/** Optional on-device WebGPU language model. Never downloads a model without user approval. */
import {createBlankEmitter,createBlankSound,validateProject,clamp} from './presets.js';
const MODEL='Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
let engine=null,loading=null;
export const webGPUAvailable=()=>typeof navigator!=='undefined'&&!!navigator.gpu;
export const webModelReady=()=>!!engine;
export async function loadWebModel(progress=()=>{}){
 if(engine)return MODEL;
 if(loading)return loading;
 if(!webGPUAvailable())throw Error('WebGPU is unavailable or blocked on this MacBook. Use Browser Creator instead.');
 loading=(async()=>{
  progress('Loading on-device AI runtime…');
  const {CreateMLCEngine}=await import('@mlc-ai/web-llm');
  engine=await CreateMLCEngine(MODEL,{initProgressCallback:p=>progress(String(p?.text||'Downloading model…'))});
  progress('Model ready — inference stays on this device.');
  return MODEL;
 })();
 try{return await loading;}finally{loading=null;}
}
const numeric={
 emitter:{start:[0,30],duration:[.05,30],x:[-25,25],y:[-25,25],z:[-25,25],rate:[0,400],burst:[0,350],life:[.1,12],speed:[0,24],spread:[0,180],gravity:[-20,20],drag:[0,6],turbulence:[0,5],sizeStart:[0,3],sizeEnd:[0,3],opacityStart:[0,1],opacityEnd:[0,1]},
 sound:{start:[0,30],duration:[.05,30],freq:[20,4000],endFreq:[20,4000],attack:[.001,2],release:[.005,4],volume:[0,1.25],pan:[-1,1],noise:[0,1],filter:[100,18000],drive:[0,1],echo:[0,.7]}
};
const enums={
 emitter:{shape:['point','sphere','disc','ring','box'],sprite:['glow','spark','smoke','ring','star','square'],blend:['add','normal']},
 sound:{kind:['tone','noise','pluck','bell'],wave:['sine','triangle','saw','square']}
};
function safeSettings(kind,input){
 const result={};if(!input||typeof input!=='object'||Array.isArray(input))return result;
 for(const [key,value] of Object.entries(input)){
  if(Object.hasOwn(numeric[kind],key)){
   const n=Number(value);if(Number.isFinite(n)){const [min,max]=numeric[kind][key];result[key]=clamp(n,min,max);}
  }else if(Object.hasOwn(enums[kind],key)&&enums[kind][key].includes(value))result[key]=value;
  else if(kind==='emitter'&&['colorStart','colorEnd'].includes(key)&&/^#[\da-f]{6}$/i.test(value))result[key]=value.toLowerCase();
 }return result;
}
export function parseModelDraft(project,text){
 const src=validateProject(project);
 if(typeof text!=='string'||text.length>14000)throw Error('Invalid model response');
 const cleaned=text.trim().replace(/^\x60{3}(?:json)?/,'').replace(/\x60{3}$/,'').trim();
 let json;
 try{json=JSON.parse(cleaned);}catch{
  const from=cleaned.indexOf('{'),to=cleaned.lastIndexOf('}');
  if(from<0||to<=from)throw Error('The language model did not return a valid editable plan');
  json=JSON.parse(cleaned.slice(from,to+1));
 }
 if(!Array.isArray(json.emitters)||!Array.isArray(json.sounds))throw Error('Expected an array of emitter and sound layers');
 if(json.emitters.length>7||json.sounds.length>7)throw Error('Model proposed too many layers');
 if(src.emitters.length+json.emitters.length>50||src.sounds.length+json.sounds.length>50)throw Error('Project layer limit');
 const next=structuredClone(src),changes=[];
 for(const [kind,items,list] of [['emitter',json.emitters,next.emitters],['sound',json.sounds,next.sounds]]){
  for(const item of items){
   if(!item||typeof item!=='object')continue;
   const layer=kind==='emitter'?createBlankEmitter():createBlankSound();
   layer.name=String(item.name||'New Layer').trim().slice(0,80);
   Object.assign(layer,safeSettings(kind,item.settings));
   layer.start=Math.min(layer.start,src.duration-.05);
   layer.duration=Math.max(.05,Math.min(layer.duration,src.duration-layer.start));
   list.push(layer);changes.push({type:'add',kind,id:layer.id,name:layer.name});
  }
 }
 if(!changes.length)return {reply:'The model did not propose usable layers. Try Browser Creator instead.',project:null,changes:[],steps:[],sources:[],engine:'webgpu'};
 return {reply:'The small in-browser language model proposed '+changes.length+' editable layer(s). Check the draft carefully before applying; compact models can misunderstand complicated prompts.',project:next,changes,steps:[{tool:'webgpu_language_model',ok:true,summary:MODEL+' · validated '+changes.length+' layer(s)'}],sources:[],engine:'webgpu'};
}
export async function planWithWebModel({project,prompt,reference=null,preferences=''}) {
 if(!engine)throw Error('Enable the on-device model first');
 const system='Return ONLY a JSON object with keys emitters (array) and sounds (array). Each entry has name and settings. Max 5 each. This is a Roblox particle and procedural sound editor. Particle settings: rate 0-400, burst 0-350, life .1-12, speed 0-24, spread 0-180, gravity -20..20, drag, turbulence, sizeStart, sizeEnd, opacityStart, opacityEnd, colorStart and colorEnd in #RRGGBB, shape point/sphere/disc/ring/box, sprite glow/spark/smoke/ring/star/square, blend add/normal. Sound: kind tone/noise/pluck/bell, wave sine/triangle/saw/square, freq 20..4000, endFreq, attack, release, volume, noise, drive, filter, echo, duration, start. Design several layers for rich effects. These are procedural sound synths, NOT generated real-world recordings. Respond with JSON only.';
 const context=JSON.stringify({preferences:String(preferences).slice(0,350),reference,duration:project.duration}).slice(0,1200);
 const res=await engine.chat.completions.create({messages:[{role:'system',content:system},{role:'user',content:String(prompt).slice(0,2500)+'\n'+context}],temperature:.25,max_tokens:900});
 return parseModelDraft(project,res?.choices?.[0]?.message?.content||'');
}

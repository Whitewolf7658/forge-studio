/**
 * Browser Creator — deterministic, no-install VFX/SFX planner.
 * This is NOT a neural language model. It generates editable proposal layers,
 * works without WebGPU or paid APIs and requires explicit user approval.
 */
import {createBlankEmitter,createBlankSound,validateProject,clamp} from './presets.js';
const cx=(n,a,b)=>Math.min(b,Math.max(a,n));
const palette={
 blue:['#d7faff','#427df2'],cyan:['#d5ffff','#3ba6be'],purple:['#e7cfff','#7954d7'],
 red:['#ffdac2','#f04e4e'],orange:['#fff3b3','#ed6228'],green:['#d7ffbc','#49aa65'],
 yellow:['#fff8bf','#dcaa36'],white:['#ffffff','#bed7ed'],black:['#9c9fa9','#242931'],
 gray:['#c1c9d2','#596573'],grey:['#c1c9d2','#596573'],gold:['#ffedba','#be8c30'],
 pink:['#ffd8ed','#df78af'],teal:['#cbffe9','#259f95']
};
const recipes={
 sparks:{name:'Electrical Sparks',rate:88,burst:75,life:.47,speed:6.2,spread:140,gravity:-4,drag:.45,turbulence:1.8,sizeStart:.13,sizeEnd:.015,shape:'sphere',sprite:'spark',blend:'add',colorStart:'#d9fbff',colorEnd:'#438afa'},
 flash:{name:'Energy Flash',rate:0,burst:32,life:.13,speed:2,spread:180,gravity:0,sizeStart:.53,sizeEnd:0,shape:'sphere',sprite:'glow',blend:'add',colorStart:'#ffffff',colorEnd:'#9acaff'},
 smoke:{name:'Rolling Smoke',rate:25,burst:18,life:3.5,speed:.8,spread:40,gravity:.6,drag:.22,turbulence:.55,sizeStart:.38,sizeEnd:1.75,opacityStart:.52,shape:'disc',sprite:'smoke',blend:'normal',colorStart:'#979fab',colorEnd:'#29333e'},
 fire:{name:'Flame Plumes',rate:105,burst:40,life:1.15,speed:2,spread:25,gravity:1.5,drag:.35,turbulence:.6,sizeStart:.4,sizeEnd:.07,sprite:'glow',shape:'disc',blend:'add',colorStart:'#ffefba',colorEnd:'#ef5831'},
 ember:{name:'Rising Embers',rate:44,burst:26,life:2.2,speed:1.2,spread:55,gravity:.6,drag:.26,turbulence:.4,sizeStart:.09,sizeEnd:.02,sprite:'spark',shape:'sphere',blend:'add',colorStart:'#ffe5a2',colorEnd:'#e9722b'},
 mist:{name:'Ambient Mist',rate:22,burst:20,life:5,speed:.35,spread:145,gravity:.05,drag:.6,turbulence:.28,sizeStart:.7,sizeEnd:2.1,opacityStart:.24,sprite:'smoke',shape:'box',blend:'normal',colorStart:'#b7cfdf',colorEnd:'#628291'},
 dust:{name:'Floating Dust',rate:32,burst:25,life:4,speed:.43,spread:180,gravity:.01,drag:.72,turbulence:.35,sizeStart:.08,sizeEnd:.02,opacityStart:.64,sprite:'glow',shape:'box',blend:'normal',colorStart:'#f8e1bc',colorEnd:'#b79d79'},
 snow:{name:'Snowfall',rate:85,burst:30,life:5,speed:.5,spread:40,gravity:-.7,drag:.25,turbulence:.2,sizeStart:.11,sizeEnd:.08,sprite:'glow',shape:'box',blend:'normal',colorStart:'#ffffff',colorEnd:'#bdd5f7'},
 rain:{name:'Rainfall',rate:170,burst:60,life:1.8,speed:3.5,spread:12,gravity:-10,drag:0,turbulence:.1,sizeStart:.08,sizeEnd:.05,sprite:'spark',shape:'box',blend:'normal',colorStart:'#d8f0fa',colorEnd:'#7ea3c7'},
 portal:{name:'Portal Energy',rate:79,burst:95,life:1.5,speed:1.2,spread:175,gravity:0,drag:1.4,turbulence:.8,sizeStart:.2,sizeEnd:.37,sprite:'glow',shape:'ring',blend:'add',colorStart:'#a2ffed',colorEnd:'#5887ee'},
 magic:{name:'Magic Particles',rate:70,burst:80,life:1.6,speed:1.8,spread:180,gravity:0,drag:1.2,turbulence:.9,sizeStart:.24,sizeEnd:.38,sprite:'star',shape:'sphere',blend:'add',colorStart:'#d5c5ff',colorEnd:'#8761dd'},
 blast:{name:'Explosion Shockwave',rate:0,burst:150,life:.7,speed:11,spread:180,gravity:-2,drag:.22,turbulence:.5,sizeStart:.27,sizeEnd:.02,sprite:'spark',shape:'sphere',blend:'add',colorStart:'#fff3b7',colorEnd:'#f1572e'},
 confetti:{name:'Confetti Burst',rate:0,burst:120,life:2.7,speed:5,spread:180,gravity:-6,drag:.36,turbulence:.2,sizeStart:.24,sizeEnd:.12,sprite:'square',shape:'sphere',blend:'normal',colorStart:'#ffa6d3',colorEnd:'#b1d4ff'}
};
const sounds={
 crackle:{name:'Electrical Crackle',kind:'noise',wave:'saw',duration:.8,freq:1300,endFreq:320,attack:.004,release:.2,volume:.46,noise:.75,filter:7300,drive:.42,echo:.1},
 hum:{name:'Generator Hum',kind:'tone',wave:'saw',duration:3.5,freq:85,endFreq:88,attack:.18,release:.65,volume:.48,noise:.16,filter:900,drive:.23,echo:.02},
 impact:{name:'Impact Strike',kind:'noise',wave:'triangle',duration:.9,freq:170,endFreq:43,attack:.002,release:.65,volume:.81,noise:.84,filter:2500,drive:.65,echo:.12},
 rumble:{name:'Low Rumble',kind:'noise',wave:'sine',duration:2.3,freq:92,endFreq:43,attack:.09,release:1,volume:.68,noise:.27,filter:800,drive:.37,echo:.07},
 wind:{name:'Atmospheric Wind',kind:'noise',wave:'sine',duration:5,freq:120,endFreq:140,attack:.56,release:.8,volume:.5,noise:1,filter:1000,drive:0,echo:.16},
 whoosh:{name:'Air Rush',kind:'noise',wave:'sine',duration:.84,freq:220,endFreq:570,attack:.15,release:.33,volume:.65,noise:1,filter:3300,drive:.1,echo:.02},
 laser:{name:'Laser Zap',kind:'tone',wave:'saw',duration:.42,freq:1450,endFreq:96,attack:.002,release:.22,volume:.65,noise:.1,filter:8500,drive:.23,echo:.08},
 bell:{name:'Crystal Chime',kind:'bell',wave:'sine',duration:1.8,freq:780,endFreq:770,attack:.002,release:1.4,volume:.55,noise:0,filter:13000,drive:.03,echo:.26},
 click:{name:'UI Click',kind:'tone',wave:'sine',duration:.16,freq:720,endFreq:1090,attack:.002,release:.09,volume:.4,noise:.02,filter:10000,drive:0,echo:.03},
 step:{name:'Footstep Impact',kind:'noise',wave:'sine',duration:.28,freq:130,endFreq:48,attack:.003,release:.17,volume:.62,noise:.83,filter:1400,drive:.24,echo:0},
 splash:{name:'Water Splash',kind:'noise',wave:'sine',duration:.7,freq:550,endFreq:180,attack:.002,release:.38,volume:.64,noise:.77,filter:5200,drive:0,echo:.05}
};
const match=(t,pattern)=>pattern.test(t);
const uniq=list=>[...new Set(list)];
function effectKeys(t){
 const keys=[];
 if(match(t,/electri|voltage|lightning|spark|crackl|arcing|plasma/i))keys.push('sparks','flash');
 if(match(t,/explos|detonat|grenade|shockwave|blast|bomb/i))keys.push('blast','smoke','flash');
 if(match(t,/fire|flame|burning|torch|inferno|campfire/i))keys.push('fire','ember');
 if(match(t,/smok|soot|exhaust/i))keys.push('smoke');
 if(match(t,/fog|mist|haze|steam/i))keys.push('mist');
 if(match(t,/dust|debris|sand|pollen/i))keys.push('dust');
 if(match(t,/snow|blizzard|flakes/i))keys.push('snow');
 if(match(t,/rain|downpour|drizzle/i))keys.push('rain');
 if(match(t,/portal|vortex|wormhole|teleport/i))keys.push('portal');
 if(match(t,/magic|spell|fairy|aura/i))keys.push('magic');
 if(match(t,/confetti|celebrat|streamer/i))keys.push('confetti');
 if(match(t,/wind|gust|breeze/i)&&!keys.length)keys.push('dust');
 if(match(t,/no\\s+smoke|without\\s+smoke/i))return uniq(keys).filter(k=>k!=='smoke');
 return uniq(keys);
}
function soundKeys(t){
 const keys=[];
 if(match(t,/electri|spark|crackl|static|voltage|lightning/i))keys.push('crackle');
 if(match(t,/generator|engine|machine|machinery|motor|industrial|mechanical/i))keys.push('hum');
 if(match(t,/explos|boom|blast|detonat|impact|hit|collision|slam|thud/i))keys.push('impact','rumble');
 if(match(t,/thunder|rumbl|deep\\s+bass/i))keys.push('rumble');
 if(match(t,/wind|gust|breeze|storm/i))keys.push('wind');
 if(match(t,/whoosh|swoosh|swing|sweep|swish/i))keys.push('whoosh');
 if(match(t,/laser|gunshot|zap|raygun/i))keys.push('laser');
 if(match(t,/bell|chime|shimmer|crystal/i))keys.push('bell');
 if(match(t,/click|button|interface|ui\\s+sound|notification/i))keys.push('click');
 if(match(t,/footstep|walking|running\\s+on/i))keys.push('step');
 if(match(t,/water|splash|liquid|drip/i))keys.push('splash');
 return match(t,/no\\s+sound|without\\s+sound|silent/i)?[]:uniq(keys);
}
function mods(t){
 const duration=t.match(/\\b(\\d+(?:\\.\\d+)?)\\s*(?:s|secs?|seconds?)\\b/i);
 const quantity=t.match(/\\b(\\d{1,3})\\s*(?:particles?|sparks?|embers?)\\b/i);
 return {intense:match(t,/\\b(massive|intense|huge|explosive|powerful|strong|thick|dense)\\b/i),
 subtle:match(t,/\\b(subtle|gentle|small|faint|light|weak|soft|thin)\\b/i),
 fast:match(t,/\\b(fast|rapid|quick|sharp)\\b/i),slow:match(t,/\\b(slow|drifting|floating)\\b/i),
 duration:duration?cx(+duration[1],.1,30):null,quantity:quantity?cx(+quantity[1],1,350):null};
}
function colors(t,reference){
 for(const [key,value] of Object.entries(palette))if(new RegExp('\\b'+key+'\\b','i').test(t))return value;
 return reference?.palette?.length?[reference.palette[0],reference.palette[1]||reference.palette[0]]:null;
}
function emitter(key,text,m,reference){
 const layer={...createBlankEmitter(),...recipes[key]},factor=m.intense?1.6:m.subtle?.55:1;
 layer.rate=Math.round(cx(layer.rate*factor,0,400));layer.burst=Math.round(cx(layer.burst*factor,0,350));
 layer.speed=Number(cx(layer.speed*(m.fast?1.4:m.slow?.65:1),0,24).toFixed(2));
 if(m.quantity!==null)layer.burst=m.quantity;
 if(m.duration!==null)layer.duration=m.duration;
 const c=colors(text,reference);
 if(c&&(key!=='smoke'||/colour|color|tinted/i.test(text))){layer.colorStart=c[0];layer.colorEnd=c[1];}
 return layer;
}
function sound(key,m,reference){
 const layer={...createBlankSound(),...sounds[key]};
 if(m.intense)layer.volume=Number(cx(layer.volume*1.2,0,1.25).toFixed(2));
 if(m.subtle)layer.volume=Number(cx(layer.volume*.65,0,1.25).toFixed(2));
 if(m.duration!==null)layer.duration=m.duration;
 if(reference?.type==='audio'&&Number.isFinite(reference.rms))layer.volume=Number(cx(Math.max(.18,reference.rms*1.8),0,1.25).toFixed(2));
 return layer;
}
function editSelected(layer,t){
 const bigger=/\\b(more|increase|boost|stronger|louder|bigger|denser|thicker|brighter|faster|higher)\\b/i.test(t);
 const smaller=/\\b(less|decrease|reduce|quieter|smaller|slower|softer|thinner|weaker|lower)\\b/i.test(t);
 const mul=bigger?1.35:smaller?.7:1,changes={};
 if('rate'in layer){
   if(/density|particles|sparks|thicker/.test(t))changes.rate=Math.round(cx(layer.rate*mul,0,400));
   if(/speed|faster|slower|velocity/.test(t))changes.speed=Number(cx(layer.speed*mul,0,24).toFixed(2));
   if(/size|larger|smaller/.test(t))changes.sizeStart=Number(cx(layer.sizeStart*mul,0,3).toFixed(2));
   if(/lifetime|last\\s+longer|shorter/.test(t))changes.life=Number(cx(layer.life*mul,.1,12).toFixed(2));
   const c=colors(t);if(c){changes.colorStart=c[0];changes.colorEnd=c[1];}
 }else{
   if(/loud|quiet|volume|gain/.test(t))changes.volume=Number(cx(layer.volume*mul,0,1.25).toFixed(2));
   if(/pitch|higher|lower|deeper/.test(t)){changes.freq=Number(cx(layer.freq*mul,20,4000).toFixed(2));changes.endFreq=Number(cx(layer.endFreq*mul,20,4000).toFixed(2));}
   if(/echo|reverb/.test(t))changes.echo=Number(cx(Math.max(layer.echo,.16)*mul,0,.7).toFixed(2));
 }
 return changes;
}
export function planFromPrompt({project,prompt,selection=null,reference=null,preferences=''}) {
 const working=structuredClone(validateProject(project)),text=String(prompt||'').trim().slice(0,5500);
 if(!text)return {reply:'Enter an effect description first.',project:null,changes:[],steps:[],sources:[],engine:'procedural'};
 const m=mods(text+' '+(/realistic/i.test(preferences)?'realistic':''));
 const steps=[],changes=[];
 const isEdit=/\\b(make (it|the|this)|change|adjust|modify|increase|decrease|reduce|more\\s+(smoke|sparks|particles)|less\\s+(smoke|sparks|particles))\\b/i.test(text);
 const selected=selection&&working[selection.kind==='sound'?'sounds':'emitters']?.find(x=>x.id===selection.id);
 if(isEdit&&selected){
   const updates=editSelected(selected,text);if(Object.keys(updates).length){
     Object.assign(selected,updates);changes.push({type:'edit',kind:selection.kind,id:selected.id,name:selected.name,fields:Object.keys(updates)});
     steps.push({tool:'edit_selected',ok:true,summary:JSON.stringify(updates)});
     return {reply:'Prepared '+Object.keys(updates).length+' changes to '+selected.name+'. Review and apply to keep them.',project:working,changes,steps,sources:[],engine:'procedural'};
   }
 }
 let effects=effectKeys(text),audio=soundKeys(text);
 const audioOnly=/\\b(only|just)\\s+(a\\s+)?(sound|audio|sfx)|sound\\s+only|audio\\s+only/i.test(text);
 const effectOnly=/\\b(only|just)\\s+(a\\s+)?(effect|particles?|vfx)|vfx\\s+only|particles?\\s+only/i.test(text);
 if(audioOnly)effects=[];if(effectOnly)audio=[];
 if(!effects.length&&!audio.length){
   if(/sound|audio|sfx|tone|noise/.test(text))audio=['click'];
   else if(/particle|effect|vfx|visual/.test(text))effects=['magic'];
   else return {reply:'Browser Creator needs a concrete effect or sound description. Try “blue electrical sparks and generator hum” or “heavy smoke with orange embers”. This mode is not a general-purpose language model.',project:null,changes:[],steps:[{tool:'recognize_prompt',ok:false,summary:'No supported visual/audio concept found'}],sources:[],engine:'procedural'};
 }
 if(working.emitters.length+effects.length>50||working.sounds.length+audio.length>50)throw Error('Too many layers');
 for(const key of effects){
   const layer=emitter(key,text,m,reference);layer.duration=cx(layer.duration,.05,working.duration);
   working.emitters.push(layer);changes.push({type:'add',kind:'emitter',id:layer.id,name:layer.name});
   steps.push({tool:'compose_emitter',ok:true,summary:layer.name+' '+layer.rate+'/sec '+layer.colorStart});
 }
 for(const key of audio){
   const layer=sound(key,m,reference);layer.start=key==='rumble'?.18:0;
   layer.duration=cx(layer.duration,.05,Math.max(.05,working.duration-layer.start));
   working.sounds.push(layer);changes.push({type:'add',kind:'sound',id:layer.id,name:layer.name});
   steps.push({tool:'compose_sound',ok:true,summary:layer.name+' '+layer.kind+' '+layer.freq+'Hz'});
 }
 return {reply:'Prepared '+changes.length+' editable particle/sound layers: '+changes.map(x=>x.name).join(', ')+'. This is procedural browser generation, not a neural AI model or real-world sound recording.',project:working,changes,steps,sources:[],engine:'procedural'};
}
const hex=(r,g,b)=>'#'+[r,g,b].map(n=>Math.round(cx(n,0,255)).toString(16).padStart(2,'0')).join('');
function colorSamples(data){const map=new Map();for(let i=0;i<data.length;i+=16){if(data[i+3]<100)continue;const color=hex(Math.round(data[i]/32)*32,Math.round(data[i+1]/32)*32,Math.round(data[i+2]/32)*32);map.set(color,(map.get(color)||0)+1);}return [...map].sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);}
export async function inspectBrowserReference(file){
 if(!file||file.size>24_000_000)throw Error('Reference exceeds 24 MB');
 const mime=file.type;
 if(mime.startsWith('image/')){
   const bitmap=await createImageBitmap(file);
   try{const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d',{willReadFrequently:true});
     ctx.drawImage(bitmap,0,0,64,64);
     return {type:'image',palette:colorSamples(ctx.getImageData(0,0,64,64).data),dimensions:[bitmap.width,bitmap.height],
       note:'Measured image colours; not semantic image understanding.'};
   }finally{bitmap.close();}
 }
 if(mime.startsWith('audio/')){
   const context=new (window.AudioContext||window.webkitAudioContext)();
   try{const buffer=await context.decodeAudioData(await file.arrayBuffer()),data=buffer.getChannelData(0);
     const step=Math.max(1,Math.floor(data.length/50000));let sum=0,peak=0,n=0;
     for(let i=0;i<data.length;i+=step){const v=data[i];sum+=v*v;peak=Math.max(peak,Math.abs(v));n++;}
     return {type:'audio',duration:Number(buffer.duration.toFixed(2)),rms:Number(Math.sqrt(sum/Math.max(1,n)).toFixed(3)),peak:Number(peak.toFixed(3)),
       note:'Duration and loudness only; no sound identification.'};
   }finally{await context.close();}
 }
 if(mime.startsWith('video/')){
   const url=URL.createObjectURL(file),video=document.createElement('video');video.muted=true;video.preload='metadata';video.src=url;
   try{
     await new Promise((ok,fail)=>{video.onloadedmetadata=ok;video.onerror=()=>fail(Error('Unsupported video format'));video.load();});
     if(!Number.isFinite(video.duration)||video.duration<.1)throw Error('Could not read video duration');
     const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d',{willReadFrequently:true}),frames=[];
     for(const ratio of [.1,.5,.9]){
       const time=Math.min(video.duration-.05,video.duration*ratio);
       const sought=new Promise((ok,fail)=>{video.onseeked=ok;video.onerror=()=>fail(Error('Video frame unavailable'));});
       video.currentTime=time;await sought;
       ctx.drawImage(video,0,0,64,64);frames.push({at:Number(time.toFixed(2)),colors:colorSamples(ctx.getImageData(0,0,64,64).data)});
     }
     return {type:'video',duration:Number(video.duration.toFixed(2)),frames,palette:frames[1]?.colors||[],
       note:'Sampled three frames for colour only; not full video comprehension.'};
   }finally{video.pause();video.removeAttribute('src');URL.revokeObjectURL(url);}
 }
 throw Error('Choose an image, audio file or browser-compatible video');
}

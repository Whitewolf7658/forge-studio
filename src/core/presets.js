export const effectPresets = [
  {id:'embers',label:'Ember Drift',category:'Atmosphere',icon:'✦',tone:'#ff8858',description:'Warm rising sparks',data:{rate:33,burst:22,life:1.75,speed:1.6,spread:36,gravity:.8,drag:.48,turbulence:.75,sizeStart:.3,sizeEnd:.04,opacityStart:.94,opacityEnd:0,colorStart:'#ffcf78',colorEnd:'#ff5f55',shape:'sphere',sprite:'spark',blend:'add'}},
  {id:'spell',label:'Arcane Bloom',category:'Magic',icon:'✳',tone:'#a58bff',description:'Glowing magic energy',data:{rate:55,burst:60,life:1.2,speed:2.9,spread:180,gravity:0,drag:1,turbulence:1.3,sizeStart:.42,sizeEnd:.12,opacityStart:1,opacityEnd:0,colorStart:'#98e7ff',colorEnd:'#a96fff',shape:'sphere',sprite:'glow',blend:'add'}},
  {id:'smoke',label:'Soft Smoke',category:'Atmosphere',icon:'☁',tone:'#99acbe',description:'Slow volumetric wisps',data:{rate:16,burst:8,life:3.5,speed:.72,spread:24,gravity:.12,drag:.17,turbulence:.38,sizeStart:.36,sizeEnd:1.8,opacityStart:.4,opacityEnd:0,colorStart:'#a5b7c6',colorEnd:'#384b61',shape:'disc',sprite:'smoke',blend:'normal'}},
  {id:'impact',label:'Impact Sparks',category:'Combat',icon:'✴',tone:'#ffb767',description:'Fast radial impact burst',data:{rate:0,burst:90,life:.65,speed:8.5,spread:180,gravity:-5,drag:.28,turbulence:.16,sizeStart:.22,sizeEnd:.015,opacityStart:1,opacityEnd:0,colorStart:'#fff6bd',colorEnd:'#ff793e',shape:'point',sprite:'spark',blend:'add'}},
  {id:'snow',label:'Snowfall',category:'Weather',icon:'❄',tone:'#8bc9fc',description:'Floating snow particles',data:{rate:80,burst:25,life:5,speed:.45,spread:50,gravity:-.5,drag:.1,turbulence:.28,sizeStart:.09,sizeEnd:.1,opacityStart:.9,opacityEnd:.65,colorStart:'#ffffff',colorEnd:'#abd5ff',shape:'box',sprite:'glow',blend:'normal'}},
  {id:'dust',label:'Dust Motes',category:'Atmosphere',icon:'◌',tone:'#d6b792',description:'Gentle ambient dust',data:{rate:32,burst:32,life:3.8,speed:.42,spread:180,gravity:.02,drag:1,turbulence:.25,sizeStart:.065,sizeEnd:.015,opacityStart:.65,opacityEnd:0,colorStart:'#ffdfb7',colorEnd:'#be9478',shape:'box',sprite:'glow',blend:'normal'}},
  {id:'portal',label:'Portal Field',category:'Magic',icon:'◉',tone:'#4fe6d2',description:'Charged circular field',data:{rate:68,burst:100,life:1.5,speed:1.1,spread:165,gravity:0,drag:1.6,turbulence:.6,sizeStart:.2,sizeEnd:.42,opacityStart:1,opacityEnd:0,colorStart:'#40ffe4',colorEnd:'#5482ff',shape:'ring',sprite:'glow',blend:'add'}},
  {id:'confetti',label:'Confetti Pop',category:'Celebration',icon:'▧',tone:'#ff7ab4',description:'Colourful paper burst',data:{rate:0,burst:120,life:2.7,speed:5.5,spread:180,gravity:-6.7,drag:.34,turbulence:.24,sizeStart:.24,sizeEnd:.14,opacityStart:1,opacityEnd:.1,colorStart:'#ff70ba',colorEnd:'#f7da73',shape:'point',sprite:'square',blend:'normal'}},
  {id:'electric',label:'Voltage',category:'Combat',icon:'ϟ',tone:'#79b6ff',description:'High energy blue plasma',data:{rate:90,burst:100,life:.38,speed:5.1,spread:180,gravity:0,drag:1.7,turbulence:2.4,sizeStart:.2,sizeEnd:.04,opacityStart:1,opacityEnd:0,colorStart:'#c5f9ff',colorEnd:'#4787ff',shape:'sphere',sprite:'star',blend:'add'}},
  {id:'fire',label:'Torch Flame',category:'Atmosphere',icon:'♨',tone:'#ff9952',description:'Rising layered flames',data:{rate:105,burst:40,life:1,speed:1.8,spread:16,gravity:1.8,drag:.48,turbulence:.45,sizeStart:.46,sizeEnd:.07,opacityStart:.87,opacityEnd:0,colorStart:'#fff1ac',colorEnd:'#ff4e30',shape:'disc',sprite:'glow',blend:'add'}},
];
export const soundPresets = [
  {id:'laser',label:'Plasma Zap',category:'Sci-fi',icon:'⌁',tone:'#a38bff',description:'Pitch-bent sci-fi shot',data:{kind:'tone',wave:'saw',duration:.45,freq:1300,endFreq:110,attack:.002,release:.22,volume:.65,noise:.06,filter:8500,drive:.22,echo:.07}},
  {id:'impact',label:'Heavy Impact',category:'Combat',icon:'✷',tone:'#fd9a69',description:'Cinematic hit',data:{kind:'noise',wave:'sine',duration:.76,freq:115,endFreq:45,attack:.001,release:.52,volume:.9,noise:.84,filter:1600,drive:.75,echo:.08}},
  {id:'blip',label:'UI Confirm',category:'Interface',icon:'◈',tone:'#75d8d1',description:'Bright pleasant UI chime',data:{kind:'tone',wave:'sine',duration:.19,freq:680,endFreq:1020,attack:.002,release:.12,volume:.43,noise:0,filter:10000,drive:0,echo:.08}},
  {id:'whoosh',label:'Movement Whoosh',category:'Motion',icon:'➜',tone:'#86b8ef',description:'Fast filtered air sweep',data:{kind:'noise',wave:'sine',duration:.9,freq:160,endFreq:500,attack:.17,release:.28,volume:.7,noise:1,filter:4200,drive:.1,echo:0}},
  {id:'bass',label:'Sub Drop',category:'Cinematic',icon:'◉',tone:'#eb8cae',description:'Deep bass transition',data:{kind:'tone',wave:'sine',duration:1.3,freq:155,endFreq:36,attack:.004,release:.42,volume:.92,noise:.08,filter:700,drive:.33,echo:.03}},
  {id:'bell',label:'Crystal Chime',category:'Magic',icon:'✧',tone:'#84bcfc',description:'Shimmering bell tone',data:{kind:'bell',wave:'sine',duration:1.65,freq:740,endFreq:735,attack:.002,release:1.25,volume:.65,noise:.01,filter:14000,drive:0,echo:.23}},
  {id:'retro',label:'Retro Pickup',category:'Interface',icon:'▣',tone:'#fed084',description:'8-bit ascending collectible',data:{kind:'tone',wave:'square',duration:.36,freq:390,endFreq:1200,attack:.002,release:.11,volume:.32,noise:0,filter:7000,drive:.08,echo:0}},
  {id:'explosion',label:'Explosion',category:'Combat',icon:'✹',tone:'#ff8f5c',description:'Layered blast and low rumble',data:{kind:'noise',wave:'triangle',duration:1.45,freq:140,endFreq:40,attack:.003,release:.92,volume:.9,noise:.78,filter:2300,drive:.55,echo:.15}},
  {id:'wind',label:'Ambient Wind',category:'Environment',icon:'≈',tone:'#91c1d3',description:'Soft filtered atmosphere',data:{kind:'noise',wave:'sine',duration:3.2,freq:180,endFreq:210,attack:.55,release:.85,volume:.5,noise:1,filter:850,drive:0,echo:.1}},
  {id:'pluck',label:'Soft Pluck',category:'Music',icon:'♬',tone:'#c2a4ff',description:'Mellow string-like pluck',data:{kind:'pluck',wave:'triangle',duration:1.0,freq:330,endFreq:330,attack:.001,release:.6,volume:.5,noise:.05,filter:4300,drive:.12,echo:.19}},
];
let seq=0;
export const uid=()=>`sp_${Date.now().toString(36)}_${(++seq).toString(36)}`;
export const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
export function createEmitter(presetId='embers'){
 const preset=effectPresets.find(x=>x.id===presetId)||effectPresets[0];
 return {id:uid(),name:preset.label,enabled:true,solo:false,start:0,duration:8,x:0,y:0,z:0,shape:'point',sprite:'glow',rate:30,burst:0,life:1.5,speed:2,spread:65,gravity:-.8,drag:.25,turbulence:.2,sizeStart:.25,sizeEnd:.03,opacityStart:1,opacityEnd:0,colorStart:'#ffffff',colorEnd:'#6d94ff',blend:'add',textureId:'',...structuredClone(preset.data)};
}
export function createSound(presetId='laser'){
 const preset=soundPresets.find(x=>x.id===presetId)||soundPresets[0];
 return {id:uid(),name:preset.label,enabled:true,solo:false,start:0,duration:.6,kind:'tone',wave:'sine',freq:440,endFreq:220,attack:.01,release:.3,volume:.6,pan:0,noise:0,filter:12000,drive:0,echo:0,reverse:false,assetId:'',sample:null,...structuredClone(preset.data)};
}
export function makeProject(){return {format:'spectra-studio',version:1,name:'Untitled Project',duration:8,bpm:120,emitters:[createEmitter('embers'),createEmitter('spell')],sounds:[{...createSound('impact'),start:.5},{...createSound('bell'),start:1.2}],settings:{grid:true,background:'studio',quality:1}};}
const emitterNumbers={start:[0,30],duration:[.05,30],x:[-25,25],y:[-25,25],z:[-25,25],rate:[0,400],burst:[0,350],life:[.1,12],speed:[0,24],spread:[0,180],gravity:[-20,20],drag:[0,6],turbulence:[0,5],sizeStart:[0,3],sizeEnd:[0,3],opacityStart:[0,1],opacityEnd:[0,1]};
const soundNumbers={start:[0,30],duration:[.05,30],freq:[20,4000],endFreq:[20,4000],attack:[.001,2],release:[.005,4],volume:[0,1.25],pan:[-1,1],noise:[0,1],filter:[100,18000],drive:[0,1],echo:[0,.7]};
const cleanText=(s,max=100)=>String(s??'').slice(0,max);
function normalize(raw,kind){
 const defaults=kind==='emitter'?createEmitter():createSound();const item={...defaults};
 item.id=cleanText(raw.id||uid(),80).replace(/[^a-zA-Z0-9_-]/g,'')||uid();item.name=cleanText(raw.name||defaults.name);
 for(const [key,[min,max]] of Object.entries(kind==='emitter'?emitterNumbers:soundNumbers))item[key]=Number.isFinite(Number(raw[key]))?clamp(raw[key],min,max):defaults[key];
 for(const key of ['enabled','solo'])item[key]=typeof raw[key]==='boolean'?raw[key]:defaults[key];
 if(kind==='emitter'){
  for(const [key,allowed] of Object.entries({shape:['point','sphere','disc','ring','box'],sprite:['glow','spark','star','ring','square','smoke'],blend:['add','normal']}))item[key]=allowed.includes(raw[key])?raw[key]:defaults[key];
  for(const key of ['colorStart','colorEnd'])item[key]=/^#[0-9a-fA-F]{6}$/.test(raw[key])?raw[key]:defaults[key];
  item.textureId=cleanText(raw.textureId||'',100);
 }else{
  for(const [key,allowed] of Object.entries({kind:['tone','noise','pluck','bell','sample'],wave:['sine','triangle','saw','square']}))item[key]=allowed.includes(raw[key])?raw[key]:defaults[key];
  item.reverse=!!raw.reverse;item.assetId=cleanText(raw.assetId||'',100);
  if(raw.sample&&Array.isArray(raw.sample.data)&&raw.sample.data.length<=132300){item.sample={rate:clamp(raw.sample.rate,4000,96000),data:raw.sample.data.map(n=>clamp(n,-1,1))};}
 }
 return item;
}
export function validateProject(p){
 if(!p||p.format!=='spectra-studio'||!Array.isArray(p.emitters)||!Array.isArray(p.sounds)||p.emitters.length>50||p.sounds.length>50)throw new Error('Not a valid Spectra project');
 if(JSON.stringify(p).length>15e6)throw new Error('Project exceeds 15 MB limit');
 const defaults=makeProject();const result={...defaults,name:cleanText(p.name||'Untitled Project'),duration:clamp(p.duration,1,30),bpm:clamp(p.bpm,40,240),emitters:p.emitters.map(e=>normalize(e,'emitter')),sounds:p.sounds.map(e=>normalize(e,'sound'))};
 result.settings={grid:p.settings?.grid!==false,background:p.settings?.background==='light'?'light':'studio',quality:1};return result;
}
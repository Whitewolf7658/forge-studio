import {clamp} from './presets.js';
export const AUDIO_RATE = 44100;
const TAU = Math.PI * 2;
const getSolo = layers => layers.some(x=>x.solo && x.enabled);
const hashSeed = id => [...String(id)].reduce((s,c)=>(s*31+c.charCodeAt(0))>>>0,2166136261)||1;
function rng(seed){let v=seed>>>0;return ()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return (v>>>0)/4294967296;};}
function oscillator(wave,phase){const q=phase/TAU;switch(wave){case 'triangle':return 2*Math.abs(2*(q-Math.floor(q+.5)))-1;case 'square':return Math.sin(phase)>=0?1:-1;case 'saw':return 2*(q-Math.floor(q+.5));default:return Math.sin(phase);}}
export function renderSound(layer,rate=AUDIO_RATE){
 const len=Math.max(1,Math.ceil(clamp(layer.duration,.025,30)*rate));const left=new Float32Array(len),right=new Float32Array(len);
 const random=rng(hashSeed(layer.id));const freq0=clamp(layer.freq,15,20000),freq1=clamp(layer.endFreq,15,20000);
 const vol=clamp(layer.volume,0,1.5),pan=clamp(layer.pan,-1,1),leftPan=Math.cos((pan+1)*Math.PI/4),rightPan=Math.sin((pan+1)*Math.PI/4);
 const attack=Math.max(.001,clamp(layer.attack,.001,10)),release=Math.max(.005,clamp(layer.release,.005,12));
 const noise=clamp(layer.noise,0,1),cutoff=clamp(layer.filter,60,20000),filterAlpha=1-Math.exp(-TAU*cutoff/rate),drive=clamp(layer.drive,0,1);
 const sample=layer.sample&&Array.isArray(layer.sample.data)?layer.sample:null;
 const duration=len/rate;let low=0,phase=0;
 for(let i=0;i<len;i++){
  const t=i/rate,position=t/duration;
  const hz=freq0*Math.pow(freq1/freq0,position);
  phase+=TAU*hz/rate;
  if(phase>TAU*1000)phase%=TAU;
  let signal=oscillator(layer.wave,phase);
  if(layer.kind==='bell')signal=.62*Math.sin(phase)+.28*Math.sin(phase*2.01)+.19*Math.sin(phase*3.92)+.12*Math.sin(phase*5.43);
  if(layer.kind==='pluck')signal=(.68*signal+.22*Math.sin(phase*2.006)+.1*Math.sin(phase*3))*Math.exp(-t*4.5/Math.max(.3,duration));
  if(layer.kind==='noise')signal=.45*Math.sin(phase)+.55*signal;
  if(sample){const index=t*clamp(sample.rate,4000,96000),a=Math.floor(index),blend=index-a;const raw=sample.data;signal=a>=raw.length?0:(raw[a]||0)*(1-blend)+(raw[a+1]||0)*blend;}
  signal=signal*(1-noise)+(random()*2-1)*noise;
  low+=filterAlpha*(signal-low);
  signal=low;
  if(drive>.005)signal=Math.tanh(signal*(1+drive*7))/Math.tanh(1+drive*7);
  let envelope=Math.min(1,t/attack,Math.max(0,(duration-t)/release));
  if(layer.kind==='bell')envelope*=Math.exp(-2.2*t/Math.max(.1,duration));
  if(layer.reverse)envelope=Math.min(1,(duration-t)/attack,Math.max(0,t/release));
  signal*=envelope*vol;
  left[i]=signal*leftPan;right[i]=signal*rightPan;
 }
 if(layer.echo>.005){const feedback=clamp(layer.echo,0,.7),offset=Math.max(1,Math.floor(.24*rate));for(let i=offset;i<len;i++){left[i]+=left[i-offset]*feedback*.7;right[i]+=right[i-offset]*feedback*.7;}}
 return {left,right,rate};
}
export function renderMix(project,rate=AUDIO_RATE,options={}){
 const tail=1.0,seconds=clamp(project.duration,1,30);
 const len=Math.ceil((seconds+tail)*rate),left=new Float32Array(len),right=new Float32Array(len);
 const audible=(project.sounds||[]).filter(s=>s.enabled&&(!getSolo(project.sounds)||s.solo)&&(options.id==null||s.id===options.id));
 for(const s of audible){const layer=renderSound(s,rate),offset=Math.floor(clamp(s.start,0,30)*rate);for(let i=0;i<layer.left.length&&i+offset<len;i++){left[i+offset]+=layer.left[i];right[i+offset]+=layer.right[i];}}
 let peak=0;for(let i=0;i<len;i++){peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
 const gain=peak>.96?.96/peak:1;for(let i=0;i<len;i++){left[i]*=gain;right[i]*=gain;}
 return {left,right,rate,duration:seconds+tail,peak};
}
export function soundToWav(sound){const {left,right,rate}=sound;const len=Math.min(left.length,right.length),out=new ArrayBuffer(44+len*4),view=new DataView(out);
 const str=(at,value)=>{for(let i=0;i<value.length;i++)view.setUint8(at+i,value.charCodeAt(i));};
 str(0,'RIFF');view.setUint32(4,36+len*4,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,rate,true);view.setUint32(28,rate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,len*4,true);
 for(let i=0;i<len;i++){const l=Math.max(-1,Math.min(1,left[i]||0)),r=Math.max(-1,Math.min(1,right[i]||0));view.setInt16(44+i*4,Math.round(l*(l<0?32768:32767)),true);view.setInt16(46+i*4,Math.round(r*(r<0?32768:32767)),true);}return out;}
export function importSample(samples,rate){const target=11025,max=Math.min(samples.length/rate,12),n=Math.floor(max*target);const data=new Array(n);for(let i=0;i<n;i++){const x=i*rate/target,a=Math.floor(x),f=x-a;data[i]=+((samples[a]||0)*(1-f)+(samples[a+1]||0)*f).toFixed(5);}return {rate:target,data};}
export async function playBuffer(rendered,context=null){const ctx=context||new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();const b=ctx.createBuffer(2,rendered.left.length,rendered.rate);b.copyToChannel(rendered.left,0);b.copyToChannel(rendered.right,1);const node=ctx.createBufferSource();node.buffer=b;node.connect(ctx.destination);node.start();return {ctx,node};}
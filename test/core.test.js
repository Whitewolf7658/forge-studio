import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProject,createEmitter,createSound,createBlankEmitter,createBlankSound,validateProject,effectPresets,soundPresets} from '../src/core/presets.js';
import {renderSound,renderMix,soundToWav,importSample} from '../src/core/audio.js';
import {exportRobloxLua} from '../src/core/exports.js';

test('presets produce independent objects with valid IDs and settings',()=>{
 const a=createEmitter('embers'),b=createEmitter('embers');assert.notEqual(a.id,b.id);a.rate=5;assert.notEqual(a.rate,b.rate);
 assert.ok(effectPresets.length>=8);assert.ok(soundPresets.length>=8);
});
test('projects validate and restore persisted settings',()=>{
 const p=makeProject();p.name='Temple VFX';p.duration=12;p.emitters[0].rate=140;
 const q=validateProject(JSON.parse(JSON.stringify(p)));
 assert.equal(q.name,'Temple VFX');assert.equal(q.duration,12);assert.equal(q.emitters[0].rate,140);
 assert.throws(()=>validateProject({format:'forge-studio',objects:[]}));
});
test('sound synthesizer renders finite, nonzero stereo audio',()=>{
 for(const preset of soundPresets){const sound=createSound(preset.id);const result=renderSound(sound,11025);assert.ok(result.left.length>50,preset.id);let power=0;for(let i=0;i<result.left.length;i++){assert.ok(Number.isFinite(result.left[i]));assert.ok(Number.isFinite(result.right[i]));power+=Math.abs(result.left[i]);}assert.ok(power>0,preset.id);}
});
test('audio timeline mixes at start offsets and exports valid WAV header',()=>{
 const p=makeProject();p.sounds=[{...createSound('blip'),start:1,duration:.15}];p.duration=2;
 const mixed=renderMix(p,11025);assert.equal(mixed.left.length,33075);assert.equal(mixed.left[0],0);
 assert.ok(mixed.left.some(x=>x!==0));const wav=soundToWav(mixed),v=new DataView(wav);
 assert.equal(String.fromCharCode(...new Uint8Array(wav,0,4)),'RIFF');assert.equal(String.fromCharCode(...new Uint8Array(wav,8,4)),'WAVE');assert.equal(v.getUint16(22,true),2);assert.equal(v.getUint16(34,true),16);
 assert.equal(wav.byteLength,44+mixed.left.length*4);
});
test('audio sample imports are bounded and JSON-serializable',()=>{
 const sample=importSample(new Float32Array(44100).fill(.2),44100);
 assert.equal(sample.rate,11025);assert.equal(sample.data.length,11025);assert.ok(Math.abs(sample.data[100]-.2)<.001);assert.ok(JSON.stringify(sample).length>100);
});
test('Roblox Lua export includes actual ParticleEmitter properties, timing and safe identifiers',()=>{
 const p=makeProject();p.emitters[0].textureId='12345678';p.emitters[0].burst=12;const lua=exportRobloxLua(p);
 for(const part of ['Instance.new("ParticleEmitter")','ParticleEmitterShape','NumberSequenceKeypoint.new','ColorSequenceKeypoint.new','task.delay','rbxassetid://12345678','Emit(12)'])assert.ok(lua.includes(part),part);
 p.emitters[0].textureId='"\nprint("injected")';assert.ok(!exportRobloxLua(p).includes('print("injected")'));
});
test('blank VFX and sound create independently and do not inherit the preset parameters',()=>{
 const emitter=createBlankEmitter(),other=createBlankEmitter(),sound=createBlankSound();
 assert.notEqual(emitter.id,other.id);
 assert.equal(emitter.name,'Untitled Particle');
 assert.equal(emitter.shape,'point');
 assert.equal(emitter.turbulence,0);
 assert.notEqual(emitter.colorStart,createEmitter('embers').colorStart);
 assert.equal(sound.name,'Untitled Sound');
 assert.equal(sound.wave,'sine');
 assert.equal(sound.freq,sound.endFreq);
 assert.notEqual(sound.kind,createSound('impact').kind);
 const waveform=renderSound(sound,11025);
 assert.ok(waveform.left.some(x=>Math.abs(x)>0.0001));
 const project=makeProject();
 project.emitters=[emitter];
 project.sounds=[sound];
 const roundtrip=validateProject(JSON.parse(JSON.stringify(project)));
 assert.equal(roundtrip.emitters[0].colorStart,emitter.colorStart);
 assert.equal(roundtrip.sounds[0].freq,sound.freq);
 assert.match(exportRobloxLua(project),/ParticleEmitter/);
});

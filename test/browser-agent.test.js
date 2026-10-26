import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProject,validateProject} from '../src/core/presets.js';
import {planFromPrompt} from '../src/core/browser-agent.js';
import {parseModelDraft} from '../src/core/browser-llm.js';
import {renderMix} from '../src/core/audio.js';

const empty=()=>{
 const p=makeProject();p.emitters=[];p.sounds=[];return p;
};
test('school-browser creator builds multiple original effects + sounds without API',()=>{
 const project=empty();
 const answer=planFromPrompt({project,prompt:'Create thick blue electrical sparks bursting from a broken generator, with crackling sounds and a deep mechanical hum'});
 assert.ok(answer.changes.length>=3);
 assert.ok(answer.project.emitters.some(e=>e.sprite==='spark'));
 assert.ok(answer.project.sounds.some(s=>s.name.includes('Crackle')));
 assert.ok(answer.project.sounds.some(s=>s.name.includes('Hum')));
 assert.deepEqual(project.emitters,[]);
 assert.deepEqual(project.sounds,[]);
 const checked=validateProject(answer.project);
 assert.equal(checked.emitters[0].blend,'add');
 const sound=renderMix(checked,11025);
 assert.ok(sound.left.some(x=>Math.abs(x)>0.01));
});
test('school-browser sound-only mode does not accidentally generate VFX',()=>{
 const a=planFromPrompt({project:empty(),prompt:'Make only a soft UI click sound, gentle and short'});
 assert.equal(a.project.emitters.length,0);
 assert.equal(a.project.sounds.length,1);
 assert.equal(a.project.sounds[0].name,'UI Click');
});
test('school-browser creator edits selected layer and does not modify original',()=>{
 const input=empty();const first=planFromPrompt({project:input,prompt:'Create smoke drifting slowly'});
 const before=first.project.emitters[0].rate;
 const selected={kind:'emitter',id:first.project.emitters[0].id};
 const adjusted=planFromPrompt({project:first.project,prompt:'Make the smoke thicker with more particles',selection:selected});
 assert.equal(adjusted.changes[0].type,'edit');
 assert.ok(adjusted.project.emitters[0].rate>before);
 assert.equal(first.project.emitters[0].rate,before);
});
test('reference colour analysis can steer new emitter shades',()=>{
 const answer=planFromPrompt({project:empty(),prompt:'Create a bright portal effect',reference:{type:'image',palette:['#13579b','#2354fe']}});
 assert.equal(answer.project.emitters[0].colorStart,'#13579b');
});
test('unknown prompts are not falsely claimed as neural AI',()=>{
 const a=planFromPrompt({project:empty(),prompt:'Why is my Roblox script slow?'});
 assert.equal(a.project,null);assert.deepEqual(a.changes,[]);
 assert.match(a.reply,/not a general-purpose language model/i);
});
test('optional neural JSON plans validate against editor schema',()=>{
 const initial=empty();
 const answer=parseModelDraft(initial,JSON.stringify({emitters:[{name:'Spark',settings:{rate:75,sprite:'spark',blend:'add',gravity:-2,colorStart:'#aabbcc',unsupportedField:'NO'}}],sounds:[{name:'Crackle',settings:{kind:'noise',noise:.9,freq:850}}]}));
 assert.equal(answer.project.emitters[0].rate,75);
 assert.equal(answer.project.emitters[0].unsupportedField,undefined);
 assert.equal(answer.project.sounds[0].kind,'noise');
 assert.equal(initial.emitters.length,0);
 assert.throws(()=>parseModelDraft(initial,'sure, I can do that'),/valid|model/i);
});

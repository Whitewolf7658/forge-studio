/**
 * Spectra Core: private, optional AI dock. The agent never modifies project data
 * without an explicit Apply click, and the public site has no secret API key.
 */
import {planFromPrompt,inspectBrowserReference} from './browser-agent.js';
import {loadWebModel,planWithWebModel,webGPUAvailable,webModelReady} from './browser-llm.js';
export function initSpectraCore({getProject,getSelection,applyProject,notify}) {
  const header=document.querySelector('.head-actions');
  if(!header)throw Error('Spectra Core requires a header');
  const toggle=document.createElement('button');
  toggle.id='core-toggle';toggle.className='core-trigger';toggle.type='button';
  toggle.innerHTML='<span class="core-asterisk">✦</span><span>Spectra Core</span><small>BROWSER</small>';
  header.insertBefore(toggle,header.querySelector('[data-action="export-menu"]'));
  const dock=document.createElement('aside');
  dock.id='spectra-core-dock';dock.className='core-dock hidden';dock.setAttribute('aria-label','Private Spectra AI assistant');
  dock.innerHTML=[
  '<header class="core-head"><div class="core-title"><span class="core-monogram">✦</span><div><strong>SPECTRA CORE</strong><small>PRIVATE CREATION AGENT</small></div></div><button id="core-close" class="core-icon" aria-label="Close">×</button></header>',
  '<div class="core-connection"><span id="core-led" class="core-led"></span><span id="core-status">Checking local engine…</span><button id="core-refresh" class="core-icon" title="Refresh connection">↻</button></div>',
  '<div class="core-engine"><label>ENGINE<select id="core-engine"><option value="browser">Browser Creator · ready</option><option value="webgpu">Small in-browser AI · WebGPU</option><option value="local">Windows AI companion · Ollama</option></select></label><button id="core-enable-model" class="hidden">Load AI model</button></div>',
  '<p id="core-engine-note" class="core-engine-note">Runs now on your school MacBook without an installation. Procedural prompt-to-effect creation, not a full language model.</p>',
  '<div id="core-offline" class="core-offline hidden"><strong>Windows companion is optional.</strong><p>The browser creator works right here without installs. For a larger language model, use the Windows companion at home.</p><a href="https://github.com/Whitewolf7658/forge-studio/blob/main/local_core/README.md" target="_blank" rel="noopener">Setup instructions ↗</a><code>http://127.0.0.1:8765</code></div>',
  '<div class="core-config hidden"><label>Reasoning model<select id="core-model"><option value="">Connect locally…</option></select></label><label>Vision model<select id="core-vision"><option value="">Install vision model</option></select></label></div>',
  '<details class="core-memory"><summary>Personalize your AI · local memory</summary><textarea id="core-preferences" rows="2" maxlength="900" placeholder="e.g. realistic Roblox fire, cinematic sounds, no cartoon effects"></textarea><div class="core-memory-actions"><button id="core-save-preferences">Save preferences</button><button id="core-clear-chat">Clear conversation</button></div></details>',
  '<div class="core-conversation" id="core-chat" role="log" aria-live="polite"><div class="core-message assistant"><span class="core-kicker">SPECTRA CORE</span><div class="core-message-body">On your school laptop, Browser Creator builds editable particle and sound layers from descriptions. It can inspect basic image colours and sound levels. This mode is procedural, not a general AI model; the optional WebGPU model and Windows companion provide language-model features.</div></div></div>',
  '<div class="core-bottom">',
  '<div id="core-draft" class="core-draft hidden"><div class="core-draft-head"><strong>PROPOSED CHANGES</strong><span id="core-draft-count"></span></div><div id="core-draft-details"></div><div class="core-draft-actions"><button id="core-discard">Discard</button><button id="core-apply" class="primary">Apply to project</button></div></div>',
  '<div id="core-reference" class="core-reference hidden"><span id="core-reference-name"></span><button id="core-remove-ref" aria-label="Remove reference">×</button></div>',
  '<textarea id="core-prompt" rows="3" maxlength="5500" placeholder="Describe an original effect, sound or research task…" aria-label="Ask Spectra Core"></textarea>',
  '<div class="core-compose-actions"><label for="core-file" class="core-attach">＋ Reference</label><input id="core-file" type="file" hidden accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,audio/wav,audio/mpeg,audio/ogg,audio/mp4,.mov,.m4a,.mp3,.ogg,.wav,.mp4,.webm"><label class="core-web-label"><input id="core-web" type="checkbox"><span>Web access</span></label><button id="core-send" class="primary">Run agent ↗</button></div>',
  '<div class="core-footnote">Browser Creator works on school devices · AI model download is optional · Approve edits before applying</div>',
  '</div>'
  ].join('');
  document.querySelector('.app').appendChild(dock);
  const $=id=>dock.querySelector('#'+id);
  const chat=$('core-chat'),send=$('core-send'),prompt=$('core-prompt');
  let attached=null,draft=null,history=[],online=false,running=false,baseline=null;
  try{
    const previous=JSON.parse(localStorage.getItem('spectra.core.history.v1')||'[]');
    if(Array.isArray(previous))history=previous.filter(x=>['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-10);
    $('core-preferences').value=localStorage.getItem('spectra.core.preferences.v1')||'';
  }catch{/* Private mode may disable local storage */}

  function message(kind,text){
    const el=document.createElement('div');el.className='core-message '+kind;
    const kicker=document.createElement('span');kicker.className='core-kicker';
    kicker.textContent=kind==='user'?'YOU':kind==='error'?'ERROR':'SPECTRA CORE';
    const body=document.createElement('div');body.className='core-message-body';
    body.textContent=String(text||'');el.append(kicker,body);chat.append(el);
    chat.scrollTop=chat.scrollHeight;return el;
  }
  function connection(text,good){
    $('core-status').textContent=text;
    $('core-led').classList.toggle('on',Boolean(good));
    $('core-offline').classList.toggle('hidden',$('core-engine').value!=='local'||Boolean(good));
    online=Boolean(good);
  }
  function fillOptions(id,arr,preferred){
    const el=$(id),before=el.value;el.replaceChildren();
    for(const name of arr){
      const option=document.createElement('option');option.value=name;option.textContent=name;el.append(option);
    }
    if(!arr.length){
      const option=document.createElement('option');option.value='';
      option.textContent='Not installed';el.append(option);
    }else el.value=arr.includes(before)?before:(arr.includes(preferred)?preferred:arr[0]);
  }
  async function checkConnection(){
    if($('core-engine').value!=='local')return;
    connection('Checking Windows companion…',false);
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
    try{
      const res=await fetch('/api/health',{signal:controller.signal,cache:'no-store'});
      if(!res.ok||!res.headers.get('content-type')?.includes('application/json'))throw Error('No local agent API');
      const data=await res.json();
      if(!data.local||!data.ok)throw Error('Not a private Spectra agent');
      const names=data.models||[];
      fillOptions('core-model',names,'qwen3:4b');
      fillOptions('core-vision',names.filter(n=>/vl|vision|gemma3|llava/i.test(n)),'qwen2.5vl:3b');
      connection(names.length?'Windows model ready':'Companion active · download an Ollama model',names.length>0);
    }catch{connection('Windows companion not connected',false);}
    finally{clearTimeout(timer);}
  }
  function updateEngine(){
    const mode=$('core-engine').value;
    $('core-config').classList.toggle('hidden',mode!=='local');
    $('core-web').disabled=mode!=='local';
    if(mode!=='local')$('core-web').checked=false;
    $('core-enable-model').classList.toggle('hidden',mode!=='webgpu'||webModelReady());
    if(mode==='browser'){
      $('core-engine-note').textContent='Instant browser composer · works on this school MacBook. Procedural interpretation, not a language model.';
      connection('Browser Creator ready · no installs',true);
    }else if(mode==='webgpu'){
      const supported=webGPUAvailable();
      $('core-enable-model').disabled=!supported;
      $('core-engine-note').textContent=supported?'Optional small language model: downloads roughly 500 MB after you click Load. Needs memory and school Wi-Fi access.':'WebGPU appears unavailable or blocked. Switch to Browser Creator.';
      connection(webModelReady()?'On-device language model ready':supported?'Model not loaded · click Load':'WebGPU unavailable',webModelReady());
    }else{
      $('core-engine-note').textContent='This mode uses the Windows companion on your home PC. Switch to Browser Creator for school.';
      checkConnection();
    }
  }
  $('core-engine').onchange=updateEngine;
  $('core-enable-model').onclick=async()=>{
    if(!confirm('Download a small open-weight language model (hundreds of MB) to this browser? This may be blocked or slow on a school MacBook.'))return;
    const button=$('core-enable-model');button.disabled=true;button.textContent='Loading…';
    try{
      await loadWebModel(progress=>$('core-engine-note').textContent=progress);
      message('assistant','On-device model loaded. You can now draft effect layers with language-model assistance.');
      updateEngine();
    }catch(error){message('error',error.message+' Browser Creator remains available.');button.disabled=false;button.textContent='Retry download';updateEngine();}
  };
  function renderDraft(result){
    draft=result?.project&&result.changes?.length?result:null;
    $('core-draft').classList.toggle('hidden',!draft);
    if(!draft)return;
    $('core-draft-count').textContent=draft.changes.length+' operation(s)';
    const box=$('core-draft-details');box.replaceChildren();
    for(const change of draft.changes.slice(0,20)){
      const row=document.createElement('div');row.className='core-change';
      row.textContent=(change.type||'edit').toUpperCase()+' · '+(change.name||change.id||'Project')
        +(change.fields?.length?' · '+change.fields.join(', '):'');
      box.append(row);
    }
  }
  function evidence(result){
    if(result.steps?.length){
      const details=document.createElement('details');details.className='core-evidence';
      const sum=document.createElement('summary');sum.textContent='Agent activity · '+result.steps.length+' tool calls';details.append(sum);
      for(const step of result.steps){
        const p=document.createElement('p');p.textContent=(step.ok?'✓ ':'! ')+step.tool+': '+step.summary;details.append(p);
      }
      chat.append(details);
    }
    if(result.sources?.length){
      const div=document.createElement('div');div.className='core-sources';
      const title=document.createElement('small');title.textContent='RESEARCH SOURCES';div.append(title);
      for(const source of result.sources.slice(0,10)){
        try{
          const url=new URL(source.url);
          if(url.protocol!=='https:')continue;
          const a=document.createElement('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';
          a.textContent=(source.title||url.hostname).slice(0,100);div.append(a);
        }catch{}
      }
      chat.append(div);
    }
  }
  async function run(){
    if(running)return;
    const question=prompt.value.trim();
    if(!question){prompt.focus();return;}
    const mode=$('core-engine').value;
    if(mode==='local'&&!online){message('error','The Windows AI companion is not connected. Switch to Browser Creator to work here on your school laptop.');return;}
    if(mode==='webgpu'&&!webModelReady()){message('error','Load the optional on-device model, or choose Browser Creator which works immediately.');return;}
    if(draft){message('error','Apply or discard the current draft before another request.');return;}
    if(mode==='local'&&attached&&(attached.mime.startsWith('image/')||attached.mime.startsWith('video/'))&&!$('core-vision').value){
      message('error','Install a vision model on the Windows companion to interpret images/video.');return;
    }
    running=true;send.disabled=true;send.textContent='Working…';
    baseline=JSON.stringify(getProject());
    message('user',question+(attached?' [Reference: '+attached.name+']':''));
    prompt.value='';
    const preferences=$('core-preferences').value.slice(0,900);
    const progress=message('assistant',mode==='browser'?'Composing editable layers in this browser…':mode==='webgpu'?'Running the on-device language model…':'Planning with the local model and tools…');
    try{
      let answer;
      if(mode==='browser'||mode==='webgpu'){
        const ref=attached?.file?await inspectBrowserReference(attached.file):null;
        if(mode==='browser'){
          answer=planFromPrompt({prompt:question,project:getProject(),selection:getSelection?.()||null,reference:ref,preferences});
        }else{
          answer=await planWithWebModel({prompt:question,project:getProject(),reference:ref,preferences});
        }
        if(ref){answer.reference=ref;}
      }else{
        const request={prompt:question,project:getProject(),model:$('core-model').value,
          visionModel:$('core-vision').value,allowWeb:$('core-web').checked,history:history.slice(-8),preferences};
        if(attached)request.media={name:attached.name,mime:attached.mime,data:attached.data};
        const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
        if(!response.headers.get('content-type')?.includes('application/json'))throw Error('Unexpected local server response');
        answer=await response.json();
        if(!response.ok||answer.error)throw Error(answer.error||'Local agent request failed');
      }
      progress.querySelector('.core-message-body').textContent=answer.reply||'Finished.';
      evidence(answer);renderDraft(answer);
      history.push({role:'user',content:question},{role:'assistant',content:answer.reply||''});
      history=history.slice(-10);
      try{localStorage.setItem('spectra.core.history.v1',JSON.stringify(history));}catch{}
      if(answer.reference?.note)message('assistant','Reference measurement: '+answer.reference.note);
      if(!answer.changes?.length)notify('Spectra Core finished without changing the project');
    }catch(err){
      progress.classList.add('error');progress.querySelector('.core-message-body').textContent='Request failed: '+err.message;
    }finally{running=false;send.disabled=false;send.textContent='Run creator ↗';chat.scrollTop=chat.scrollHeight;}
  }
  send.onclick=run;
  prompt.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();run();}
  });
  $('core-refresh').onclick=()=>updateEngine();
  $('core-close').onclick=()=>{dock.classList.add('hidden');toggle.classList.remove('active');};
  toggle.onclick=()=>{
    const open=dock.classList.toggle('hidden')===false;
    toggle.classList.toggle('active',open);
    if(open){updateEngine();prompt.focus();}
  };
  $('core-save-preferences').onclick=()=>{
    try{localStorage.setItem('spectra.core.preferences.v1',$('core-preferences').value.slice(0,900));
      message('assistant','Your private creation preferences are saved on this computer.');}
    catch{message('error','This browser is not allowing local storage.');}
  };
  $('core-clear-chat').onclick=()=>{
    if(!confirm('Clear this assistant conversation from the current browser?'))return;
    history=[];try{localStorage.removeItem('spectra.core.history.v1');}catch{}
    chat.replaceChildren();message('assistant','Conversation cleared. Project layers are unchanged.');
  };
  $('core-discard').onclick=()=>{renderDraft(null);message('assistant','Discarded. Your project was not changed.');};
  $('core-apply').onclick=()=>{
    if(!draft)return;
    if(JSON.stringify(getProject())!==baseline&&!confirm('Your project changed while Core was working. Apply this draft and overwrite newer manual changes?'))return;
    try{
      const operations=draft.changes.length;
      applyProject(draft.project,draft.changes);
      renderDraft(null);baseline=null;
      message('assistant','Applied '+operations+' project changes. Ctrl+Z undoes the whole group.');
      notify('Spectra Core changes applied');
    }catch(e){message('error','Changes could not be applied: '+e.message);}
  };
  $('core-file').onchange=event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(file.size>24_000_000){message('error','Maximum reference size is 24 MB.');event.target.value='';return;}
    const reader=new FileReader();
    reader.onload=()=>{
      const value=String(reader.result||''),comma=value.indexOf(',');
      if(comma<0){message('error','Could not read reference');return;}
      let mime=file.type||'';
      if(!mime){
        const ext=file.name.split('.').pop()?.toLowerCase();
        mime=({mov:'video/quicktime',m4a:'audio/mp4',wav:'audio/wav',
          mp3:'audio/mpeg',ogg:'audio/ogg'})[ext]||'';
      }
      attached={name:file.name.slice(0,100),mime,data:value.slice(comma+1),file};
      $('core-reference-name').textContent=file.name+' · '+(file.size/1048576).toFixed(1)+' MB';
      $('core-reference').classList.remove('hidden');
    };
    reader.onerror=()=>message('error','File reading failed');
    reader.readAsDataURL(file);
  };
  $('core-remove-ref').onclick=()=>{attached=null;$('core-file').value='';$('core-reference').classList.add('hidden');};
  return {open:()=>{dock.classList.remove('hidden');toggle.classList.add('active');updateEngine();},refresh:updateEngine};
}

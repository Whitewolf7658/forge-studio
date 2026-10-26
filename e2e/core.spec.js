import {test,expect} from '@playwright/test';

test('school browser mode opens as ready without Ollama or installation',async({page})=>{
  const errs=[];
  page.on('pageerror',error=>errs.push(error.message));
  await page.route('**/api/health',async(route)=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({ok:true,local:true,ollama:false,models:[]})
  }));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('SPECTRA');
  await page.locator('#core-toggle').click();
  await expect(page.locator('#spectra-core-dock')).toBeVisible();
  await expect(page.locator('#core-offline')).toBeHidden();
  await expect(page.locator('#core-status')).toContainText('Browser Creator ready');
  await expect(page.locator('#core-engine')).toHaveValue('browser');
  await page.locator('#core-close').click();
  await expect(page.locator('#spectra-core-dock')).toBeHidden();
  expect(errs).toEqual([]);
});

test('AI project draft requires Apply and can be undone',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/health',async(route)=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({ok:true,local:true,ollama:true,
      models:['qwen3:4b','qwen2.5vl:3b']})
  }));
  let requestReceived=null;
  await page.route('**/api/chat',async(route)=>{
    requestReceived=route.request().postDataJSON();
    const request=route.request().postDataJSON();
    const next=JSON.parse(JSON.stringify(request.project));
    const template=next.emitters[0];
    const newLayer={...template,id:'ai_testing_2026',name:'AI Test Spark',rate:43,
      colorStart:'#82bbff',sprite:'spark'};
    next.emitters.push(newLayer);
    await route.fulfill({
      status:200,contentType:'application/json',
      body:JSON.stringify({reply:'Prepared your new editable sparks.',project:next,
        changes:[{type:'add',kind:'emitter',id:newLayer.id,name:newLayer.name}],
        steps:[{tool:'add_effect',ok:true,summary:'created test sparks'}],sources:[],model:'qwen3:4b'})
    });
  });
  await page.goto('/');
  await page.locator('#core-toggle').click();
  await page.locator('#core-engine').selectOption('local');
  await expect(page.locator('#core-status')).toContainText('ready');
  await page.locator('.core-memory summary').click();
  await page.locator('#core-preferences').fill('High-detail realistic blue electrical effects.');
  await page.locator('#core-save-preferences').click();
  await page.locator('#core-prompt').fill('Build test sparks');
  await page.locator('#core-send').click();
  await expect(page.locator('#core-draft')).toBeVisible();
  expect(requestReceived?.preferences).toContain('realistic blue electrical');
  await expect(page.locator('#core-draft')).toContainText('AI Test Spark');
  await expect(page.locator('#layer-list')).not.toContainText('AI Test Spark');
  await page.locator('#core-apply').click();
  await expect(page.locator('#layer-list')).toContainText('AI Test Spark');
  await page.locator('[data-action="undo"]').first().click();
  await expect(page.locator('#layer-list')).not.toContainText('AI Test Spark');
  expect(errors).toEqual([]);
});


test('school laptop composes VFX + audio with zero AI server, reviews and undoes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let calls=0;
 await page.route('**/api/chat',async route=>{
  calls++;await route.fulfill({status:500,body:'AI should not be called'});
 });
 await page.goto('/');
 await page.locator('#core-toggle').click();
 await expect(page.locator('#core-status')).toContainText('Browser Creator ready');
 await page.locator('#core-prompt').fill('Create bright blue electrical sparks from a damaged generator and deep mechanical hum');
 await page.locator('#core-send').click();
 await expect(page.locator('#core-draft')).toBeVisible();
 await expect(page.locator('#core-draft')).toContainText('Electrical Sparks');
 await expect(page.locator('#core-draft')).toContainText('Generator Hum');
 await expect(page.locator('#layer-list')).not.toContainText('Electrical Sparks');
 await page.locator('#core-apply').click();
 await expect(page.locator('#layer-list')).toContainText('Electrical Sparks');
 await page.locator('[data-action="undo"]').first().click();
 await expect(page.locator('#layer-list')).not.toContainText('Electrical Sparks');
 expect(calls).toBe(0);
 expect(errors).toEqual([]);
});

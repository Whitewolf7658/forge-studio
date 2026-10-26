import {test,expect} from '@playwright/test';

test('AI dock opens, reports offline state, and does not break editor',async({page})=>{
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
  await expect(page.locator('#core-offline')).toBeVisible();
  await expect(page.locator('#core-status')).toContainText('model');
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

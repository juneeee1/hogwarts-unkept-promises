import {chromium,executablePath} from './qa-runtime.mjs';
const browser=await chromium.launch({headless:true,executablePath,args:['--use-angle=metal']});
const context=await browser.newContext({viewport:{width:1440,height:960},locale:'zh-CN'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4175/');await page.locator('.experience.is-ready').waitFor({timeout:60000});await page.screenshot({path:'outputs/qa-singleplayer/overview-zh.png'});console.log(await page.locator('main').innerText());
await page.getByRole('button',{name:'开启这个夜晚'}).click();await page.waitForTimeout(700);await page.keyboard.down('w');await page.waitForTimeout(1000);await page.keyboard.up('w');await page.waitForTimeout(300);console.log('walk',await page.locator('main').getAttribute('data-step'),await page.locator('main').getAttribute('data-fps'));await page.screenshot({path:'outputs/qa-singleplayer/bridge-zh.png'});
const action=page.locator('.portal-action');if(await action.count()){await action.click();await page.screenshot({path:'outputs/qa-singleplayer/letter-zh.png'});console.log('dialog',await page.getByRole('dialog').innerText());}
console.log('errors',errors);await browser.close();

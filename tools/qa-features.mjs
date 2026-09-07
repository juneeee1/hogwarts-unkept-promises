import {chromium,executablePath} from './qa-runtime.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {strict as assert} from 'node:assert';

const key='hogwarts-unkept-promises-v1';
const seed=JSON.parse(await readFile('outputs/qa-singleplayer/completed-save.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath,args:['--use-angle=metal']});
const results=[],errors=[];
async function open(overrides={}){
 const context=await browser.newContext({viewport:{width:1440,height:960},locale:'zh-CN',acceptDownloads:true});
 await context.addInitScript(({key,save})=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(save));
  window.__qaTools={};Object.defineProperty(document,'modelContext',{value:{registerTool(tool){window.__qaTools[tool.name]=tool;}},configurable:true});
 },{key,save:{...seed,secrets:[],...overrides}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4175/');await page.locator('.experience.is-ready').waitFor({timeout:60000});
 return {context,page};
}
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
async function walk(page,x,z){
 for(let i=0,stuck=0,last=1e6;i<180;i++){
  const s=await page.evaluate(()=>window.__qaTools.read_castle_exploration.execute()),[px,,pz]=s.position,dx=x-px,dz=z-pz,d=Math.hypot(dx,dz);
  if(d<.4)return;
  stuck=Math.abs(last-d)<.008?stuck+1:0;assert(stuck<16,`Route blocked: ${s.position} to ${x},${z}`);last=d;
  const yaw=s.heading*Math.PI/180,lx=dx*Math.cos(yaw)-dz*Math.sin(yaw),lz=dx*Math.sin(yaw)+dz*Math.cos(yaw);
  const keys=[...(lx>.25?['d']:lx<-.25?['a']:[]),...(lz>.25?['s']:lz<-.25?['w']:[])];
  for(const k of keys)await page.keyboard.down(k);await page.waitForTimeout(100);for(const k of keys)await page.keyboard.up(k);
 }
 throw Error('Route timed out');
}
async function travel(page,name){await page.getByRole('button',{name:'城堡地图',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:new RegExp(name)}).click();await page.waitForTimeout(650);}
async function interact(page){await page.waitForTimeout(400);await page.locator('.portal-action').click();await page.locator('.story-dialog').waitFor();}
async function settings(page){await page.locator('.top-tools>.icon-button').last().click();}
try{
 const {context,page}=await open();await settings(page);
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'导出存档',exact:true}).click();
 const download=await downloadPromise;const exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(exported.step,'complete');assert(exported.endingRead);
 const upload=page.locator('input[type=file]');await upload.setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":99}')});await page.getByRole('alert').filter({hasText:'现有进度未改变'}).waitFor();assert.equal((await saved(page)).step,'complete');
 await page.getByRole('button',{name:'重新开始',exact:true}).click();await page.locator('.confirm-actions').getByRole('button',{name:'返回',exact:true}).click();assert.equal((await saved(page)).step,'complete');
 await page.getByRole('button',{name:'重新开始',exact:true}).click();await page.locator('.confirm-actions').getByRole('button',{name:'确认',exact:true}).click();assert.equal((await saved(page)).step,'letter');assert.equal((await saved(page)).started,false);
 await settings(page);await page.locator('input[type=file]').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.locator('.confirm-actions').getByRole('button',{name:'确认',exact:true}).click();assert.equal((await saved(page)).step,'complete');
 await page.reload();await page.locator('.experience.is-ready').waitFor({timeout:60000});assert.equal(await page.locator('main').getAttribute('data-step'),'complete');
 const other=await context.newPage();await other.goto('http://127.0.0.1:4175/');await other.locator('.experience.is-ready').waitFor({timeout:60000});await other.locator('.language-select select').selectOption('en');await page.locator('.error-banner').filter({hasText:'另一标签页'}).waitFor();assert.equal((await saved(page)).locale,'en');
 await page.screenshot({path:'outputs/qa-singleplayer/save-conflict.png'});await context.close();results.push({saveExport:true,invalidImportPreservesProgress:true,newGameCancel:true,newGameConfirm:true,importAndReload:true,crossTabConflict:true});console.log('PASS save UI, reset/import, cross-tab protection');

 for(const [house,step,checkpoint,waypoints,expected] of [
  ['gryffindor','passage','shelter',[[87,3]],[0]],
  ['ravenclaw','archive','library',[],[0]],
  ['hufflepuff','medicine','shelter',[[87,0],[90,-2.8]],[2]],
  ['slytherin','stars','astronomy',[[28.4,-44.6],[28.4,-46.4]],[0,3,0]],
 ]){
  const {context,page}=await open({house,step,checkpoint,endingRead:false,drafts:{}});await page.locator('.enter-button').click();await page.waitForTimeout(650);for(const [x,z] of waypoints)await walk(page,x,z);await interact(page);await page.getByRole('button',{name:/学院带来的帮助/}).click();assert.deepEqual((await saved(page)).drafts[step],expected);assert.equal((await saved(page)).step,step);await page.getByRole('button',{name:/学院带来的帮助/}).click();assert.deepEqual((await saved(page)).drafts[step],expected);await context.close();results.push({house,aid:true,idempotent:true});console.log('PASS house aid',house);
 }
 const secrets=await open({checkpoint:'bridge'});await secrets.page.locator('.enter-button').click();await secrets.page.waitForTimeout(650);
 for(const [id,place,waypoints] of [
  ['owl','高架石桥',[[0,66],[2.8,65.5]]],
  ['wrapper','钟楼庭院',[[0,20],[-17,20],[-17,11]]],
  ['swamp','移动楼梯',[[-7,-63]]],
  ['portrait','移动楼梯',[[7,-63]]],
  ['locket','图书馆',[[-29.2,-8]]],
 ]){
  await travel(secrets.page,place);for(const [x,z] of waypoints)await walk(secrets.page,x,z);await interact(secrets.page);await secrets.page.getByRole('button',{name:'认真收好这一刻'}).click();assert((await saved(secrets.page)).secrets.includes(id));console.log('PASS secret',id);
 }
 await secrets.page.getByRole('button',{name:'故事册',exact:true}).click();assert.equal(await secrets.page.locator('.secret-list button:not([disabled])').count(),5);await secrets.page.screenshot({path:'outputs/qa-singleplayer/secrets-complete.png'});await secrets.context.close();results.push({secrets:5,worldApproachAndInteraction:true,journalReplay:true});assert.deepEqual(errors,[]);
}catch(e){console.error(e);process.exitCode=1;}finally{await writeFile('outputs/qa-singleplayer/features.json',JSON.stringify({results,errors},null,2));await browser.close();}

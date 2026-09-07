import {chromium,executablePath} from './qa-runtime.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {strict as assert} from 'node:assert';
const browser=await chromium.launch({headless:true,executablePath,args:['--use-angle=metal']});
const context=await browser.newContext({viewport:{width:1440,height:960},locale:'zh-CN'});
const seed=JSON.parse(await readFile('outputs/qa-singleplayer/completed-save.json','utf8'));
const report={},errors=[];
try{
 await context.addInitScript(s=>{if(!localStorage.getItem('hogwarts-unkept-promises-v1'))localStorage.setItem('hogwarts-unkept-promises-v1',JSON.stringify(s));window.__qaAudio=[];const Original=window.Audio;window.Audio=function(...args){const audio=new Original(...args);window.__qaAudio.push(audio);return audio;};},{...seed,step:'sorting',house:null,sorting:[],started:true,endingRead:false,checkpoint:'hall',locale:'zh-CN',music:true});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4175/');await page.locator('.experience.is-ready').waitFor({timeout:60000});await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 await context.setOffline(true);await page.reload();await page.locator('.experience.is-ready').waitFor({timeout:60000});
 assert.equal(await page.evaluate(()=>window.__qaAudio.length),0,'Saved music enabled autoplay without a new gesture');
 await page.locator('.enter-button').click();await page.waitForFunction(()=>window.__qaAudio.some(a=>!a.paused&&a.currentTime>.2),null,{timeout:15000});
 report.offlineAudioPlayback=true;report.savedPreferenceNeedsGesture=true;
 const range=await page.evaluate(async()=>{const response=await fetch(window.__qaAudio[0].src,{headers:{Range:'bytes=0-31'}});return {status:response.status,bytes:(await response.arrayBuffer()).byteLength,contentRange:response.headers.get('Content-Range')};});
 assert.equal(range.status,206);assert.equal(range.bytes,32);assert.equal(range.contentRange,'bytes 0-31/4946484');report.cachedRangeResponse=range;
 await page.getByRole('button',{name:'静音背景音乐',exact:true}).click();assert(await page.evaluate(()=>window.__qaAudio[0].paused));report.offlineMute=true;
 await page.keyboard.down('w');await page.waitForTimeout(6380);await page.keyboard.up('w');await page.waitForTimeout(450);
 await page.screenshot({path:'outputs/qa-polish/hall-windows.png'});await page.locator('.portal-action').click();await page.locator('.sorting-dialog').waitFor();await page.waitForTimeout(800);
 await page.locator('.hat-voice').click();const localVoice=await page.evaluate(()=>window.speechSynthesis?.getVoices().some(v=>v.localService&&v.lang.toLowerCase().startsWith('zh')));
 if(!localVoice){await page.locator('.voice-note').waitFor();report.voice='No installed local Chinese voice; localized subtitle fallback shown';}else report.voice='Local Chinese voice offered; audible quality not manually graded';
 assert.deepEqual(errors,[]);console.log(JSON.stringify(report,null,2));
}catch(error){console.error(error);process.exitCode=1;}finally{await writeFile('outputs/qa-polish/offline-audio.json',JSON.stringify({report,errors},null,2));await browser.close();}

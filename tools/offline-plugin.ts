import type {Plugin} from 'vite';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
export async function respondFromCache(request:Request,cached:Response):Promise<Response>{
 const range=request.headers.get('range');if(!range||cached.status!==200)return cached;
 const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return cached;
 const blob=await cached.blob(),size=blob.size;
 const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
 const end=match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 const headers=new Headers(cached.headers);headers.set('Content-Range','bytes '+start+'-'+end+'/'+size);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');headers.delete('Content-Encoding');
 return new Response(blob.slice(start,end+1),{status:206,headers});
}
export function offlinePlugin():Plugin {let output='';return {name:'castle-offline',apply:'build',configResolved(config){output=resolve(config.root,config.build.outDir);},async closeBundle(){
 const files:string[]=[];async function walk(dir:string){for(const item of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,item.name);if(item.isDirectory())await walk(path);else if(!item.name.endsWith('.map')&&item.name!=='sw.js')files.push(relative(output,path).replaceAll('\\','/'));}}await walk(output);files.sort();const hash=createHash('sha256');for(const f of files)hash.update(await readFile(resolve(output,f)));const version='hogwarts-story-'+hash.digest('hex').slice(0,16);
 const script=`const VERSION=${JSON.stringify(version)};const FILES=${JSON.stringify(files)};const respondFromCache=${respondFromCache.toString()};
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(VERSION);try{await cache.addAll(FILES.map(p=>new URL(p,self.registration.scope).href));await self.skipWaiting();}catch(error){await caches.delete(VERSION);throw error;}})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('hogwarts-story-')&&n!==VERSION).map(n=>caches.delete(n)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;event.respondWith((async()=>{const cache=await caches.open(VERSION);if(event.request.mode==='navigate'){try{return await fetch(event.request);}catch{return (await cache.match(new URL('index.html',self.registration.scope).href,{ignoreVary:true}))||Response.error();}}const cached=await cache.match(event.request,{ignoreVary:true});if(cached)return respondFromCache(event.request,cached);return fetch(event.request);})());});`;
 await writeFile(resolve(output,'sw.js'),script);console.log(`Offline bundle: ${files.length} files, ${version}`);
 }};}

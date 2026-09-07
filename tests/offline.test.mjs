import {strict as assert} from 'node:assert';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
try{
 const {respondFromCache}=await server.ssrLoadModule('/tools/offline-plugin.ts');
 const audio=()=>new Response('0123456789',{headers:{'Content-Type':'audio/mpeg'}});
 for(const [range,expected,contentRange] of [['bytes=0-1','01','bytes 0-1/10'],['bytes=5-','56789','bytes 5-9/10'],['bytes=-3','789','bytes 7-9/10'],['bytes=8-99','89','bytes 8-9/10']]){
  const response=await respondFromCache(new Request('https://example.test/theme.mp3',{headers:{Range:range}}),audio());assert.equal(response.status,206);assert.equal(response.headers.get('Content-Range'),contentRange);assert.equal(response.headers.get('Content-Type'),'audio/mpeg');assert.equal(response.headers.get('Content-Length'),String(expected.length));assert.equal(await response.text(),expected);
 }
 for(const range of ['bytes=10-','bytes=7-2','bytes=-0']){const response=await respondFromCache(new Request('https://example.test/theme.mp3',{headers:{Range:range}}),audio());assert.equal(response.status,416);assert.equal(response.headers.get('Content-Range'),'bytes */10');}
 const plain=await respondFromCache(new Request('https://example.test/theme.mp3'),audio());assert.equal(plain.status,200);assert.equal(await plain.text(),'0123456789');
 console.log('PASS cached audio byte ranges, suffixes, invalid ranges and complete requests');
}finally{await server.close();}

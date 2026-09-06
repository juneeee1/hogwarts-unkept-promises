import { strict as assert } from 'node:assert';
import { createServer } from 'vite';
import * as THREE from 'three';

// Geometry and navigation tests need no browser, graphics driver, or network.
globalThis.document={createElement(){return {width:0,height:0,getContext(){return {createRadialGradient(){return {addColorStop(){}}},fillRect(){}}}}}};
const server=await createServer({configFile:false,server:{middlewareMode:true},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
try{
 const {buildCastle}=await server.ssrLoadModule('/src/world/castle.ts');
 const {PLACES,canMove,placeAt,insideWalkable}=await server.ssrLoadModule('/src/world/navigation.ts');
 const keys=['stone','trim','darkStone','roof','floor','wood','gold','iron','window','blueWindow','wax','flame','green','rock','tree','red','blue','yellow','emerald','parchment'];
 const m=Object.fromEntries(keys.map(k=>[k,new THREE.MeshStandardMaterial()]));
 const scene=new THREE.Scene();const world=buildCastle(scene,m);let vertices=0,triangles=0;
 scene.traverse(o=>{if(!o.geometry)return;const p=o.geometry.getAttribute('position');vertices+=p.count;if(o.isMesh)triangles+=(o.geometry.index?.count??p.count)/3;for(const n of p.array)assert(Number.isFinite(n),'Non-finite geometry vertex');});
 assert(vertices>50000,'Expected detailed geometry');assert(triangles<1500000,'Mobile triangle budget exceeded');
 for(const place of PLACES){const [x,y,z]=place.position;assert.equal(placeAt(x,z,y),place.id,'Wrong destination region');assert(canMove(x,z,y,world.obstacles),`Blocked spawn: ${place.id}`);}
 for(let z=84;z>-37;z-=.25)assert(canMove(0,z,2.05,world.obstacles),`Blocked central bridge-to-hall path at ${z}`);
 assert(!canMove(6,72,2.05,world.obstacles),'Can leave stone bridge');
 assert(!canMove(12.5,-20,2.05,world.obstacles),'Can cross Great Hall stone wall');
 assert(!canMove(3.5,-20,2.05,world.obstacles),'Can cross table');
 assert(!insideWalkable(37,-47,34.05),'Can fall from observatory');
 // Flood fill the actual collision geometry to verify courtyard-to-side-room access.
 const step=.5,queue=[[0,18]],visited=new Set(['0,36']);
 for(let index=0;index<queue.length;index++){const [x,z]=queue[index];for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,nz=z+dz,key=`${Math.round(nx/step)},${Math.round(nz/step)}`;if(visited.has(key)||nz>32)continue;if(canMove(nx,nz,2.05,world.obstacles)){visited.add(key);queue.push([nx,nz]);}}}
 for(const place of PLACES.filter(p=>['courtyard','hall','library','potions'].includes(p.id))){const [x,,z]=place.position;assert(visited.has(`${Math.round(x/step)},${Math.round(z/step)}`),`Unreachable room: ${place.id}`);}
 console.log(JSON.stringify({result:'PASS',checks:['finite geometry','triangle budget','six safe spawns','continuous bridge-to-hall walk','bridge boundaries','wall collision','table collision','observatory boundary','all ground-floor rooms connected'],vertices,triangles,colliders:world.obstacles.length,walkableCells:visited.size},null,2));
} finally {await server.close();}

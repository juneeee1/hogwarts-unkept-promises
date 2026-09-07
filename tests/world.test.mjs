import { strict as assert } from 'node:assert';
import { createServer } from 'vite';
import * as THREE from 'three';

// Geometry and navigation tests need no browser, graphics driver, or network.
globalThis.document={createElement(){return {width:0,height:0,getContext(){return {createRadialGradient(){return {addColorStop(){}}},fillRect(){}}}}}};
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:{port:24981}},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
try{
 const {buildCastle}=await server.ssrLoadModule('/src/world/castle.ts');
 const {PLACES,ALL_PLACES,canMove,placeAt,insideWalkable}=await server.ssrLoadModule('/src/world/navigation.ts');
 const keys=['stone','trim','darkStone','roof','floor','wood','gold','iron','window','blueWindow','wax','flame','green','rock','tree','red','blue','yellow','emerald','parchment','sandstone','brass','silver','ceramic','glass','lens','leather','robe'];
 const m=Object.fromEntries(keys.map(k=>[k,new THREE.MeshStandardMaterial()]));
 m.portraits=Array.from({length:6},()=>new THREE.MeshStandardMaterial());m.banners=Array.from({length:4},()=>new THREE.MeshStandardMaterial());
 // Intersect the cloth's actual triangle edges against the rendered stool and hat.
 // This detects the round-seat / splayed-leg clipping reported in the model preview.
 const {Builder}=await server.ssrLoadModule('/src/world/builder.ts');
 const {buildSortingHatDisplay}=await server.ssrLoadModule('/src/world/sorting-hat.ts');
 const {animateSortingHat}=await server.ssrLoadModule('/src/world/sorting-hat.ts');
 const display=new THREE.Scene(),displayBuilder=new Builder(display,m);
 const displayHat=buildSortingHatDisplay(displayBuilder,0,.4,0);displayBuilder.finish();
 const cloth=display.getObjectByName('sorting-hat-stool-drape');assert(cloth,'Missing cloth');
 const solid=[];display.traverse(o=>{if(o.isMesh&&o!==cloth)solid.push(o);});
 const clothP=cloth.geometry.getAttribute('position'),clothI=cloth.geometry.index;
 const ray=new THREE.Raycaster(),from=new THREE.Vector3(),to=new THREE.Vector3(),direction=new THREE.Vector3();
 for(const tilt of [0,.018,-.018]){
   animateSortingHat(displayHat,1.14,tilt===0?0:1);
   displayHat.rotation.z=tilt;displayHat.rotation.y=.04;display.updateMatrixWorld(true);
   const seen=new Set();
   for(let i=0;i<clothI.count;i+=3)for(const [a,b] of [[0,1],[1,2],[2,0]]){
     const ia=clothI.getX(i+a),ib=clothI.getX(i+b),key=ia<ib?`${ia}:${ib}`:`${ib}:${ia}`;
     if(seen.has(key))continue;seen.add(key);
     from.fromBufferAttribute(clothP,ia).applyMatrix4(cloth.matrixWorld);
     to.fromBufferAttribute(clothP,ib).applyMatrix4(cloth.matrixWorld);
     assert(from.y>.45,'Cloth intersects the floor');direction.copy(to).sub(from);
     const length=direction.length();ray.set(from,direction.normalize());ray.near=.0001;ray.far=length-.0001;
     const hits=ray.intersectObjects(solid,false);
     assert.equal(hits.length,0,`Cloth crosses display geometry at ${from.toArray()} / tilt ${tilt}`);
   }
 }
 const scene=new THREE.Scene();const world=buildCastle(scene,m);const {buildStoryWorld}=await server.ssrLoadModule('/src/world/story-world.ts');const storyWorld=buildStoryWorld(scene,m);world.obstacles.push(...storyWorld.obstacles);let vertices=0,triangles=0;
 scene.traverse(o=>{if(!o.geometry)return;const p=o.geometry.getAttribute('position');vertices+=p.count;if(o.isMesh)triangles+=(o.geometry.index?.count??p.count)/3;for(const n of p.array)assert(Number.isFinite(n),'Non-finite geometry vertex');});
 assert(vertices>50000,'Expected detailed geometry');assert(triangles<1500000,`Mobile triangle budget exceeded: ${triangles}`);
 for(const place of ALL_PLACES){const [x,y,z]=place.position;assert.equal(placeAt(x,z,y),place.id,'Wrong destination region');assert(canMove(x,z,y,world.obstacles),`Blocked spawn: ${place.id}`);}
 for(let z=84;z>-37;z-=.25)assert(canMove(0,z,2.05,world.obstacles),`Blocked central bridge-to-hall path at ${z}`);
 assert(!canMove(6,72,2.05,world.obstacles),'Can leave stone bridge');
 assert(!canMove(12.5,-20,2.05,world.obstacles),'Can cross Great Hall stone wall');
 assert(!canMove(3.5,-20,2.05,world.obstacles),'Can cross table');
 assert(!insideWalkable(37,-47,34.05),'Can fall from observatory');
 // Flood fill the actual collision geometry to verify courtyard-to-side-room access.
 const step=.5,queue=[[0,18]],visited=new Set(['0,36']);
 for(let index=0;index<queue.length;index++){const [x,z]=queue[index];for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,nz=z+dz,key=`${Math.round(nx/step)},${Math.round(nz/step)}`;if(visited.has(key)||nz>32)continue;if(canMove(nx,nz,2.05,world.obstacles)){visited.add(key);queue.push([nx,nz]);}}}
 for(const place of PLACES.filter(p=>['courtyard','hall','library','potions','stairs'].includes(p.id))){const [x,,z]=place.position;assert(visited.has(`${Math.round(x/step)},${Math.round(z/step)}`),`Unreachable room: ${place.id}`);}
 // Verify real generated place settings stay inside table bounds, including the last setting.
 const {HALL_TABLES}=await server.ssrLoadModule('/src/world/props.ts');
 assert(HALL_TABLES.plateOffset+HALL_TABLES.plateRadius<HALL_TABLES.width/2,'Plate crosses side of table');
 for(let z=HALL_TABLES.firstPlaceZ;z>HALL_TABLES.lastPlaceZ;z-=2.3)assert(Math.abs(z-HALL_TABLES.centerZ)+HALL_TABLES.plateRadius<HALL_TABLES.length/2,'Plate crosses end of table');
 const {STORY_OBJECTS}=await server.ssrLoadModule('/src/game/story.ts');
 for(const object of STORY_OBJECTS){const [ox,oy,oz]=object.position;const eye=object.place==='astronomy'?34.05:2.05;let reachable=false;for(let x=ox-object.range;x<ox+object.range;x+=.3)for(let z=oz-object.range;z<oz+object.range;z+=.3){if(Math.hypot(x-ox,z-oz,eye-oy)<object.range&&canMove(x,z,eye,world.obstacles))reachable=true;}assert(reachable,`Cannot approach story object ${object.id}`);}
 const {newSave}=await server.ssrLoadModule('/src/game/state.ts');storyWorld.setState(newSave(),'shelter',true);storyWorld.update(0);assert(!canMove(87,1,2.05,world.obstacles),'Unsolved beam does not block route');storyWorld.setState({...newSave(),step:'shield'},'shelter',true);storyWorld.update(1);assert(canMove(87,1,2.05,world.obstacles),'Solved beam still blocks route');
 const {flightWorld,flightLocal,flightHeight,STAIR_RUN,STAIR_RISE,EYE_HEIGHT}=await server.ssrLoadModule('/src/world/staircases.ts');
 for(const flight of world.stairs.flights){
   for(const angle of flight.angles){flight.angle=angle;let feet=flight.floor*STAIR_RISE;
     for(let d=0;d<=STAIR_RUN;d+=.15){const p=flightWorld(flight,0,d);const support=world.stairs.floorAt(p.x,p.z,feet);assert.notEqual(support,null,`Unsupported ascent floor ${flight.floor} at ${d}`);feet=support;}
     assert(Math.abs(feet-(flight.floor+1)*STAIR_RISE)<.2,'Flight does not reach upper landing');
     for(let d=STAIR_RUN;d>=0;d-=.15){const p=flightWorld(flight,0,d);const support=world.stairs.floorAt(p.x,p.z,feet);assert.notEqual(support,null,`Unsupported descent floor ${flight.floor} at ${d}`);feet=support;}
     assert(Math.abs(feet-flight.floor*STAIR_RISE)<.2,`Flight does not return to lower landing: floor=${flight.floor}, angle=${angle}, feet=${feet}`);
   }flight.angle=flight.angles[0];
 }
 const flight=world.stairs.flights[0],mid=flightWorld(flight,.2,9),rider=new THREE.Vector3(mid.x,flightHeight(9,0)+EYE_HEIGHT,mid.z);
 world.stairs.update(.01,rider);assert(world.stairs.trigger(rider),'Stair trigger failed');
 for(let t=.06;t<5.7;t+=.05){world.stairs.update(t,rider);const local=flightLocal(flight,rider.x,rider.z);assert(Math.abs(local.x-.2)<1e-5&&Math.abs(local.d-9)<1e-5,'Rider slips during rotation');assert.notEqual(world.stairs.floorAt(rider.x,rider.z,rider.y-EYE_HEIGHT),null,'Rider loses support');}
 assert(!flight.moving,'Stair animation did not finish');assert(Math.abs(flight.angle-flight.angles[1])<1e-5,'Stair misses landing');
 assert.equal(world.stairs.floorAt(0,-78,10.8),null,'Can step into atrium void');
 assert.equal(world.stairs.floorAt(12.5,-77,5.4),null,'Can leave outer gallery');
 console.log(JSON.stringify({result:'PASS',checks:['cloth clears stool and hat in rest and nod poses','finite geometry','triangle budget','nine safe spawns','all story props approachable','rescue beam changes collision','continuous bridge-to-hall walk','bridge boundaries','wall collision','table collision','observatory boundary','all ground-floor rooms connected','plate edge margins','both directions on all four flights','both staircase alignments','rider carried through rotation','atrium fall prevention'],vertices,triangles,colliders:world.obstacles.length,walkableCells:visited.size},null,2));
} finally {await server.close();}

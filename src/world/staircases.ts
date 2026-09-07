import * as T from 'three';
import {Builder} from './builder';
import type {Materials} from './materials';
import {lantern,portrait} from './props';
import type {FireSource} from './effects';

export const STAIR_RISE=5.4,STAIR_RUN=18,STEP_COUNT=30,STAIR_WIDTH=2.65,EYE_HEIGHT=2.05;
export type Flight={group:T.Group;origin:T.Vector3;floor:number;angle:number;from:number;to:number;progress:number;moving:boolean;alternate:boolean;angles:[number,number]};
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
export function flightLocal(f:Flight,x:number,z:number){const dx=x-f.origin.x,dz=z-f.origin.z,c=Math.cos(f.angle),s=Math.sin(f.angle);return {x:dx*c-dz*s,d:-(dx*s+dz*c)};}
export function flightWorld(f:Flight,x:number,d:number){return {x:f.origin.x+x*Math.cos(f.angle)-d*Math.sin(f.angle),z:f.origin.z-x*Math.sin(f.angle)-d*Math.cos(f.angle)};}
export function flightHeight(d:number,floor:number){return floor*STAIR_RISE+Math.ceil(T.MathUtils.clamp(d,0,STAIR_RUN)/(STAIR_RUN/STEP_COUNT)-1e-6)*STAIR_RISE/STEP_COUNT;}
export function inStairHall(x:number,z:number){return Math.abs(x)<12.4&&z<-60.6&&z>-93.4;}
export function onGallery(x:number,z:number){return inStairHall(x,z)&&(Math.abs(x)>8.12||z<-89.55||z>-64.45);}
export function galleryOpening(flights:Flight[],x:number,z:number,level:number){
  return flights.some(f=>f.floor+1===level&&f.angles.some(angle=>{const local=flightLocal({...f,angle},x,z);return Math.abs(local.x)<STAIR_WIDTH/2+.15&&local.d>0&&local.d<STAIR_RUN-.12;}));
}
export function stairSupport(flights:Flight[],x:number,z:number,feet:number):number|null{
  if(!inStairHall(x,z))return null;
  const candidates:number[]=[0];if(onGallery(x,z))for(let i=1;i<=4;i++)if(!galleryOpening(flights,x,z,i))candidates.push(i*STAIR_RISE);
  for(const f of flights){const p=flightLocal(f,x,z);if(Math.abs(p.x)<STAIR_WIDTH/2-.32&&p.d>=-.22&&p.d<=STAIR_RUN+.22)candidates.push(flightHeight(p.d,f.floor));}
  const reachable=candidates.filter(y=>Math.abs(y-feet)<.32).sort((a,b)=>b-a);return reachable[0]??null;
}
export function buildStairHall(scene:T.Scene,m:Materials,fire:FireSource[]){
  const b=new Builder(scene,m),flights:Flight[]=[],portraits:T.Group[]=[];
  b.box(0,-.4,-77,27,.8,34,m.floor);b.box(0,-12.5,-77,26.5,25,33.5,m.darkStone);b.box(0,-.5,-57,5,1,8,m.floor);
  for(const s of [-1,1]){b.box(s*13,14.5,-77,1,29,34,m.sandstone,0,true);b.box(s*7.8,14.5,-60,10.4,29,1,m.sandstone,0,true);b.box(s*13,29,-77,1.5,.6,34.5,m.trim);}
  b.box(0,18,-60,5.2,22,1,m.sandstone);b.arch(0,0,-59.4,5.2,7.1,.7);b.arch(0,0,-60.6,5.2,7.1,.7);
  b.box(0,14.5,-94,27,29,1,m.sandstone,0,true);
  for(const side of [-1,1])for(let zz=-64;zz> -93;zz-=7){b.box(side*13.45,12,zz,1,24,1.45,m.sandstone);b.cylinder(side*13.45,25.1,zz,.6,2.2,m.roof,.03,12);b.opening(side*13.53,18,zz-2.6,1.1,4.2,side*Math.PI/2);}b.roof(0,-77,27,35,29,9);
  // A tall traceried north window above the crossing flights.
  b.opening(0,4,-93.42,9.5,22,0,false,true);
  for(const x of [-3.4,-1.7,0,1.7,3.4]){b.arch(x,4,-93.21,1.55,17,.12,0,m.trim);b.beam(v(x,4,-93.18),v(x,21,-93.18),.055,m.trim);}
  for(const yy of [9,15,20])b.beam(v(-4.55,yy,-93.18),v(4.55,yy,-93.18),.08,m.trim);
  for(const x of [-10.8,10.8]){b.cylinder(x,14.5,-92.6,.44,29,m.trim);for(const xx of [-.22,.22])b.cylinder(x+xx,14.5,-92.6,.18,29,m.trim);}
  for(let level=0;level<4;level++){
    const left=level%2===0,origin=v(0,level*STAIR_RISE,left?-63:-91);
    const angles:[number,number]=left?[-Math.PI/6,Math.PI/6]:[Math.PI*5/6,-Math.PI*5/6];
    const group=new T.Group();group.position.copy(origin);group.rotation.y=angles[0];scene.add(group);const sb=new Builder(group,m);
    for(let i=0;i<STEP_COUNT;i++){
      const d=(i+.5)*STAIR_RUN/STEP_COUNT,y=(i+1)*STAIR_RISE/STEP_COUNT;
      sb.box(0,y-.14,-d,STAIR_WIDTH,.28,STAIR_RUN/STEP_COUNT+.014,m.trim);
      sb.box(0,y-.027,-d+STAIR_RUN/STEP_COUNT/2-.025,STAIR_WIDTH+.06,.055,.085,m.floor);
    }
    // Deep continuous stringers support the stone treads.
    for(const sign of [-1,1]){
      sb.beam(v(sign*(STAIR_WIDTH/2-.08),-.3,.1),v(sign*(STAIR_WIDTH/2-.08),STAIR_RISE-.3,-STAIR_RUN),.16,m.darkStone);
      sb.beam(v(sign*(STAIR_WIDTH/2-.035),1.13,0),v(sign*(STAIR_WIDTH/2-.035),STAIR_RISE+1.13,-STAIR_RUN),.073,m.trim);
      sb.beam(v(sign*(STAIR_WIDTH/2-.035),.28,0),v(sign*(STAIR_WIDTH/2-.035),STAIR_RISE+.28,-STAIR_RUN),.065,m.trim);
      for(let j=0;j<=30;j++){const d=j*STAIR_RUN/30,y=d/STAIR_RUN*STAIR_RISE;sb.cylinder(sign*(STAIR_WIDTH/2-.035),y+.64,-d,.045,.91,m.trim,.062,12);if(j%3===0)sb.sphere(sign*(STAIR_WIDTH/2-.035),y+.69,-d,.085,m.trim,1,1.5,1);}
      for(let d=.6;d<STAIR_RUN;d+=1.2){const y=d/STAIR_RUN*STAIR_RISE;sb.arch(sign*(STAIR_WIDTH/2-.035),y+.31,-d,.58,.73,.065,Math.PI/2,m.trim);}
      for(const d of [0,STAIR_RUN]){const y=d/STAIR_RUN*STAIR_RISE;sb.box(sign*STAIR_WIDTH/2,y+.64,-d,.2,1.28,.2,m.trim);sb.sphere(sign*STAIR_WIDTH/2,y+1.36,-d,.15,m.trim);}
    }
    sb.finish();flights.push({group,origin,floor:level,angle:angles[0],from:angles[0],to:angles[0],progress:1,moving:false,alternate:false,angles});
  }
  // Four perimeter galleries; the center stays open to the ground-floor atrium.
  for(let level=1;level<=4;level++){
    const y=level*STAIR_RISE;
    for(const side of [-1,1]){
      // Cut real notches where the flights enter the gallery; never bury the upper steps in a slab.
      for(let zz=-93.25;zz< -60.6;zz+=.5)for(let xx=8.25;xx<12.5;xx+=.5){if(!galleryOpening(flights,side*xx,zz,level))b.box(side*xx,y-.2,zz,.5,.4,.5,m.floor);}
      b.box(side*12.35,y-.52,-77,.22,.24,33,m.trim);
    }
    b.box(0,y-.2,-91.75,16,.4,4.5,m.floor);b.box(0,y-.2,-62.5,16,.4,4,m.floor);
    const gaps:{x:number;z:number}[]=[];for(const f of flights){if(f.floor===level)gaps.push({x:f.origin.x,z:f.origin.z});if(f.floor+1===level)for(const angle of f.angles)gaps.push({x:f.origin.x-STAIR_RUN*Math.sin(angle),z:f.origin.z-STAIR_RUN*Math.cos(angle)});}
    for(const s of [-1,1])for(let z=-89;z<-64.6;z+=.72){if(gaps.some(g=>Math.sign(g.x)===s&&Math.abs(g.z-z)<1.8))continue;b.cylinder(s*8.04,y+.55,z,.046,1.1,m.trim,.07,12);b.box(s*8.04,y+1.1,z,.16,.14,.74,m.trim);b.box(s*8.04,y+.13,z,.17,.18,.74,m.trim);}
    for(const z of [-89.45,-64.55]){for(let x=-7.8;x<8;x+=.7){if(flights.some(f=>f.floor===level&&Math.abs(f.origin.z-z)<2.1&&Math.abs(x)<1.8))continue;b.box(x,y+1.1,z,.72,.14,.16,m.trim);b.cylinder(x,y+.55,z,.055,1.1,m.trim,.07,12);}}
    for(const side of [-1,1])for(let z=-66;z>-92;z-=6){b.arch(side*12.35,y-5.2,z,5.3,4.5,.25,side*Math.PI/2,m.trim);b.box(side*12.3,y-2.7,z+2.7,.2,5.4,.27,m.trim);}
  }
  // Salon-hung original paintings in varied sizes, with cast-metal frame profiles.
  let index=0;for(const side of [-1,1])for(let row=0;row<5;row++)for(let col=0;col<6;col++){
    const z=-64.3-col*5,y=2.65+row*5.35,w=col%3===0?2.65:2.05,h=col%2===0?3.15:2.65;
    portraits.push(portrait(b,side*12.44,y,z,w,h,index++%6,-side*Math.PI/2));
    if(col%2===0){lantern(b,fire,side*12.1,y-.25,z-2.2,-side*Math.PI/2);}
  }
  for(const x of [-8.1,8.1])for(let row=0;row<5;row++)portraits.push(portrait(b,x,2.8+row*5.3,-93.4,2.8,3.7,index++%6));
  for(const y of [3.8,11.8,21.5]){const light=new T.PointLight(0xffc58c,150,31,1.7);light.position.set(0,y,-78);scene.add(light);}
  const moon=new T.PointLight(0xb4d7ee,140,28,1.7);moon.position.set(0,18,-90);scene.add(moon);
  b.finish();
  let lastTime=0;
  return {flights,obstacles:b.obstacles,
    floorAt:(x:number,z:number,feet:number)=>stairSupport(flights,x,z,feet),
    trigger(player:T.Vector3){
      const feet=player.y-EYE_HEIGHT;const ridden=flights.find(f=>{const p=flightLocal(f,player.x,player.z);return Math.abs(p.x)<STAIR_WIDTH/2&&p.d>.4&&p.d<STAIR_RUN-.4&&Math.abs(flightHeight(p.d,f.floor)-feet)<.35;});
      const target=ridden??flights.filter(f=>Math.abs(f.origin.y-feet)<.4||Math.abs(f.origin.y+STAIR_RISE-feet)<.4).sort((a,b)=>a.origin.distanceTo(player)-b.origin.distanceTo(player))[0];
      if(!target||target.moving)return false;target.alternate=!target.alternate;target.from=target.angle;target.to=target.angles[target.alternate?1:0];while(target.to-target.from>Math.PI)target.to-=Math.PI*2;while(target.to-target.from< -Math.PI)target.to+=Math.PI*2;target.progress=0;target.moving=true;return true;
    },
    update(t:number,player?:T.Vector3){
      const dt=lastTime?Math.min(t-lastTime,.05):0;lastTime=t;let yawDelta=0;
      for(const f of flights){if(!f.moving)continue;const local=player?flightLocal(f,player.x,player.z):null;
        const rider=player&&local&&Math.abs(local.x)<STAIR_WIDTH/2&&local.d>.25&&local.d<STAIR_RUN-.25&&Math.abs(flightHeight(local.d,f.floor)-(player.y-EYE_HEIGHT))<.35;
        const before=f.angle;f.progress=Math.min(1,f.progress+dt/5);const eased=f.progress*f.progress*(3-2*f.progress);f.angle=T.MathUtils.lerp(f.from,f.to,eased);f.group.rotation.y=f.angle;
        if(rider&&player&&local){const p=flightWorld(f,local.x,local.d);player.x=p.x;player.z=p.z;yawDelta+=f.angle-before;}
        if(f.progress>=1)f.moving=false;
      }return yawDelta;
    },
    nearPortrait(player:T.Vector3){return portraits.find(p=>p.position.distanceTo(player)<3);},
  };
}

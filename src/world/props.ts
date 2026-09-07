import * as T from 'three';
import {Builder} from './builder';
import type {FireSource} from './effects';

export const HALL_TABLES={xs:[-8,-3.5,3.5,8],centerZ:-23,width:2.5,length:29,plateRadius:.27,plateOffset:.73,firstPlaceZ:-10.2,lastPlaceZ:-36.7};
const vec=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
export function turned(b:Builder,x:number,y:number,z:number,points:number[][],mat:T.Material,segments=24){b.add(new T.LatheGeometry(points.map(([r,h])=>new T.Vector2(r,h)),segments),mat,x,y,z);}
export function tube(b:Builder,points:T.Vector3[],r:number,mat:T.Material){b.add(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,r,8,false),mat);}
export function detailedCandle(b:Builder,fire:FireSource[],x:number,y:number,z:number,h=.5,holder=true){
  if(holder){turned(b,x,y,z,[[0,0],[.17,0],[.18,.025],[.15,.05],[.1,.06],[.05,.11],[.04,.22],[.065,.26],[.12,.28],[.13,.32],[.08,.34]],b.m.brass);y+=.34;}
  // Floating and lantern candles occupy very few pixels; keep table-level wax fully detailed.
  const wax=new T.CylinderGeometry(.059,.068,h,holder?20:12,holder?5:3);const p=wax.getAttribute('position');for(let i=0;i<p.count;i++){const yy=p.getY(i);p.setY(i,yy+Math.sin(Math.atan2(p.getZ(i),p.getX(i))*5+x+z)*.009*(yy/h+.5));}wax.computeVertexNormals();b.add(wax,b.m.wax,x,y+h/2,z);
  for(let i=0;i<(holder?4:2);i++){const a=i*2.399+x;const len=.05+(Math.sin(i*3+x+z)+1)*.07;b.sphere(x+Math.cos(a)*.064,y+h-len/2-.018,z+Math.sin(a)*.064,.013,b.m.wax,1,len/.026,1);}
  b.cylinder(x,y+h+.023,z,.006,.052,b.m.wood,.004,8);fire.push({x,y:y+h+.02,z,size:.2});
}
export function candelabrum(b:Builder,fire:FireSource[],x:number,y:number,z:number){
  turned(b,x,y,z,[[0,0],[.24,0],[.26,.045],[.2,.07],[.1,.1],[.06,.17],[.05,.52],[.085,.57],[.055,.66],[.055,.88]],b.m.brass);
  for(const s of [-1,1]){tube(b,[vec(x,y+.35,z),vec(x+s*.23,y+.37,z),vec(x+s*.4,y+.58,z),vec(x+s*.4,y+.77,z)],.028,b.m.brass);detailedCandle(b,fire,x+s*.4,y+.7,z,.38+(.5+s)*.04);}
  detailedCandle(b,fire,x,y+.75,z,.57);
}
export function plate(b:Builder,x:number,y:number,z:number){
  turned(b,x,y,z,[[0,0],[.16,0],[.2,.009],[.25,.035],[.27,.043],[.27,.054],[.25,.06],[.2,.026],[.16,.014],[0,.014]],b.m.ceramic);
  b.add(new T.TorusGeometry(.254,.004,6,40).rotateX(Math.PI/2),b.m.gold,x,y+.055,z);
}
export function goblet(b:Builder,x:number,y:number,z:number){
  turned(b,x,y,z,[[0,0],[.087,0],[.096,.012],[.073,.025],[.023,.052],[.018,.15],[.048,.19],[.092,.235],[.106,.32],[.11,.35],[.102,.35],[.096,.32],[.082,.24],[.042,.205],[0,.202]],b.m.gold);
}
export function bottle(b:Builder,x:number,y:number,z:number,scale=1){
  const profile=[[0,0],[.11,0],[.145,.035],[.15,.28],[.13,.34],[.055,.41],[.046,.56],[.059,.57],[.058,.6],[.037,.6],[.034,.55],[.04,.4],[.1,.31],[.12,.27],[.12,.04],[0,.03]].map(([r,h])=>[r*scale,h*scale]);
  turned(b,x,y,z,profile,b.m.glass,scale<1?16:28);b.cylinder(x,y+.145*scale,z,.118*scale,.22*scale,b.m.green,.118*scale,24);b.cylinder(x,y+.6*scale,z,.04*scale,.085*scale,b.m.wood,.04*scale,16);
  const label=new T.PlaneGeometry(.15*scale,.12*scale);b.add(label,b.m.parchment,x,y+.21*scale,z+.151*scale);
}
export function portrait(b:Builder,x:number,y:number,z:number,w:number,h:number,index:number,ry=0){
  const group=new T.Group();group.position.set(x,y,z);group.rotation.y=ry;b.scene.add(group);const pb=new Builder(group,b.m);
  pb.box(0,0,-.04,w+.3,h+.3,.12,b.m.wood);
  // Successive raised mouldings catch warm lantern light on real bevelled geometry.
  for(const [extra,depth,thick,mat] of [[.24,.04,.065,b.m.brass],[.11,.1,.035,b.m.gold],[.045,.125,.018,b.m.brass]] as [number,number,number,T.Material][]){
    for(const s of [-1,1]){pb.box(s*(w+extra)/2,0,depth,thick,h+extra,thick,mat);pb.box(0,s*(h+extra)/2,depth,w+extra,thick,thick,mat);}
  }
  const art=new T.Mesh(new T.PlaneGeometry(w,h),b.m.portraits[index%6]);art.position.z=.105;group.add(art);
  for(const sx of [-1,1])for(const sy of [-1,1]){pb.sphere(sx*(w+.24)/2,sy*(h+.24)/2,.06,.085,b.m.brass,1,1,.48);const scroll=new T.TorusGeometry(.07,.012,6,16,Math.PI*1.6);pb.add(scroll,b.m.gold,sx*(w+.24)/2,sy*(h+.24)/2,.11);}
  for(const [mat,geos] of pb.buckets)for(const g of geos)b.add(g,mat,x,y,z,ry);pb.buckets.clear();return group;
}
export function lantern(b:Builder,fire:FireSource[],x:number,y:number,z:number,ry=0){
  const group=new T.Group();group.position.set(x,y,z);group.rotation.y=ry;b.scene.add(group);const lb=new Builder(group,b.m);
  lb.box(0,.2,-.14,.15,.68,.12,b.m.iron);tube(lb,[vec(0,.58,-.09),vec(0,.9,.12),vec(0,.85,.45),vec(0,.65,.46)],.025,b.m.iron);
  turned(lb,0,0,.46,[[.03,-.43],[.19,-.36],[.22,-.31],[.17,-.27]],b.m.brass,4);turned(lb,0,0,.46,[[.26,.35],[.23,.43],[.09,.61],[0,.64]],b.m.brass,4);
  // Open metal cage with pale translucent panes, the candle remains visible inside.
  const pane=new T.MeshPhysicalMaterial({color:0xddc8a1,transparent:true,opacity:.18,roughness:.18,side:T.DoubleSide,depthWrite:false});
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const g=new T.PlaneGeometry(.29,.52);g.rotateY(a);lb.add(g,pane,Math.sin(a)*.18,.03,.46+Math.cos(a)*.18);lb.beam(vec(Math.sin(a+.785)*.24,-.27,.46+Math.cos(a+.785)*.24),vec(Math.sin(a+.785)*.3,.35,.46+Math.cos(a+.785)*.3),.019,b.m.iron);}
  const localFire:FireSource[]=[];detailedCandle(lb,localFire,0,-.27,.46,.38,false);group.updateMatrixWorld();for(const f of localFire){const p=group.localToWorld(vec(f.x,f.y,f.z));fire.push({x:p.x,y:p.y,z:p.z,size:f.size});}lb.finish();
}
export {buildSortingHatDisplay} from './sorting-hat';

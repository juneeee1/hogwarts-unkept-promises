import * as T from 'three';
import {animateSortingHat} from './sorting-hat';
import {Builder} from './builder';
import type {Materials} from './materials';
import {turned,buildSortingHatDisplay,portrait,lantern,candelabrum,tube,bottle} from './props';
import type {FireSource} from './effects';
export type Interaction={position:T.Vector3;label:string;message:string;range:number;activate?:()=>void};
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
export function enrichRooms(scene:T.Scene,m:Materials,fire:FireSource[]){
  const b=new Builder(scene,m),interactions:Interaction[]=[],flags:T.Mesh[]=[];
  // Embroidered, pleated house banners. Geometry gives the fabric depth, not a rigid board.
  for(let i=0;i<4;i++){
    const x=(i-1.5)*3.9;const g=new T.PlaneGeometry(2.65,5.8,20,32);const p=g.getAttribute('position');for(let j=0;j<p.count;j++){const xx=p.getX(j),yy=p.getY(j);p.setZ(j,Math.sin(xx*11)*.085+Math.cos(yy*1.2+xx)*.07);if(yy<-2.3)p.setY(j,yy+Math.abs(xx)*.2);}g.computeVertexNormals();
    const flag=new T.Mesh(g,m.banners[[0,3,2,1][i]]);flag.position.set(x,11.7,-42.95);flags.push(flag);scene.add(flag);b.box(x,14.68,-42.92,3,.075,.1,m.brass);for(const s of [-1,1])b.sphere(x+s*1.56,14.68,-42.92,.075,m.gold);
  }
  // The battered Sorting Hat sits on a simple four-legged stool at the head of the aisle.
  const hx=0,hz=-39.25;
  const hat=buildSortingHatDisplay(b,hx,.4,hz);
  interactions.push({position:v(hx,1.8,hz),range:3,label:'听听分院帽',message:'“嗯……一颗好奇的心。勇气，智慧，忠诚，还是野心？有时候，决定你是谁的，是你自己的选择。”',activate:()=>{hat.rotation.z=.018;}});
  // Layered stone vault shafts and timber hammer beams under the enchanted ceiling.
  for(let z=-5;z>-44;z-=6){
    for(const s of [-1,1]){for(const dx of [-.19,0,.19])b.cylinder(s*11.45+dx,8.2,z+2.5,.085,16,m.trim,.085,12);turned(b,s*11.45,13.4,z+2.5,[[.13,0],[.28,.13],[.31,.34],[.26,.47]],m.trim);
      b.box(s*8.6,15.9,z,5.3,.3,.42,m.wood);b.beam(v(s*11.1,11.8,z),v(s*6.15,16,z),.13,m.wood);b.beam(v(s*6.15,16,z),v(s*6.15,20.7,z),.13,m.wood);
      lantern(b,fire,s*11.5,3.8,z+2.3,-s*Math.PI/2);
    }
    for(const s of [-1,1])b.beam(v(s*8.4,19.6,z),v(0,26.5,z),.11,m.wood);
  }
  for(const x of [-11.3,11.3])for(let z=-8;z>-40;z-=8){b.box(x,.18,z,.46,.36,1.25,m.trim);b.arch(x,.35,z,.95,2.1,.13,Math.PI/2,m.trim);}
  // Book spines carry raised bands; reading desks include open folios, quills and pooled lamplight.
  for(const z of [-10,-30])for(const x of [-28.5,-25.5]){
    for(const sign of [-1,1]){const g=new T.BoxGeometry(.42,.055,.63);g.rotateZ(-sign*.105);b.add(g,m.parchment,x+sign*.22,1.305,z);for(let line=0;line<12;line++)b.box(x+sign*.22,1.344,z-.25+line*.042,.32,.002,.004,m.wood);}
    b.cylinder(x+.57,1.35,z-.1,.075,.16,m.iron,.05,20);b.beam(v(x+.58,1.43,z-.1),v(x+.73,1.85,z-.03),.007,m.wood);
    const quill=new T.SphereGeometry(.05,16,10);quill.scale(.45,3.7,.13);quill.rotateZ(-.35);b.add(quill,m.parchment,x+.76,1.91,z-.03);
    for(const dz of [-.75,.75]){b.box(x,.62,z+dz,.68,.16,.65,m.wood);b.box(x,1.1,z+dz*1.38,.73,1.1,.12,m.wood);for(const dx of [-.28,.28])b.box(x+dx,.31,z+dz,.075,.62,.43,m.wood);}
  }
  for(const x of [-32,-22]){portrait(b,x,8.7,-37.45,2.2,2.8,x< -27?0:3);b.arch(x,6.3,-37.35,5.5,4.7,.2,0,m.wood);}
  for(const z of [-36,-26,-17])for(const x of [-32,-22])for(let y=.58;y<6;y+=1.05)for(let dx=-2.3;dx<2.3;dx+=.23)for(const offset of [0,.35])b.box(x+dx,y+offset,z+.776,.15,.022,.014,m.brass);
  // The library's west wall is lined with floor-to-ceiling oak stacks.
  const covers=[m.red,m.blue,m.emerald,m.yellow,m.leather];
  for(const z of [-6,-12,-18,-24,-30]){
    b.box(-35.42,4.6,z,1,9.2,4.5,m.wood);
    for(let row=0;row<8;row++){const y=.35+row*1.08;b.box(-35.15,y,z,1.25,.1,4.6,m.wood);for(let i=0;i<17;i++){const h=.58+Math.sin(i*8+row+z)*.15;const zz=z-2+i*.235;b.box(-34.76,y+h/2+.08,zz,.45,h,.16,covers[(i+row)%covers.length]);for(const yy of [.12,h-.07])b.box(-34.526,y+yy+.08,zz,.016,.018,.14,m.brass);}}
    for(const dz of [-2.25,2.25]){b.box(-34.96,4.65,z+dz,.23,9.3,.18,m.wood);b.cylinder(-34.96,9.4,z+dz,.14,.35,m.brass,.02,12);}
  }
  // Copper coils, a balance and specimen cabinets give the potions room a working-laboratory scale.
  for(const z of [-9,-19,-29])for(let y=.72;y<5.2;y+=1)b.box(34.95,y,z,1.4,.09,4.45,m.wood);
  for(const x of [23,31]){
    b.box(x,2.55,-37.3,5.1,5.1,.9,m.wood,0,true);for(let y=.5;y<5;y+=.86){b.box(x,y,-36.7,5.3,.12,.8,m.wood);for(let j=0;j<8;j++)bottle(b,x-2.15+j*.61,y+.08,-36.54,.64+(j%3)*.11);}
    lantern(b,fire,x,6,-37,0);
  }
  const coilPoints:T.Vector3[]=[];for(let i=0;i<130;i++){const t=i/129,a=t*Math.PI*12;coilPoints.push(v(24.25+Math.cos(a)*.19,1.32+t*.95,-23.3+Math.sin(a)*.19));}tube(b,coilPoints,.019,m.brass);b.cylinder(24.25,1.3,-23.3,.26,.06,m.iron);
  b.cylinder(21.5,1.6,-12.8,.017,.78,m.brass);b.beam(v(21.1,2,-12.8),v(21.9,2,-12.8),.018,m.brass);for(const sx of [-.34,.34]){b.beam(v(21.5+sx,2,-12.8),v(21.5+sx,1.65,-12.8),.004,m.iron);turned(b,21.5+sx,1.61,-12.8,[[0,0],[.12,.025],[.15,.04]],m.brass);}
  interactions.push({position:v(23,2,-12),range:2.5,label:'观察坩埚',message:'微小的气泡沿着锅沿升起。空气中混着薄荷与湿石头的气味，这一锅药剂还需要一点耐心。'});
  b.obstacles.push({x:hx,z:hz,w:.75,d:.75,minY:.4,maxY:2.9});
  // The celestial instrument is an open brass armillary, not a luminous low-poly ball.
  const armillary=new T.Group();armillary.position.set(-22,2.05,-32);scene.add(armillary);
  for(let i=0;i<5;i++){const ring=new T.Mesh(new T.TorusGeometry(.66+i*.043,.015,10,96),m.brass);ring.rotation.set(i*.58,.4+i*.51,i*.38);armillary.add(ring);}
  armillary.add(new T.Mesh(new T.SphereGeometry(.085,32,24),m.gold));b.cylinder(-22,.76,-32,.08,1.52,m.brass,.12,32);turned(b,-22,0,-32,[[0,0],[.52,0],[.55,.055],[.47,.12],[.24,.19],[.12,.27]],m.wood);
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2;b.beam(v(-22+Math.cos(a)*.86,2.05+Math.sin(a)*.86,-32),v(-22+Math.cos(a)*.91,2.05+Math.sin(a)*.91,-32),.005,m.gold);}
  interactions.push({position:v(-27,2,-10),range:3.1,label:'翻阅古老的书页',message:'书页轻轻翻动，一行细小的注记显露出来：“礼堂尽头的门后，楼梯会记得每一位旅人。”'});
  // Telescope: stepped brass tubes, barrel rings, dark eyepiece, optical lens and adjustable mount.
  const telescope=new T.Group();telescope.position.set(31,34.5,-49);telescope.rotation.z=.85;scene.add(telescope);const tb=new Builder(telescope,m);
  turned(tb,0,-1.4,0,[[.11,0],[.11,.24],[.16,.24],[.16,.68],[.22,.68],[.22,1.5],[.28,1.5],[.28,2.58],[.31,2.58],[.31,2.76],[.265,2.76],[.265,2.58]],m.brass,48);
  for(const yy of [-1.15,-.71,.13,1.15,1.3])tb.add(new T.TorusGeometry(yy<-.8?.12:yy<0?.175:yy<1?.236:.32,.018,10,48).rotateX(Math.PI/2),m.gold,0,yy,0);
  tb.cylinder(0,-1.44,0,.1,.15,m.iron,.1,32);const lens=new T.Mesh(new T.SphereGeometry(.265,48,32),m.lens);lens.scale.y=.17;lens.position.y=1.28;telescope.add(lens);tb.finish();
  b.cylinder(31,33.8,-49,.12,.8,m.brass);b.add(new T.TorusGeometry(.34,.04,12,48),m.brass,31,34.15,-49);for(let j=0;j<3;j++){const a=j/3*Math.PI*2;b.beam(v(31,34,-49),v(31+Math.sin(a)*1.18,32,-49+Math.cos(a)*1.18),.056,m.wood);b.sphere(31+Math.sin(a)*1.18,32.1,-49+Math.cos(a)*1.18,.07,m.brass);}
  b.obstacles.push({x:31,z:-49,w:2.1,d:1.8,minY:32,maxY:36});
  interactions.push({position:v(31,34,-49),range:2.8,label:'转动望远镜',message:'你缓缓调整黄铜镜筒。镜片掠过冷蓝色的光，北方的星群映进目镜。',activate:()=>{telescope.rotation.y+=Math.PI/8;}});
  const chartx=27,chartz=-48;b.box(chartx,33.1,chartz,2.1,.14,1.15,m.wood,0,true);b.box(chartx,33.18,chartz,1.65,.022,.88,m.parchment);
  for(const dx of [-.85,.85])b.box(chartx+dx,32.55,chartz,.1,1.1,.85,m.wood);
  // Concentric etched rings on the star chart and clockwork calibration wheel.
  for(const r of [.12,.23,.34])b.add(new T.TorusGeometry(r,.004,6,64).rotateX(Math.PI/2),m.iron,chartx,33.198,chartz);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;b.sphere(chartx+Math.cos(a)*.34,33.2,chartz+Math.sin(a)*.34,.009,m.iron);}
  interactions.push({position:v(chartx,34,chartz),range:2.3,label:'查看星图',message:'羊皮纸上记着观星课的坐标。请把望远镜对准北方，沿最明亮的星寻找下一颗。'});
  candelabrum(b,fire,chartx+.78,33.2,chartz);
  b.finish();
  let speaking=false,lastMouth=-1;
  return {interactions,obstacles:b.obstacles,setHatSpeaking(this:void,value:boolean){speaking=value;},update(t:number){if(t-lastMouth>1/30||t===0){animateSortingHat(hat,t,speaking?1:0);lastMouth=t;}hat.rotation.z=speaking?Math.sin(t*2)*.008:0;flags.forEach((f,i)=>{f.rotation.y=Math.sin(t*.7+i)*.018;});hat.rotation.z*=.99;hat.rotation.y=Math.sin(t*.55)*.04;armillary.rotation.y=t*.025;}};
}

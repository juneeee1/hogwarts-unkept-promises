import * as T from 'three';
import {buildChibiProfessor} from './chibi-professor';
import {Builder,gothicOutline} from './builder';
import type {Materials} from './materials';
import {glowTexture,random} from './materials';
import {turned,bottle,plate,goblet,detailedCandle,tube,portrait} from './props';
import {flameField,type FireSource} from './effects';
import {STORY_OBJECTS,objectStatus} from '../game/story';
import {newSave,stepNumber,type Save} from '../game/state';
import type {PlaceId} from './navigation';
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
function leaf(b:Builder,x:number,y:number,z:number,size:number,ry:number){const g=new T.SphereGeometry(size,12,8);g.scale(.48,1,.09);g.rotateZ(.6);b.add(g,b.m.emerald,x,y,z,ry);}
function book(b:Builder,x:number,y:number,z:number,w=.8){b.box(x,y,z,w,.07,.62,b.m.leather);b.box(x,y+.045,z,w-.05,.045,.58,b.m.parchment);b.box(x,y+.072,z,w,.018,.62,b.m.leather);for(const dz of [-.22,.22])b.box(x-w/2-.005,y+.033,z+dz,.02,.08,.024,b.m.brass);}
function letter(b:Builder,x:number,y:number,z:number,w=.6){b.box(x,y,z,w,.015,w*.65,b.m.parchment);b.beam(v(x-w/2,y+.015,z-w*.325),v(x,y+.015,z+.06),.004,b.m.wood);b.beam(v(x+w/2,y+.015,z-w*.325),v(x,y+.015,z+.06),.004,b.m.wood);b.cylinder(x,y+.024,z+.055,.053,.018,b.m.red,.053,24);b.add(new T.TorusGeometry(.034,.004,6,24).rotateX(Math.PI/2),b.m.gold,x,y+.036,z+.055);}
function desk(b:Builder,x:number,y:number,z:number,w=2,d=1){b.box(x,y,z,w,.14,d,b.m.wood,0,true);for(const dx of [-w*.41,w*.41])for(const dz of [-d*.35,d*.35]){turned(b,x+dx,0,z+dz,[[.075,0],[.065,.08],[.04,y*.3],[.07,y*.35],[.048,y*.43],[.048,y-.06]],b.m.wood);}}
function room(scene:T.Scene,m:Materials,cx:number,cz:number,rescue:boolean){
 const group=new T.Group();group.name=rescue?'story-rescue-room':'story-morning-study';scene.add(group);const b=new Builder(group,m),fire:FireSource[]=[];
 b.box(cx,-.15,cz,12,.3,14,rescue?m.wood:m.floor);
 for(const sx of [-6,6])b.box(cx+sx,2.5,cz,.3,5,14,rescue?m.wood:m.sandstone);
 b.box(cx,2.5,cz-7,12,5,.3,rescue?m.wood:m.sandstone);b.box(cx,2.5,cz+7,12,5,.3,rescue?m.wood:m.sandstone);
 b.box(cx,5.03,cz,12,.22,14,m.wood);
 for(let z=cz-6;z<=cz+6;z+=2){b.box(cx,4.7,z,12,.26,.24,m.wood);b.beam(v(cx-5.8,3.7,z),v(cx-4.4,4.7,z),.1,m.wood);b.beam(v(cx+5.8,3.7,z),v(cx+4.4,4.7,z),.1,m.wood);}
 for(const sx of [-5.7,5.7]){b.box(cx+sx,.2,cz,.16,.35,13.6,m.wood);b.box(cx+sx,3.5,cz,.18,.13,13.6,m.wood);}
 const lamp=new T.PointLight(rescue?0xffb972:0xffe3b8,rescue?24:19,16,1.5);lamp.position.set(cx,3.5,cz);group.add(lamp);
 b.finish();return {group,b,fire,lamp};
}
export function buildStoryWorld(scene:T.Scene,source:Materials){
 const dryWood=source.wood.clone();dryWood.roughness=.95;dryWood.roughnessMap=null;dryWood.normalScale.set(.18,.18);dryWood.color.set(0x786b59);
 const cloth=source.robe.clone();cloth.roughness=1;cloth.bumpMap=null;cloth.color.set(0x11141a);
 const m={...source,wood:dryWood,robe:cloth};
 let save:Save=newSave(),place:PlaceId='bridge',motion=true;const b=new Builder(scene,m);const ambientGroup=new T.Group();scene.add(ambientGroup);const a=new Builder(ambientGroup,m),fire:FireSource[]=[];
 // Diegetic props use existing scanned materials; all readable text is localized in the journal.
 desk(a,1.6,1.1,78,1.2,.85);letter(a,1.6,1.19,78,.7);detailedCandle(a,fire,1.99,1.18,77.8,.4);
 letter(a,25,1.16,-10.9,.6);book(a,-27,1.4,-9.3);letter(a,-27,1.49,-9.3,.5);
 desk(a,-17,1.02,9,1.3,.85);book(a,-17,1.12,9);a.cylinder(-17.5,1.2,8.9,.15,.27,m.leather,.18,24);for(let i=0;i<6;i++)leaf(a,-17.5+Math.sin(i*2.4)*.12,1.55+i*.06,8.9+Math.cos(i*2.4)*.13,.17,i);
 const wrapper=new T.Group();wrapper.position.set(-16.87,1.2,9);ambientGroup.add(wrapper);const wb=new Builder(wrapper,m);for(let j=0;j<4;j++)wb.box(-.09+j*.045,.008,0,.05,.008,.14,m.yellow);wb.finish();wrapper.rotation.z=.24;wrapper.scale.y=3;
 // The invitation tray never intrudes into the central walking aisle.
 desk(a,-2,1.03,-6,1.35,.8);letter(a,-2,1.12,-6,.72);for(const x of [-2.4,-1.7]){a.cylinder(x,1.25,-6,.04,.25,m.brass,.05,16);tube(a,[v(x,1.38,-6),v(x+.03,1.49,-6),v(x+.15,1.5,-6)],.006,m.wood);}
 desk(a,-30,1.08,-8,1.05,.8);letter(a,-30,1.17,-8,.65);a.add(new T.TorusGeometry(.09,.018,10,32).rotateX(Math.PI/2),m.brass,-30,1.2,-8);a.sphere(-30,1.2,-8,.055,m.emerald,1,.3,1);
 const testimony=new T.Group();testimony.position.set(-30.23,1.22,-8);ambientGroup.add(testimony);const tb=new Builder(testimony,m);letter(tb,0,0,0,.28);tb.finish();testimony.rotation.y=-.25;
 const owl=new T.Group();owl.position.set(3.8,1.12,64);ambientGroup.add(owl);const ob=new Builder(owl,m);const feather=new T.MeshStandardMaterial({color:0xe1dfce,roughness:.95});ob.sphere(0,.3,0,.24,feather,.9,1.25,.8);ob.sphere(0,.67,0,.205,feather,1,.9,.8);for(const s of [-1,1]){ob.sphere(s*.085,.68,.145,.061,m.gold,1,1,.2);ob.sphere(s*.085,.68,.16,.026,m.iron,1,1,.3);ob.sphere(s*.21,.26,-.015,.13,feather,.42,2,.6);ob.beam(v(s*.075,.03,0),v(s*.08,-.025,.13),.018,m.brass);}ob.add(new T.ConeGeometry(.035,.095,16).rotateX(-Math.PI/2),m.brass,0,.6,.19);
 for(let row=0;row<4;row++)for(let j=0;j<7;j++){const aa=j/7*Math.PI*2;ob.sphere(Math.sin(aa)*(.18-row*.015),.16+row*.09,Math.cos(aa)*.15,.035,m.robe,.6,.27,.17);}ob.finish();
 a.box(3.8,1.1,64,.6,.09,.7,m.wood);a.box(3.8,.56,64,.11,1.12,.11,m.wood);letter(a,3.72,1.16,64.2,.25);
 const frog=new T.Group();frog.position.set(3.55,1.16,64.15);ambientGroup.add(frog);const fb=new Builder(frog,m);fb.sphere(0,.035,0,.065,m.leather,1,.6,1.35);for(const s of [-1,1]){fb.sphere(s*.06,.02,-.02,.04,m.leather,1,.6,1.6);fb.sphere(s*.032,.07,.04,.018,m.leather);}fb.finish();
 // A deliberately preserved scrap of swamp, complete with reeds and a low iron fence.
 a.cylinder(-9,.085,-64,1.2,.16,m.darkStone,1.2,48);a.cylinder(-9,.19,-64,1.08,.03,m.green,1.08,48);
 for(let j=0;j<15;j++){const aa=j/15*Math.PI*2;a.cylinder(-9+Math.cos(aa)*1.2,.48,-64+Math.sin(aa)*1.2,.014,.7,m.iron,.014,8);}
 a.add(new T.TorusGeometry(1.2,.022,8,72).rotateX(Math.PI/2),m.brass,-9,.74,-64);
 for(let j=0;j<10;j++){const xx=-9+Math.sin(j*2.4)*.7,zz=-64+Math.cos(j*2.4)*.7;a.beam(v(xx,.22,zz),v(xx+.1,1.0+(j%3)*.12,zz+.1),.008,m.emerald);a.sphere(xx+.1,1.0+(j%3)*.12,zz+.1,.034,m.leather,.7,2,.7);}
 const bubbles=new T.Group();ambientGroup.add(bubbles);for(let j=0;j<7;j++){const q=new T.Mesh(new T.SphereGeometry(.05,12,8),m.glass);q.position.set(-9+Math.sin(j)*.6,.4,-64+Math.cos(j)*.5);bubbles.add(q);}
 portrait(a,9,2.05,-65.2,1.05,1.5,1);a.box(9,.68,-65.2,.12,1.25,.2,m.wood);
 const visiting=new T.Mesh(new T.PlaneGeometry(.38,.5),m.portraits[4]);visiting.position.set(9,2,-65.04);ambientGroup.add(visiting);
 a.finish();const ambientFX=flameField(fire);ambientGroup.add(ambientFX.mesh);
 const rescue=room(scene,m,87,0,true),rb=rescue.b;
 for(let i=0;i<15;i++){rb.box(81.6,1.5,i*.8-6,.04,.04,.65,m.brass);rb.box(92.4,1.5,i*.8-6,.04,.04,.65,m.brass);}
 const beam=new T.Group();beam.name='movable-broken-beam';beam.position.set(87,.9,1);rescue.group.add(beam);const bb=new Builder(beam,m);bb.box(0,0,0,5,.27,.3,m.wood);for(const x of [-1.5,1.5])bb.box(x,0,0,.09,.3,.34,m.iron);bb.finish();beam.rotation.z=.19;
 rb.box(87,3.2,1,5.5,.16,.6,m.wood);rb.beam(v(84.5,0,1),v(84.5,3.3,1),.08,m.wood);rb.beam(v(89.5,0,1),v(89.5,3.3,1),.08,m.wood);
 desk(rb,84,1.0,-2,1.3,.9);detailedCandle(rb,rescue.fire,84,1.1,-2,.63);
 const ward=new T.Mesh(new T.TorusGeometry(.52,.025,12,96),new T.MeshStandardMaterial({color:0x83b7a5,emissive:0x76bca0,emissiveIntensity:.2,metalness:.7,roughness:.22}));ward.position.set(84,2.2,-2.1);rescue.group.add(ward);
 desk(rb,90,1.04,-4.5,1.9,1.1);rb.box(90,1.19,-4.5,1.25,.2,.75,m.leather);for(const x of [89.5,90.5])rb.box(x,1.29,-4.5,.05,.02,.8,m.brass);rb.box(89.75,1.32,-4.5,.45,.12,.6,m.parchment);bottle(rb,90.1,1.29,-4.5,.64);for(const x of [89.85,90.25])rb.box(x,1.35,-4.5,.08,.025,.7,m.leather);
 // A light-tight adjoining doorway suggests the Shack without importing its events into the castle.
 rb.box(87,1.6,-6.81,2.2,3.2,.12,m.iron);rb.box(87,3.2,-6.7,2.45,.18,.3,m.wood);for(const x of [85.78,88.22])rb.box(x,1.6,-6.7,.18,3.2,.3,m.wood);
 rb.finish();const rescueFX=flameField(rescue.fire);rescue.group.add(rescueFX.mesh);
 const study=room(scene,m,87,-31,false),sb=study.b;
 // Deep window reveals, leaded panes, operable shutters, and a softly lit working desk.
 // A real masonry bay supports the window, with a recess continuous to the rear wall.
 sb.box(81.97,2.5,-34.74,1.51,5,.35,m.sandstone,0,true);sb.box(85.84,2.5,-34.74,1.13,5,.35,m.sandstone,0,true);
 sb.box(84,.5,-34.74,2.55,1,.35,m.sandstone,0,true);sb.box(84,4.86,-34.74,2.55,.28,.35,m.sandstone);
 sb.box(86.38,2.5,-36.27,.28,5,3.05,m.sandstone,0,true);
 const boundary=gothicOutline(2.55,3.5);for(const side of [-1,1]){const curve=boundary.filter(p=>p.y>=3.5-2.55*.63-.001&&p.x*side>=-.001).sort((a,b)=>a.y-b.y);const shape=new T.Shape([new T.Vector2(side*1.275,3.5),...curve]);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.3,bevelEnabled:false});sb.add(geo,m.sandstone,84,1.1,-34.84);}
 sb.opening(84,1.1,-34.52,2.55,3.5,0,false);sb.box(84,1.08,-34.35,2.95,.16,.65,m.trim);
 const shutters:T.Group[]=[];for(const s of [-1,1]){const g=new T.Group();g.position.set(84+s*1.32,2.35,-34.28);study.group.add(g);const gb=new Builder(g,m);gb.box(-s*.64,0,0,1.28,2.38,.09,m.wood);for(const yy of [-.8,.8])gb.box(-s*.64,yy,.055,1.2,.09,.035,m.iron);gb.sphere(-s*1.14,-.1,.09,.038,m.brass);gb.finish();shutters.push(g);}
 const sun=new T.PointLight(0xffe4bb,1,17,2);sun.position.set(84,2.6,-33.9);study.group.add(sun);
 const dustPositions:number[]=[],dustRandom=random(144);for(let i=0;i<90;i++)dustPositions.push(83.2+dustRandom()*4,1+dustRandom()*2.7,-34+dustRandom()*4.3);
 const dustGeometry=new T.BufferGeometry();dustGeometry.setAttribute('position',new T.Float32BufferAttribute(dustPositions,3));const sunray=new T.Points(dustGeometry,new T.PointsMaterial({color:0xffdf9e,size:.024,map:glowTexture(),transparent:true,opacity:.34,depthWrite:false,blending:T.AdditiveBlending}));study.group.add(sunray);
 desk(sb,87,1.12,-32,2.8,1.35);book(sb,86.45,1.24,-32);bottle(sb,87.6,1.2,-32.25,.85);plate(sb,87.8,1.22,-31.8);goblet(sb,87.8,1.26,-31.8);plate(sb,86,1.22,-31.8);const offeredCup=new T.Group();offeredCup.position.set(86,1.26,-31.8);study.group.add(offeredCup);const cb=new Builder(offeredCup,m);goblet(cb,0,0,0);cb.finish();
 sb.box(90,1.7,-34.5,1.8,3.4,.6,m.wood,0,true);for(let y=.55;y<3.2;y+=.7){sb.box(90,y,-34.13,1.85,.08,.6,m.wood);for(let j=0;j<4;j++)if(Math.abs(y-1.95)>.1)book(sb,89.5+j*.25,y+.11,-34.05,.2);}
 const archive=new T.Group();archive.position.set(87.35,1.25,-31.78);study.group.add(archive);const ab=new Builder(archive,m);book(ab,0,0,0,.42);ab.finish();
 const sprout=new T.Group();sprout.position.set(83.4,1.23,-34.1);study.group.add(sprout);const pb=new Builder(sprout,m);turned(pb,0,0,0,[[.12,0],[.18,.32],[.2,.34],[.18,.36],[.155,.33],[.13,.12]],m.leather);pb.cylinder(0,.3,0,.16,.02,m.wood);pb.beam(v(0,.3,0),v(.05,.71,0),.008,m.emerald);for(let i=0;i<5;i++)leaf(pb,.05+Math.sin(i*2.4)*.08,.4+i*.08,Math.cos(i*2.4)*.09,.12,i);pb.finish();
 const newLeaf=new T.Mesh(new T.SphereGeometry(.17,16,12),m.emerald);newLeaf.position.set(.11,.7,.02);newLeaf.scale.set(.01,.01,.01);sprout.add(newLeaf);
 const character=buildChibiProfessor(study.group,m,84.7,-33.65);
 const wool=new T.MeshStandardMaterial({color:0x4e3831,roughness:1});sb.box(87,.018,-30.9,3.9,.018,4.2,wool);for(const dx of [-1.83,1.83])sb.box(87+dx,.029,-30.9,.06,.003,3.97,m.leather);
 for(const x of [88.8,90.6]){sb.box(x,2.9,-36.85,1.55,4.4,.45,m.wood);for(let row=0;row<5;row++){const y=.82+row*.78;sb.box(x,y,-36.53,1.65,.09,.55,m.wood);for(let j=0;j<7;j++){const xx=x-.61+j*.2,hh=.45+(j%3)*.065;sb.box(xx,y+.05+hh/2,-36.44,.14,hh,.34,[m.leather,m.red,m.blue,m.emerald][(row+j)%4]);for(const dy of [.12,hh-.07])sb.box(xx,y+dy,-36.262,.12,.018,.008,m.brass);}}}
 for(const x of [81.75,92.25])for(let z=-36;z< -25;z+=1.4){sb.box(x,.65,z,.08,1.3,1.34,m.wood);sb.box(x+(x<87?.05:-.05),1.35,z,.12,.12,1.42,m.wood);}
 sb.arch(90.2,.18,-36.42,3.4,4.2,.14,0,m.wood);
 sb.box(86,.5,-29.8,.7,.11,.7,m.wood);sb.box(86,1,-29.5,.7,1.1,.09,m.wood);for(const dx of [-.28,.28])for(const dz of [-.28,.28])sb.box(86+dx,.24,-29.8+dz,.055,.48,.055,m.wood);
 sb.finish();
 const markers=new Map<string,T.Group>();for(const o of STORY_OBJECTS){const g=new T.Group();g.position.set(o.position[0],o.position[1]+.65,o.position[2]);const mat=new T.MeshBasicMaterial({color:o.kind==='main'?0xe0cda4:0x99b7a4,transparent:true,opacity:.62,depthTest:true});const diamond=new T.Mesh(new T.OctahedronGeometry(.045),mat);g.add(diamond);const glow=new T.Sprite(new T.SpriteMaterial({map:glowTexture(),color:o.kind==='main'?0xf4ddaa:0xafd8c1,transparent:true,opacity:.13,depthWrite:false,depthTest:true}));glow.scale.setScalar(.46);g.add(glow);scene.add(g);markers.set(o.id,g);}
 const fireworks=new T.Group();scene.add(fireworks);const fRand=random(738);for(let burst=0;burst<2;burst++){const points:number[]=[];for(let j=0;j<90;j++){const aa=fRand()*Math.PI*2,el=fRand()*2-1,r=Math.sqrt(1-el*el);points.push(Math.cos(aa)*r,el,Math.sin(aa)*r);}const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(points,3));const mat=new T.PointsMaterial({color:burst?0x98c4dd:0xf0c276,size:.08,transparent:true,depthWrite:false,blending:T.AdditiveBlending});const cloud=new T.Points(geom,mat);cloud.position.set(burst?3:-3,9,-33);fireworks.add(cloud);}
 const beamObstacle={x:87,z:1,w:5,d:.55,minY:.1,maxY:1.7};
 rescue.group.visible=false;study.group.visible=false;
 const obstacles=[...a.obstacles,...rb.obstacles,...sb.obstacles,beamObstacle,{x:84.7,z:-33.65,w:1.15,d:.8,minY:0,maxY:2.4}];
 b.finish();return {obstacles,setState(s:Save,p:PlaceId,reducedMotion=false){save=s;place=p;motion=!reducedMotion;},update(time:number){
   const t=motion?time:0;rescue.group.visible=place==='shelter';study.group.visible=place==='study';ambientFX.update(t);if(rescue.group.visible)rescueFX.update(t);
   const cleared=stepNumber(save.step)>stepNumber('passage');beam.position.x=T.MathUtils.lerp(beam.position.x,cleared?91.4:87,.045);beam.rotation.z=T.MathUtils.lerp(beam.rotation.z,cleared?1.44:.19,.045);beamObstacle.x=cleared?91.4:87;beamObstacle.w=cleared?.5:5;beamObstacle.d=cleared?1:.55;
   const guarded=stepNumber(save.step)>stepNumber('shield');(ward.material as T.MeshStandardMaterial).emissiveIntensity=guarded?1.6:.22;ward.rotation.z=t*.08;
   const opened=stepNumber(save.step)>stepNumber('window');shutters.forEach((g,i)=>g.rotation.y=T.MathUtils.lerp(g.rotation.y,opened?(i===0?-1.95:1.95):0,.045));sun.intensity=T.MathUtils.lerp(sun.intensity,opened?8:1,.03);sunray.visible=opened;
   const grown=stepNumber(save.step)>stepNumber('experiment');newLeaf.scale.lerp(v(grown?.42:.01,grown?1:.01,grown?.09:.01),.035);
   offeredCup.position.z=T.MathUtils.lerp(offeredCup.position.z,grown?-31.4:-31.8,.03);
   const filed=stepNumber(save.step)>stepNumber('cabinet');archive.position.lerp(filed?v(90,1.98,-34.0):v(87.35,1.25,-31.78),.045);character.update(t,!motion);
   owl.rotation.y=Math.sin(t*.35)*.18;const found=save.secrets.includes('owl');frog.position.y=1.16+(found&&motion?Math.max(0,Math.sin(t*2))* .16:0);frog.rotation.y=t*.1;
   visiting.position.x=9+(save.secrets.includes('portrait')?Math.sin(t*.5)*.3:0);visiting.visible=!save.secrets.includes('portrait')||Math.sin(t*.5)>-.65;
   bubbles.children.forEach((q,i)=>{if(save.secrets.includes('swamp')){const face=[[-.18,.3],[.18,.3],[-.35,0],[-.18,-.13],[0,-.18],[.18,-.13],[.35,0]][i];q.position.lerp(v(-9+face[0],1.1+face[1]+Math.sin(t*.6)*.06,-63.45),.04);}else q.position.y=.3+((t*.2+i*.14)%1)*.3;});
   const keptWrapper=save.secrets.includes('wrapper');wrapper.rotation.z=T.MathUtils.lerp(wrapper.rotation.z,keptWrapper?0:.24,.035);wrapper.scale.y=T.MathUtils.lerp(wrapper.scale.y,keptWrapper?1:3,.035);wrapper.position.y=T.MathUtils.lerp(wrapper.position.y,keptWrapper?1.19:1.2,.035);
   testimony.position.x=T.MathUtils.lerp(testimony.position.x,save.secrets.includes('locket')?-29.68:-30.23,.035);testimony.rotation.y=T.MathUtils.lerp(testimony.rotation.y,save.secrets.includes('locket')?0:-.25,.035);
   for(const o of STORY_OBJECTS){const g=markers.get(o.id)!;g.visible=place===o.place&&objectStatus(save,o)==='active';g.position.y=o.position[1]+.65+Math.sin(t*1.6)*.04;g.rotation.y=t*.35;}
   fireworks.visible=save.step==='complete'&&place==='hall';fireworks.children.forEach((o,i)=>{const age=(t*.4+i*.4)%1;o.scale.setScalar(motion?.2+age*5:3);const material=(o as T.Points<T.BufferGeometry,T.PointsMaterial>).material;material.opacity=motion?Math.sin(age*Math.PI)*.85:.65;});
 }};
}

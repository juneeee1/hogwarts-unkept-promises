import * as T from 'three';
import {Builder} from './builder';
import type {Materials} from './materials';
import {tube} from './props';
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);

/** Original articulated collectible proportions; no photograph or actor texture. */
export function buildChibiProfessor(parent:T.Object3D,m:Materials,x:number,z:number){
 const root=new T.Group();root.name='recovering-professor';root.position.set(x,0,z);root.rotation.y=.18;parent.add(root);
 const skin=new T.MeshPhysicalMaterial({color:0xe3c6a0,roughness:.64,clearcoat:.1});
 const dark=new T.MeshStandardMaterial({color:0x17151b,roughness:.62});
 const robe=new T.MeshStandardMaterial({color:0x272630,roughness:.83});
 const hair=new T.MeshPhysicalMaterial({color:0x17171c,roughness:.6,clearcoat:.12,clearcoatRoughness:.6});
 const highlight=new T.MeshStandardMaterial({color:0x292930,roughness:.56});
 const b=new Builder(root,m);
 const ellipsoid=(builder:Builder,mat:T.Material,px:number,py:number,pz:number,sx:number,sy:number,sz:number,segments=24)=>{const g=new T.SphereGeometry(1,segments,16);g.scale(sx,sy,sz);builder.add(g,mat,px,py,pz);};
 for(const s of [-1,1]){ellipsoid(b,dark,s*.19,.115,.08,.16,.12,.24);b.cylinder(s*.17,.33,0,.105,.44,robe,.11,20);}
 const tunic=new T.LatheGeometry([[.32,.26],[.33,.37],[.27,.82],[.35,1.05],[.2,1.17],[.11,1.23]].map(([r,y])=>new T.Vector2(r,y)),32);tunic.scale(1,1,.73);b.add(tunic,robe);
 for(let i=0;i<7;i++)ellipsoid(b,m.silver,.03,1.08-i*.104,.226,.016,.018,.012,12);
 // Open, double-sided cape panels with shaped hems and a separate inner lining.
 for(const side of [-1,1]){
  const g=new T.PlaneGeometry(1,1,16,20),p=g.getAttribute('position');
  for(let i=0;i<p.count;i++){const u=p.getX(i)+.5,t=.5-p.getY(i),a=side*(.32+u*2.68),r=.32+t*.24;const fold=Math.sin(u*14+t*3)*.026*t;p.setXYZ(i,Math.sin(a)*(r+fold),1.13-t*(1.02-.05*Math.sin(u*8)),Math.cos(a)*(r*.79+fold));}
  g.computeVertexNormals();const capeMat=dark.clone();capeMat.side=T.DoubleSide;b.add(g,capeMat);
  tube(b,[v(side*.12,1.19,.2),v(side*.23,.86,.29),v(side*.28,.42,.39),v(side*.2,.11,.4)],.018,highlight);
 }
 for(const s of [-1,1]){tube(b,[v(s*.3,1.06,0),v(s*.43,.8,.12),v(s*.35,.82,.36)],.112,robe);ellipsoid(b,skin,s*.35,.82,.39,.09,.085,.09);}
 // A small closed notebook, held in the sleeves; no detached fingers.
 b.box(0,.81,.43,.56,.07,.35,m.leather);b.box(0,.854,.43,.52,.035,.3,m.parchment);
 const head=new T.Group();head.name='chibi-head';head.position.set(0,1.69,.02);root.add(head);const hb=new Builder(head,m);
 // A continuous painted face on rounded geometry avoids separate eyeballs and brows.
 const face=new T.SphereGeometry(1,64,36),fp=face.getAttribute('position'),uv=face.getAttribute('uv');
 for(let i=0;i<fp.count;i++){const px=fp.getX(i),py=fp.getY(i),pz=fp.getZ(i);const cheek=1+.06*Math.max(0,-py);fp.setXYZ(i,px*.58*cheek,py*.565,pz*.455+.025);uv.setXY(i,pz>=0?px*.5+.5:0,pz>=0?py*.5+.5:1);}
 face.computeVertexNormals();hb.add(face,m.professorFace??skin);
 const peach=new T.MeshStandardMaterial({color:0xffd6b4,roughness:.85});
 ellipsoid(hb,peach,0,-.105,.474,.033,.031,.027,24);
 for(const side of [-1,1])ellipsoid(hb,peach,side*.567,-.09,.01,.067,.09,.065);
 // A smooth bob-shaped cap, with a high front hairline and long sides and back.
 const cap=new T.SphereGeometry(1,56,36),cp=cap.getAttribute('position'),cu=cap.getAttribute('uv');
 for(let i=0;i<cp.count;i++){const a=cu.getX(i)*Math.PI*2,t=1-cu.getY(i),side=1-Math.max(0,Math.cos(a));const edge=.70+1.83*T.MathUtils.smoothstep(side,.06,.65),phi=t*edge;const r=Math.sin(Math.min(phi,1.52))*(1-.065*Math.max(0,phi-1.52));cp.setXYZ(i,Math.sin(a)*r*.626,Math.cos(phi)*.62+.055,Math.cos(a)*r*.495-.045);}
 cap.computeVertexNormals();hb.add(cap,hair);
 // Wide, flattened sculpted locks overlap the cap. Every lock tapers to a soft tip.
 function lock(points:T.Vector3[],width:number){const path=new T.CatmullRomCurve3(points),steps=32,rings=12,geo=new T.TubeGeometry(path,steps,1,rings,false),p=geo.getAttribute('position');
  for(let row=0;row<=steps;row++){const t=row/steps,c=path.getPointAt(t),r=width*(.25+.75*Math.sin(Math.PI*Math.pow(t,.75)))*Math.pow(1-t,.35)+.002;
   for(let col=0;col<=rings;col++){const i=row*(rings+1)+col;p.setXYZ(i,c.x+(p.getX(i)-c.x)*r,c.y+(p.getY(i)-c.y)*r,c.z+(p.getZ(i)-c.z)*r*.38);}}
  geo.computeVertexNormals();hb.add(geo,hair);
 }
 for(const side of [-1,1]){
  lock([v(side*.025,.65,.09),v(side*.20,.56,.32),v(side*.37,.33,.43),v(side*.46,-.05,.40),v(side*.36,-.38,.39)],.175);
  lock([v(side*.09,.635,.015),v(side*.34,.46,.33),v(side*.55,.14,.30),v(side*.57,-.30,.22),v(side*.49,-.49,.25)],.145);
  lock([v(side*.18,.60,-.08),v(side*.49,.33,.10),v(side*.62,-.05,.045),v(side*.59,-.38,.045),v(side*.50,-.5,.09)],.14);
 }
 for(let j=0;j<5;j++){const a=Math.PI*.6+j/4*Math.PI*.8;lock([v(Math.sin(a)*.2,.58,Math.cos(a)*.23-.08),v(Math.sin(a)*.59,.20,Math.cos(a)*.47),v(Math.sin(a)*.59,-.30,Math.cos(a)*.47),v(Math.sin(a)*.50,-.51,Math.cos(a)*.40)],.13);}
 hb.finish();b.finish();
 return {root,update(time:number,reducedMotion=false){head.rotation.z=reducedMotion?0:Math.sin(time*.53)*.025;head.rotation.x=reducedMotion?0:Math.sin(time*.37)*.012;root.rotation.y=.18+(reducedMotion?0:Math.sin(time*.35)*.018);}};
}

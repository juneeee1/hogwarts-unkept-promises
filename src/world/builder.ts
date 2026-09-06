import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Materials } from './materials';
import type { Obstacle } from './navigation';

export class Builder {
  buckets = new Map<T.Material,T.BufferGeometry[]>();
  obstacles: Obstacle[]=[];
  constructor(public scene:T.Scene, public m:Materials) {}
  add(geo:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0,ry=0) {
    geo.rotateY(ry); geo.translate(x,y,z);
    // All merged geometries use the same attribute layout.
    if(!geo.index) geo.setIndex(Array.from({length:geo.getAttribute('position').count},(_,i)=>i));
    if(!geo.getAttribute('uv')) geo.setAttribute('uv',new T.BufferAttribute(new Float32Array(geo.getAttribute('position').count*2),2));
    const a=this.buckets.get(mat)||[]; a.push(geo);this.buckets.set(mat,a);
  }
  box(x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material=this.m.stone,ry=0,solid=false) {
    const g=new T.BoxGeometry(w,h,d);const uv=g.getAttribute('uv');
    for(let i=0;i<uv.count;i++){const face=Math.floor(i/4); const u=face<2?d:face<4?w:w;const v=face<2?h:face<4?d:h;uv.setXY(i,uv.getX(i)*u/4,uv.getY(i)*v/4);}
    this.add(g,mat,x,y,z,ry);
    if(solid) this.obstacles.push({x,z,w,d,minY:y-h/2,maxY:y+h/2});
  }
  cylinder(x:number,y:number,z:number,r:number,h:number,mat:T.Material=this.m.stone,rt=r,n=24) {
    const g=new T.CylinderGeometry(rt,r,h,n);const uv=g.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*r*1.57,uv.getY(i)*h/4);
    this.add(g,mat,x,y,z);
  }
  sphere(x:number,y:number,z:number,r:number,mat:T.Material,sx=1,sy=1,sz=1) {const g=new T.SphereGeometry(r,12,8);g.scale(sx,sy,sz);this.add(g,mat,x,y,z);}
  beam(a:T.Vector3,b:T.Vector3,r:number,mat:T.Material=this.m.trim) {
    const d=new T.Vector3().subVectors(b,a);const g=new T.CylinderGeometry(r,r,d.length(),8);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));const c=a.clone().add(b).multiplyScalar(.5);this.add(g,mat,c.x,c.y,c.z);
  }
  arch(x:number,y:number,z:number,w:number,h:number,depth=.32,ry=0,mat:T.Material=this.m.trim) {
    const rise=w*.63, spring=h-rise, thick=.22;
    const points:T.Vector2[]=[];
    points.push(new T.Vector2(-w/2,0),new T.Vector2(-w/2,spring));
    for(let i=1;i<=16;i++){const t=i/16;points.push(new T.Vector2(-w/2+w/2*(1-Math.cos(t*Math.PI/2)),spring+rise*Math.sin(t*Math.PI/2)));}
    for(let i=1;i<=16;i++){const t=i/16;points.push(new T.Vector2(w/2*Math.sin(t*Math.PI/2),spring+rise*Math.cos(t*Math.PI/2)));}
    points.push(new T.Vector2(w/2,0));
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],delta=b.clone().sub(a),len=delta.length();
      const g=new T.BoxGeometry(thick,len+.03,depth);g.rotateZ(-Math.atan2(delta.x,delta.y));g.translate((a.x+b.x)/2,(a.y+b.y)/2,0);this.add(g,mat,x,y,z,ry);
    }
  }
  opening(x:number,y:number,z:number,w:number,h:number,ry=0,lit=true) {
    const rise=w*.63,spring=h-rise,s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,spring);s.quadraticCurveTo(-w/2,spring+rise*.63,0,h);s.quadraticCurveTo(w/2,spring+rise*.63,w/2,spring);s.lineTo(w/2,0);s.closePath();
    this.add(new T.ShapeGeometry(s,12),lit?this.m.window:this.m.blueWindow,x,y,z,ry);
    this.arch(x,y,z,w+.2,h+.1,.32,ry);
    const local=(xx:number,yy:number,zz:number)=>new T.Vector3(xx,yy,zz).applyAxisAngle(new T.Vector3(0,1,0),ry).add(new T.Vector3(x,y,z));
    for(const dx of [-w/6,w/6]) this.beam(local(dx,0,.05),local(dx,h*.75,.05),.045,this.m.darkStone);
    this.beam(local(-w/2,h*.38,.07),local(w/2,h*.38,.07),.04,this.m.darkStone);
    this.beam(local(-w/2,h*.65,.07),local(w/2,h*.65,.07),.04,this.m.darkStone);
    const ring=new T.TorusGeometry(w*.18,.045,6,20);this.add(ring,this.m.darkStone,...local(0,h*.79,.09).toArray() as [number,number,number],ry);
  }
  roof(x:number,z:number,w:number,d:number,base:number,rise:number) {
    const len=Math.hypot(w/2,rise),angle=Math.atan2(rise,w/2);
    for(const sign of [-1,1]) {const g=new T.BoxGeometry(len,.3,d+1.2);g.rotateZ(-sign*angle);g.translate(sign*w/4,base+rise/2,0);this.add(g,this.m.roof,x,0,z);}
    this.box(x,base+rise+.12,z,.28,.32,d+1.8,this.m.gold);
    const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
    const g=new T.ExtrudeGeometry(shape,{depth:.45,bevelEnabled:false});this.add(g,this.m.stone,x,base,z+d/2-.2);this.add(g.clone(),this.m.stone,0,0,-d+.2);
  }
  tower(x:number,z:number,r:number,h:number,roofH:number,base=0) {
    this.cylinder(x,base+h/2,z,r,h,this.m.stone);
    for(const yy of [1,h*.36,h*.68,h-1]) {this.cylinder(x,base+yy,z,r+.22,.32,this.m.trim);this.cylinder(x,base+yy-.26,z,r+.12,.18,this.m.darkStone);}
    this.cylinder(x,base+h+.2,z,r+.5,.65,this.m.trim);
    this.cylinder(x,base+h+roofH/2+.5,z,r+.65,roofH,this.m.roof,.03,32);
    for(let j=1;j<7;j++)this.cylinder(x,base+h+roofH*j/7+.5,z,(r+.65)*(1-j/7)+.035,.1,this.m.darkStone,(r+.65)*(1-j/7)+.035,32);
    this.cylinder(x,base+h+roofH+1,z,.065,1.5,this.m.gold,.025,8);
    this.sphere(x,base+h+roofH+.5,z,.19,this.m.gold);
    const count=Math.max(6,Math.floor(r*2.8));
    for(let y=7;y<h-2;y+=5.5) for(let j=0;j<count;j++) {const a=j/count*Math.PI*2;this.opening(x+Math.sin(a)*(r+.025),base+y,z+Math.cos(a)*(r+.025),.7,1.85,a,(j+Math.round(y))%4!==0);}
    for(let j=0;j<count;j++){const a=j/count*Math.PI*2;this.box(x+Math.sin(a)*r,base+h-.7,z+Math.cos(a)*r,.45,1.4,.6,this.m.trim,a);}
    if(base===0)this.obstacles.push({x,z,w:r*1.6,d:r*1.6,minY:0,maxY:h});
  }
  finish() {
    for(const [mat,geos]of this.buckets){const merged=mergeGeometries(geos,false);if(!merged)throw new Error('Geometry merge failed');const mesh=new T.Mesh(merged,mat);mesh.castShadow=mat!==this.m.flame&&mat!==this.m.window;mesh.receiveShadow=true;this.scene.add(mesh);geos.forEach(g=>g.dispose());}
    this.buckets.clear();
  }
}

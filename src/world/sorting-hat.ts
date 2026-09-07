import * as T from 'three';
import {Builder} from './builder';

type Point2=[number,number];
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
const TAU=Math.PI*2;
const radiusAt=(y:number)=>.485-.135*y-.025*y*y;
const eye:Point2[]=[[.073,.81],[.302,1.024],[.337,.638],[.222,.659],[.13,.711]];
const smoothEye:Point2[]=new T.CatmullRomCurve3(eye.map(([x,y])=>v(x,y,0)),true,'centripetal').getPoints(64).map(p=>[p.x,p.y]);
const mouth:Point2[]=[[-.315,.393],[-.16,.482],[.015,.513],[.172,.462],[.314,.397],[.12,.374],[-.14,.365]];
function inside(x:number,y:number,polygon:Point2[]){
  let hit=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
  }
  return hit;
}
function frontDepth(x:number,y:number){
  const r=radiusAt(y),a=Math.asin(T.MathUtils.clamp(x/r,-1,1));
  return r*.87*Math.cos(a)+.014*Math.sin(a*8+y*11);
}
function meshGrid(points:number[],uv:number[],indices:number[]){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

/** Sculpted, hollow-eyed leather hat. All details remain real geometry when viewed from the side. */
export function buildSortingHat(b:Builder,x:number,y:number,z:number){
  const group=new T.Group();group.name='sorting-hat';group.position.set(x,y,z);b.scene.add(group);
  const hb=new Builder(group,b.m),leather=b.m.leather;
  const edge=leather.clone();edge.color.setHex(0x71503a);edge.roughness=.86;
  const underside=leather.clone();underside.color.setHex(0x36271f);
  const hollow=new T.MeshStandardMaterial({color:0x100c09,roughness:1,side:T.DoubleSide});
  const thread=new T.MeshStandardMaterial({color:0x9b7854,roughness:1});
  const curve=(points:T.Vector3[],r:number,mat:T.Material=leather,closed=false,steps=32)=>{
    const path=new T.CatmullRomCurve3(points,closed,'centripetal');
    const g=new T.TubeGeometry(path,steps,r,8,closed),p=g.getAttribute('position');
    // Leather folds flatten into the underlying surface, avoiding round cord-like creases.
    if(r>.02)for(let row=0;row<=steps;row++){
      const c=path.getPointAt(row/steps);for(let col=0;col<=8;col++){const i=row*9+col;p.setZ(i,c.z+(p.getZ(i)-c.z)*.65);}
    }
    g.computeVertexNormals();hb.add(g,mat);return path;
  };
  const stitch=(a:T.Vector3,c:T.Vector3)=>{
    const mid=a.clone().lerp(c,.5);mid.z+=.006;
    hb.add(new T.TubeGeometry(new T.QuadraticBezierCurve3(a,mid,c),3,.0036,4,false),thread);
  };
  // The body has actual openings. Recessed liners sit behind the thick, folded edges.
  const n=96,rows=62,points:number[]=[],uv:number[]=[],indices:number[]=[];
  for(let j=0;j<=rows;j++){
    const yy=j/rows*1.24,r=radiusAt(yy);
    for(let i=0;i<=n;i++){
      const a=i/n*TAU,front=Math.pow(Math.max(0,Math.cos(a)),5);
      const lower=Math.exp(-Math.pow((yy-.22)/.22,2));
      const fold=.018*Math.sin(a*9+yy*12)+.014*Math.sin(a*4-yy*15)+lower*.022*Math.sin(yy*69+Math.sin(a*3)*.9);
      const xx=Math.sin(a)*(r+fold),zz=Math.cos(a)*(r*.87+fold);
      const cheek=front*.026*Math.cos(a*5+yy*12);
      points.push(xx,yy+.008*Math.sin(a*4+yy*8),zz+cheek);uv.push(i/n*2,yy*1.4);
      if(i<n&&j<rows){
        const ax=(i+.5)/n*TAU,cy=(j+.5)/rows*1.24,cx=Math.sin(ax)*radiusAt(cy);
        const opening=Math.cos(ax)>.15&&(inside(Math.abs(cx),cy,smoothEye)||inside(cx,cy,mouth));
        if(!opening){const k=j*(n+1)+i;indices.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}
      }
    }
  }
  hb.add(meshGrid(points,uv,indices),leather);
  // An asymmetric swept crown folds over and droops to the left, instead of ending in a cone.
  const spine=new T.CatmullRomCurve3([v(0,1.24,0),v(-.014,1.42,0),v(-.14,1.585,0),v(-.345,1.56,.006),v(-.58,1.395,.016),v(-.76,1.32,.025)]);
  const radii=[radiusAt(1.24),.245,.184,.13,.063,.002];
  const top:number[]=[],topUV:number[]=[],topIndex:number[]=[],topRows=30;
  for(let j=0;j<=topRows;j++){
    const t=j/topRows,c=spine.getPoint(t),tangent=j===0?v(0,1,0):spine.getTangent(t);
    const across=new T.Vector3().crossVectors(tangent,v(0,0,1)).normalize();
    const index=Math.min(4,Math.floor(t*5)),r=T.MathUtils.lerp(radii[index],radii[index+1],t*5-index);
    for(let i=0;i<=n;i++){
      const a=i/n*TAU,fold=1+Math.sin(a*7-t*17)*.065+Math.sin(a*3+t*11)*.045;
      const p=c.clone().addScaledVector(across,Math.sin(a)*r*fold).addScaledVector(v(0,0,1),Math.cos(a)*r*.87*fold);
      if(t<.13){const blend=1-t/.13,base=rows*(n+1)*3+i*3;
        p.x+=(points[base]-Math.sin(a)*radii[0])*blend;
        p.z+=(points[base+2]-Math.cos(a)*radii[0]*.87)*blend;
      }
      if(j===0){p.set(points[rows*(n+1)*3+i*3],points[rows*(n+1)*3+i*3+1],points[rows*(n+1)*3+i*3+2]);}
      top.push(p.x,p.y,p.z);topUV.push(i/n*2,1.736+t*.85);
      if(i<n&&j<topRows){const k=j*(n+1)+i;topIndex.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}
    }
  }
  hb.add(meshGrid(top,topUV,topIndex),leather);
  // Rounded triangular sockets with rolled rims and uneven, individual stitches.
  for(const sign of [-1,1]){
    const socket=eye.map(([xx,yy])=>[xx*sign,yy] as Point2);
    const shape=new T.Shape(smoothEye.map(([xx,yy])=>new T.Vector2(xx*sign,yy)));shape.closePath();
    const recess=new T.ShapeGeometry(shape);const p=recess.getAttribute('position');
    for(let i=0;i<p.count;i++)p.setZ(i,frontDepth(p.getX(i),p.getY(i))-.095);recess.computeVertexNormals();hb.add(recess,hollow);
    const rim=curve(socket.map(([xx,yy])=>v(xx,yy,frontDepth(xx,yy)+.012)),.034,leather,true,48);
    for(let i=0;i<17;i++){
      const t=(i+.35)/17,p=rim.getPointAt(t),tangent=rim.getTangentAt(t);
      const cross=v(-tangent.y,tangent.x,0).normalize().multiplyScalar(.024);
      stitch(p.clone().add(cross).add(v(0,0,.019)),p.clone().sub(cross).add(v(0,0,.019)));
    }
    curve([[.025,.86],[.14,1.056],[.285,1.135],[.315,1.13]].map(([xx,yy])=>v(xx*sign,yy,frontDepth(xx*sign,yy)+.025)),.038,edge);
    curve([[.025,.66],[.16,.58],[.3,.514],[.405,.47]].map(([xx,yy])=>v(xx*sign,yy,frontDepth(xx*sign,yy)+.031)),.04,leather);
  }
  // Pinched nose joins the brows and upper lip; a dark cavity separates the lips.
  const nose=new T.SphereGeometry(1,20,16);nose.scale(.047,.173,.072);nose.rotateX(-.15);hb.add(nose,leather,0,.787,.353);
  const mouthShape=new T.Shape(mouth.map(([xx,yy])=>new T.Vector2(xx,yy)));mouthShape.closePath();
  const mouthGeo=new T.ShapeGeometry(mouthShape);const mp=mouthGeo.getAttribute('position');
  for(let i=0;i<mp.count;i++)mp.setZ(i,frontDepth(mp.getX(i),mp.getY(i))-.11);mouthGeo.computeVertexNormals();hb.add(mouthGeo,hollow);
  curve(mouth.slice(0,5).map(([xx,yy])=>v(xx,yy,frontDepth(xx,yy)+.03)),.036,edge);
  curve([mouth[4],mouth[5],mouth[6],mouth[0]].map(([xx,yy])=>v(xx,yy,frontDepth(xx,yy)+.025)),.03,leather);
  // Broad lower folds are flattened leather ridges, with irregular depth and sag.
  for(let row=0;row<3;row++){
    const yy=.12+row*.082,p:T.Vector3[]=[];
    for(let i=0;i<=12;i++){const xx=(i/12-.5)*.86,fy=yy+.018*Math.sin(xx*10+row*.8);p.push(v(xx,fy,frontDepth(xx,fy)+.018));}
    curve(p,.022+row*.003, row===0?edge:leather,false,48);
  }
  // Floppy brim: annular cloth-like surfaces, not a torus. Both sides have thickness.
  const brimAt=(a:number,t:number)=>{
    const radius=T.MathUtils.lerp(.43,.85+.05*Math.sin(a*3+.7),t);
    return v(Math.sin(a)*radius*1.12,.009+t*t*(.065*Math.sin(a*3+.4)+.063*Math.cos(a*2-.8)),Math.cos(a)*radius*.87);
  };
  for(const side of [1,-1]){
    const bp:number[]=[],bu:number[]=[],bi:number[]=[],rings=8;
    for(let j=0;j<=rings;j++)for(let i=0;i<=n;i++){
      const a=i/n*TAU,t=j/rings,p=brimAt(a,t);p.y+=side*.012;bp.push(...p.toArray());bu.push(p.x*1.5+.5,p.z*1.5+.5);
      if(i<n&&j<rings){const k=j*(n+1)+i;if(side===1)bi.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);else bi.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}
    }
    hb.add(meshGrid(bp,bu,bi),side===1?leather:underside);
  }
  curve(Array.from({length:64},(_,i)=>brimAt(i/64*TAU,1)),.012,edge,true,96);
  for(let i=0;i<74;i++){
    const a=i/74*TAU,p=brimAt(a,.93),q=brimAt(a+.018,.89);p.y+=.022;q.y+=.022;stitch(p,q);
  }
  // Side repair seams continue down the crown and out across the brim.
  for(const sign of [-1,1]){
    const seam:T.Vector3[]=[];
    for(let j=0;j<=24;j++){const yy=.06+j/24*1.18,a=sign*(1.07+.055*Math.sin(yy*6)),r=radiusAt(yy);seam.push(v(Math.sin(a)*(r+.012),yy,Math.cos(a)*(r*.87+.017)));}
    const path=curve(seam,.009,underside,false,36);
    for(let j=0;j<22;j++){const p=path.getPointAt((j+.5)/22);stitch(p.clone().add(v(-.012,-.009,.012)),p.clone().add(v(.015,.007,.013)));}
  }
  hb.finish();return group;
}

export const HAT_STOOL={radius:.41,top:.77,legRadius:.045,hatClearance:.046};

/** y is the actual seat top. The fold follows the circular rim at every x. */
export function createHatStoolDrapeGeometry(){
  const columns=32,rows=48,g=new T.PlaneGeometry(1,1,columns,rows),p=g.getAttribute('position');
  const corner=.032;
  for(let i=0;i<p.count;i++){
    const u=p.getX(i)+.5,t=.5-p.getY(i),xx=(u-.5)*.70;
    const edge=Math.sqrt((HAT_STOOL.radius+.012)**2-xx*xx);
    const pleat=(1+Math.sin(u*23+.4))*.004;
    let yy:number,zz:number;
    if(t<=.40){
      const travel=t/.40;
      // Pinned cloth on the seat has positive clearance, including its folds.
      yy=.013+pleat*Math.sin(travel*Math.PI)**2;
      zz=T.MathUtils.lerp(-.19,edge-corner,travel);
    }else if(t<=.54){
      const angle=(t-.40)/.14*Math.PI/2;
      yy=.013-corner*(1-Math.cos(angle));
      zz=edge-corner+corner*Math.sin(angle);
    }else{
      const drop=(t-.54)/.46;
      yy=.013-corner-drop*.60+Math.sin(u*17+.7)*.012*drop**4;
      // A small outward flare clears the splayed front legs all the way to the hem.
      zz=edge+drop*.078+pleat*Math.sin(drop*Math.PI/2)*4;
    }
    p.setXYZ(i,xx,yy,zz);
  }
  g.computeVertexNormals();return g;
}

/** One assembly is shared by the Great Hall and the model review. */
export function buildSortingHatDisplay(b:Builder,x:number,floorY:number,z:number){
  const profile=[[0,.67],[.39,.67],[.41,.72],[.38,.77],[0,.77]];
  b.add(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),32),b.m.wood,x,floorY,z);
  for(const dx of [-.25,.25])for(const dz of [-.25,.25]){
    b.beam(v(x+dx*1.23,floorY,z+dz*1.23),v(x+dx,floorY+.68,z+dz),HAT_STOOL.legRadius,b.m.wood);
  }
  const velvet=new T.MeshPhysicalMaterial({color:0x52152a,roughness:.97,sheen:1,sheenColor:0x8b2945,sheenRoughness:.84,side:T.DoubleSide});
  const cloth=createHatStoolDrapeGeometry(),mesh=new T.Mesh(cloth,velvet);
  mesh.name='sorting-hat-stool-drape';mesh.position.set(x,floorY+HAT_STOOL.top,z);mesh.castShadow=mesh.receiveShadow=true;b.scene.add(mesh);
  const hat=buildSortingHat(b,x,floorY+HAT_STOOL.top+HAT_STOOL.hatClearance,z);
  return hat;
}

/** Deform the entire mouth region together; brim, seat clearance and stitches stay attached. */
export function animateSortingHat(hat:T.Group,time:number,amount:number){
 type Region={position:T.BufferAttribute;base:Float32Array;indices:number[]};
 let regions=hat.userData.mouthRegions as Region[]|undefined;
 if(!regions){regions=[];hat.traverse(object=>{if(!(object instanceof T.Mesh))return;const position=object.geometry.getAttribute('position') as T.BufferAttribute;const base=new Float32Array(position.array),indices:number[]=[];for(let i=0;i<position.count;i++)if(Math.abs(position.getX(i))<.41&&position.getY(i)>.23&&position.getY(i)<.66&&position.getZ(i)>.1)indices.push(i);if(indices.length){position.setUsage(T.DynamicDrawUsage);regions!.push({position,base,indices});}});hat.userData.mouthRegions=regions;}
 const opening=T.MathUtils.clamp(amount,0,1)*(.35+.65*Math.abs(Math.sin(time*9.3)*Math.cos(time*3.1)));
 for(const {position,base,indices} of regions){for(const i of indices){const x=base[i*3],y=base[i*3+1],z=base[i*3+2],weight=Math.max(0,1-(x/.41)**2)*Math.exp(-(((y-.44)/.12)**2));position.setY(i,y+opening*weight*(y<.445?-.047:.02));position.setZ(i,z+opening*weight*.008);}position.needsUpdate=true;}
 hat.userData.mouthOpenness=opening;
}

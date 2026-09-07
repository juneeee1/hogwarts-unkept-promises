import * as T from 'three';
import type {Materials} from './materials';

/** A continuous wand enters the frame from below; no hand or sleeve geometry. */
export function buildWand(parent:T.Group,m:Materials){
  const direction=new T.Vector3(-.3,.43,-.81).normalize();
  const model=new T.Group();model.name='walnut-wand';
  model.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);parent.add(model);
  const walnut=new T.MeshStandardMaterial({color:0x513423,map:m.wood.map,normalMap:m.wood.normalMap,normalScale:new T.Vector2(.15,.15),roughness:.39});
  const profile:T.Vector2[]=[new T.Vector2(0,-.68)];
  for(let i=0;i<=96;i++){
    const y=-.68+i/96*1.56,t=Math.max(0,y/.88);
    const handle=y<.12;
    const r=handle?.026+Math.sin((y+.68)*8)*.003:.019*(1-t)+.002;
    profile.push(new T.Vector2(r+(handle?Math.sin(y*62)*.001:0),y));
  }
  profile.push(new T.Vector2(0,.884));
  model.add(new T.Mesh(new T.LatheGeometry(profile,32),walnut));
  for(const y of [-.46,.11,.15]){
    const ring=new T.Mesh(new T.TorusGeometry(y<.12?.026:.018,.0016,8,32),m.brass);
    ring.rotation.x=Math.PI/2;ring.position.y=y;model.add(ring);
  }
  model.traverse(obj=>{if(obj instanceof T.Mesh)obj.receiveShadow=true;});
  return direction.multiplyScalar(.884);
}

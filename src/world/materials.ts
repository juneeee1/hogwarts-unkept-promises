import * as T from 'three';
import stoneColor from '../assets/castle_wall_varriation_diff.jpg';
import stoneNormal from '../assets/castle_wall_varriation_nor_gl.jpg';
import stoneRough from '../assets/castle_wall_varriation_rough.jpg';
import roofColor from '../assets/roof_slates_02_diff.jpg';
import roofNormal from '../assets/roof_slates_02_nor_gl.jpg';
import roofRough from '../assets/roof_slates_02_rough.jpg';
import floorColor from '../assets/monastery_stone_floor_diff.jpg';
import floorNormal from '../assets/monastery_stone_floor_nor_gl.jpg';
import floorRough from '../assets/monastery_stone_floor_rough.jpg';

export function random(seed = 8913) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
const rand = random();
function surface(kind: 'stone' | 'roof' | 'floor' | 'wood') {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const isWood = kind === 'wood', isRoof = kind === 'roof', isFloor = kind === 'floor';
  ctx.fillStyle = isRoof ? '#222c32' : isWood ? '#1f110b' : '#4c4840'; ctx.fillRect(0,0,512,512);
  const h = isRoof ? 32 : isWood ? 512 : isFloor ? 85.333 : 64;
  const w = isRoof ? 64 : isWood ? 64 : isFloor ? 128 : 128;
  for(let y=0,row=0;y<512;y+=h,row++) for(let x=-w;x<512;x+=w) {
    const xx=x+(row%2)*w/2, n=rand();
    const base=isRoof ? [42,53,60] : isWood ? [61,36,22] : isFloor ? [98,96,87] : [135,127,109];
    ctx.fillStyle=`rgb(${base.map(v=>Math.floor(v+n*27)).join(',')})`;
    ctx.fillRect(xx+2,y+2,w-4,h-4);
    ctx.strokeStyle = isWood ? '#26170e' : 'rgba(227,216,188,.15)'; ctx.lineWidth=1; ctx.strokeRect(xx+3,y+3,w-6,h-6);
    for(let j=0;j<50;j++) {
      ctx.fillStyle=`rgba(${rand()>.5?'255,243,213':'10,12,13'},${rand()*.09})`;
      ctx.fillRect(xx+rand()*w,y+rand()*h,isWood?1:rand()*20,isWood?rand()*300:rand()*4);
    }
  }
  const im=ctx.getImageData(0,0,512,512);
  for(let i=0;i<im.data.length;i+=4) {const n=(rand()-.5)*14; im.data[i]+=n; im.data[i+1]+=n; im.data[i+2]+=n;} ctx.putImageData(im,0,0);
  const texture=new T.CanvasTexture(canvas); texture.colorSpace=T.SRGBColorSpace; texture.wrapS=texture.wrapT=T.RepeatWrapping; texture.anisotropy=4;
  return texture;
}
export function makeMaterials(onTextureError?:(message:string)=>void) {
  const stone=surface('stone'), wood=surface('wood');
  const loader=new T.TextureLoader();
  const tex=(asset:string|{src:string},srgb=false)=>{const url=typeof asset==="string"?asset:asset.src;const t=loader.load(url,undefined,undefined,()=>onTextureError?.('部分材质尚未加载成功，请重新载入城堡。'));t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.colorSpace=T.SRGBColorSpace;return t;};
  const stonePbr={map:tex(stoneColor,true),normalMap:tex(stoneNormal),roughnessMap:tex(stoneRough)};
  const roofPbr={map:tex(roofColor,true),normalMap:tex(roofNormal),roughnessMap:tex(roofRough)};
  const floorPbr={map:tex(floorColor,true),normalMap:tex(floorNormal),roughnessMap:tex(floorRough)};
  return {
    stone: new T.MeshStandardMaterial({...stonePbr,normalScale:new T.Vector2(.8,.8),roughness:.93,color:0xbbb6a3}),
    trim: new T.MeshStandardMaterial({map:stone,bumpMap:stone,bumpScale:.055,roughness:.85,color:0xd7cdb1}),
    darkStone: new T.MeshStandardMaterial({...stonePbr,normalScale:new T.Vector2(.7,.7),roughness:1,color:0x6c7269}),
    roof: new T.MeshStandardMaterial({...roofPbr,normalScale:new T.Vector2(.8,.8),roughness:.7,metalness:.12,color:0x71818c}),
    floor: new T.MeshStandardMaterial({...floorPbr,normalScale:new T.Vector2(.8,.8),roughness:.8,color:0xa1a097}),
    wood: new T.MeshStandardMaterial({map:wood,bumpMap:wood,bumpScale:.04,roughness:.7}),
    gold: new T.MeshStandardMaterial({color:0xb39553,metalness:.72,roughness:.31}),
    iron: new T.MeshStandardMaterial({color:0x20292c,metalness:.75,roughness:.5}),
    window: new T.MeshBasicMaterial({color:new T.Color(1.65,.78,.23)}),
    blueWindow: new T.MeshStandardMaterial({color:0x294454,emissive:0x18394d,emissiveIntensity:.45,roughness:.38}),
    wax: new T.MeshStandardMaterial({color:0xe8d6a0,roughness:.85}),
    flame: new T.MeshBasicMaterial({color:new T.Color(4.5,2.1,.6)}),
    green: new T.MeshStandardMaterial({color:0x165e48,emissive:0x258066,emissiveIntensity:.9,metalness:.3,roughness:.25}),
    rock: new T.MeshStandardMaterial({color:0x424c4b,roughness:1,flatShading:false}),
    tree: new T.MeshStandardMaterial({color:0x172e29,roughness:1,flatShading:true}),
    red: new T.MeshStandardMaterial({color:0x641e22,roughness:.88}),
    blue: new T.MeshStandardMaterial({color:0x17344c,roughness:.88}),
    yellow: new T.MeshStandardMaterial({color:0x987943,roughness:.88}),
    emerald: new T.MeshStandardMaterial({color:0x174535,roughness:.88}),
    parchment: new T.MeshStandardMaterial({color:0xd1c6a5,roughness:1}),
  };
}
export type Materials = ReturnType<typeof makeMaterials>;

export function glowTexture() {
  const c=document.createElement('canvas'); c.width=c.height=128; const ctx=c.getContext('2d')!;
  const g=ctx.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,244,203,1)');g.addColorStop(.08,'rgba(255,213,139,.85)');g.addColorStop(.3,'rgba(255,172,75,.16)');g.addColorStop(1,'rgba(255,141,42,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new T.CanvasTexture(c);
}

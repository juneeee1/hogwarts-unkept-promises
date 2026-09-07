import * as T from 'three';
import professorFace from '../assets/polish-v3/professor-face.webp';
import timberColor from '../assets/wood_table_001_diff.webp';
import timberNormal from '../assets/wood_table_001_nor_gl.webp';
import timberRough from '../assets/wood_table_001_rough.webp';
import sandstoneColor from '../assets/large_sandstone_blocks_diff.webp';
import sandstoneNormal from '../assets/large_sandstone_blocks_nor_gl.webp';
import sandstoneRough from '../assets/large_sandstone_blocks_rough.webp';
import portraitAtlas from '../assets/wizard-portraits.webp';
import heraldryAtlas from '../assets/house-heraldry.webp';
import stoneColor from '../assets/castle_wall_varriation_diff.webp';
import stoneNormal from '../assets/castle_wall_varriation_nor_gl.webp';
import stoneRough from '../assets/castle_wall_varriation_rough.webp';
import roofColor from '../assets/roof_slates_02_diff.webp';
import roofNormal from '../assets/roof_slates_02_nor_gl.webp';
import roofRough from '../assets/roof_slates_02_rough.webp';
import floorColor from '../assets/monastery_stone_floor_diff.webp';
import floorNormal from '../assets/monastery_stone_floor_nor_gl.webp';
import floorRough from '../assets/monastery_stone_floor_rough.webp';

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
function leatherGrain(){
  const size=512,data=new Uint8Array(size*size*4),color=new Uint8Array(size*size*4),noise=random(8021);
  const grid=Array.from({length:32*32},()=>noise());
  const mottling=(x:number,y:number,scale:number)=>{
    const xx=x/scale,yy=y/scale,ix=Math.floor(xx),iy=Math.floor(yy),fx=xx-ix,fy=yy-iy;
    const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),sample=(a:number,b:number)=>grid[(a%32)+(b%32)*32];
    return T.MathUtils.lerp(T.MathUtils.lerp(sample(ix,iy),sample(ix+1,iy),sx),T.MathUtils.lerp(sample(ix,iy+1),sample(ix+1,iy+1),sx),sy);
  };
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4,pores=noise(),mottle=mottling(x,y,16)*.55+mottling(x,y,64)*.45;
    const crease=Math.pow(Math.max(0,Math.cos(x*Math.PI/16+Math.sin(y*Math.PI/32)*1.4)),22)*.25;
    const grain=110+pores*82+mottle*28-crease*70;
    data[i]=data[i+1]=data[i+2]=grain;data[i+3]=255;
    const tint=154+mottle*78+(pores-.5)*24-crease*48;
    color[i]=tint;color[i+1]=tint*.94;color[i+2]=tint*.86;color[i+3]=255;
  }
  const texture=(pixels:Uint8Array)=>{const t=new T.DataTexture(pixels,size,size,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.needsUpdate=true;return t;};
  const bump=texture(data),map=texture(color);map.colorSpace=T.SRGBColorSpace;return {bump,map};
}
function leadedGlass(stained=false){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;const ctx=canvas.getContext('2d')!;
  const gradient=ctx.createLinearGradient(0,0,256,512);gradient.addColorStop(0,'#96b6c5');gradient.addColorStop(.5,'#465c71');gradient.addColorStop(1,'#bdc7c2');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,512);
  if(stained){const colors=['#526e86','#749085','#b38a54','#876c80','#7a4d4b'];for(let row=-1;row<11;row++)for(let col=-1;col<7;col++){const x=col*51.2+(row%2)*25.6,y=row*51.2;ctx.beginPath();ctx.moveTo(x,y-51.2);ctx.lineTo(x+25.6,y);ctx.lineTo(x,y+51.2);ctx.lineTo(x-25.6,y);ctx.closePath();ctx.fillStyle=colors[((row+11)*3+col+7)%colors.length];ctx.fill();ctx.strokeStyle='#c9b281';ctx.lineWidth=.6;ctx.stroke();}}
  const r=random(591);for(let i=0;i<1300;i++){ctx.fillStyle=`rgba(205,224,222,${r()*.09})`;ctx.fillRect(r()*256,r()*512,2+r()*8,1+r()*7);}
  ctx.strokeStyle='#283237';ctx.lineWidth=2.3;for(let x=-512;x<768;x+=51.2){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+256,512);ctx.stroke();ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-256,512);ctx.stroke();}
  const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
export function makeMaterials(onTextureError?:(message:string)=>void,onReady?:()=>void) {
  const stone=surface('stone'), wood=surface('wood'),grain=leatherGrain();
  const atlasTiles:{texture:T.Texture;base:T.Texture}[]=[];
  const manager=new T.LoadingManager(()=>{for(const {texture,base} of atlasTiles){texture.image=base.image;texture.needsUpdate=true;}onReady?.();});
  const loader=new T.TextureLoader(manager);
  const tex=(asset:string|{src:string},srgb=false)=>{const url=typeof asset==="string"?asset:asset.src;const t=loader.load(url,undefined,undefined,()=>onTextureError?.('部分材质尚未加载成功，请重新载入城堡。'));t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.colorSpace=T.SRGBColorSpace;return t;};
  const stonePbr={map:tex(stoneColor,true),normalMap:tex(stoneNormal),roughnessMap:tex(stoneRough)};
  const roofPbr={map:tex(roofColor,true),normalMap:tex(roofNormal),roughnessMap:tex(roofRough)};
  const floorPbr={map:tex(floorColor,true),normalMap:tex(floorNormal),roughnessMap:tex(floorRough)};
  const portraitBase=tex(portraitAtlas,true),heraldryBase=tex(heraldryAtlas,true);
  const tile=(base:T.Texture,cols:number,rows:number,index:number)=>{const t=new T.Texture(stone.image);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;atlasTiles.push({texture:t,base});t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.repeat.set(1/cols,1/rows);t.offset.set((index%cols)/cols,1-(Math.floor(index/cols)+1)/rows);return t;};
  // Maps share source images while each canvas has its own UV region.
  const timberPbr={map:tex(timberColor,true),normalMap:tex(timberNormal),roughnessMap:tex(timberRough)};
  const sandstonePbr={map:tex(sandstoneColor,true),normalMap:tex(sandstoneNormal),roughnessMap:tex(sandstoneRough)};
  const windowGlass=leadedGlass(),stainedGlass=leadedGlass(true);
  const faceMap=tex(professorFace,true);faceMap.wrapS=faceMap.wrapT=T.ClampToEdgeWrapping;
  return {
    professorFace:new T.MeshStandardMaterial({map:faceMap,roughness:.85}),
    sandstone:new T.MeshStandardMaterial({...sandstonePbr,normalScale:new T.Vector2(.55,.55),color:0xc4bba7,roughness:.89}),
    portraits: Array.from({length:6},(_,i)=>new T.MeshStandardMaterial({map:tile(portraitBase,3,2,i),roughness:.91,side:T.DoubleSide})),
    banners: Array.from({length:4},(_,i)=>new T.MeshStandardMaterial({map:tile(heraldryBase,2,2,i),roughness:.94,side:T.DoubleSide})),
    brass: new T.MeshStandardMaterial({color:0x9b753b,metalness:.86,roughness:.28}),
    silver: new T.MeshStandardMaterial({color:0xb8bbb7,metalness:.93,roughness:.21}),
    ceramic: new T.MeshPhysicalMaterial({color:0xe6dac1,roughness:.24,clearcoat:.65,clearcoatRoughness:.16}),
    glass: new T.MeshPhysicalMaterial({color:0xa6bcae,metalness:0,roughness:.09,transmission:.88,thickness:.12,ior:1.46,transparent:true,opacity:1,envMapIntensity:1.3}),
    lens: new T.MeshPhysicalMaterial({color:0x548199,roughness:.06,metalness:.08,transmission:.9,thickness:.25,ior:1.52,clearcoat:1}),
    leather: new T.MeshStandardMaterial({color:0x80624a,roughness:.79,map:grain.map,bumpMap:grain.bump,bumpScale:.012}),
    robe: new T.MeshStandardMaterial({color:0x171921,roughness:1,bumpMap:wood,bumpScale:.006}),
    stone: new T.MeshStandardMaterial({...stonePbr,normalScale:new T.Vector2(.8,.8),roughness:.93,color:0xbbb6a3}),
    trim: new T.MeshStandardMaterial({...sandstonePbr,normalScale:new T.Vector2(.13,.13),roughness:.83,color:0xd0b998}),
    darkStone: new T.MeshStandardMaterial({...stonePbr,normalScale:new T.Vector2(.7,.7),roughness:1,color:0x6c7269}),
    roof: new T.MeshStandardMaterial({...roofPbr,normalScale:new T.Vector2(.8,.8),roughness:.7,metalness:.12,color:0x71818c}),
    floor: new T.MeshStandardMaterial({...floorPbr,normalScale:new T.Vector2(.8,.8),roughness:.8,color:0xa1a097}),
    wood: new T.MeshStandardMaterial({...timberPbr,normalScale:new T.Vector2(.45,.45),roughness:.64,color:0x63513d,metalness:0}),
    gold: new T.MeshStandardMaterial({color:0xb39960,metalness:.86,roughness:.27,envMapIntensity:1.15}),
    iron: new T.MeshStandardMaterial({color:0x20292c,metalness:.75,roughness:.5}),
    window: new T.MeshBasicMaterial({color:new T.Color(1.65,.78,.23)}),
    stainedGlass: new T.MeshPhysicalMaterial({map:stainedGlass,emissiveMap:stainedGlass,color:0xe0d9c5,emissive:0xffffff,emissiveIntensity:.25,roughness:.22,metalness:0,clearcoat:1,clearcoatRoughness:.17,side:T.DoubleSide}),
    blueWindow: new T.MeshPhysicalMaterial({map:windowGlass,emissiveMap:windowGlass,color:0x89a0a8,emissive:0x5d8098,emissiveIntensity:.32,roughness:.2,metalness:.08,clearcoat:1,clearcoatRoughness:.15}),
    wax: new T.MeshStandardMaterial({color:0xe8d6a0,roughness:.85}),
    flame: new T.MeshBasicMaterial({color:new T.Color(4.5,2.1,.6)}),
    green: new T.MeshStandardMaterial({color:0x165e48,emissive:0x258066,emissiveIntensity:.18,metalness:0,roughness:.28}),
    rock: new T.MeshStandardMaterial({color:0x424c4b,roughness:1,flatShading:false}),
    tree: new T.MeshStandardMaterial({color:0x172e29,roughness:1,flatShading:true}),
    red: new T.MeshStandardMaterial({color:0x4c2924,roughness:.9,bumpMap:wood,bumpScale:.016}),
    blue: new T.MeshStandardMaterial({color:0x283038,roughness:.9,bumpMap:wood,bumpScale:.016}),
    yellow: new T.MeshStandardMaterial({color:0x716045,roughness:.9,bumpMap:wood,bumpScale:.016}),
    emerald: new T.MeshStandardMaterial({color:0x303d30,roughness:.9,bumpMap:wood,bumpScale:.016}),
    parchment: new T.MeshStandardMaterial({color:0xd1c6a5,roughness:1}),
  };
}
export type Materials = ReturnType<typeof makeMaterials>;

export function glowTexture() {
  const c=document.createElement('canvas'); c.width=c.height=128; const ctx=c.getContext('2d')!;
  const g=ctx.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,244,203,1)');g.addColorStop(.08,'rgba(255,213,139,.85)');g.addColorStop(.3,'rgba(255,172,75,.16)');g.addColorStop(1,'rgba(255,141,42,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new T.CanvasTexture(c);
}

import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { makeMaterials, random, glowTexture } from './materials';
import { buildCastle, type WorldObjects } from './castle';
import { PLACES, canMove, placeAt, type PlaceId } from './navigation';
import { CastleAudio } from './audio';

export type Quality='auto'|'high'|'low';
export type EngineState={place:PlaceId; heading:number; nearPortal:boolean; lumos:boolean; mode:'overview'|'walk'; fps:number};
class HalfResolutionAO extends GTAOPass {override setSize(width:number,height:number){super.setSize(Math.ceil(width*.5),Math.ceil(height*.5));}}
export class CastleEngine {
  scene=new T.Scene();camera=new T.PerspectiveCamera(53,1,.08,1100);
  renderer:T.WebGLRenderer;composer:EffectComposer;bloom:UnrealBloomPass;ao:HalfResolutionAO;world:WorldObjects;
  audio=new CastleAudio();mode:'overview'|'walk'='overview';paused=false;lumos=false;quality:Quality='auto';
  yaw=0;pitch=.11;move={x:0,y:0};keys=new Set<string>();wand=new T.Group();wandLight=new T.PointLight(0xb5e6ff,0,16,1.5);wandTip=new T.Vector3();
  private disposers:(()=>void)[]=[];private frame=0;private last=0;private elapsed=0;private lastEmit=0;private frames=0;private fps=60;private frameWindow=0;private ended=false;private dragging=false;private dragged=false;
  private orbit={theta:.7,phi:1.04,radius:158};private autoOrbit=true;private mobile=false;private bob=0;private castTime=-10;private portalCooldown=0;private nearPortal=false;
  private glow:T.Sprite;private sparks:T.Points;private sparkVel:Float32Array;private starField:T.Points;private moon:T.Sprite;private resizeObserver:ResizeObserver;private reducedMotion=false;
  private snapshot:EngineState={place:'bridge',heading:0,nearPortal:false,lumos:false,mode:'overview',fps:60};
  constructor(public container:HTMLElement,private onState:(s:EngineState)=>void,private onError:(message:string)=>void) {
    this.mobile=matchMedia('(pointer: coarse)').matches||innerWidth<768;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer=new T.WebGLRenderer({antialias:!this.mobile,powerPreference:'high-performance',alpha:false,preserveDrawingBuffer:false});
    this.renderer.setClearColor(0x101b25);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
    this.renderer.domElement.setAttribute('aria-label','可交互的三维霍格沃茨城堡，拖动环视');this.renderer.domElement.setAttribute('role','img');container.appendChild(this.renderer.domElement);
    const materials=makeMaterials(this.onError);this.scene.fog=new T.FogExp2(0x132a37,.0035);
    const hemi=new T.HemisphereLight(0xa9cddd,0x363126,.85);this.scene.add(hemi);
    const moonlight=new T.DirectionalLight(0xbbd4e4,3.3);moonlight.position.set(-65,110,48);moonlight.castShadow=true;moonlight.shadow.mapSize.set(2048,2048);Object.assign(moonlight.shadow.camera,{left:-70,right:70,top:80,bottom:-70,near:1,far:240});moonlight.shadow.bias=-.0008;moonlight.shadow.normalBias=.15;this.scene.add(moonlight);
    const sunset=new T.DirectionalLight(0xefbc86,.9);sunset.position.set(75,30,-50);this.scene.add(sunset);
    this.world=buildCastle(this.scene,materials);
    // Atmosphere is a true 3D sky with layered clouds and stars, never a flat scene image.
    const sky=new T.Mesh(new T.SphereGeometry(650,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;uniform float time;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}void main(){vec3 d=normalize(p);float h=max(0.,d.y);vec3 c=mix(vec3(.028,.055,.075),vec3(.004,.012,.026),pow(h,.42));vec2 uv=d.xz/max(.14,d.y+.18)*2.;float n=noise(uv*2.+vec2(time*.002,0.))*.55+noise(uv*4.)*.3+noise(uv*8.)*.15;float cloud=smoothstep(.48,.8,n)*(1.-smoothstep(.3,.9,h));c=mix(c,vec3(.06,.08,.1),cloud*.3);gl_FragColor=vec4(c,1.);}`}));this.scene.add(sky);
    const rand=random(1208),stars:number[]=[],starColors:number[]=[];for(let i=0;i<1700;i++){const a=rand()*6.28,h=.12+rand()*.88,r=Math.sqrt(1-h*h);stars.push(Math.sin(a)*r*580,h*580,Math.cos(a)*r*580);const l=.35+rand()*.9;starColors.push(l*.8,l*.9,l);}
    const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(stars,3));sg.setAttribute('color',new T.Float32BufferAttribute(starColors,3));this.starField=new T.Points(sg,new T.PointsMaterial({size:1.25,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,fog:false}));this.scene.add(this.starField);
    this.moon=new T.Sprite(new T.SpriteMaterial({map:glowTexture(),color:0xc5e4ec,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));this.moon.position.set(-145,150,-210);this.moon.scale.setScalar(55);this.scene.add(this.moon);
    const disc=new T.Mesh(new T.SphereGeometry(5.5,24,16),new T.MeshBasicMaterial({color:0xe5e4cf}));disc.position.copy(this.moon.position);this.scene.add(disc);
    // Hand-carved wand and a relaxed hand in a dark school robe.
    this.camera.add(this.wand);this.scene.add(this.camera);this.wand.position.set(.36,-.36,-.66);
    const direction=new T.Vector3(-.32,.42,-.78).normalize();const rotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),direction);
    const wandModel=new T.Group();wandModel.quaternion.copy(rotation);this.wand.add(wandModel);
    const profile:T.Vector2[]=[];for(let i=0;i<22;i++){const y=i/21*.95;const radius=(.016*(1-i/24)+Math.sin(i*2.1)*.002)*(i<5?1.8:1);profile.push(new T.Vector2(radius,y));}
    const shaft=new T.Mesh(new T.LatheGeometry(profile,12),new T.MeshStandardMaterial({color:0x56351f,roughness:.55}));wandModel.add(shaft);
    for(const y of [.03,.17,.24]){const ring=new T.Mesh(new T.TorusGeometry(.024,.003,6,16),materials.gold);ring.rotation.x=Math.PI/2;ring.position.y=y;wandModel.add(ring);}
    const skin=new T.MeshStandardMaterial({color:0xbe9477,roughness:.83});const palm=new T.Mesh(new T.SphereGeometry(.065,14,10),skin);palm.scale.set(.8,1.25,.55);palm.position.set(.025,.03,.03);this.wand.add(palm);
    for(let i=0;i<4;i++){const f=new T.Mesh(new T.CapsuleGeometry(.013,.055,4,8),skin);f.rotation.z=.5;f.position.set(-.017+i*.017,.037-i*.012,.048);this.wand.add(f);}
    const thumb=new T.Mesh(new T.CapsuleGeometry(.02,.055,4,8),skin);thumb.rotation.z=-.7;thumb.position.set(-.035,.046,.024);this.wand.add(thumb);
    const sleeve=new T.Mesh(new T.CylinderGeometry(.07,.115,.42,12),new T.MeshStandardMaterial({color:0x151b22,roughness:1}));sleeve.position.set(.09,-.16,.13);sleeve.rotation.z=.4;sleeve.rotation.x=-.35;this.wand.add(sleeve);
    const cuff=new T.Mesh(new T.CylinderGeometry(.071,.071,.032,12),materials.darkStone);cuff.position.set(.012,-.012,.042);cuff.rotation.z=.4;this.wand.add(cuff);
    const tip=direction.clone().multiplyScalar(.96);this.glow=new T.Sprite(new T.SpriteMaterial({map:glowTexture(),color:0x99dfff,blending:T.AdditiveBlending,transparent:true,depthTest:false,opacity:0}));this.glow.position.copy(tip);this.glow.scale.setScalar(.2);this.wand.add(this.glow);this.wandLight.position.copy(tip);this.wand.add(this.wandLight);this.wand.visible=false;
    const sparkGeo=new T.BufferGeometry();sparkGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(90*3),3));this.sparkVel=new Float32Array(90*3);this.sparks=new T.Points(sparkGeo,new T.PointsMaterial({size:.14,map:glowTexture(),color:0xa3dfff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));this.sparks.visible=false;this.scene.add(this.sparks);
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.ao=new HalfResolutionAO(this.scene,this.camera,512,512);this.ao.updateGtaoMaterial({radius:2.4,distanceExponent:1.2,thickness:1,scale:1.5});this.ao.blendIntensity=.75;this.composer.addPass(this.ao);this.bloom=new UnrealBloomPass(new T.Vector2(1,1),.25,.6,1.25);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.bindInput();this.renderer.shadowMap.needsUpdate=true;
    this.frame=requestAnimationFrame(t=>this.animate(t));
  }
  private listen(target:EventTarget,type:string,handler:EventListener,options?:AddEventListenerOptions){target.addEventListener(type,handler,options);this.disposers.push(()=>target.removeEventListener(type,handler,options));}
  private bindInput(){
    const canvas=this.renderer.domElement;let px=0,py=0;
    this.listen(canvas,'pointerdown',((e:PointerEvent)=>{if(this.paused)return;this.dragging=true;this.dragged=false;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);}) as EventListener);
    this.listen(canvas,'pointermove',((e:PointerEvent)=>{if(this.paused||(!this.dragging&&document.pointerLockElement!==canvas))return;const locked=document.pointerLockElement===canvas;const dx=locked?e.movementX:e.clientX-px,dy=locked?e.movementY:e.clientY-py;px=e.clientX;py=e.clientY;if(Math.abs(dx)+Math.abs(dy)>1)this.dragged=true;
      if(this.mode==='walk'){this.yaw-=dx*.003;this.pitch=T.MathUtils.clamp(this.pitch-dy*.0028,-1.35,1.3);}else{this.autoOrbit=false;this.orbit.theta-=dx*.004;this.orbit.phi=T.MathUtils.clamp(this.orbit.phi-dy*.003,.3,1.47);}}) as EventListener);
    this.listen(canvas,'pointerup',(()=>{this.dragging=false;}) as EventListener);this.listen(canvas,'pointercancel',(()=>{this.dragging=false;}) as EventListener);
    this.listen(canvas,'wheel',((e:WheelEvent)=>{if(this.mode==='overview'&&!this.paused){e.preventDefault();this.orbit.radius=T.MathUtils.clamp(this.orbit.radius+e.deltaY*.06,75,235);}})as EventListener,{passive:false});
    this.listen(window,'keydown',((e:KeyboardEvent)=>{if(this.paused||/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();this.keys.add(k);if(e.repeat)return;if(k==='l')this.toggleLumos();if(k===' ')this.cast();if(k==='e')this.usePortal();})as EventListener);
    this.listen(window,'keyup',((e:KeyboardEvent)=>{this.keys.delete(e.key.toLowerCase());})as EventListener);
    this.listen(window,'blur',(()=>this.clearInput())as EventListener);
    this.listen(document,'visibilitychange',(()=>{this.clearInput();this.last=0;this.audio.setSuspended(document.hidden);})as EventListener);
    this.listen(canvas,'webglcontextlost',((e:Event)=>{e.preventDefault();this.paused=true;this.onError('画面暂时中断。请重新载入城堡，或切换到流畅画质。');})as EventListener);
  }
  private clearInput(){this.keys.clear();this.move.x=this.move.y=0;this.dragging=false;}
  private resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;const dpr=this.quality==='low'?1:this.quality==='high'?Math.min(devicePixelRatio,2):Math.min(devicePixelRatio,this.mobile?1.35:1.65);this.renderer.setPixelRatio(dpr);this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.fov=this.mode==='overview'?(w<h?60:48):(w<h?72:66);this.camera.updateProjectionMatrix();this.wand.position.x=w<h?.24:.36;this.wand.scale.setScalar(w<h?.86:1);this.composer.setPixelRatio(dpr);this.composer.setSize(w,h);this.bloom.enabled=this.quality!=='low';this.ao.enabled=this.quality==='high'||(this.quality==='auto'&&!this.mobile);}
  setQuality(q:Quality){this.quality=q;this.resize();}
  setPaused(p:boolean){this.paused=p;this.clearInput();if(p&&document.pointerLockElement)document.exitPointerLock();}
  setSound(on:boolean){this.audio.setEnabled(on);}
  enter(id:PlaceId='bridge'){this.mode='walk';this.wand.visible=true;this.goTo(id);this.resize();this.emit();}
  overview(){this.mode='overview';this.wand.visible=false;this.orbit={theta:.7,phi:1.04,radius:158};this.autoOrbit=true;this.clearInput();this.resize();if(document.pointerLockElement)document.exitPointerLock();this.emit();}
  goTo(id:PlaceId){const p=PLACES.find(p=>p.id===id);if(!p)return;this.mode='walk';this.wand.visible=true;this.camera.position.set(...p.position);this.yaw=p.yaw;this.pitch=id==='bridge'?.18:.05;this.clearInput();this.portalCooldown=this.elapsed+2;this.resize();this.emit();}
  toggleLumos(){if(this.mode!=='walk')return;this.lumos=!this.lumos;this.audio.spell();this.emit();}
  cast(){if(this.mode!=='walk'||this.paused||this.elapsed-this.castTime<.8)return;this.castTime=this.elapsed;this.audio.spell();this.wand.updateWorldMatrix(true,true);const tip=this.glow.getWorldPosition(new T.Vector3());const dir=this.camera.getWorldDirection(new T.Vector3());const p=this.sparks.geometry.getAttribute('position');for(let i=0;i<p.count;i++){p.setXYZ(i,tip.x,tip.y,tip.z);this.sparkVel[i*3]=dir.x*(3+Math.random()*7)+(Math.random()-.5)*3;this.sparkVel[i*3+1]=dir.y*6+(Math.random()-.5)*3;this.sparkVel[i*3+2]=dir.z*(3+Math.random()*7)+(Math.random()-.5)*3;}p.needsUpdate=true;this.sparks.visible=true;}
  usePortal(){if(this.mode!=='walk'||this.elapsed<this.portalCooldown)return;const p=this.world.portals.find(p=>p.position.distanceTo(this.camera.position.clone().add(new T.Vector3(0,-2.05,0)))<2.7);if(p){this.audio.spell();this.goTo(p.target);}}
  getState(){return {...this.snapshot};}
  private emit(){this.snapshot={place:placeAt(this.camera.position.x,this.camera.position.z,this.camera.position.y),heading:((this.yaw*180/Math.PI)%360+360)%360,nearPortal:this.nearPortal,lumos:this.lumos,mode:this.mode,fps:this.fps};this.onState(this.snapshot);}
  private animate(ms:number){
    if(this.ended)return;this.frame=requestAnimationFrame(t=>this.animate(t));if(document.hidden){this.last=0;return;}
    const dt=this.last?Math.min((ms-this.last)/1000,.045):.016;this.last=ms;this.elapsed+=dt;const t=this.elapsed;
    this.frames++;this.frameWindow+=dt;if(this.frameWindow>2){this.fps=Math.round(this.frames/this.frameWindow);if(this.quality==='auto'&&this.fps<27&&this.renderer.getPixelRatio()>1.05&&t>5){this.renderer.setPixelRatio(1);this.composer.setPixelRatio(1);this.bloom.enabled=false;this.ao.enabled=false;}this.frames=0;this.frameWindow=0;}
    if(!this.paused){
      if(this.mode==='overview'){
        if(this.autoOrbit&&!this.reducedMotion)this.orbit.theta+=dt*.018;
        const {theta,phi,radius}=this.orbit;const portrait=this.camera.aspect<1;const r=radius*(portrait?1.23:1);this.camera.position.set(Math.sin(theta)*Math.sin(phi)*r,Math.cos(phi)*r+10,Math.cos(theta)*Math.sin(phi)*r-10);this.camera.lookAt(0,portrait?17:14,-12);
      }else{
        let dx=this.move.x+(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0);
        let dz=this.move.y+(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);const len=Math.hypot(dx,dz);if(len>1){dx/=len;dz/=len;}
        const speed=(this.keys.has('shift')?7:4.6)*dt,wx=(dx*Math.cos(this.yaw)+dz*Math.sin(this.yaw))*speed,wz=(-dx*Math.sin(this.yaw)+dz*Math.cos(this.yaw))*speed;
        const p=this.camera.position;if(canMove(p.x+wx,p.z,p.y,this.world.obstacles))p.x+=wx;if(canMove(p.x,p.z+wz,p.y,this.world.obstacles))p.z+=wz;
        if(len>.08){this.bob+=dt*8;this.audio.step(t);}else this.bob+=dt*1.5;
        this.camera.rotation.set(this.pitch,this.yaw,0,'YXZ');this.wand.position.y=-.36+(this.reducedMotion?0:Math.sin(this.bob)*Math.min(len,.9)*.014);this.wand.rotation.z=this.reducedMotion?0:Math.sin(this.bob*.5)*.012;
        this.nearPortal=this.world.portals.some(p=>p.position.distanceTo(this.camera.position.clone().add(new T.Vector3(0,-2.05,0)))<2.7);
      }
    }
    const spellAge=t-this.castTime,flash=spellAge<.7?Math.pow(1-spellAge/.7,2):0;
    this.wandLight.intensity=(this.lumos?18:0)+flash*40;(this.glow.material as T.SpriteMaterial).opacity=(this.lumos?.85:0)+flash;this.glow.scale.setScalar(.2+flash*.25);
    this.wand.rotation.x=spellAge<.5?-Math.sin(spellAge/.5*Math.PI)*.16:0;
    if(this.sparks.visible){const p=this.sparks.geometry.getAttribute('position');for(let i=0;i<p.count;i++){p.setXYZ(i,p.getX(i)+this.sparkVel[i*3]*dt,p.getY(i)+this.sparkVel[i*3+1]*dt,p.getZ(i)+this.sparkVel[i*3+2]*dt);this.sparkVel[i*3+1]-=dt*.6;}p.needsUpdate=true;(this.sparks.material as T.PointsMaterial).opacity=Math.max(0,1-spellAge/1.6);if(spellAge>1.6)this.sparks.visible=false;}
    this.world.waterUniforms.time.value=t;if(!this.reducedMotion)this.world.animations(t);
    if(t-this.lastEmit>.3){this.emit();this.lastEmit=t;}
    this.composer.render();
  }
  dispose(){this.ended=true;cancelAnimationFrame(this.frame);this.disposers.forEach(fn=>fn());this.resizeObserver.disconnect();this.audio.dispose();if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock();
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();this.scene.traverse(obj=>{const mesh=obj as T.Mesh;if(mesh.geometry)geometries.add(mesh.geometry);if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>materials.add(m));});materials.forEach(m=>Object.values(m).forEach(x=>{if(x instanceof T.Texture)textures.add(x);}));textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.bloom.dispose();this.ao.dispose();this.composer.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}

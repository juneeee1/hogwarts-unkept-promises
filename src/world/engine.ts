import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildWand } from './wand';
import { inStairHall, EYE_HEIGHT } from './staircases';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { makeMaterials, random, glowTexture } from './materials';
import { buildCastle, type WorldObjects } from './castle';
import { ALL_PLACES, canMove, placeAt, type PlaceId } from './navigation';
import { CastleAudio } from './audio';
import { buildStoryWorld } from './story-world';
import { newSave, type Save } from '../game/state';
import { STORY_OBJECTS, objectStatus } from '../game/story';
import { t } from '../game/copy';

export type Quality='auto'|'high'|'low';
export type EngineState={place:PlaceId; heading:number; nearPortal:boolean; lumos:boolean; mode:'overview'|'walk'; fps:number; actionLabel:string; message:string; stairsMoving:boolean;actionId?:string;objectiveDistance?:number};
class HalfResolutionAO extends GTAOPass {
  override setSize(width:number,height:number){super.setSize(Math.ceil(width*.5),Math.ceil(height*.5));}
  override render(renderer:T.WebGLRenderer,writeBuffer:T.WebGLRenderTarget,readBuffer:T.WebGLRenderTarget,deltaTime:number,maskActive:boolean){
    // The normal override does not understand sprite alpha or custom instanced flame shaders.
    // Keep these out of the AO depth pass, so an invisible light cannot cast a square shadow.
    const hidden:T.Object3D[]=[];
    this.scene.traverse(object=>{if(!object.visible)return;const material=(object as T.Mesh).material;const translucent=material&&(Array.isArray(material)?material:[material]).some(m=>m.transparent||m.opacity<1);if(object instanceof T.Sprite||translucent){hidden.push(object);object.visible=false;}});
    try{super.render(renderer,writeBuffer,readBuffer,deltaTime,maskActive);}finally{hidden.forEach(object=>{object.visible=true;});}
  }
}
export class CastleEngine {
  scene=new T.Scene();camera=new T.PerspectiveCamera(53,1,.08,1100);
  renderer:T.WebGLRenderer;composer:EffectComposer;bloom:UnrealBloomPass;ao:HalfResolutionAO;world:WorldObjects;
  story:ReturnType<typeof buildStoryWorld>;game:Save=newSave();onInteraction?:(id:string)=>void;
  audio=new CastleAudio();mode:'overview'|'walk'='overview';paused=false;lumos=false;quality:Quality='auto';
  yaw=0;pitch=.11;move={x:0,y:0};keys=new Set<string>();wand=new T.Group();wandLight=new T.PointLight(0xb5e6ff,0,16,1.5);wandTip=new T.Vector3();
  private disposers:(()=>void)[]=[];private frame=0;private last=0;private elapsed=0;private lastEmit=0;private frames=0;private fps=60;private frameWindow=0;private ended=false;private dragging=false;
  private orbit={theta:.7,phi:1.04,radius:158};private autoOrbit=true;private mobile=false;private bob=0;private castTime=-10;private portalCooldown=0;private nearPortal=false;
  private glow:T.Sprite;private sparks:T.Points;private sparkVel:Float32Array;private starField:T.Points;private moon:T.Sprite;private resizeObserver:ResizeObserver;private reducedMotion=false;
  private message='';private messageUntil=0;private shadowTick=0;private adaptiveLow=false;private ambient:T.HemisphereLight;
  private storyFocus:{position:T.Vector3;rotation:T.Quaternion;yaw:number;pitch:number}|null=null;private hatSpeechUntil=0;
  private snapshot:EngineState={place:'bridge',heading:0,nearPortal:false,lumos:false,mode:'overview',fps:60,actionLabel:'',message:'',stairsMoving:false};
  constructor(public container:HTMLElement,private onState:(s:EngineState)=>void,private onError:(message:string)=>void,onReady:()=>void) {
    this.mobile=matchMedia('(pointer: coarse)').matches||innerWidth<768;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer=new T.WebGLRenderer({antialias:!this.mobile,powerPreference:'high-performance',alpha:false,preserveDrawingBuffer:false});
    this.renderer.setClearColor(0x101b25);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.16;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
    this.renderer.domElement.setAttribute('aria-label',t(this.game.locale,'canvasLabel'));this.renderer.domElement.setAttribute('role','img');container.appendChild(this.renderer.domElement);
    const pmrem=new T.PMREMGenerator(this.renderer);const roomEnvironment=new RoomEnvironment();const environment=pmrem.fromScene(roomEnvironment,.04);this.scene.environment=environment.texture;this.scene.environmentIntensity=.28;roomEnvironment.dispose();pmrem.dispose();this.disposers.push(()=>environment.dispose());
    const materials=makeMaterials(()=>this.onError('errorLoad'),()=>{if(!this.ended)onReady();});this.scene.fog=new T.FogExp2(0x132a37,.0035);
    const hemi=this.ambient=new T.HemisphereLight(0xa9cddd,0x363126,.85);this.scene.add(hemi);
    const moonlight=new T.DirectionalLight(0xbbd4e4,3.3);moonlight.position.set(-65,110,48);moonlight.castShadow=true;moonlight.shadow.mapSize.set(2048,2048);Object.assign(moonlight.shadow.camera,{left:-70,right:70,top:80,bottom:-70,near:1,far:240});moonlight.shadow.bias=-.0008;moonlight.shadow.normalBias=.15;this.scene.add(moonlight);
    const sunset=new T.DirectionalLight(0xefbc86,.9);sunset.position.set(75,30,-50);this.scene.add(sunset);
    this.world=buildCastle(this.scene,materials);this.story=buildStoryWorld(this.scene,materials);this.world.obstacles.push(...this.story.obstacles);
    // Atmosphere is a true 3D sky with layered clouds and stars, never a flat scene image.
    const sky=new T.Mesh(new T.SphereGeometry(650,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;uniform float time;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}void main(){vec3 d=normalize(p);float h=max(0.,d.y);vec3 c=mix(vec3(.028,.055,.075),vec3(.004,.012,.026),pow(h,.42));vec2 uv=d.xz/max(.14,d.y+.18)*2.;float n=noise(uv*2.+vec2(time*.002,0.))*.55+noise(uv*4.)*.3+noise(uv*8.)*.15;float cloud=smoothstep(.48,.8,n)*(1.-smoothstep(.3,.9,h));c=mix(c,vec3(.06,.08,.1),cloud*.3);gl_FragColor=vec4(c,1.);}`}));this.scene.add(sky);
    const rand=random(1208),stars:number[]=[],starColors:number[]=[];for(let i=0;i<1700;i++){const a=rand()*6.28,h=.12+rand()*.88,r=Math.sqrt(1-h*h);stars.push(Math.sin(a)*r*580,h*580,Math.cos(a)*r*580);const l=.35+rand()*.9;starColors.push(l*.8,l*.9,l);}
    const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(stars,3));sg.setAttribute('color',new T.Float32BufferAttribute(starColors,3));this.starField=new T.Points(sg,new T.PointsMaterial({size:1.25,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,fog:false}));this.scene.add(this.starField);
    this.moon=new T.Sprite(new T.SpriteMaterial({map:glowTexture(),color:0xc5e4ec,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));this.moon.position.set(-145,150,-210);this.moon.scale.setScalar(55);this.scene.add(this.moon);
    const disc=new T.Mesh(new T.SphereGeometry(5.5,24,16),new T.MeshBasicMaterial({color:0xe5e4cf}));disc.position.copy(this.moon.position);this.scene.add(disc);
    // A carved walnut wand extends naturally beyond the lower edge of the frame.
    this.camera.add(this.wand);this.scene.add(this.camera);this.wand.position.set(.36,-.36,-.66);
    const tip=buildWand(this.wand,materials);this.glow=new T.Sprite(new T.SpriteMaterial({map:glowTexture(),color:0x99dfff,blending:T.AdditiveBlending,transparent:true,depthTest:true,depthWrite:false,opacity:0}));this.glow.position.copy(tip);this.glow.scale.setScalar(.2);this.wand.add(this.glow);this.wandLight.position.copy(tip);this.wand.add(this.wandLight);this.wand.visible=false;
    const sparkGeo=new T.BufferGeometry();sparkGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(90*3),3));this.sparkVel=new Float32Array(90*3);this.sparks=new T.Points(sparkGeo,new T.PointsMaterial({size:.14,map:glowTexture(),color:0xa3dfff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));this.sparks.visible=false;this.scene.add(this.sparks);
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.ao=new HalfResolutionAO(this.scene,this.camera,512,512);this.ao.updateGtaoMaterial({radius:2.4,distanceExponent:1.2,thickness:1,scale:1.5});this.ao.blendIntensity=.75;this.composer.addPass(this.ao);this.bloom=new UnrealBloomPass(new T.Vector2(1,1),.25,.6,1.25);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.bindInput();this.renderer.shadowMap.needsUpdate=true;
    this.frame=requestAnimationFrame(t=>this.animate(t));
  }
  private listen(target:EventTarget,type:string,handler:EventListener,options?:AddEventListenerOptions){target.addEventListener(type,handler,options);this.disposers.push(()=>target.removeEventListener(type,handler,options));}
  private bindInput(){
    const canvas=this.renderer.domElement;let px=0,py=0;
    this.listen(canvas,'pointerdown',((e:PointerEvent)=>{if(this.paused)return;this.dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);}) as EventListener);
    this.listen(canvas,'pointermove',((e:PointerEvent)=>{if(this.paused||(!this.dragging&&document.pointerLockElement!==canvas))return;const locked=document.pointerLockElement===canvas;const dx=locked?e.movementX:e.clientX-px,dy=locked?e.movementY:e.clientY-py;px=e.clientX;py=e.clientY;
      if(this.mode==='walk'){this.yaw-=dx*.003;this.pitch=T.MathUtils.clamp(this.pitch-dy*.0028,-1.35,1.3);}else{this.autoOrbit=false;this.orbit.theta-=dx*.004;this.orbit.phi=T.MathUtils.clamp(this.orbit.phi-dy*.003,.3,1.47);}}) as EventListener);
    this.listen(canvas,'pointerup',(()=>{this.dragging=false;}) as EventListener);this.listen(canvas,'pointercancel',(()=>{this.dragging=false;}) as EventListener);
    this.listen(canvas,'wheel',((e:WheelEvent)=>{if(this.mode==='overview'&&!this.paused){e.preventDefault();this.orbit.radius=T.MathUtils.clamp(this.orbit.radius+e.deltaY*.06,75,235);}})as EventListener,{passive:false});
    this.listen(window,'keydown',((e:KeyboardEvent)=>{if(this.paused||/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();this.keys.add(k);if(e.repeat)return;if(k==='l')this.toggleLumos();if(k===' ')this.cast();if(k==='e')this.interact();})as EventListener);
    this.listen(window,'keyup',((e:KeyboardEvent)=>{this.keys.delete(e.key.toLowerCase());})as EventListener);
    this.listen(window,'resize',(()=>{this.clearInput();this.resize();})as EventListener);
    this.listen(window,'orientationchange',(()=>{this.clearInput();this.resize();})as EventListener);
    this.listen(window,'blur',(()=>this.clearInput())as EventListener);
    this.listen(document,'visibilitychange',(()=>{this.clearInput();this.last=0;this.audio.setSuspended(document.hidden);})as EventListener);
    this.listen(canvas,'webglcontextlost',((e:Event)=>{e.preventDefault();this.paused=true;this.onError('errorWebgl');})as EventListener);
  }
  private clearInput(){this.keys.clear();this.move.x=this.move.y=0;this.dragging=false;}
  private resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.clearInput();const dpr=this.quality==='low'||this.adaptiveLow?1:this.quality==='high'?Math.min(devicePixelRatio,2):Math.min(devicePixelRatio,this.mobile?1.35:1.65);this.renderer.setPixelRatio(dpr);this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.fov=this.mode==='overview'?(w<h?60:48):(w<h?72:66);this.camera.updateProjectionMatrix();this.wand.position.x=w<h?.18:.34;this.wand.position.z=w<h?-.72:-.72;this.wand.scale.setScalar(w<h?.78:.92);this.composer.setPixelRatio(dpr);this.composer.setSize(w,h);this.bloom.enabled=this.quality!=='low'&&!this.adaptiveLow;this.ao.enabled=!this.adaptiveLow&&(this.quality==='high'||(this.quality==='auto'&&!this.mobile));}
  setQuality(q:Quality){this.quality=q;this.adaptiveLow=false;this.resize();}
  setPaused(p:boolean){this.paused=p;this.clearInput();if(p&&document.pointerLockElement)document.exitPointerLock();}
  setHatSpeech(seconds:number){this.hatSpeechUntil=seconds>0?this.elapsed+seconds:0;}
  setStoryFocus(id:string|null){
    if(id==='sorting'&&!this.storyFocus){this.storyFocus={position:this.camera.position.clone(),rotation:this.camera.quaternion.clone(),yaw:this.yaw,pitch:this.pitch};this.wand.visible=false;this.clearInput();}
    else if(id!=='sorting'&&this.storyFocus){this.camera.position.copy(this.storyFocus.position);this.camera.quaternion.copy(this.storyFocus.rotation);this.yaw=this.storyFocus.yaw;this.pitch=this.storyFocus.pitch;this.storyFocus=null;this.wand.visible=this.mode==='walk';this.hatSpeechUntil=0;this.resize();}
  }
  setSound(on:boolean){this.audio.setEnabled(on);}
  enter(id:PlaceId='bridge'){this.mode='walk';this.wand.visible=true;this.goTo(id);this.resize();this.emit();}
  overview(){this.mode='overview';this.wand.visible=false;this.orbit={theta:.7,phi:1.04,radius:158};this.autoOrbit=true;this.clearInput();this.resize();if(document.pointerLockElement)document.exitPointerLock();this.emit();}
  goTo(id:PlaceId){const p=ALL_PLACES.find(p=>p.id===id);if(!p)return;this.mode='walk';this.wand.visible=true;this.camera.position.set(...p.position);this.yaw=p.yaw;this.pitch=id==='bridge'?.18:id==='stairs'?.24:.08;this.message='';this.messageUntil=0;this.nearPortal=false;this.clearInput();this.portalCooldown=this.elapsed+2;this.resize();this.emit();}
  toggleLumos(){if(this.mode!=='walk'||this.paused)return;this.lumos=!this.lumos;this.audio.spell();this.emit();}
  cast(){if(this.mode!=='walk'||this.paused||this.elapsed-this.castTime<.8)return;this.castTime=this.elapsed;this.audio.spell();this.wand.updateWorldMatrix(true,true);const tip=this.glow.getWorldPosition(new T.Vector3());const dir=this.camera.getWorldDirection(new T.Vector3());const p=this.sparks.geometry.getAttribute('position');for(let i=0;i<p.count;i++){p.setXYZ(i,tip.x,tip.y,tip.z);this.sparkVel[i*3]=dir.x*(3+Math.random()*7)+(Math.random()-.5)*3;this.sparkVel[i*3+1]=dir.y*6+(Math.random()-.5)*3;this.sparkVel[i*3+2]=dir.z*(3+Math.random()*7)+(Math.random()-.5)*3;}p.needsUpdate=true;this.sparks.visible=true;}
  usePortal(){if(this.mode!=='walk'||this.paused||this.elapsed<this.portalCooldown)return;const p=this.world.portals.find(p=>p.position.distanceTo(this.camera.position.clone().add(new T.Vector3(0,-2.05,0)))<2.7);if(p){this.audio.spell();this.goTo(p.target);}}
  setGame(save:Save){this.game=save;this.renderer.domElement.setAttribute('aria-label',t(save.locale,'canvasLabel'));this.renderer.shadowMap.needsUpdate=true;this.emit();}
  private nearbyStory(){const p=placeAt(this.camera.position.x,this.camera.position.z,this.camera.position.y);return STORY_OBJECTS.filter(o=>o.place===p&&objectStatus(this.game,o)!=='locked'&&new T.Vector3(...o.position).distanceTo(this.camera.position)<o.range).sort((a,b)=>Number(b.id===this.game.step)-Number(a.id===this.game.step)||new T.Vector3(...a.position).distanceToSquared(this.camera.position)-new T.Vector3(...b.position).distanceToSquared(this.camera.position))[0];}
  interact(){
    if(this.mode!=='walk'||this.paused)return;
    const nearby=this.nearbyStory();if(nearby){this.onInteraction?.(nearby.id);return;}
    if(this.nearPortal){this.usePortal();return;}
    if(inStairHall(this.camera.position.x,this.camera.position.z)){
      const moving=this.world.stairs.trigger(this.camera.position);this.message=moving?'stairsMessage':'stairsMoving';this.messageUntil=this.elapsed+7;this.audio.spell();this.emit();
    }
  }
  getState(){return {...this.snapshot};}
  private emit(){
    const place=placeAt(this.camera.position.x,this.camera.position.z,this.camera.position.y),nearby=this.nearbyStory();const goal=STORY_OBJECTS.find(o=>o.id===this.game.step);
    this.snapshot={place,heading:((this.yaw*180/Math.PI)%360+360)%360,nearPortal:this.nearPortal,lumos:this.lumos,mode:this.mode,fps:this.fps,actionId:nearby?.id,actionLabel:nearby?t(this.game.locale,nearby.id+'.title'):this.nearPortal?t(this.game.locale,this.camera.position.y>25?'toCourtyard':'toTower'):inStairHall(this.camera.position.x,this.camera.position.z)?t(this.game.locale,'moveStairs'):'',message:this.elapsed<this.messageUntil?t(this.game.locale,this.message):'',stairsMoving:this.world.stairs.flights.some(f=>f.moving),objectiveDistance:goal&&goal.place===place?Math.round(new T.Vector3(...goal.position).distanceTo(this.camera.position)):undefined};this.onState(this.snapshot);
  }
  private animate(ms:number){
    if(this.ended)return;this.frame=requestAnimationFrame(t=>this.animate(t));if(document.hidden){this.last=0;return;}
    const dt=this.last?Math.min((ms-this.last)/1000,.045):.016;this.last=ms;this.elapsed+=dt;const t=this.elapsed;
    this.frames++;this.frameWindow+=dt;if(this.frameWindow>2){this.fps=Math.round(this.frames/this.frameWindow);if(this.quality==='auto'&&this.fps<27&&this.renderer.getPixelRatio()>1.05&&t>5){this.adaptiveLow=true;this.renderer.setPixelRatio(1);this.composer.setPixelRatio(1);this.bloom.enabled=false;this.ao.enabled=false;}this.frames=0;this.frameWindow=0;}
    if(!this.paused){
      if(this.mode==='overview'){
        if(this.autoOrbit&&!this.reducedMotion)this.orbit.theta+=dt*.018;
        const {theta,phi,radius}=this.orbit;const portrait=this.camera.aspect<1;const r=radius*(portrait?1.23:1);this.camera.position.set(Math.sin(theta)*Math.sin(phi)*r,Math.cos(phi)*r+10,Math.cos(theta)*Math.sin(phi)*r-10);this.camera.lookAt(0,portrait?17:14,-12);
      }else{
        this.yaw+=this.world.stairs.update(t,this.camera.position);
        let dx=this.move.x+(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0);
        let dz=this.move.y+(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);const len=Math.hypot(dx,dz);if(len>1){dx/=len;dz/=len;}
        const speed=(this.keys.has('shift')?7:4.6)*dt,wx=(dx*Math.cos(this.yaw)+dz*Math.sin(this.yaw))*speed,wz=(-dx*Math.sin(this.yaw)+dz*Math.cos(this.yaw))*speed;
        const p=this.camera.position;
        const tryStep=(x:number,z:number)=>{
          if(!canMove(x,z,p.y,this.world.obstacles))return;
          if(inStairHall(x,z)){const height=this.world.stairs.floorAt(x,z,p.y-EYE_HEIGHT);if(height===null)return;p.y=height+EYE_HEIGHT;}
          else if(inStairHall(p.x,p.z)&&p.y>EYE_HEIGHT+.3)return;
          else if(p.y<10){p.y=EYE_HEIGHT+(Math.abs(x)<11&&z< -38&&z> -43.15?.4:0);}
          p.x=x;p.z=z;
        };
        tryStep(p.x+wx,p.z);tryStep(p.x,p.z+wz);
        if(len>.08){this.bob+=dt*8;this.audio.step(t);}else this.bob+=dt*1.5;
        this.camera.rotation.set(this.pitch,this.yaw,0,'YXZ');this.wand.position.y=-.36+(this.reducedMotion?0:Math.sin(this.bob)*Math.min(len,.9)*.014);this.wand.rotation.z=this.reducedMotion?0:Math.sin(this.bob*.5)*.012;
        this.nearPortal=this.world.portals.some(p=>p.position.distanceTo(this.camera.position.clone().add(new T.Vector3(0,-2.05,0)))<2.7);
      }
    }
    if(this.storyFocus){const portrait=this.camera.aspect<1,position=new T.Vector3(portrait?0:1.35,portrait?2.4:2.2,portrait?-33.25:-35.45),target=new T.Vector3(portrait?0:1.35,portrait?.7:1.93,-39.25);const quaternion=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(position,target,new T.Vector3(0,1,0)));const amount=this.reducedMotion?1:1-Math.exp(-dt*7);this.camera.position.lerp(position,amount);this.camera.quaternion.slerp(quaternion,amount);this.camera.fov=portrait?62:50;this.camera.updateProjectionMatrix();}
    this.world.setHatSpeaking(!this.reducedMotion&&t<this.hatSpeechUntil);
    const spellAge=t-this.castTime,flash=spellAge<.7?Math.pow(1-spellAge/.7,2):0;
    this.wandLight.intensity=(this.lumos?18:0)+flash*40;(this.glow.material as T.SpriteMaterial).opacity=(this.lumos?.85:0)+flash;this.glow.scale.setScalar(.2+flash*.25);
    this.wand.rotation.x=spellAge<.5?-Math.sin(spellAge/.5*Math.PI)*.16:0;
    if(this.sparks.visible){const p=this.sparks.geometry.getAttribute('position');for(let i=0;i<p.count;i++){p.setXYZ(i,p.getX(i)+this.sparkVel[i*3]*dt,p.getY(i)+this.sparkVel[i*3+1]*dt,p.getZ(i)+this.sparkVel[i*3+2]*dt);this.sparkVel[i*3+1]-=dt*.6;}p.needsUpdate=true;(this.sparks.material as T.PointsMaterial).opacity=Math.max(0,1-spellAge/1.6);if(spellAge>1.6)this.sparks.visible=false;}
    this.world.waterUniforms.time.value=t;this.world.animations(this.reducedMotion?0:t);this.story.setState(this.game,this.mode==='overview'?'bridge':placeAt(this.camera.position.x,this.camera.position.z,this.camera.position.y),this.reducedMotion);this.story.update(t);
    if(this.world.stairs.flights.some(f=>f.moving)&&t-this.shadowTick>.15){this.renderer.shadowMap.needsUpdate=true;this.shadowTick=t;}
    if(t-this.lastEmit>.3){this.emit();this.lastEmit=t;}
    const indoor=this.mode==='walk'&&this.camera.position.y<28&&this.camera.position.z<0;this.ambient.intensity=T.MathUtils.lerp(this.ambient.intensity,this.camera.position.x>70?.65:indoor?.27:.85,.045);
    this.composer.render();
  }
  dispose(){this.ended=true;cancelAnimationFrame(this.frame);this.disposers.forEach(fn=>fn());this.resizeObserver.disconnect();this.audio.dispose();if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock();
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();this.scene.traverse(obj=>{const mesh=obj as T.Mesh;if(mesh.geometry)geometries.add(mesh.geometry);if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>materials.add(m));});materials.forEach(m=>Object.values(m).forEach(x=>{if(x instanceof T.Texture)textures.add(x);}));textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.bloom.dispose();this.ao.dispose();this.composer.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}

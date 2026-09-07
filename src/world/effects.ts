import * as T from 'three';

export type FireSource = {x:number;y:number;z:number;size:number};
const noiseGLSL = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){return noise(p)*.57+noise(p*2.07)*.28+noise(p*4.13)*.15;}`;

/** One instanced draw for all flames; thin billboards retain depth occlusion. */
export function flameField(sources:FireSource[]) {
  const g=new T.InstancedBufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],3));
  g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));g.setIndex([0,1,2,0,2,3]);
  g.setAttribute('offset',new T.InstancedBufferAttribute(new Float32Array(sources.flatMap(p=>[p.x,p.y,p.z])),3));
  g.setAttribute('size',new T.InstancedBufferAttribute(new Float32Array(sources.map(p=>p.size)),1));
  g.setAttribute('phase',new T.InstancedBufferAttribute(new Float32Array(sources.map((_,i)=>i*2.39996)),1));g.instanceCount=sources.length;
  const uniforms={time:{value:0}};
  const mat=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false,
    vertexShader:`attribute vec3 offset;attribute float size,phase;uniform float time;varying vec2 vUv;varying float vPhase;void main(){vUv=uv;vPhase=phase;vec4 center=modelViewMatrix*vec4(offset,1.);float bend=sin(time*3.8+phase)*.085*position.y*position.y;center.xy+=vec2((position.x+bend)*size*.68,position.y*size*(1.+sin(time*8.+phase)*.06));gl_Position=projectionMatrix*center;}`,
    fragmentShader:`uniform float time;varying vec2 vUv;varying float vPhase;${noiseGLSL}void main(){vec2 p=vUv;float n=fbm(vec2(p.x*5.+vPhase,p.y*5.-time*3.));float center=.5+sin(p.y*8.-time*4.+vPhase)*.065*p.y;float width=sin(pow(p.y,.58)*3.14159)*.38*(.78+n*.35);float edge=abs(p.x-center);float a=(1.-smoothstep(width*.7,width+.025,edge))*smoothstep(0.,.08,p.y)*(1.-smoothstep(.85,1.,p.y));if(a<.015)discard;float core=1.-smoothstep(0.,width*.9,edge);vec3 c=mix(vec3(2.9,.65,.06),vec3(4.8,3.1,1.2),core*(1.-p.y*.7));c=mix(vec3(.15,.28,.75),c,smoothstep(.01,.13,p.y));gl_FragColor=vec4(c,a*.95);}`});
  const mesh=new T.Mesh(g,mat);mesh.frustumCulled=false;mesh.renderOrder=4;return {mesh,update:(t:number)=>{uniforms.time.value=t;}};
}

/** Grey, softly occluding vapour. Noise breaks up the silhouette, no additive glow. */
export function vapourField(centers:T.Vector3[]) {
  const sources=centers.flatMap((c,j)=>Array.from({length:9},(_,i)=>({c,phase:i/9,seed:j*12+i})));
  const g=new T.InstancedBufferGeometry();const plane=new T.PlaneGeometry(1,1);g.setAttribute('position',plane.getAttribute('position'));g.setAttribute('uv',plane.getAttribute('uv'));g.setIndex(plane.index);
  g.setAttribute('offset',new T.InstancedBufferAttribute(new Float32Array(sources.flatMap(p=>p.c.toArray())),3));
  g.setAttribute('phase',new T.InstancedBufferAttribute(new Float32Array(sources.map(p=>p.phase)),1));
  g.setAttribute('seed',new T.InstancedBufferAttribute(new Float32Array(sources.map(p=>p.seed)),1));g.instanceCount=sources.length;
  const uniforms={time:{value:0}};
  const mat=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,
    vertexShader:`attribute vec3 offset;attribute float phase,seed;uniform float time;varying vec2 vUv;varying float life,vSeed;void main(){vUv=uv;vSeed=seed;life=fract(phase+time*.11);vec3 p=offset+vec3(sin(life*7.+seed)*life*.45,life*2.1,cos(life*5.+seed)*life*.32);vec4 mv=modelViewMatrix*vec4(p,1.);float s=.28+life*1.25;mv.xy+=position.xy*s;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float time;varying vec2 vUv;varying float life,vSeed;${noiseGLSL}void main(){vec2 p=vUv-.5;float n=fbm(vUv*5.+vec2(vSeed,time*.08));float edge=1.-smoothstep(.12,.5,length(p));float a=edge*smoothstep(.3,.75,n)*sin(life*3.14159)*.2;gl_FragColor=vec4(mix(vec3(.2,.27,.24),vec3(.59,.65,.59),n),a);}`});
  const mesh=new T.Mesh(g,mat);mesh.frustumCulled=false;mesh.renderOrder=5;return {mesh,update:(t:number)=>{uniforms.time.value=t;}};
}

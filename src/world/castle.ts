import * as T from 'three';
import { Builder } from './builder';
import { random, type Materials, glowTexture } from './materials';

export type WorldObjects = { obstacles: Builder['obstacles']; candles: T.Points; water: T.Mesh; waterUniforms: {time:{value:number}}; flames: T.Points; portals: {position:T.Vector3; target:'astronomy'|'courtyard'}[]; animations: (t:number)=>void };

export function buildCastle(scene:T.Scene,m:Materials):WorldObjects {
  const b=new Builder(scene,m),rand=random(92181),v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
  const embers:number[]=[],candlePts:number[]=[],pointColors:number[]=[];
  function glow(x:number,y:number,z:number,scale=1) {embers.push(x,y,z);pointColors.push(scale,scale*.67,scale*.3);}
  function candle(x:number,y:number,z:number,h=.55,floating=false) {
    b.cylinder(x,y+h/2,z,.065,h,m.wax,.057,6);b.sphere(x,y+h+.09,z,.095,m.flame,.62,1.65,.62);
    if(floating)candlePts.push(x,y+h+.09,z);else glow(x,y+h+.09,z);
  }
  function torch(x:number,y:number,z:number,ry=0) {
    b.box(x,y-.18,z,.2,.75,.25,m.iron,ry); b.cylinder(x,y+.18,z,.17,.3,m.gold,.28,8);
    b.sphere(x,y+.57,z,.22,m.flame,.7,1.65,.7);glow(x,y+.55,z,1.3);
  }
  function light(x:number,y:number,z:number,power:number,distance:number,color=0xffbd70) {const l=new T.PointLight(color,power,distance,1.65);l.position.set(x,y,z);scene.add(l);return l;}
  function barrier(x:number,z:number,w:number,d:number,y=0,h=10) {b.obstacles.push({x,z,w,d,minY:y,maxY:y+h});}
  function wall(x:number,z:number,w:number,h:number,d:number) {b.box(x,h/2,z,w,h,d,m.stone,0,true);b.box(x,h-.2,z,w+.22,.38,d+.2,m.trim);}
  function frontWall(cx:number,z:number,w:number,h:number,door=4.8) {
    wall(cx-(w+door)/4,z,(w-door)/2,h,.9);wall(cx+(w+door)/4,z,(w-door)/2,h,.9);
    b.box(cx,(h+7.8)/2,z,door,h-7.8,.9,m.stone);
    b.arch(cx,0,z+.55,door,7.8,.9);b.arch(cx,0,z-.55,door,7.8,.9);
  }
  function columns(x:number,z:number,w:number,d:number) {
    for(let zz=z-d/2+3;zz<=z+d/2-2;zz+=5.5)for(const sign of [-1,1]){
      b.box(x+sign*(w/2+.35),4,zz,1,8,1.2,m.darkStone);
      b.box(x+sign*(w/2+.35),8.25,zz,.8,.7,1,m.trim);
      b.cylinder(x+sign*(w/2+.35),9.4,zz,.44,1.8,m.roof,0,8);
    }
  }
  // The entire walkable ground, bridge and rooms share a continuous floor.
  b.box(0,-.5,-12,78,1,92,m.floor);
  b.box(0,-1,69,10,2,76,m.floor);
  for(const sign of [-1,1]) {
    b.box(sign*5,-.05,69,.7,1.2,77,m.stone,0,true);
    b.box(sign*5,.61,69,.95,.16,77,m.trim);
    for(let z=33;z<109;z+=6){b.box(sign*5,1,z,1.1,1.1,1.1,m.trim);if(z%12===9)torch(sign*5,2.1,z);}
    for(let z=39;z<103;z+=12){b.box(sign*4.2,-12,z,1.5,22,2.4,m.darkStone);b.arch(sign*4.5,-18,z+6,9.7,16,1.5,Math.PI/2,m.darkStone);}
  }
  // Fortress silhouette: foundations, battlements and asymmetrical clustered spires.
  for(let i=0;i<76;i++) {
    const a=i/76*Math.PI*2,r=38+rand()*6,sy=12+rand()*11;const g=new T.IcosahedronGeometry(1,3);const p=g.getAttribute('position');
    for(let j=0;j<p.count;j++){const x=p.getX(j),y=p.getY(j),z=p.getZ(j);const n=1+Math.sin(x*13+y*9)*Math.sin(z*11-y*6)*.09;p.setXYZ(j,x*n,y,z*n);}g.computeVertexNormals();g.scale(7+rand()*7,sy,7+rand()*8);g.rotateY(rand()*6);b.add(g,m.rock,Math.sin(a)*r,-sy-.7,Math.cos(a)*r-12);
  }
  for(const x of [-38.7,38.7]) {wall(x,-12,1.3,6,88);for(let z=-54;z<31;z+=2)b.box(x,6.65,z,1.5,1.3,1,m.trim);}
  wall(0,-57,78,8,1.5);
  for(const x of [-23,23])wall(x,31,32,8,1.6);
  frontWall(0,31,16,13,7.5);
  b.opening(-5.3,7,31.48,1.2,3.1);b.opening(5.3,7,31.48,1.2,3.1);
  b.tower(-9,31,3.6,20,9);b.tower(9,31,3.6,20,9);
  b.tower(-30,22,4.8,33,15);b.tower(30,22,4.4,29,13);
  b.tower(-17,-45,6.6,47,22);b.tower(-21,-47,2.6,59,10);b.tower(-12,-47,2.2,51,12);
  b.tower(4,-49,4.4,37,17);b.tower(-34,-42,3.7,32,13);
  b.tower(37,-33,3.1,29,11);
  // Front courtyard's cloister: genuine open pointed arches and slender columns.
  for(const side of [-1,1]) {
    for(let z=4;z<=26;z+=5.5){b.cylinder(side*21,2.55,z,.37,5.1,m.trim);b.cylinder(side*21,.18,z,.65,.36,m.darkStone);b.cylinder(side*21,4.5,z,.57,.3,m.trim);}
    for(let z=6.75;z<26;z+=5.5)b.arch(side*21,0,z,5,5.6,.52,Math.PI/2);
    b.box(side*23,6,15,6,.45,27,m.trim);b.roof(side*23,15,6,27,6.3,2);
    for(let z=6;z<29;z+=11){torch(side*20.6,2.8,z,Math.PI/2);light(side*19,3,z,42,10);}
  }
  // A low circular fountain leaves a generous route around it.
  b.cylinder(-9,.18,15,3.2,.4,m.trim);b.cylinder(-9,.55,15,2.85,.75,m.darkStone);b.cylinder(-9,.96,15,2.55,.04,m.blueWindow);
  b.cylinder(-9,1.7,15,.38,1.5,m.trim);b.cylinder(-9,2.45,15,1.35,.18,m.trim);b.sphere(-9,3,15,.27,m.gold);barrier(-9,15,5.8,5.8,0,3);
  for(let j=0;j<12;j++){const a=j/12*Math.PI*2;b.beam(v(-9+Math.sin(a)*.5,2.4,15+Math.cos(a)*.5),v(-9+Math.sin(a)*2,1,15+Math.cos(a)*2),.025,m.blueWindow);}
  // Great Hall: four tables, hammer-beam roof, tracery and the enchanted ceiling.
  frontWall(0,0,25,17);
  b.opening(-7.5,6,0.52,2.4,6);b.opening(7.5,6,0.52,2.4,6);
  wall(-12.5,-22,1,17,44);wall(12.5,-22,1,17,44);wall(0,-44,25,17,1);
  b.roof(0,-22,26,45,17,11);columns(0,-22,25,44);
  // Small roof dormers, clustered pinnacles and buttress mouldings break up the roof masses.
  for(const side of [-1,1])for(let z=-7;z>-42;z-=8.5){const x=side*8.5;b.box(x,20,z,2.2,3.8,2.8,m.stone);b.cylinder(x,22.9,z,1.8,2.6,m.roof,0,4);b.opening(x+side*1.12,19.2,z,1,2.2,side*Math.PI/2);b.box(side*13,2,z,1.35,.3,2,m.trim);b.box(side*13,4.3,z,1.25,.25,1.8,m.trim);}
  for(let z=-5;z>-44;z-=6) {
    for(const s of [-1,1]){
      b.opening(s*13.025,5,z,2.5,8,s*Math.PI/2,true);
      b.opening(s*11.98,5,z,2.5,8,-s*Math.PI/2,false);
      b.box(s*11.7,7,z+2.5,.45,14,.6,m.trim);
      b.beam(v(s*11.4,14,z),v(s*7,18,z),.2,m.wood);
      b.beam(v(s*11.4,16.4,z),v(0,26.3,z),.23,m.wood);
      torch(s*11.7,3.4,z+2.5); 
    }
    b.beam(v(-11.5,16,z),v(11.5,16,z),.22,m.wood);
    b.arch(0,10.5,z,23,15.5,.45,0,m.wood);
  }
  b.opening(0,7,-43.45,6.5,11,0,false);
  for(const s of [-1,1]){b.box(s*11.85,1.45,-22,.22,2.9,43,m.darkStone);b.box(s*11.65,3,-22,.38,.16,43,m.trim);}
  for(const [i,x] of [-8,-3.5,3.5,8].entries()) {
    b.box(x,1.08,-23,2.5,.2,29,m.wood,0,true);
    for(let z=-10;z>-38;z-=5){for(const dx of [-.92,.92])b.box(x+dx,.5,z,.17,1,.25,m.wood);}
    for(const dx of [-1.7,1.7]) {b.box(x+dx,.58,-23,.6,.18,29,m.wood,0,true);for(let z=-10;z>-38;z-=4)b.box(x+dx,.25,z,.22,.5,.24,m.wood);}
    for(let z=-10;z>-38;z-=2.3) {
      for(const dx of [-.76,.76]) {b.cylinder(x+dx,1.22,z,.27,.035,m.gold,.27,16);b.cylinder(x+dx*.7,1.37,z+.55,.09,.29,m.gold,.13,10);}
      candle(x,1.2,z,.35+rand()*.35);b.cylinder(x,1.19,z,.2,.05,m.gold);
    }
    const banner=[m.red,m.yellow,m.blue,m.emerald][i];b.box((i-1.5)*3.5,11.5,-42.9,2.2,5,.07,banner);b.box((i-1.5)*3.5,14,-42.8,2.5,.12,.2,m.gold);
    b.add(new T.TorusGeometry(.5,.035,8,32),m.gold,(i-1.5)*3.5,12,-42.8);b.box((i-1.5)*3.5,11,-42.81,.04,2,.02,m.gold);
  }
  b.box(0,.2,-40.5,22,.4,5,m.trim);b.box(0,1.35,-41,18,.25,1.5,m.wood,0,true);
  for(let x=-8;x<=8;x+=2.7){b.box(x,1.15,-42,1.25,2.1,.2,m.wood);b.cylinder(x,2.5,-42,.65,.35,m.wood,0,6);candle(x,1.5,-41,.8);}
  for(let i=0;i<145;i++)candle((rand()-.5)*21,7+rand()*7,-3-rand()*38,.27+rand()*.42,true);
  light(0,8,-15,165,32);light(0,8,-34,165,32);light(0,4,-1,65,14);
  // Side wings are entered through their south-facing doors from the courtyard.
  for(const x of [-27,27]) {frontWall(x,0,18,12,4.5);wall(x-9,-19,.8,12,38);wall(x+9,-19,.8,12,38);wall(x,-38,18,12,.8);b.roof(x,-19,19,39,12,8);columns(x,-19,18,38);
    for(let z=-5;z>-38;z-=6){b.opening(x+(x<0?-9.43:9.43),4,z,2.3,6,x<0?-Math.PI/2:Math.PI/2);b.opening(x+(x<0?-8.57:8.57),4,z,2.3,6,x<0?Math.PI/2:-Math.PI/2,false);b.arch(x,4,z,16,12,.3,0,m.wood);}
    b.opening(x-5.5,4,0.45,1.7,5);b.opening(x+5.5,4,0.45,1.7,5);torch(x-3,2.4,1);torch(x+3,2.4,1);
  }
  const books=[m.red,m.blue,m.yellow,m.emerald,m.wood];
  function shelf(x:number,z:number,w:number,ry=0) {
    b.box(x,3,z,w,6,.65,m.wood,ry,true);
    // Shelf fronts are always on +z, including the freestanding shelves.
    for(let y=.35;y<6;y+=1.05){b.box(x,y,z+.4,w+.2,.13,.95,m.wood);let xx=x-w/2+.15;while(xx<x+w/2-.2){const ww=.1+rand()*.16,h=.5+rand()*.4;b.box(xx+ww/2,y+h/2+.1,z+.57,ww,h,.37,books[Math.floor(rand()*books.length)]);b.box(xx+ww/2,y+h*.7,z+.767,ww*.75,.03,.008,m.gold);xx+=ww+.03;}}
    for(const sign of [-1,1]){b.box(x+sign*w/2,3.1,z+.3,.18,6.2,1,m.wood);b.cylinder(x+sign*w/2,6.4,z+.3,.16,.5,m.gold,0,8);}
  }
  for(const z of [-36,-26,-17])for(const x of [-32,-22])shelf(x,z,5);
  for(let z=-6;z>-34;z-=6){b.box(-35.5,2,z,1,4,4.5,m.wood,0,true);torch(-35,4.4,z);}
  for(const z of [-10,-30]) {b.box(-27,1.15,z,4,.18,2,m.wood,0,true);for(const x of [-28.5,-25.5]){b.box(x,.55,z,.18,1.1,.18,m.wood);b.box(x,1.28,z,.85,.07,.7,m.parchment,.1);candle(x,1.3,z+.55,.6);}}
  light(-27,5,-9,190,24);light(-27,5,-30,175,24);
  // Rolling ladder, balcony and a celestial reading globe.
  b.beam(v(-30,0,-34),v(-31,5,-35),.09,m.wood);b.beam(v(-28.9,0,-34),v(-29.9,5,-35),.09,m.wood);
  for(let y=.3;y<5;y+=.45)b.beam(v(-30-y/5,y,-34-y/5),v(-28.9-y/5,y,-34-y/5),.06,m.wood);
  b.sphere(-22,2,-32,.72,m.blueWindow);b.cylinder(-22,.7,-32,.2,1.4,m.gold);b.add(new T.TorusGeometry(.9,.045,8,48),m.gold,-22,2,-32);b.cylinder(-22,.13,-32,.6,.25,m.wood);
  // Potions: laboratory islands, copper cauldrons, bottles and spectral vapour.
  const steamGeos:number[]=[];
  for(const z of [-12,-24,-34])for(const x of [23,31]) {
    b.box(x,1,z,4,.25,3,m.wood,0,true);for(const dx of [-1.6,1.6])for(const dz of [-1.1,1.1])b.box(x+dx,.5,z+dz,.2,1,.2,m.wood);
    b.sphere(x,1.55,z,.65,m.iron,1,.82,1);b.cylinder(x,1.98,z,.52,.06,m.green);b.add(new T.TorusGeometry(.59,.08,8,24).rotateX(Math.PI/2),m.gold,x,2,z);
    for(const dx of [-1,1])b.add(new T.TorusGeometry(.16,.04,6,16),m.iron,x+dx*.69,1.6,z);
    for(let i=0;i<12;i++)steamGeos.push(x+(rand()-.5)*.6,2+rand()*2,z+(rand()-.5)*.6);
    for(let j=0;j<3;j++){const xx=x+1.1,zz=z-.9+j*.65;b.cylinder(xx,1.35,zz,.13,.45,j%2?m.blueWindow:m.green,.09,8);b.cylinder(xx,1.66,zz,.06,.17,m.gold);}
    candle(x-1.5,1.2,z-1,.6);
  }
  for(const z of [-9,-19,-29]){b.box(35.2,3,z,1.1,5,4.4,m.wood,0,true);for(let y=1;y<5;y++)for(let zz=z-1.7;zz<z+1.8;zz+=.6){b.sphere(34.5,y,zz,.2,m.green);b.cylinder(34.5,y+.23,zz,.085,.2,m.gold);}torch(18.7,3.5,z);}
  light(27,5,-9,150,24,0xb1c4a0);light(27,4,-27,170,26,0x83bead);
  // Astronomy tower: visible architecture and a reachable elevated observatory.
  b.cylinder(30,15.6,-47,6.6,31.2,m.stone);barrier(30,-47,12,12,0,30);
  for(let y=4;y<30;y+=5)for(let j=0;j<12;j++){const a=j/12*Math.PI*2;b.opening(30+Math.sin(a)*6.62,y,-47+Math.cos(a)*6.62,.8,2.5,a);}
  b.cylinder(30,31,-47,7.2,1,m.trim);b.cylinder(30,31.7,-47,6.5,.6,m.floor);
  for(let j=0;j<12;j++){const a=j/12*Math.PI*2,xx=30+Math.sin(a)*6.2,zz=-47+Math.cos(a)*6.2;b.cylinder(xx,35.8,zz,.25,8,m.trim);b.cylinder(xx,32.7,zz,.34,1.8,m.trim);b.cylinder(xx,39.7,zz,.55,.35,m.gold);b.arch(xx,32.4,zz,2.8,6.7,.3,a);}
  b.cylinder(30,40,-47,7,.8,m.trim);b.cylinder(30,47.7,-47,7.5,15,m.roof,0,36);b.cylinder(30,56,-47,.075,2,m.gold,0,8);
  for(const a of [0,.5,1,1.5]){const angle=a*Math.PI;const xx=30+Math.cos(angle)*6.8,zz=-47+Math.sin(angle)*6.8;b.tower(xx,zz,1.4,5,6,37);}
  // Brass telescope and its tripod are solid geometry, sized for first person.
  const telescope=new T.Group();const tube=new T.Mesh(new T.CylinderGeometry(.27,.4,2.8,20),m.gold);tube.rotation.z=.85;tube.position.y=2.3;telescope.add(tube);
  const lens=new T.Mesh(new T.CylinderGeometry(.38,.38,.12,20),m.blueWindow);lens.rotation.z=.85;lens.position.set(-1.02,3.23,0);telescope.add(lens);
  telescope.position.set(31,32,-49);scene.add(telescope);
  for(let j=0;j<3;j++){const a=j/3*Math.PI*2;b.beam(v(31,34,-49),v(31+Math.sin(a)*1.2,32,-49+Math.cos(a)*1.2),.065,m.wood);}
  const portalMat=new T.MeshBasicMaterial({color:0x78c7ce,transparent:true,opacity:.72});
  const portals=[{position:v(13,0,18),target:'astronomy' as const},{position:v(30,32,-43),target:'courtyard' as const}];
  const portalRings:T.Mesh[]=[];
  for(const p of portals){b.cylinder(p.position.x,p.position.y+.08,p.position.z,1.8,.15,m.darkStone);for(const r of [1.2,1.65]){const mesh=new T.Mesh(new T.TorusGeometry(r,.028,6,80),portalMat);mesh.rotation.x=-Math.PI/2;mesh.position.copy(p.position).y+=.19;scene.add(mesh);portalRings.push(mesh);}b.cylinder(p.position.x,p.position.y+.6,p.position.z,.28,1,m.gold,.14,8);b.sphere(p.position.x,p.position.y+1.4,p.position.z,.3,m.blueWindow);glow(p.position.x,p.position.y+1.5,p.position.z,1);}
  // Mountain pines and the far shore deliberately sit below the fortress skyline.
  for(let i=0;i<140;i++){const a=rand()*Math.PI*2,r=56+rand()*75,x=Math.sin(a)*r,z=Math.cos(a)*r-15;if(Math.abs(x)<9&&z>25)continue;const h=5+rand()*10,y=-22+rand()*3;b.cylinder(x,y+h*.2,z,.23,h*.4,m.wood,.14,5);for(let j=0;j<3;j++)b.cylinder(x,y+h*(.38+j*.2),z,h*(.28-j*.065),h*.62,m.tree,.05,7);}
  // Broad, eroded Highland ridges instead of isolated conical mountains.
  const terrain=new T.PlaneGeometry(1500,1500,150,150);terrain.rotateX(-Math.PI/2);const tp=terrain.getAttribute('position');
  for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),r=Math.hypot(x,z);const ramp=T.MathUtils.smoothstep(r,125,275);const n=Math.sin(x*.007+z*.003)*18+Math.cos(z*.009-x*.004)*26+Math.sin(x*.027+z*.012)*9+Math.cos(x*.044-z*.029)*4;tp.setY(i,-34+ramp*(39+n));}terrain.computeVertexNormals();b.add(terrain,m.rock);
  b.finish();
  // Lake: animated wave normals, moonlit specular streaks and shore attenuation.
  const waterUniforms={time:{value:0},color:{value:new T.Color(0x13252f)}};
  const waterMat=new T.ShaderMaterial({uniforms:waterUniforms,vertexShader:`varying vec3 vWorld; void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float time;uniform vec3 color;varying vec3 vWorld;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}void main(){vec2 p=vWorld.xz;float n=noise(p*vec2(.18,.8)+time*.07);float fine=noise(p*vec2(.4,2.)-time*.15);float moon=pow(max(0.,1.-abs(p.x+65.+p.y*.1)/70.),6.)*pow(fine,6.);float fog=1.-exp(-length(vWorld-cameraPosition)*.003);vec3 c=color+(n-.5)*.004+moon*vec3(.06,.08,.1);gl_FragColor=vec4(mix(c,vec3(.013,.027,.037),fog),1.);}`});
  const water=new T.Mesh(new T.PlaneGeometry(1800,1800),waterMat);water.rotation.x=-Math.PI/2;water.position.y=-25;scene.add(water);
  const pointGeo=new T.BufferGeometry();pointGeo.setAttribute('position',new T.Float32BufferAttribute(embers,3));pointGeo.setAttribute('color',new T.Float32BufferAttribute(pointColors,3));
  const pointMat=new T.PointsMaterial({size:2.7,map:glowTexture(),transparent:true,blending:T.AdditiveBlending,depthWrite:false,vertexColors:true});const flames=new T.Points(pointGeo,pointMat);scene.add(flames);
  const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(candlePts,3));const candles=new T.Points(cg,new T.PointsMaterial({size:1.25,color:0xffc478,map:glowTexture(),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));scene.add(candles);
  // An enchanted firmament under the hammer-beam roof, visible from the aisle.
  const ceilingStars:number[]=[];for(let i=0;i<500;i++){const x=(rand()-.5)*23;ceilingStars.push(x,17+(1-Math.abs(x)/13)*11-.3,-1-rand()*42);}
  const csg=new T.BufferGeometry();csg.setAttribute('position',new T.Float32BufferAttribute(ceilingStars,3));const cs=new T.Points(csg,new T.PointsMaterial({size:.105,color:0x98c6df,transparent:true,opacity:.9,depthWrite:false,blending:T.AdditiveBlending,fog:false}));scene.add(cs);
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(steamGeos,3));const steam=new T.Points(sg,new T.PointsMaterial({size:1.25,color:0x65a8a0,map:glowTexture(),transparent:true,opacity:.18,depthWrite:false,blending:T.AdditiveBlending}));scene.add(steam);
  const steamBase=[...steamGeos];
  return {obstacles:b.obstacles,candles,flames,water,waterUniforms,portals,animations(t){portalRings.forEach((r,i)=>{r.rotation.z=t*(i%2?-.12:.12);});const p=steam.geometry.getAttribute('position');for(let i=0;i<p.count;i++){p.setY(i,2+(steamBase[i*3+1]-2+t*.4)%2.8);p.setX(i,steamBase[i*3]+Math.sin(t+i)*.12);}p.needsUpdate=true;pointMat.opacity=.84+Math.sin(t*6)*.06;}};
}

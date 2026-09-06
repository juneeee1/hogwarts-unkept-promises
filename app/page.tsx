'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Compass, Map, Volume2, VolumeX, Settings2, X, Sparkles, Moon, Move, MousePointer2, Maximize, Minimize, BookOpen, Castle, Telescope, FlaskConical, DoorOpen, RotateCcw, WandSparkles, Footprints } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PLACES, type PlaceId } from '@/src/world/navigation';
import type { CastleEngine, EngineState, Quality } from '@/src/world/engine';
import { registerExplorationTools } from '@/src/webmcp';

const INITIAL:EngineState={place:'bridge',heading:0,nearPortal:false,lumos:false,mode:'overview',fps:60};
const ICONS=[Footprints,Compass,DoorOpen,BookOpen,FlaskConical,Telescope];
export default function Home(){
  const mount=useRef<HTMLDivElement>(null),engine=useRef<CastleEngine|null>(null);
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[state,setState]=useState(INITIAL),[panel,setPanel]=useState<'map'|'settings'|null>(null),[sound,setSound]=useState(false),[quality,setQuality]=useState<Quality>('auto'),[fade,setFade]=useState(false),[visited,setVisited]=useState<PlaceId[]>([]),[hint,setHint]=useState(true),[full,setFull]=useState(false);
  const [stick,setStick]=useState({x:0,y:0});const joystick=useRef<{id:number;x:number;y:number}|null>(null);const transition=useRef<ReturnType<typeof setTimeout>|null>(null);const overview=state.mode==='overview';const place=PLACES.find(p=>p.id===state.place)||PLACES[0];
  useEffect(()=>{let alive=true;let instance:CastleEngine|null=null;let boot:ReturnType<typeof setTimeout>;
    import('@/src/world/engine').then(({CastleEngine})=>{boot=setTimeout(()=>{if(!alive||!mount.current)return;try{instance=new CastleEngine(mount.current,s=>{if(!alive)return;setState(s);if(s.mode==='walk')setVisited(v=>v.includes(s.place)?v:[...v,s.place]);},setError,()=>{if(alive)setReady(true);});engine.current=instance;}catch(e){console.error(e);setError('暂时无法开启三维场景。请使用支持 WebGL 2 的浏览器重新打开。');}},80);}).catch(()=>setError('城堡资源载入失败，请检查网络后重试。'));
    return()=>{alive=false;clearTimeout(boot);if(transition.current)clearTimeout(transition.current);instance?.dispose();engine.current=null;};
  },[]);
  useEffect(()=>{engine.current?.setPaused(panel!==null);if(panel){joystick.current=null;setStick({x:0,y:0});}},[panel]);
  useEffect(()=>{const clear=()=>{joystick.current=null;setStick({x:0,y:0});};window.addEventListener('blur',clear);return()=>window.removeEventListener('blur',clear);},[]);
  useEffect(()=>{if(ready&&engine.current)return registerExplorationTools(engine.current,()=>setPanel(null));},[ready]);
  useEffect(()=>{if(overview)return;const timer=setTimeout(()=>setHint(false),16000);return()=>clearTimeout(timer);},[overview]);
  useEffect(()=>{const cb=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',cb);return()=>document.removeEventListener('fullscreenchange',cb);},[]);
  useEffect(()=>{const cb=(e:KeyboardEvent)=>{if(e.repeat)return;if(e.key.toLowerCase()==='m'){e.preventDefault();setPanel(v=>v==='map'?null:'map');}if(e.key==='Escape')setPanel(null);};window.addEventListener('keydown',cb);return()=>window.removeEventListener('keydown',cb);},[]);
  const travel=(id:PlaceId)=>{if(!engine.current)return;setPanel(null);setFade(true);if(transition.current)clearTimeout(transition.current);transition.current=setTimeout(()=>{engine.current?.enter(id);setFade(false);setHint(true);},360);};
  const returnOverview=()=>{setPanel(null);engine.current?.overview();};
  const toggleSound=(value=!sound)=>{setSound(value);engine.current?.setSound(value);};
  const changeQuality=(q:Quality)=>{setQuality(q);engine.current?.setQuality(q);};
  const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else setError('当前浏览器不支持全屏。可以横屏继续体验。');}catch{setError('当前容器不允许全屏，可以继续在此窗口体验。');}};
  const joystickMove=(e:React.PointerEvent)=>{if(joystick.current?.id!==e.pointerId)return;const dx=e.clientX-joystick.current.x,dy=e.clientY-joystick.current.y;const distance=Math.hypot(dx,dy),factor=distance>39?39/distance:1;const x=dx*factor,y=dy*factor;setStick({x,y});if(engine.current)engine.current.move={x:x/39,y:y/39};};
  const joystickEnd=()=>{joystick.current=null;setStick({x:0,y:0});if(engine.current)engine.current.move={x:0,y:0};};
  return <main className={`experience ${overview?'is-overview':'is-walking'} ${ready?'is-ready':''}`}>
    <div className="world-canvas" ref={mount}/>
    <div className="cinema-shade" aria-hidden="true"/>
    <div className="fine-grain" aria-hidden="true"/>
    <header className="topbar">
      <button className="brand" aria-label="返回城堡全景" onClick={returnOverview}><span className="brand-seal">H<span>✧</span></span><span className="brand-wordmark">HOGWARTS<small>城 堡 漫 游</small></span></button>
      <div className="top-location">{overview?<><span className="live-dot"/>自由探索 · 夜</>:<><Compass size={15}/><span>{place.name}</span><span className="location-divider"/><span className="location-en">{place.en}</span></>}</div>
      <nav className="top-tools" aria-label="体验工具">
        <button className={`icon-button ${sound?'active':''}`} title={sound?'关闭环境音':'开启环境音'} aria-label={sound?'关闭环境音':'开启环境音'} aria-pressed={sound} onClick={()=>toggleSound()}>{sound?<Volume2/>:<VolumeX/>}</button>
        <button className="icon-button" title="城堡地图 M" aria-label="打开城堡地图" onClick={()=>setPanel('map')}><Map/></button>
        <button className="icon-button" title="体验设置" aria-label="打开体验设置" onClick={()=>setPanel('settings')}><Settings2/></button>
      </nav>
    </header>
    {overview?<>
      <div className="overview-caption"><span className="tiny-rule"/>苏格兰高地 · 黑湖之畔</div>
      <section className="arrival">
        <div className="eyebrow"><span/> A NIGHT AT HOGWARTS</div>
        <h1>霍格沃茨<span>入夜之后</span></h1>
        <p>灯火未眠，魔法正在发生。</p>
        <div className="arrival-actions"><button className="enter-button" disabled={!ready} onClick={()=>travel('bridge')}><WandSparkles size={18}/>{ready?'走进城堡':'正在点亮城堡'}<ArrowRight size={20}/></button><button className="text-button" disabled={!ready} onClick={()=>setPanel('map')}>选择目的地 <ArrowUpRight size={16}/></button></div>
        <div className="arrival-note"><span className="keyboard-hint"><MousePointer2 size={13}/> 拖动环视 · 滚轮缩放</span><span className="touch-hint">轻划屏幕，环视城堡</span><i/>第一人称沉浸探索</div>
      </section>
      <aside className="destination-preview" aria-label="探索目的地"><div className="dest-title">今晚，去哪里 <span>06</span></div>{PLACES.slice(2,5).map((p,i)=><button key={p.id} onClick={()=>travel(p.id)} disabled={!ready}><span className="dest-number">0{i+1}</span><span>{p.name}<small>{p.en}</small></span><ArrowUpRight size={16}/></button>)}</aside>
      <footer className="overview-footer"><span>✧ <span>让好奇心引路</span></span><span>非官方同人场景 · 自由漫游</span></footer>
    </>:<>
      <div className="compass-bar" aria-hidden="true"><span>W</span><i/><i/><i/><strong>{state.heading>315||state.heading<45?'N':state.heading<135?'W':state.heading<225?'S':'E'}</strong><i/><i/><i/><span>E</span><b>◆</b></div>
      <div className="crosshair" aria-hidden="true"/>
      <div className="walk-location" key={place.id}><span>{place.en}</span><h2>{place.name}</h2></div>
      {hint&&<div className="walk-hint"><span className="keyboard-hint">W A S D 移动 · 拖动环视 · Shift 快行</span><span className="touch-hint">左侧摇杆移动 · 右侧轻划环视</span><button aria-label="关闭操作提示" onClick={()=>setHint(false)}><X size={14}/></button></div>}
      {state.nearPortal&&<button className="portal-action" onClick={()=>engine.current?.usePortal()}><Sparkles size={17}/>{state.place==='astronomy'?'回到庭院':'前往天文塔'}<kbd>E</kbd></button>}
      <div className="movement-pad" aria-label="移动摇杆" role="group" onPointerDown={e=>{if(joystick.current)return;e.currentTarget.setPointerCapture(e.pointerId);const rect=e.currentTarget.getBoundingClientRect();joystick.current={id:e.pointerId,x:rect.left+rect.width/2,y:rect.top+rect.height/2};joystickMove(e);}} onPointerMove={joystickMove} onPointerUp={joystickEnd} onPointerCancel={joystickEnd} onLostPointerCapture={joystickEnd}><span className="stick-n">⌃</span><span className="stick-e">›</span><span className="stick-w">‹</span><span className="stick-s">⌄</span><div className="stick-center" style={{transform:`translate(${stick.x}px,${stick.y}px)`}}><Move size={17}/></div></div>
      <div className="spell-controls"><button className={`lumos-button ${state.lumos?'lit':''}`} aria-label={state.lumos?'熄灭魔杖':'荧光闪烁，点亮魔杖'} aria-pressed={state.lumos} onClick={()=>engine.current?.toggleLumos()}><Sparkles size={21}/><span>{state.lumos?'诺克斯':'荧光闪烁'}</span><kbd>L</kbd></button><button className="cast-button" aria-label="挥动魔杖施法" onClick={()=>engine.current?.cast()}><WandSparkles size={26}/><span>施法</span></button></div>
      <footer className="walk-footer"><button onClick={()=>setPanel('map')}><Map size={17}/><span>活点地图</span><kbd>M</kbd></button><span className="discoveries">已探索 <b>{String(visited.length).padStart(2,'0')}</b> / 06</span><button className="overview-return" onClick={returnOverview}><Castle size={17}/>城堡全景</button></footer>
    </>}
    {!ready&&!error&&<div className="loading-screen"><div className="loading-emblem">H</div><span>霍格沃茨的灯，正在亮起</span><div className="loading-line"/><small>石墙 · 星光 · 尚未结束的魔法</small></div>}
    <div className={`travel-fade ${fade?'visible':''}`} aria-hidden="true"/>
    {error&&<div className="error-banner" role="alert"><p>{error}</p><button onClick={()=>ready?setError(''):window.location.reload()}>{ready?'继续探索':'重新载入'}</button></div>}
    <Dialog open={panel==='map'} onOpenChange={open=>!open&&setPanel(null)}><DialogContent className="castle-dialog map-dialog" showCloseButton={false}><div className="dialog-heading"><div><div className="eyebrow">THE MARAUDER’S MAP</div><DialogTitle className="dialog-title">城堡的秘密，都在路上</DialogTitle></div><button className="icon-button" aria-label="关闭地图" onClick={()=>setPanel(null)}><X/></button></div><DialogDescription className="dialog-description">选择一处目的地，或继续沿着石廊自由探索。</DialogDescription>
      <div className="map-layout"><div className="map-drawing" aria-label="城堡平面导览图"><svg viewBox="0 0 360 400" role="img" aria-label="石桥在南侧，庭院位于中间，大礼堂居中，图书馆在西，魔药教室在东，天文塔在东北"><defs><pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M 12 0 L 0 0 0 12" fill="none" stroke="currentColor" strokeWidth=".3" opacity=".16"/></pattern></defs><rect x="15" y="15" width="330" height="370" fill="url(#grid)"/><g className="plan-stone" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M51 47H309V272H198V382H162V272H51Z"/><rect x="141" y="63" width="78" height="158"/><rect x="66" y="85" width="57" height="133"/><rect x="237" y="85" width="57" height="133"/><path d="M60 227H155M205 227H300M60 257H155M205 257H300M162 290H198M162 318H198M162 346H198M162 373H198"/><circle cx="278" cy="51" r="22"/><circle cx="94" cy="51" r="24"/><circle cx="65" cy="268" r="14"/><circle cx="294" cy="268" r="14"/><circle cx="155" cy="271" r="10"/><circle cx="205" cy="271" r="10"/><circle cx="117" cy="243" r="9"/><path d="M151 81V206M171 81V206M189 81V206M209 81V206" opacity=".45"/><path d="M180 372V238L180 225V199" strokeDasharray="4 6" opacity=".5"/></g><text x="326" y="30" className="map-north">N</text><path d="M330 35v25m-4-21 4-5 4 5" stroke="currentColor" fill="none"/>{[{id:'bridge',x:180,y:342},{id:'courtyard',x:180,y:246},{id:'hall',x:180,y:140},{id:'library',x:94,y:147},{id:'potions',x:266,y:147},{id:'astronomy',x:278,y:51}].map((p,i)=><g key={p.id} className={`map-marker ${state.place===p.id&&!overview?'current':''}`}><circle cx={p.x} cy={p.y} r="11"/><text x={p.x} y={p.y+4}>{i+1}</text></g>)}</svg><span className="map-inscription">我庄严宣誓，我没干好事。</span></div>
      <div className="place-list">{PLACES.map((p,i)=>{const Icon=ICONS[i];return <button className={`place-option ${!overview&&state.place===p.id?'selected':''}`} key={p.id} onClick={()=>travel(p.id)} disabled={!ready}><span className="place-icon"><Icon size={21}/></span><span><strong>{p.name}{visited.includes(p.id)&&<i>已探索</i>}</strong><small>{p.en}</small></span><ArrowUpRight size={17}/></button>;})}</div></div>
      <div className="map-bottom"><span><i className="live-dot"/> {visited.length} / 6 处已探索</span><span>天文塔可通过庭院星盘抵达</span></div>
    </DialogContent></Dialog>
    <Dialog open={panel==='settings'} onOpenChange={open=>!open&&setPanel(null)}><DialogContent className="castle-dialog settings-dialog" showCloseButton={false}><div className="dialog-heading"><div><div className="eyebrow">MAKE YOURSELF AT HOME</div><DialogTitle className="dialog-title">让魔法恰到好处</DialogTitle></div><button className="icon-button" aria-label="关闭设置" onClick={()=>setPanel(null)}><X/></button></div><DialogDescription className="dialog-description">调整你的城堡漫游体验。</DialogDescription><div className="setting-row"><label htmlFor="ambient-sound"><Volume2 size={19}/><span>环境声音<small>风声、脚步与魔杖的轻响</small></span></label><Switch id="ambient-sound" checked={sound} onCheckedChange={toggleSound}/></div><div className="quality-setting"><span>画面品质</span><RadioGroup value={quality} onValueChange={value=>changeQuality(value as Quality)} className="quality-options" aria-label="画面品质">{[['auto','自适应'],['high','精致'],['low','流畅']].map(([id,label])=><label key={id} className={quality===id?'selected':''}><RadioGroupItem value={id}/>{label}</label>)}</RadioGroup><p>自适应模式会根据设备表现调整画面。</p></div><div className="control-guide"><div><kbd>W A S D</kbd><span>行走</span><kbd>Shift</kbd><span>快行</span></div><div><kbd>L</kbd><span>点亮魔杖</span><kbd>Space</kbd><span>施法</span></div><div><kbd>M</kbd><span>城堡地图</span><kbd>E</kbd><span>使用星盘</span></div><p>手机：左侧摇杆行走，右侧轻划环视。</p></div><div className="settings-actions"><button onClick={fullscreen}>{full?<Minimize size={17}/>:<Maximize size={17}/>} {full?'退出全屏':'全屏沉浸'}</button><button onClick={()=>travel('bridge')}><RotateCcw size={17}/> 回到石桥</button></div><p className="fan-note">以原著中的魔法学校为灵感的非官方同人空间。<br/>建筑为艺术化重构，无需聊天即可自由探索。</p></DialogContent></Dialog>
  </main>;
}

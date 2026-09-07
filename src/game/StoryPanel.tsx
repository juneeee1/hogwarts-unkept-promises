'use client';
import {useState} from 'react';
import {ArrowRight,Check,RotateCcw,Sparkles,HelpCircle,Shield} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {SECRETS,stepNumber,type Save,type Step,type Secret,type Action} from './state';
import {PUZZLES,checkPuzzle} from './story';
import {t} from './copy';
import {InvitationLetter} from './InvitationLetter';
import {SortingCeremony} from './SortingCeremony';
import {StoryIcon} from './StoryIcon';
export function StoryPanel({id,save,dispatch,onClose,onAdvance,onSpeak}:{id:string;save:Save;dispatch:(a:Action)=>void;onClose:()=>void;onAdvance:()=>void;onSpeak:(seconds:number)=>void}){
 const tr=(key:string)=>t(save.locale,key),secret=SECRETS.includes(id as Secret),step=id as Step,puzzle=PUZZLES[step];
 const [values,setValues]=useState<number[]>(save.drafts[step]??(puzzle?.kind==='dials'?[0,0,0]:[])),[feedback,setFeedback]=useState<'none'|'fail'|'done'>('none'),[hint,setHint]=useState(false),[aid,setAid]=useState(false);
 const done=secret?save.secrets.includes(id as Secret):stepNumber(save.step)>stepNumber(step),locked=!secret&&step!==save.step&&!done&&step!=='complete';
 const finish=()=>{if(secret){dispatch({type:'secret',id:id as Secret});onClose();}else {dispatch({type:'solve',step});onAdvance();}};
 const submit=()=>{if(!checkPuzzle(step,values)){setFeedback('fail');return;}dispatch({type:'solve',step});setFeedback('done');};
 const changeValues=(next:number[])=>{setFeedback('none');setValues(next);dispatch({type:'draft',step,values:next});};
 const aidStep=save.house?({gryffindor:'passage',ravenclaw:'archive',hufflepuff:'medicine',slytherin:'stars'})[save.house]:null;
 const useAid=()=>{setAid(true);if(step==='passage')changeValues(values[0]===0?values:[0]);else if(step==='archive')changeValues([0]);else if(step==='medicine')changeValues(values[0]===2?values:[2]);else if(step==='stars')changeValues([0,3,values[2]??0]);};
 const add=(i:number)=>{if(puzzle?.kind==='choice')changeValues([i]);else if(puzzle?.kind==='sequence')changeValues(values.length<puzzle.length?[...values,i]:[i]);};
 if(id==='letter')return <InvitationLetter {...{save,dispatch,onClose,onAdvance}}/>;
 if(id==='sorting')return <SortingCeremony {...{save,dispatch,onClose,onAdvance,onSpeak}}/>;
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="story-dialog" showCloseButton={false}>
  <div className="story-rubric"><span>✧ {tr(secret?'secrets':stepNumber(step)>=5&&stepNumber(step)<=10?'parallel':'chapter')}</span><button className="story-close" aria-label={tr('close')} onClick={onClose}>×</button></div>
  <div className="story-sheet" key={id}>
   <div className="story-seal" aria-hidden="true">{secret?'✦':step==='sorting'?'H':feedback==='done'?'✓':String(Math.max(1,stepNumber(step)+1)).padStart(2,'0')}</div>
   <DialogTitle className="story-title">{tr(id+'.title')}</DialogTitle>
   <DialogDescription className="story-prose">{tr(locked?'locked':feedback==='done'?id+'.done':done&&puzzle?id+'.done':id+'.body')}</DialogDescription>
   {feedback==='done'?<button className="story-primary" onClick={onAdvance}>{tr('continue')}<ArrowRight size={18}/></button>:
    locked||done?<button className="story-primary" onClick={onClose}>{tr('close')}</button>:
    puzzle?<div className="puzzle-workspace" data-puzzle={step}>
     {puzzle.kind==='dials'?<div className={`dial-workspace ${step==='stars'?'star-dials':''}`}><div className={`astrolabe-art ${step==='experiment'?'mixing-art':''}`} aria-hidden="true">{step==='experiment'?values.map((n,i)=><div className="measure-vial" key={i}><i style={{height:`${12+n*21}%`}}/><StoryIcon name={puzzle.items[i]}/></div>):<>{values.map((v,i)=><div className={`orbit orbit-${i}`} key={i} style={{transform:`rotate(${v*90}deg)`}}><span><StoryIcon name={puzzle.items[i]}/></span></div>)}<i>✧</i></>}</div><div className="dial-controls">{puzzle.items.map((item,i)=><button key={item} onClick={()=>{changeValues(values.map((n,j)=>j===i?(n+1)%4:n));}} aria-label={`${tr(item)}: ${step==='stars'?tr(['north','east','south','west'][values[i]]):values[i]}`}><small>{tr(item)}</small><strong>{step==='stars'?tr(['north','east','south','west'][values[i]]):values[i]}</strong><RotateCcw size={15}/></button>)}</div></div>:<>
      {puzzle.kind==='sequence'&&<div className="recipe-slots" aria-label={tr('select')}>{Array.from({length:puzzle.length},(_,i)=><div key={i}><small>{i+1}</small>{values[i]!==undefined&&<StoryIcon name={puzzle.items[values[i]]}/>}<span>{values[i]===undefined?'·':tr(puzzle.items[values[i]])}</span></div>)}</div>}
      <div className={`story-options ${puzzle.kind==='sequence'?'ingredient-options':''}`}>{puzzle.items.map((item,i)=>{return <button key={item} onClick={()=>add(i)} aria-pressed={values.includes(i)} className={values.includes(i)?'chosen':''}><StoryIcon name={item}/><span>{tr(item)}</span>{values.includes(i)&&<Check size={16}/>}</button>;})}</div>
     </>}
     {aidStep===step&&<div className="house-aid"><button className="quiet-action" onClick={useAid}><Shield size={15}/>{tr('houseAid')} · {tr(save.house!)}</button>{aid&&<p>{tr('aid.'+save.house)}</p>}</div>}
     {feedback==='fail'&&<output className="puzzle-feedback">{tr(id+'.fail')}</output>}
     {hint&&<p className="puzzle-hint">{tr(id+'.hint')}</p>}
     <div className="puzzle-actions"><button className="quiet-action" onClick={()=>setHint(v=>!v)}><HelpCircle size={16}/>{tr('hint')}</button>{puzzle.kind!=='dials'&&<button className="quiet-action" onClick={()=>{changeValues([]);}}><RotateCcw size={15}/>{tr('resetPuzzle')}</button>}<button className="story-primary" disabled={values.length!==puzzle.length} onClick={submit}><Sparkles size={17}/>{tr('confirm')}</button></div>
    </div>:<button className="story-primary" onClick={step==='complete'?()=>{dispatch({type:'ending'});onClose();}:finish}>{tr(secret?'secret.action':step==='complete'?'continue':id+'.action')}<ArrowRight size={18}/></button>}
  </div>
 </DialogContent></Dialog>;
}

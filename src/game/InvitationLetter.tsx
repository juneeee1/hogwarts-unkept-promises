'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,X} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {t} from './copy';
import type {Save,Action} from './state';
export function InvitationLetter({save,dispatch,onClose,onAdvance}:{save:Save;dispatch:(a:Action)=>void;onClose:()=>void;onAdvance:()=>void}){
 const tr=(key:string)=>t(save.locale,key),[phase,setPhase]=useState<'sealed'|'opening'|'reading'>('sealed'),timer=useRef<ReturnType<typeof setTimeout>|null>(null),readButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{if(phase==='reading')readButton.current?.focus({preventScroll:true});},[phase]);
 const unfold=()=>{if(phase!=='sealed')return;setPhase('opening');timer.current=setTimeout(()=>setPhase('reading'),matchMedia('(prefers-reduced-motion: reduce)').matches?0:1300);};
 const finish=()=>{if(save.step!=='letter'){onClose();return;}dispatch({type:'solve',step:'letter'});onAdvance();};
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent centered={false} className={`invitation-dialog letter-experience ${phase!=='sealed'?'is-open':''} ${phase==='reading'?'is-reading':''}`} showCloseButton={false}>
  <DialogTitle className="sr-only">{tr('letter.title')}</DialogTitle><DialogDescription className="sr-only">{tr('envelopeCaption')}</DialogDescription>
  <button className="story-close letter-dismiss" aria-label={tr('close')} onClick={onClose}><X size={20}/></button>
  <div className="letter-page" inert={phase!=='reading'} aria-hidden={phase!=='reading'}>
   <div className="letter-content invitation-paper"><div className="letter-masthead">HOGWARTS<span>H</span></div><h2 className="letter-heading">{tr('letter.title')}</h2><p className="story-prose">{tr('letter.body')}</p><div className="letter-signature">{tr('letterSignature')}</div><button ref={readButton} className="story-primary" onClick={finish}>{tr(save.step==='letter'?'letter.action':'close')}<ArrowRight size={17}/></button></div>
  </div>
  <div className="letter-shell" aria-hidden={phase==='reading'}><div className="letter-pocket-back"/><div className="letter-flap"/><div className="letter-pocket-front"/><button className="wax-seal" disabled={phase!=='sealed'} aria-label={tr('openEnvelope')} aria-expanded={phase!=='sealed'} onClick={unfold}><span>H</span></button></div>
  {phase==='sealed'&&<div className="letter-instruction"><p>{tr('envelopeCaption')}</p><button className="envelope-open" onClick={unfold}>{tr('openEnvelope')}<ArrowRight size={17}/></button></div>}
 </DialogContent></Dialog>;
}

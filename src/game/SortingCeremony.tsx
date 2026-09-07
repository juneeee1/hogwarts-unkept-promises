'use client';
import {useEffect,useState} from 'react';
import {Check,ArrowRight,Volume2} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {t} from './copy';
import {HOUSES,suggestedHouse,type Save,type Action} from './state';
import {HOUSE_LETTERS} from './story';
import {StoryIcon} from './StoryIcon';
export function SortingCeremony({save,dispatch,onClose,onAdvance,onSpeak}:{save:Save;dispatch:(a:Action)=>void;onClose:()=>void;onAdvance:()=>void;onSpeak:(seconds:number)=>void}){
 const tr=(key:string)=>t(save.locale,key),[choice,setChoice]=useState(suggestedHouse(save.sorting)),[voiceNotice,setVoiceNotice]=useState(false);
 const complete=save.house!==null,line=complete?tr('sort.finished'):save.sorting.length<3?tr(`sort.q${save.sorting.length}`):tr('sort.result');
 useEffect(()=>{onSpeak(Math.min(6,Math.max(2,line.length*.055)));return()=>{onSpeak(0);window.speechSynthesis?.cancel();};},[line,onSpeak]);
 const speak=()=>{const voice=window.speechSynthesis?.getVoices().find(v=>v.localService&&v.lang.toLowerCase().startsWith(save.locale.slice(0,2).toLowerCase()));if(!voice){setVoiceNotice(true);return;}setVoiceNotice(false);window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(line);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.84;utterance.pitch=.62;utterance.onstart=()=>onSpeak(20);utterance.onend=()=>onSpeak(0);utterance.onerror=()=>{onSpeak(0);setVoiceNotice(true);};window.speechSynthesis.speak(utterance);};
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent centered={false} className="story-dialog sorting-dialog" showCloseButton={false}>
  <div className="story-rubric"><span>{tr('hatSpeaker')}</span><div className="hat-dialog-tools"><button className="hat-voice" aria-label={tr('hatVoice')} onClick={speak}><Volume2 size={18}/></button><button className="story-close" aria-label={tr('close')} onClick={onClose}>×</button></div></div>
  <div className="sorting-conversation"><DialogTitle className="story-title">{tr('sorting.title')}</DialogTitle><DialogDescription key={line} className="hat-speech">{line}</DialogDescription>{voiceNotice&&<p className="voice-note">{tr('hatVoiceUnavailable')}</p>}
   {complete?<button className="story-primary" onClick={onClose}>{tr('close')}</button>:save.sorting.length<3?<div className="sorting-questions"><div className="question-progress">{save.sorting.length+1} / 3</div><div className="story-options">{HOUSES.map((house,i)=><button key={house} onClick={()=>{dispatch({type:'answer',house});if(save.sorting.length===2)setChoice(suggestedHouse([...save.sorting,house]));}}><StoryIcon name={house}/><span>{tr(`sort.${save.sorting.length}.${HOUSE_LETTERS[i]}`)}</span><ArrowRight size={16}/></button>)}</div></div>:<div className="sorting-result"><small>{tr('sort.suggest')} · {tr(suggestedHouse(save.sorting))}</small><div className="house-grid">{HOUSES.map(h=><button key={h} data-house={h} aria-pressed={h===choice} className={h===choice?'selected':''} onClick={()=>setChoice(h)}><StoryIcon name={h}/><span>{tr(h)}</span>{h===choice&&<Check size={15}/>}</button>)}</div><button className="story-primary" onClick={()=>{dispatch({type:'house',house:choice});onAdvance();}}>{tr('sort.choose')}<ArrowRight size={17}/></button></div>}
  </div>
 </DialogContent></Dialog>;
}

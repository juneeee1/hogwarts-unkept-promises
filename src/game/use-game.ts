'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {newSave,detectLocale,loadSave,persistSave,parseSave,reduceGame,SAVE_KEY,type Action,type Save} from './state';
export type SaveStatus='new'|'saved'|'recovered'|'unavailable'|'corrupt'|'conflict';
export function useGame(){
 const [save,setSave]=useState<Save>(()=>newSave()),[loaded,setLoaded]=useState(false),[status,setStatus]=useState<SaveStatus>('new');
 const current=useRef(save),statusRef=useRef<SaveStatus>('new');
 const report=useCallback((v:SaveStatus)=>{statusRef.current=v;setStatus(v);},[]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>{const locale=detectLocale(navigator.languages);let result:ReturnType<typeof loadSave>;try{result=loadSave(window.localStorage,locale);}catch{result={save:newSave(locale),status:'unavailable'};}current.current=result.save;setSave(result.save);report(result.status);setLoaded(true);});
 const onStorage=(event:StorageEvent)=>{if(event.key!==SAVE_KEY||!event.newValue)return;const incoming=parseSave(event.newValue);if(incoming&&(incoming.updatedAt>current.current.updatedAt||incoming.revision>current.current.revision))report('conflict');};window.addEventListener('storage',onStorage);return()=>{cancelAnimationFrame(frame);window.removeEventListener('storage',onStorage);};
 },[report]);
 const commit=useCallback((next:Save,replace=false)=>{if(statusRef.current==='conflict'&&!replace)return;current.current=next;setSave(next);if(statusRef.current==='corrupt'&&!replace)return;let ok=false;try{ok=persistSave(window.localStorage,next);}catch{/* Restricted storage leaves the in-memory session playable. */}report(ok?'saved':'unavailable');},[report]);
 const dispatch=useCallback((action:Action)=>{const next=reduceGame(current.current,action);if(next!==current.current)commit(next,action.type==='start');},[commit]);
 const replace=useCallback((next:Save)=>commit({...next,revision:Math.max(next.revision,current.current.revision)+1,updatedAt:Date.now()},true),[commit]);
 return {save,loaded,status,current,dispatch,replace};
}

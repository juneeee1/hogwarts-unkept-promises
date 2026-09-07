'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import theme from '../assets/audio/hedwigs-theme.mp3';
export function useMusic(){
 const audio=useRef<HTMLAudioElement|null>(null),wanted=useRef(false),sequence=useRef(0);
 const [playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 const setEnabled=useCallback((enabled:boolean)=>{
  wanted.current=enabled;const attempt=++sequence.current;setFailed(false);
  if(!enabled){audio.current?.pause();setPlaying(false);return;}
  if(!audio.current){const player=new Audio(theme);player.loop=true;player.volume=.32;player.preload='none';audio.current=player;}
  void audio.current.play().then(()=>{if(attempt!==sequence.current)return;if(!wanted.current){audio.current?.pause();return;}setPlaying(true);}).catch(()=>{if(attempt===sequence.current){setPlaying(false);setFailed(true);}});
 },[]);
 const dispose=useCallback(()=>{++sequence.current;audio.current?.pause();audio.current?.removeAttribute('src');},[]);
 useEffect(()=>{const visibility=()=>{if(document.hidden){++sequence.current;audio.current?.pause();setPlaying(false);}else if(wanted.current)setEnabled(true);};document.addEventListener('visibilitychange',visibility);return()=>{document.removeEventListener('visibilitychange',visibility);dispose();};},[setEnabled,dispose]);
 return {playing,failed,setEnabled};
}

import { PLACES, type PlaceId } from './world/navigation';
import type { CastleEngine } from './world/engine';
type Tool={name:string;title:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown};
type Context={registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>};
export function registerExplorationTools(engine:CastleEngine,closePanel:()=>void){
  const context=(document as Document & {modelContext?:Context}).modelContext;
  if(!context?.registerTool)return()=>{};
  const controller=new AbortController();
  const tools:Tool[]=[
    {name:'read_castle_exploration',title:'查看城堡探索状态',description:'Read the current place, camera position, light state and available destinations.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({...engine.getState(),position:engine.camera.position.toArray(),quality:engine.quality,places:PLACES.map(({id,name})=>({id,name}))})},
    {name:'travel_to_castle_place',title:'前往城堡场景',description:'Enter first person at a named destination, using the same navigation as the castle map.',inputSchema:{type:'object',properties:{place:{type:'string',enum:PLACES.map(p=>p.id)}},required:['place'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){const id=(input as {place?:unknown})?.place;if(typeof id!=='string'||!PLACES.some(p=>p.id===id))throw new Error('Unknown castle destination');closePanel();engine.setPaused(false);engine.enter(id as PlaceId);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return engine.getState();}},
    {name:'set_wand_light',title:'点亮或熄灭魔杖',description:'Set the first-person wand light to the requested on/off state.',inputSchema:{type:'object',properties:{on:{type:'boolean'}},required:['on'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){const on=(input as {on?:unknown})?.on;if(typeof on!=='boolean')throw new Error('on must be a boolean');if(engine.mode!=='walk')throw new Error('Enter a castle location first');if(engine.lumos!==on)engine.toggleLumos();await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return {lumos:engine.lumos};}},
  ];
  for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{});}catch{/* Optional standard: never interfere with normal game controls. */}}
  return()=>controller.abort();
}

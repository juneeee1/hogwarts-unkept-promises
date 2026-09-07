import type { PlaceId } from '../world/navigation';
export const LOCALES=['zh-CN','zh-TW','en','ja','ko'] as const;
export type Locale=typeof LOCALES[number];
export const HOUSES=['gryffindor','ravenclaw','hufflepuff','slytherin'] as const;
export type House=typeof HOUSES[number];
export const STEPS=['letter','sorting','ink','archive','stars','passage','shield','medicine','window','experiment','cabinet','feast','complete'] as const;
export type Step=typeof STEPS[number];
export const SECRETS=['owl','wrapper','swamp','portrait','locket'] as const;
export type Secret=typeof SECRETS[number];
export type Save={drafts:Partial<Record<Step,number[]>>;version:1;revision:number;step:Step;house:House|null;sorting:House[];secrets:Secret[];visited:PlaceId[];checkpoint:PlaceId;locale:Locale;quality:'auto'|'high'|'low';sound:boolean;music:boolean;started:boolean;endingRead:boolean;updatedAt:number};
export type Action={type:'draft';step:Step;values:number[]}|{type:'start'}|{type:'locale';value:Locale}|{type:'setting';quality?:Save['quality'];sound?:boolean;music?:boolean}|{type:'visit';place:PlaceId}|{type:'answer';house:House}|{type:'house';house:House}|{type:'solve';step:Step}|{type:'secret';id:Secret}|{type:'ending'};
export const SAVE_KEY='hogwarts-unkept-promises-v1',BACKUP_KEY=SAVE_KEY+'-backup';
export const PLACE_IDS=['bridge','courtyard','hall','library','potions','stairs','astronomy','shelter','study'] as const;
export function detectLocale(languages:readonly string[]):Locale{for(const raw of languages){const l=raw.toLowerCase();if(/^zh-(tw|hk|mo|hant)/.test(l))return 'zh-TW';if(l.startsWith('zh'))return 'zh-CN';if(l.startsWith('ja'))return 'ja';if(l.startsWith('ko'))return 'ko';if(l.startsWith('en'))return 'en';}return 'en';}
export function newSave(locale:Locale='zh-CN'):Save{return {drafts:{},version:1,revision:0,step:'letter',house:null,sorting:[],secrets:[],visited:[],checkpoint:'bridge',locale,quality:'auto',sound:false,music:false,started:false,endingRead:false,updatedAt:0};}
export function suggestedHouse(answers:House[]):House {return [...HOUSES].sort((a,b)=>answers.filter(x=>x===b).length-answers.filter(x=>x===a).length)[0];}
export function parallel(step:Step){return ['passage','shield','medicine','window','experiment','cabinet'].includes(step);}
export function objectivePlace(step:Step):PlaceId{return ({letter:'bridge',sorting:'hall',ink:'potions',archive:'library',stars:'astronomy',passage:'shelter',shield:'shelter',medicine:'shelter',window:'study',experiment:'study',cabinet:'study',feast:'hall',complete:'hall'} as const)[step];}
export function stepNumber(step:Step){return STEPS.indexOf(step);}
export function reduceGame(s:Save,a:Action):Save{
 const n:Save={...s};
 switch(a.type){
  case 'draft':if(a.step!==s.step||!['ink','archive','stars','passage','shield','medicine','experiment'].includes(a.step)||a.values.length>4||a.values.some(v=>!Number.isInteger(v)||v<0||v>3))return s;n.drafts={...s.drafts,[a.step]:[...a.values]};break;
  case 'start':n.started=true;break;
  case 'locale':if(!LOCALES.includes(a.value))return s;n.locale=a.value;break;
  case 'setting':if(a.quality)n.quality=a.quality;if(a.sound!==undefined)n.sound=a.sound;if(a.music!==undefined)n.music=a.music;break;
  case 'visit':if(!PLACE_IDS.includes(a.place))return s;if(!s.visited.includes(a.place))n.visited=[...s.visited,a.place];n.checkpoint=a.place;break;
  case 'answer':if(s.step!=='sorting'||s.sorting.length>=3||!HOUSES.includes(a.house))return s;n.sorting=[...s.sorting,a.house];break;
  case 'house':if(s.step!=='sorting'||s.sorting.length!==3||!HOUSES.includes(a.house))return s;n.house=a.house;n.step='ink';n.checkpoint='hall';break;
  case 'solve':if(a.step!==s.step||a.step==='sorting'||a.step==='complete')return s;n.step=STEPS[stepNumber(s.step)+1];n.drafts={...s.drafts};delete n.drafts[s.step];if(['passage','window'].includes(n.step))n.checkpoint=objectivePlace(n.step);if(n.step==='feast')n.checkpoint='hall';break;
  case 'secret':if(s.secrets.includes(a.id)||!SECRETS.includes(a.id))return s;n.secrets=[...s.secrets,a.id];break;
  case 'ending':if(s.step!=='complete')return s;n.endingRead=true;break;
 }
 if(JSON.stringify(n)===JSON.stringify(s))return s;
 return {...n,revision:s.revision+1,updatedAt:Date.now()};
}
// Reject inconsistent or future saves without partially applying untrusted data.
export function parseSave(raw:string):Save|null{
 try{if(raw.length>256_000)return null;const v=JSON.parse(raw);if(!v||v.version!==1||!STEPS.includes(v.step)||!LOCALES.includes(v.locale)||!['auto','high','low'].includes(v.quality)||!PLACE_IDS.includes(v.checkpoint))return null;
 if(v.house!==null&&!HOUSES.includes(v.house))return null;
 for(const [key,allowed,max] of [['sorting',HOUSES,3],['secrets',SECRETS,5],['visited',PLACE_IDS,9]] as const){if(!Array.isArray(v[key])||v[key].length>max||v[key].some((x:unknown)=>!allowed.includes(x as never)))return null;}
 if(new Set(v.secrets).size!==v.secrets.length||new Set(v.visited).size!==v.visited.length)return null;
 if(v.music!==undefined&&typeof v.music!=='boolean')return null;
 if(['sound','started','endingRead'].some(k=>typeof v[k]!=='boolean')||!Number.isSafeInteger(v.revision)||v.revision<0||!Number.isFinite(v.updatedAt)||v.updatedAt<0)return null;
 const i=stepNumber(v.step);if(i>=2&&(!v.house||v.sorting.length!==3))return null;if(i<2&&v.house!==null)return null;if(i===0&&v.sorting.length!==0)return null;if(!v.started&&i>0)return null;if(v.endingRead&&v.step!=='complete')return null;
 const drafts=v.drafts??{};if(!drafts||typeof drafts!=='object'||Array.isArray(drafts)||Object.entries(drafts).some(([k,values])=>!['ink','archive','stars','passage','shield','medicine','experiment'].includes(k)||!Array.isArray(values)||values.length>4||(['stars','experiment'].includes(k)&&values.length!==3)||values.some((x:unknown)=>typeof x!=='number'||!Number.isInteger(x)||x<0||x>3)))return null;
 const safe:Save={drafts:Object.fromEntries(Object.entries(drafts).map(([k,a])=>[k,[...(a as number[])]])),version:1,revision:v.revision,step:v.step,house:v.house,sorting:[...v.sorting],secrets:[...v.secrets],visited:[...v.visited],checkpoint:v.checkpoint,locale:v.locale,quality:v.quality,sound:v.sound,music:v.music??false,started:v.started,endingRead:v.endingRead,updatedAt:v.updatedAt};
 if(!parallel(safe.step)&&['shelter','study'].includes(safe.checkpoint)&&safe.step!=='complete')safe.checkpoint=objectivePlace(safe.step);
 return safe;
 }catch{return null;}
}
export type StorageLike=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function loadSave(storage:StorageLike,locale:Locale):{save:Save;status:'new'|'saved'|'recovered'|'unavailable'|'corrupt'}{
 try{const raw=storage.getItem(SAVE_KEY),backup=storage.getItem(BACKUP_KEY);if(raw){const save=parseSave(raw);if(save)return {save,status:'saved'};}if(backup){const save=parseSave(backup);if(save)return {save,status:'recovered'};}return {save:newSave(locale),status:raw||backup?'corrupt':'new'};}catch{return {save:newSave(locale),status:'unavailable'};}
}
export function persistSave(storage:StorageLike,save:Save){try{const existing=storage.getItem(SAVE_KEY);if(existing&&parseSave(existing))storage.setItem(BACKUP_KEY,existing);storage.setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
export function importSave(raw:string,locale:Locale):Save|null{const s=parseSave(raw);return s?{...s,locale,revision:s.revision+1,updatedAt:Date.now()}:null;}

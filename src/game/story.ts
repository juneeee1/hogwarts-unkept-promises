import type { PlaceId } from '../world/navigation';
import {stepNumber,type Save,type Step,type Secret} from './state';
export type Puzzle={kind:'sequence'|'choice'|'dials';items:string[];answer:number[];length:number};
export const PUZZLES:Partial<Record<Step,Puzzle>>={
 ink:{kind:'sequence',items:['water','leaf','stir','flame'],answer:[0,1,2],length:3},
 archive:{kind:'choice',items:['register','rumour','private'],answer:[0],length:1},
 stars:{kind:'dials',items:['moon','star','sun'],answer:[0,3,1],length:3},
 passage:{kind:'sequence',items:['brace','lift','slide','blast'],answer:[0,1,2],length:3},
 shield:{kind:'sequence',items:['moon','star','leafMark','flameMark'],answer:[2,0,3,1],length:4},
 medicine:{kind:'sequence',items:['vial','straps','linen'],answer:[2,0,1],length:3},
 experiment:{kind:'dials',items:['waterMeasure','leafMeasure','heatMeasure'],answer:[2,1,0],length:3},
};
export function checkPuzzle(step:Step,values:readonly number[]){const p=PUZZLES[step];return !!p&&values.length===p.answer.length&&values.every((v,i)=>Number.isInteger(v)&&v===p.answer[i]);}
export type StoryObject={id:Step|Secret;place:PlaceId;position:readonly [number,number,number];range:number;kind:'main'|'secret'};
export const STORY_OBJECTS:StoryObject[]=[
 {id:'letter',place:'bridge',position:[1.6,1.3,78],range:2.6,kind:'main'},
 {id:'sorting',place:'hall',position:[0,2,-39.25],range:3.1,kind:'main'},
 {id:'ink',place:'potions',position:[25,1.35,-10.9],range:2.8,kind:'main'},
 {id:'archive',place:'library',position:[-27,1.45,-9.3],range:2.7,kind:'main'},
 {id:'stars',place:'astronomy',position:[27,33.4,-48],range:2.7,kind:'main'},
 {id:'passage',place:'shelter',position:[87,1.5,1],range:3,kind:'main'},
 {id:'shield',place:'shelter',position:[84,1.65,-2],range:2.7,kind:'main'},
 {id:'medicine',place:'shelter',position:[90,1.25,-4.5],range:2.8,kind:'main'},
 {id:'window',place:'study',position:[84,1.8,-34],range:3,kind:'main'},
 {id:'experiment',place:'study',position:[87,1.45,-32],range:2.8,kind:'main'},
 {id:'cabinet',place:'study',position:[90,1.5,-34],range:2.8,kind:'main'},
 {id:'feast',place:'hall',position:[-1,1.5,-6],range:2.6,kind:'main'},
 {id:'owl',place:'bridge',position:[3.8,1.7,64],range:2.8,kind:'secret'},
 {id:'wrapper',place:'courtyard',position:[-17,1.25,9],range:2.6,kind:'secret'},
 {id:'swamp',place:'stairs',position:[-9,1.2,-64],range:2.8,kind:'secret'},
 {id:'portrait',place:'stairs',position:[9,2,-64],range:2.8,kind:'secret'},
 {id:'locket',place:'library',position:[-30,1.3,-8],range:2.5,kind:'secret'},
];
export function objectStatus(save:Save,obj:StoryObject):'active'|'done'|'locked'{if(obj.kind==='secret')return save.secrets.includes(obj.id as Secret)?'done':'active';if(save.step===obj.id)return 'active';return stepNumber(save.step)>stepNumber(obj.id as Step)?'done':'locked';}
export const HOUSE_LETTERS=['g','r','h','s'] as const;

import atlas from '../assets/polish-v3/story-objects.webp?url';
const OBJECTS=['gryffindor','ravenclaw','hufflepuff','slytherin','water','leaf','stir','flame','moon','star','sun','register','rumour','private','brace','lift','slide','blast','vial','straps','linen','quill','book','envelope'];
const aliases:Record<string,string>={leafMark:'leaf',flameMark:'flame',waterMeasure:'water',leafMeasure:'vial',heatMeasure:'flame'};
/** Padded atlas cells keep neighbouring illustrations outside the visible tile. */
export function StoryIcon({name,className=''}:{name:string;className?:string}){
 const index=Math.max(0,OBJECTS.indexOf(aliases[name]??name));
 return <span className={`story-object-icon painted-object ${className}`} aria-hidden="true" data-object={name} style={{backgroundImage:`url(${atlas})`,backgroundPosition:`${index%6*20}% ${Math.floor(index/6)*100/3}%`}}/>;
}

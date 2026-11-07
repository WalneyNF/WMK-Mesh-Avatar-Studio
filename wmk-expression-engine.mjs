// WMK Expression Language v0.1 — interpretador determinístico, sem eval.
export const CHANNELS = Object.freeze({
 mouthOpen:[0,100,0,'Abertura da boca'],mouthForm:[0,100,0,'Arredondamento'],
 mouthWidth:[60,150,100,'Largura'],mouthStrength:[0,100,100,'Intensidade'],
 lipUpper:[0,100,50,'Lábio superior'],lipLower:[0,100,75,'Lábio inferior'],
 jawDrop:[0,100,50,'Mandíbula'],browA:[-20,20,0,'Sobrancelha A'],browB:[-20,20,0,'Sobrancelha B']
});
export const GROUPS=Object.freeze({mouth:['mouthOpen','mouthForm','mouthWidth','mouthStrength','lipUpper','lipLower','jawDrop'],brows:['browA','browB'],face:Object.keys(CHANNELS)});
export function neutral(){return Object.fromEntries(Object.entries(CHANNELS).map(([k,v])=>[k,v[2]]))}
export function validate(doc){
 const errors=[];
 if(!doc||typeof doc!=='object'||Array.isArray(doc))return ['Documento deve ser um objeto JSON'];
 if(doc.language!=='wmk-expression/0.1')errors.push('language deve ser wmk-expression/0.1');
 if(!Array.isArray(doc.steps)||!doc.steps.length||doc.steps.length>100)errors.push('steps deve conter entre 1 e 100 etapas');
 for(const [i,step] of (Array.isArray(doc.steps)?doc.steps:[]).entries()){
  const at='steps['+i+']';
  if(!step||typeof step!=='object'){errors.push(at+' inválido');continue}
  if(!['set','reset','wait'].includes(step.action))errors.push(at+'.action desconhecida');
  if(step.action==='set'){
   if(!GROUPS[step.region])errors.push(at+'.region desconhecida');
   if(!step.values||typeof step.values!=='object'||Array.isArray(step.values)||!Object.keys(step.values).length)errors.push(at+'.values obrigatório');
   else for(const [key,value] of Object.entries(step.values)){
    if(!CHANNELS[key]){errors.push(at+'.values.'+key+' desconhecido');continue}
    if(GROUPS[step.region]&&!GROUPS[step.region].includes(key))errors.push(at+'.values.'+key+' fora da região '+step.region);
    if(typeof value!=='number'||!Number.isFinite(value)||value<CHANNELS[key][0]||value>CHANNELS[key][1])errors.push(at+'.values.'+key+' fora do intervalo ['+CHANNELS[key][0]+','+CHANNELS[key][1]+']');
   }
  }
  if(step.action==='reset'&&!GROUPS[step.region])errors.push(at+'.region desconhecida');
  if(step.action==='wait'&&step.region!==undefined)errors.push(at+'.region não se aplica a wait');
  if(!Number.isInteger(step.durationMs)||step.durationMs<0||step.durationMs>10000)errors.push(at+'.durationMs deve ser inteiro entre 0 e 10000');
  if(step.easing!==undefined&&!['linear','easeInOut'].includes(step.easing))errors.push(at+'.easing desconhecido');
 }
 return errors;
}
export function compile(doc,initial=neutral()){
 const errors=validate(doc);if(errors.length)throw Error(errors.join('\n'));
 let state={...neutral(),...initial},time=0;const frames=[];
 for(const step of doc.steps){
  const start={...state};const end={...state};
  if(step.action==='reset')for(const key of GROUPS[step.region])end[key]=CHANNELS[key][2];
  if(step.action==='set')Object.assign(end,step.values);
  frames.push({startMs:time,endMs:time+step.durationMs,start,end,easing:step.easing||'easeInOut',action:step.action});
  time+=step.durationMs;state=end;
 }
 return {frames,durationMs:time,final:state};
}
export function sample(plan,ms){
 let last=plan.frames[0]?.start||neutral();
 for(const frame of plan.frames){
  if(ms<frame.startMs)return last;
  if(ms<=frame.endMs){
   if(frame.action==='wait'||frame.endMs===frame.startMs)return {...frame.end};
   let t=Math.max(0,Math.min(1,(ms-frame.startMs)/(frame.endMs-frame.startMs)));
   if(frame.easing==='easeInOut')t=t*t*(3-2*t);
   return Object.fromEntries(Object.keys(CHANNELS).map(k=>[k,frame.start[k]+(frame.end[k]-frame.start[k])*t]));
  }
  last=frame.end;
 }
 return {...last};
}

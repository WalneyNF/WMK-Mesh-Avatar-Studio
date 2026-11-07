// Adaptador Rhubarb -> WMK; não executa arquivos externos.
export const VISEMES=Object.freeze({
 A:{mouthOpen:0,mouthForm:0,mouthWidth:100,jawDrop:0},
 B:{mouthOpen:12,mouthForm:5,mouthWidth:108,jawDrop:8},
 C:{mouthOpen:40,mouthForm:12,mouthWidth:115,jawDrop:30},
 D:{mouthOpen:80,mouthForm:10,mouthWidth:115,jawDrop:70},
 E:{mouthOpen:30,mouthForm:65,mouthWidth:85,jawDrop:25},
 F:{mouthOpen:16,mouthForm:95,mouthWidth:70,jawDrop:12},
 G:{mouthOpen:9,mouthForm:10,mouthWidth:105,jawDrop:5},
 H:{mouthOpen:32,mouthForm:12,mouthWidth:105,jawDrop:25},
 X:{mouthOpen:0,mouthForm:0,mouthWidth:100,jawDrop:0}
});
export function validateRhubarb(doc){
 const errors=[];
 if(!doc||!Array.isArray(doc.mouthCues)||!doc.mouthCues.length)return ['mouthCues ausente ou vazio'];
 let previous=0;
 for(const [i,c] of doc.mouthCues.entries()){
  if(!c||!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<0||c.end<=c.start)errors.push('Intervalo inválido '+i);
  if(c?.start<previous-0.000001)errors.push('Intervalo sobreposto ou fora de ordem '+i);
  if(!Object.hasOwn(VISEMES,c?.value))errors.push('Visema desconhecido '+i);
  if(Number.isFinite(c?.end))previous=c.end;
 }
 return errors;
}
export function convertRhubarb(doc,{actor='NEX'}={}){
 const errors=validateRhubarb(doc);if(errors.length)throw Error(errors.join('; '));
 return {language:'wmk-performance/0.1',actor,durationMs:Math.round(doc.mouthCues.at(-1).end*1000),
  source:'rhubarb-lip-sync',tracks:{visemes:doc.mouthCues.map(c=>({
   startMs:Math.round(c.start*1000),endMs:Math.round(c.end*1000),
   shape:c.value,values:{...VISEMES[c.value]}
  }))}};
}
export function sampleViseme(performance,timeMs){
 const cues=performance?.tracks?.visemes||[];
 const c=cues.find(x=>timeMs>=x.startMs&&timeMs<x.endMs);
 return c?{...c.values}:{...VISEMES.X};
}

type Mark={time:number;viseme:string};const get=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const audio=get<HTMLAudioElement>('audio'),file=get<HTMLInputElement>('file'),wave=get<HTMLCanvasElement>('wave'),mouth=get<HTMLCanvasElement>('mouth'),seek=get<HTMLInputElement>('seek');
const w=wave.getContext('2d')!,m=mouth.getContext('2d')!;let marks:Mark[]=[],samples:Float32Array|null=null,level=0,analyser:AnalyserNode|null=null,context:AudioContext|null=null;
const validVisemes=['repouso','A','E','I','O','U','M/B/P','F/V'];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));const duration=()=>Number.isFinite(audio.duration)?audio.duration:0;
function markers(){get('markers').textContent=marks.length?marks.map(x=>x.time.toFixed(2)+'s: '+x.viseme).join(' | '):'Sem marcações.';}
function render(){
 const width=wave.width,height=wave.height;w.fillStyle='#0b1530';w.fillRect(0,0,width,height);
 if(samples){w.strokeStyle='#20d5ed';w.beginPath();const step=Math.ceil(samples.length/width);for(let x=0;x<width;x++){let peak=0;for(let i=x*step;i<Math.min(samples.length,(x+1)*step);i++)peak=Math.max(peak,Math.abs(samples[i]));w.moveTo(x,height/2-peak*height*.45);w.lineTo(x,height/2+peak*height*.45);}w.stroke();}
 const d=duration();if(d){for(const mark of marks){const x=mark.time/d*width;w.fillStyle='#ff75bb';w.fillRect(x,0,2,height);w.fillText(mark.viseme,x+3,14);}w.fillStyle='#ffe480';w.fillRect(audio.currentTime/d*width,0,2,height);}
 const manual=get<HTMLSelectElement>('mode').value==='manual';
 const current=marks.filter(x=>x.time<=audio.currentTime).at(-1);
 const viseme=manual?(current?.viseme??'repouso'):(level>Number(get<HTMLInputElement>('threshold').value)?'A':'repouso');
 const next=marks.find(x=>x.time>audio.currentTime);
 const transition=Number(get<HTMLInputElement>('transition').value)/1000;
 const nextMix=manual&&next&&transition>0&&next.time-audio.currentTime<transition?clamp(1-(next.time-audio.currentTime)/transition):0;
 const shapes:Record<string,number>={repouso:3,A:58,E:25,I:12,O:49,U:30,'M/B/P':3,'F/V':8};
 const heightM=(shapes[viseme]??3)*(1-nextMix)+(shapes[next?.viseme??viseme]??3)*nextMix;
 const widthM=viseme==='O'||viseme==='U'?75:viseme==='I'||viseme==='E'?155:125;
 m.fillStyle='#0b1530';m.fillRect(0,0,300,210);m.fillStyle='#310f2a';m.strokeStyle='#f7a3c8';m.lineWidth=6;m.beginPath();m.ellipse(150,103,widthM/2,Math.max(3,manual?heightM:heightM*clamp(level*Number(get<HTMLInputElement>('gain').value)*8)),0,0,Math.PI*2);m.fill();m.stroke();m.fillStyle='white';m.textAlign='center';m.font='16px system-ui';m.fillText(viseme,150,187);
 seek.value=d?String(Math.round(audio.currentTime/d*1000)):'0';get('clock').textContent=audio.currentTime.toFixed(2)+' / '+d.toFixed(2)+' s';get('meter').textContent='RMS: '+level.toFixed(3)+' · Visema: '+viseme+' · Modo: '+(manual?'timeline':'volume');
 requestAnimationFrame(render);
}requestAnimationFrame(render);
for(const viseme of validVisemes){const b=document.createElement('button');b.textContent=viseme;b.onclick=()=>{marks.push({time:audio.currentTime,viseme});marks.sort((a,b)=>a.time-b.time);markers();};get('visemes').appendChild(b);}
file.onchange=async()=>{const f=file.files?.[0];if(!f)return;audio.pause();if(audio.src.startsWith('blob:'))URL.revokeObjectURL(audio.src);audio.src=URL.createObjectURL(f);get('status').textContent=f.name;marks=[];markers();samples=null;try{const ctx=new AudioContext();const decoded=await ctx.decodeAudioData(await f.arrayBuffer());samples=decoded.getChannelData(0).slice();await ctx.close();}catch{get('status').textContent='Áudio carregado; forma de onda indisponível.';}};
get('play').onclick=()=>{if(!audio.src)return;if(audio.paused)void audio.play();else audio.pause();};get('stop').onclick=()=>{audio.pause();audio.currentTime=0;};
seek.oninput=()=>{audio.currentTime=duration()*Number(seek.value)/1000;};wave.onclick=e=>{const r=wave.getBoundingClientRect();audio.currentTime=duration()*clamp((e.clientX-r.left)/r.width);};
get('clear').onclick=()=>{marks=[];markers();};get('export').onclick=()=>{const blob=new Blob([JSON.stringify({schemaVersion:1,application:'WMK Lip Lab',audio:file.files?.[0]?.name??'',duration:duration(),marks},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='wmk-visemas.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
audio.addEventListener('play',async()=>{if(!context){context=new AudioContext();analyser=context.createAnalyser();const src=context.createMediaElementSource(audio);src.connect(analyser);analyser.connect(context.destination);}await context.resume();});
function measure(){if(analyser&&!audio.paused){const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);let sum=0;for(const v of data)sum+=v*v;level=Math.sqrt(sum/data.length);}else level=0;requestAnimationFrame(measure);}requestAnimationFrame(measure);

get('demo').onclick=async()=>{audio.pause();if(audio.src.startsWith('blob:'))URL.revokeObjectURL(audio.src);audio.src='/wmk-teste-labial.wav';get('status').textContent='Voz de teste em português (Microsoft Maria)';marks=[];markers();samples=null;try{const response=await fetch('/wmk-teste-labial.wav');if(!response.ok)throw new Error(String(response.status));const ctx=new AudioContext();const decoded=await ctx.decodeAudioData(await response.arrayBuffer());samples=decoded.getChannelData(0).slice();await ctx.close();}catch{get('status').textContent='Não foi possível carregar a voz de teste.';}};

get<HTMLInputElement>('transition').oninput=()=>{get('transition-label').textContent=get<HTMLInputElement>('transition').value+' ms';};
get('import').onclick=()=>get<HTMLInputElement>('timeline-file').click();
get<HTMLInputElement>('timeline-file').onchange=async()=>{const f=get<HTMLInputElement>('timeline-file').files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.marks))throw new Error('JSON sem marks');const parsed:Mark[]=data.marks.map((x:Mark)=>({time:Number(x.time),viseme:String(x.viseme)}));if(parsed.some(x=>!Number.isFinite(x.time)||x.time<0||!validVisemes.includes(x.viseme)))throw new Error('Marcações inválidas');marks=parsed.sort((a,b)=>a.time-b.time);get<HTMLSelectElement>('mode').value='manual';markers();get('status').textContent='Timeline importada: '+marks.length+' marcações';}catch(e){get('status').textContent='Erro ao importar timeline: '+String(e);}};

type R={cx:number;cy:number;rx:number;ry:number};type Rig={image:{width:number;height:number};head:R;face:Record<string,R>;mouth:{area:R};body:{chest:R}};const e=(id:string)=>document.getElementById(id)!;const canvas=e('canvas') as HTMLCanvasElement,ctx=canvas.getContext('2d')!,select=e('projects') as HTMLSelectElement;const paths=['head','face.eyeA','face.eyeB','face.nose','face.mouth','face.browA','face.browB','face.jaw','face.earL','face.earR','mouth.area','body.chest'];const names=['Cabeça','Olho A','Olho B','Nariz','Boca','Sobrancelha A','Sobrancelha B','Mandíbula','Orelha A','Orelha B','Área labial','Peito'];let rig:Rig|null=null,project='',active='face.mouth',img=new Image(),undo:Rig[]=[];let zoom=100;const viewport=e('canvas-viewport'),space=e('canvas-space');function setZoom(value:number){const next=Math.max(10,Math.min(800,Math.round(value)));const previous=zoom;const cx=viewport.scrollLeft+viewport.clientWidth/2,cy=viewport.scrollTop+viewport.clientHeight/2;zoom=next;canvas.style.width=canvas.width*zoom/100+'px';canvas.style.height=canvas.height*zoom/100+'px';(e('zoom-percent') as HTMLInputElement).value=String(zoom);e('zoom-readout').textContent=zoom+'%';requestAnimationFrame(()=>{viewport.scrollLeft=cx*zoom/previous-viewport.clientWidth/2;viewport.scrollTop=cy*zoom/previous-viewport.clientHeight/2})}function fitZoom(){const w=viewport.clientWidth-70,h=viewport.clientHeight-70;setZoom(Math.floor(Math.min(w/canvas.width,h/canvas.height)*100))}const step=()=>Math.max(1,Math.min(100,Number((e('zoom-step') as HTMLInputElement).value)||10));e('zoom-in').onclick=()=>setZoom(zoom+step());e('zoom-out').onclick=()=>setZoom(zoom-step());e('zoom-100').onclick=()=>setZoom(100);e('zoom-fit').onclick=fitZoom;(e('zoom-percent') as HTMLInputElement).onchange=()=>setZoom(Number((e('zoom-percent') as HTMLInputElement).value)||100);viewport.addEventListener('wheel',event=>{if(event.ctrlKey){event.preventDefault();setZoom(zoom+(event.deltaY<0?step():-step()))}else if(event.shiftKey){event.preventDefault();viewport.scrollLeft+=event.deltaY}}, {passive:false});const message=(s:string)=>e('status').textContent=s;function region(path:string):R|null{let value:unknown=rig;for(const k of path.split('.'))value=(value as Record<string,unknown>)?.[k];return value&&typeof value==='object'&&'cx'in value?value as R:null}function snapshot(){if(rig){undo.push(structuredClone(rig));if(undo.length>80)undo.shift()}}function draw(){if(!rig)return;canvas.width=rig.image.width;canvas.height=rig.image.height;canvas.style.width=canvas.width*zoom/100+'px';canvas.style.height=canvas.height*zoom/100+'px';ctx.clearRect(0,0,canvas.width,canvas.height);if(img.complete&&img.naturalWidth)ctx.drawImage(img,0,0,canvas.width,canvas.height);if(!(e('show') as HTMLInputElement).checked)return;paths.forEach((path,i)=>{if((e('only-active') as HTMLInputElement).checked&&path!==active)return;const r=region(path);if(!r)return;ctx.beginPath();ctx.ellipse(r.cx,r.cy,Math.max(2,r.rx),Math.max(2,r.ry),0,0,Math.PI*2);ctx.strokeStyle=path===active?'#00f0ff':'#f48fcf';ctx.lineWidth=path===active?2.5:1;ctx.stroke();ctx.beginPath();ctx.arc(r.cx,r.cy,path===active?5:3,0,7);ctx.fillStyle=ctx.strokeStyle;ctx.fill();ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.fillText(String(i+1),r.cx+6,r.cy-6)});drawGuideArrow()}function properties(){const r=region(active),box=e('props');box.replaceChildren();if(!r)return;const h=document.createElement('h3');h.textContent=names[paths.indexOf(active)];box.append(h);for(const key of ['cx','cy','rx','ry'] as const){const label=document.createElement('label'),span=document.createElement('span'),input=document.createElement('input');span.textContent=({cx:'Centro X',cy:'Centro Y',rx:'Raio horizontal',ry:'Raio vertical'})[key];input.type='number';input.step='0.5';input.min=key.startsWith('r')?'1':'0';input.max=String(key.endsWith('x')?rig!.image.width:rig!.image.height);input.value=String(Math.round(r[key]*100)/100);input.onchange=()=>{const n=Number(input.value);if(!Number.isFinite(n)||n<Number(input.min)||n>Number(input.max)){input.value=String(r[key]);return}snapshot();r[key]=n;draw();message('Alterações não salvas')};label.append(span,input);box.append(label)}}function activate(path:string){active=path;for(const b of e('parts').querySelectorAll('button'))b.classList.toggle('active',b.dataset.path===path);properties();draw()}paths.forEach((path,i)=>{const b=document.createElement('button');b.textContent=names[i];b.dataset.path=path;b.onclick=()=>activate(path);e('parts').append(b)});async function refresh(){try{const r=await fetch('/__studio/drafts');if(!r.ok)throw Error('Servidor indisponível');const names=await r.json() as string[];select.replaceChildren();names.forEach(name=>{const o=document.createElement('option');o.value=o.textContent=name;select.append(o)});if(!names.length)message('Nenhum rascunho encontrado.');else await load()}catch(err){message(String(err))}}async function load(){if(!select.value)return;try{const r=await fetch('/__studio/drafts/'+encodeURIComponent(select.value));const data=await r.json();if(!r.ok)throw Error(data.error);rig=data as Rig;const brow=rig.face.brow??rig.face.browA??{cx:rig.face.eyeA.cx,cy:rig.face.eyeA.cy-14,rx:15,ry:7};if(!rig.face.browA)rig.face.browA={...brow};if(!rig.face.browB)rig.face.browB={...brow,cx:rig.face.eyeB.cx,cy:brow.cy};project=select.value;undo=[];img=new Image();img.onload=draw;img.onerror=()=>message('Imagem não carregada');img.src='/__studio/projects/'+encodeURIComponent(project)+'/source.png?t='+Date.now();activate(active);fitZoom();message('Rascunho '+project+' carregado. Arraste os pontos e salve.')}catch(err){message('Erro: '+String(err))}}e('refresh').onclick=()=>void refresh();e('load').onclick=()=>void load();e('reset').onclick=()=>{if(confirm('Descartar alterações?'))void load()};e('undo').onclick=()=>{const old=undo.pop();if(old){rig=old;properties();draw()}};e('show').onchange=draw;e('only-active').onchange=draw;e('save').onclick=async()=>{if(!rig||!project)return;try{const r=await fetch('/__studio/drafts/'+encodeURIComponent(project),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rig)});const data=await r.json();if(!r.ok)throw Error(data.error);undo=[];message('Salvo em '+data.path+' — Miko preservada.')}catch(err){message('Erro ao salvar: '+String(err))}};function position(event:PointerEvent){const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height}}let dragging=false;canvas.onpointerdown=event=>{if(!rig)return;const p=position(event);/* The left panel determines the active region. Clicking the image must never silently select another region. */snapshot();dragging=true;canvas.setPointerCapture(event.pointerId);move(event)};function move(event:PointerEvent){if(!dragging||!rig)return;const p=position(event),r=region(active);if(r){r.cx=Math.max(0,Math.min(rig.image.width,p.x));r.cy=Math.max(0,Math.min(rig.image.height,p.y));draw();properties()}}canvas.onpointermove=move;canvas.onpointerup=()=>{dragging=false;message('Ponto ajustado. Clique em Salvar rascunho.')};canvas.onpointercancel=()=>{dragging=false};void refresh();

// Guided placement: independent of project creation and rig construction.
const guidePaths=[...paths];
const guideHints=[
'Enquadre a cabeça inteira e ajuste o tamanho da elipse.',
'Coloque o marcador no centro do primeiro olho.',
'Coloque o marcador no centro do segundo olho.',
'Marque o centro do nariz.',
'Coloque o marcador no centro dos lábios.',
'Marque a sobrancelha A acima do olho A.',
'Marque a sobrancelha B acima do olho B.',
'Marque o centro da mandíbula, abaixo da boca.',
'Coloque o marcador sobre a primeira orelha.',
'Coloque o marcador sobre a segunda orelha.',
'Ajuste a área labial para cobrir a região da boca.',
'Posicione o marcador na região central do peito.'
];
const guideDetails=[
'A elipse deve envolver o crânio e o rosto. O cabelo pode ultrapassar a área. Ajuste os raios no painel da direita.',
'Posicione o centro sobre a pupila do olho A. Diminua os raios até a elipse acompanhar aproximadamente o olho.',
'Repita no outro olho. Compare a altura dos dois centros para manter o alinhamento.',
'Marque o centro do nariz, entre os olhos e a boca. Use uma elipse pequena.',
'Marque o centro dos lábios fechados. A área deve cobrir a boca, não o queixo.',
'O JSON atual possui apenas uma região de sobrancelhas: mantenha o marcador sobre a sobrancelha escolhida. Para animar as duas separadamente, criaremos sobrancelha A e B futuramente.',
'Coloque o centro no queixo. Ajuste a elipse para representar a parte inferior do rosto.',
'Marque a orelha A. Se estiver coberta pelo cabelo, estime a posição pela altura dos olhos e do nariz.',
'Marque a orelha B. Compare com a primeira orelha para manter a simetria.',
'A área labial é diferente do ponto Boca: deve abranger a zona que será deformada durante a fala.',
'Centralize sobre o tórax, abaixo do pescoço. Não use o centro do colarinho como referência obrigatória.'
];
const guideReference=[[100,30],[87,38],[113,38],[100,50],[100,62],[87,30],[113,30],[100,79],[70,49],[130,49],[100,62],[100,143]];
function guideFigure(index:number){
 const [x,y]=guideReference[index];
 const brows=index===5||index===6;
 const marker=brows
 ? '<path d="'+(index===5?'M80 31 Q87 26 95 31':'M105 31 Q113 26 120 31')+'" stroke="#00e5ff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M143 16 L'+(index===5?'89':'113')+' 29" stroke="#ffd75a" stroke-width="4" stroke-linecap="round"/>'
 : '<circle cx="'+x+'" cy="'+y+'" r="9" fill="#00e5ff" stroke="white" stroke-width="2"/><path d="M'+(x+34)+' '+(y-27)+' L'+(x+11)+' '+(y-9)+'" stroke="#ffd75a" stroke-width="4" stroke-linecap="round"/><path d="M'+(x+11)+' '+(y-9)+' l13 -2 l-7 -10 z" fill="#ffd75a"/>';
 e('wizard-figure').innerHTML='<svg viewBox="0 0 200 190" role="img" aria-label="Referência '+names[paths.indexOf(guidePaths[index])]+'"><path d="M72 36 Q72 5 100 5 Q128 5 128 36 L125 64 Q116 85 100 87 Q84 85 75 64 Z M83 86 L80 100 L49 109 Q34 116 30 147 L25 185 M117 86 L120 100 L151 109 Q166 116 170 147 L175 185 M80 100 Q100 115 120 100 M40 140 L160 140" stroke="#9fb6d3" stroke-width="2.5" fill="none"/><path d="M80 38 L94 38 M106 38 L120 38 M100 43 L96 51 L104 51 M90 62 Q100 67 110 62" stroke="#9fb6d3" stroke-width="2" fill="none"/>'+marker+'</svg>';
}
function drawGuideArrow(){
 if(guideIndex<0||!(e('wizard-arrow') as HTMLInputElement).checked)return;
 const r=region(guidePaths[guideIndex]);if(!r)return;
 const x=r.cx,y=r.cy;
 const fromX=Math.max(18,Math.min(canvas.width-18,x+(x>canvas.width/2?-65:65)));
 const fromY=Math.max(18,y-52);
 ctx.save();ctx.strokeStyle='#ffe16a';ctx.fillStyle='#ffe16a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(fromX,fromY);ctx.lineTo(x,y);ctx.stroke();
 const angle=Math.atan2(y-fromY,x-fromX);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-15*Math.cos(angle-.45),y-15*Math.sin(angle-.45));ctx.lineTo(x-15*Math.cos(angle+.45),y-15*Math.sin(angle+.45));ctx.closePath();ctx.fill();ctx.restore();
}
e('wizard-arrow').onchange=draw;
let guideIndex=-1;
function guideUpdate(){
 const activeGuide=guideIndex>=0;
 e('wizard-instruction').textContent=activeGuide?guideHints[guideIndex]:'Guia desativado. Clique em Iniciar para marcar os pontos em sequência.';
 e('wizard-detail').textContent=activeGuide?guideDetails[guideIndex]:'';if(activeGuide)guideFigure(guideIndex);else e('wizard-figure').replaceChildren();e('wizard-progress').textContent=activeGuide?'Etapa '+(guideIndex+1)+' de '+guidePaths.length+' — '+names[paths.indexOf(guidePaths[guideIndex])]:'';
 (e('wizard-prev') as HTMLButtonElement).disabled=!activeGuide||guideIndex===0;
 (e('wizard-next') as HTMLButtonElement).disabled=!activeGuide||guideIndex===guidePaths.length-1;
 if(activeGuide)activate(guidePaths[guideIndex]);
}
e('wizard-start').onclick=()=>{if(!rig){message('Abra um rascunho antes de iniciar o guia.');return}guideIndex=0;(e('only-active') as HTMLInputElement).checked=true;guideUpdate()};
e('wizard-prev').onclick=()=>{if(guideIndex>0){guideIndex--;guideUpdate()}};
e('wizard-next').onclick=()=>{if(guideIndex>=0&&guideIndex<guidePaths.length-1){guideIndex++;guideUpdate()}};
e('wizard-end').onclick=()=>{guideIndex=-1;guideUpdate()};
guideUpdate();

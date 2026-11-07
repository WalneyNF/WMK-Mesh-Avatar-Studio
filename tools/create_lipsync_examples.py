from pathlib import Path
import json, subprocess
root=Path(r'C:\ferramentas\mesh-avatar-studio')
out=root/'samples'/'wmk-lipsync'
out.mkdir(parents=True,exist_ok=True)
wav=root/'samples'/'wmk-teste-labial.wav'
subprocess.run([r'D:\ffmpeg\bin\ffmpeg.exe','-y','-v','error','-i',str(wav),'-t','5','-ac','1','-ar','16000',str(out/'nex-demo-5s.wav')],check=True)
shapes=['X','A','D','C','B','F','E','C','A','X','D','C','G','B','F','X','C','D','A','X']
cues=[dict(start=round(i*.25,3),end=round((i+1)*.25,3),value=v) for i,v in enumerate(shapes)]
rh={'metadata':{'soundFile':'nex-demo-5s.wav','duration':5},'mouthCues':cues}
(out/'nex-demo-rhubarb-exemplo.json').write_text(json.dumps(rh,ensure_ascii=False,indent=2),encoding='utf-8')
(out/'LEIA-ME.txt').write_text('WMK Lip Sync Studio - exemplos prontos\nCréditos: Walney Moreira Klein - walneyk@hotmail.com\n\nnex-demo-5s.wav: trecho de 5 segundos do áudio já existente no projeto.\nnex-demo-rhubarb-exemplo.json: eventos SINTÉTICOS no formato Rhubarb, NÃO extraídos por reconhecimento fonético.\nPara testar: abra /wmk-lipsync-studio.html e clique em Carregar pacote NEX (5 s).\nA imagem é carregada de projects/NEX_apresentador/source.png.\n',encoding='utf-8')
page=root/'wmk-lipsync-studio.html'
s=page.read_text(encoding='utf-8')
s=s.replace('<button id="demo">Criar visemas de exemplo</button>','<button id="package">Carregar pacote NEX (5 s)</button><button id="demo">Criar visemas de exemplo</button>')
anchor="$('demo').onclick=()=>"
insertion="""$('package').onclick=async()=>{try{
 const base='/samples/wmk-lipsync/';
 const response=await fetch(base+'nex-demo-rhubarb-exemplo.json');
 if(!response.ok)throw Error('JSON HTTP '+response.status);
 performanceDoc=convertRhubarb(await response.json());selected=-1;updateDuration();
 if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;
 a.src=base+'nex-demo-5s.wav';a.load();
 const audioResponse=await fetch(base+'nex-demo-5s.wav');if(!audioResponse.ok)throw Error('Áudio HTTP '+audioResponse.status);
 ac=ac||new AudioContext();buffer=await ac.decodeAudioData(await audioResponse.arrayBuffer());
 const im=new Image();im.onload=()=>{img=im;draw()};im.src='/projects/NEX_apresentador/source.png';
 render();status('Pacote NEX carregado: áudio de 5 s, imagem e '+performanceDoc.tracks.visemes.length+' visemas SINTÉTICOS. Clique em Reproduzir.');
}catch(err){status('ERRO ao carregar pacote: '+err.message)}};
"""
assert anchor in s
s=s.replace(anchor,insertion+anchor,1)
page.write_text(s,encoding='utf-8')
print('OK arquivos:',*[p.name for p in out.iterdir()],sep='\n - ')
print('HTML botão pacote:', 'id="package"' in s)

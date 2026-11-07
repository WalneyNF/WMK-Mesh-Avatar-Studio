import type { Plugin } from 'vite';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

export function nexSpeechPlugin(root: string): Plugin {
  return {
    name: 'wmk-nex-local-speech',
    configureServer(server) {
      server.middlewares.use('/api/wmk-nex-tts', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method !== 'POST') { res.statusCode=405; res.end(JSON.stringify({error:'Use POST'})); return; }
        // Local-only speech generation: never expose this endpoint to the public internet.
        const remote = req.socket.remoteAddress || '';
        if (!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote)) {
          res.statusCode=403; res.end(JSON.stringify({error:'Acesso permitido apenas localmente'})); return;
        }
        try {
          const parts: Buffer[] = [];
          let bytes=0;
          for await (const chunk of req) {
            bytes += chunk.length;
            if (bytes > 8192) throw new Error('Texto muito grande');
            parts.push(chunk);
          }
          const body=JSON.parse(Buffer.concat(parts).toString('utf8'));
          const text=String(body.text||'').trim();
          if (!text || text.length>1800) throw new Error('Informe até 1800 caracteres');
          const folder=join(root,'samples','wmk-lipsync','generated');
          await mkdir(folder,{recursive:true});
          const name='nex-'+randomUUID()+'.wav';
          const file=join(folder,name);
          const script=join(root,'tools','nex-speech.ps1');
          const input=join(folder,name+'.txt');
          const {writeFile}=await import('node:fs/promises');
          await writeFile(input,text,'utf8');
          const result=await new Promise<{voice:string}>((resolve,reject)=>{
            execFile('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',script,'-InputPath',input,'-OutputPath',file],
              {timeout:120000,windowsHide:true,maxBuffer:200000},(err,stdout,stderr)=>{
                if(err) reject(new Error((stderr||err.message).slice(0,300)));
                else resolve({voice:stdout.trim()||'Voz Windows'});
              });
          });
          await unlink(input).catch(()=>{});
          const wav=await readFile(file);
          if(wav.length<100) throw new Error('WAV vazio');
          res.end(JSON.stringify({url:'/samples/wmk-lipsync/generated/'+name,voice:result.voice,bytes:wav.length}));
        } catch (e) {
          res.statusCode=400; res.end(JSON.stringify({error:e instanceof Error?e.message:String(e)}));
        }
      });
    }
  };
}

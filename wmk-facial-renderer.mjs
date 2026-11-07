// WMK Facial Renderer: geometria compartilhada com o Laboratório de Expressões.
export function renderMouth(ctx,m,values){
 if(!m)return;
 const opening=Number(values.mouthOpen)/100,form=Number(values.mouthForm)/100;
 const width=Number(values.mouthWidth)/100,strength=Number(values.mouthStrength)/100;
 const upper=Number(values.lipUpper)/100,lower=Number(values.lipLower)/100,jaw=Number(values.jawDrop)/100;
 if(opening<=0||strength<=0)return;
 const half=m.halfLen*width*(1-form*.38);
 const height=Math.min(25,Math.max(0,opening*(5+half*.7)))*strength;
 ctx.save();ctx.translate(m.cx,m.cy);ctx.rotate(m.angle||0);
 ctx.beginPath();ctx.moveTo(-half,0);
 ctx.bezierCurveTo(-half*.5,-height*.85*upper,half*.5,-height*.85*upper,half,0);
 ctx.bezierCurveTo(half*.48,height*(.2+lower*.6+jaw*.35),-half*.48,height*(.2+lower*.6+jaw*.35),-half,0);
 ctx.closePath();ctx.fillStyle='#381721';ctx.fill();
 ctx.save();ctx.clip();
 ctx.beginPath();ctx.ellipse(0,height*.48,half*.46,height*.34,0,Math.PI,2*Math.PI);ctx.fillStyle='#bc6674';ctx.fill();
 if(opening>.28){ctx.beginPath();ctx.ellipse(0,height*.06,half*.64,Math.max(1,height*.17),0,0,Math.PI*2);ctx.fillStyle='#f4dfd3';ctx.fill()}
 ctx.restore();ctx.strokeStyle='rgba(123,62,66,.8)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
}
export function renderFace(ctx,image,bridge,values){
 if(!image?.naturalWidth||!bridge?.mouth)return false;
 const m=bridge.mouth,w=image.naturalWidth,h=image.naturalHeight;
 const surface=document.createElement('canvas');surface.width=w;surface.height=h;
 const c=surface.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
 const original=c.getImageData(0,0,w,h),out=new Uint8ClampedArray(original.data);
 const opening=values.mouthOpen/100,force=values.mouthStrength/100,jaw=values.jawDrop/100,drop=opening*force*jaw*7;
 if(drop>.01){
  const rx=Math.max(20,m.halfLen*1.8),ry=32;
  for(let y=Math.max(0,Math.floor(m.cy));y<Math.min(h,Math.ceil(m.cy+ry));y++)
   for(let x=Math.max(0,Math.floor(m.cx-rx));x<Math.min(w,Math.ceil(m.cx+rx));x++){
    const nx=(x-m.cx)/rx,ny=(y-m.cy)/ry;if(nx*nx+ny*ny>=1)continue;
    const falloff=Math.pow(1-nx*nx-ny*ny,2),sy=Math.max(0,Math.min(h-1,Math.round(y-drop*falloff)));
    const from=(sy*w+x)*4,to=(y*w+x)*4;for(let k=0;k<4;k++)out[to+k]=original.data[from+k];
   }
 }
 c.putImageData(new ImageData(out,w,h),0,0);renderMouth(c,m,values);
 ctx.drawImage(surface,0,0);return true;
}

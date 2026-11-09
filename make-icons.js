// Genera los iconos PNG (sin dependencias). Uso: node make-icons.js
const fs = require("fs"), zlib = require("zlib");
function crc(buf){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}
  let x=0xFFFFFFFF;for(const b of buf)x=t[(x^b)&255]^(x>>>8);return (x^0xFFFFFFFF)>>>0}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);
  const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([len,td,c])}
function png(size,pix){const raw=Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++){raw[y*(size*4+1)]=0;for(let x=0;x<size;x++){const p=pix(x/size,y/size);const o=y*(size*4+1)+1+x*4;raw[o]=p[0];raw[o+1]=p[1];raw[o+2]=p[2];raw[o+3]=255}}
  const ih=Buffer.alloc(13);ih.writeUInt32BE(size,0);ih.writeUInt32BE(size,4);ih[8]=8;ih[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ih),chunk("IDAT",zlib.deflateSync(raw)),chunk("IEND",Buffer.alloc(0))])}
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const ell=(x,y,cx,cy,rx,ry)=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1;
// Loro estilizado dentro de la zona segura (centro 60%).
function color(u,v){
  let c=mix([63,169,201],[111,184,106],(u+v)/2);                       // fondo cielo→hoja
  if(ell(u,v,.5,.5,.46,.46)&&false)c=c;
  if(ell(u,v,.64,.34,.1,.1)) c=[255,193,59];                              // sol
  if(ell(u,v,.5,.62,.2,.26)) c=[255,111,94];                              // cuerpo coral
  if(ell(u,v,.5,.38,.17,.17)) c=[111,184,106];                            // cabeza verde
  if(ell(u,v,.5,.38,.17,.17)&&u<.5) c=[80,160,90];
  if(ell(u,v,.56,.36,.055,.055)) c=[255,255,255];                         // ojo
  if(ell(u,v,.57,.36,.025,.025)) c=[43,58,85];
  // pico
  const px=u-.6,py=v-.42; if(px>0&&px<.12&&Math.abs(py)<.09*(1-px/.12)) c=[255,193,59];
  if(ell(u,v,.5,.78,.1,.04)) c=[255,193,59];                              // percha/patas
  return c;
}
function render(size,scale){return png(size,(u,v)=>{
  let s=0,r=0,g=0,b=0;for(const dx of[.25,.75])for(const dy of[.25,.75]){
    const uu=((u*size+dx)/size-.5)/scale+.5, vv=((v*size+dy)/size-.5)/scale+.5;
    const c=color(uu,vv);r+=c[0];g+=c[1];b+=c[2];s++}
  return [r/s,g/s,b/s]})}
fs.writeFileSync("icons/icon-192.png",render(192,1));
fs.writeFileSync("icons/icon-512.png",render(512,1));
fs.writeFileSync("icons/icon-maskable-512.png",render(512,.8));
fs.writeFileSync("icons/apple-touch-icon.png",render(180,1));
console.log("ok");

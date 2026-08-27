// Original compact QR Version 3-L encoder for short app URLs (byte mode, mask 0).
// Capacity: up to 53 ISO-8859-1/UTF-8 bytes. The app falls back to origin-only when needed.
const SIZE=29, DATA_CW=55, TOTAL_CW=70, EC_CW=15;
export function drawAppQr(canvas,text,label='SNX'){
  let bytes=[...new TextEncoder().encode(text)];
  if(bytes.length>53) bytes=[...new TextEncoder().encode(location.origin)];
  if(bytes.length>53) throw new Error('App URL is too long for embedded QR encoder.');
  const data=encodeData(bytes), ec=reedSolomon(data,EC_CW), code=[...data,...ec];
  const m=Array.from({length:SIZE},()=>Array(SIZE).fill(null)); const reserved=Array.from({length:SIZE},()=>Array(SIZE).fill(false));
  finder(m,reserved,0,0); finder(m,reserved,SIZE-7,0); finder(m,reserved,0,SIZE-7); alignment(m,reserved,22,22); timing(m,reserved); reserveFormat(m,reserved); m[SIZE-8][8]=1; reserved[SIZE-8][8]=true;
  placeData(m,reserved,code); writeFormat(m,reserved,1,0); render(canvas,m,label);
}
function encodeData(bytes){
  const bits=[]; push(bits,0b0100,4); push(bits,bytes.length,8); bytes.forEach(b=>push(bits,b,8));
  const cap=DATA_CW*8; for(let i=0;i<4&&bits.length<cap;i++)bits.push(0); while(bits.length%8)bits.push(0);
  const out=[]; for(let i=0;i<bits.length;i+=8) out.push(bits.slice(i,i+8).reduce((a,b)=>(a<<1)|b,0)); let pad=0; while(out.length<DATA_CW) out.push(pad++%2?0x11:0xec); return out;
}
function push(a,n,len){for(let i=len-1;i>=0;i--)a.push((n>>i)&1)}
function reedSolomon(data,n){ const gen=generator(n), msg=[...data,...Array(n).fill(0)]; for(let i=0;i<data.length;i++){const coef=msg[i]; if(!coef)continue; for(let j=0;j<gen.length;j++) msg[i+j]^=mul(gen[j],coef);} return msg.slice(data.length); }
function generator(n){let g=[1]; for(let i=0;i<n;i++)g=polyMul(g,[1,pow2(i)]); return g;}
function polyMul(a,b){const r=Array(a.length+b.length-1).fill(0); for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)r[i+j]^=mul(a[i],b[j]); return r;}
function mul(a,b){let r=0; while(b){if(b&1)r^=a; b>>=1; a<<=1; if(a&0x100)a^=0x11d;} return r;}
function pow2(n){let r=1; while(n--)r=mul(r,2); return r;}
function finder(m,r,x,y){ for(let dy=-1;dy<=7;dy++)for(let dx=-1;dx<=7;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=SIZE||yy>=SIZE)continue;r[yy][xx]=true; const on=dx>=0&&dx<=6&&dy>=0&&dy<=6&&(dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4));m[yy][xx]=on?1:0;} }
function alignment(m,r,cx,cy){for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++){const d=Math.max(Math.abs(x),Math.abs(y));m[cy+y][cx+x]=(d===2||d===0)?1:0;r[cy+y][cx+x]=true;}}
function timing(m,r){for(let i=8;i<SIZE-8;i++){m[6][i]=i%2?0:1;r[6][i]=true;m[i][6]=i%2?0:1;r[i][6]=true;}}
function reserveFormat(m,r){for(let i=0;i<9;i++){if(i!==6){r[8][i]=true;r[i][8]=true;if(m[8][i]===null)m[8][i]=0;if(m[i][8]===null)m[i][8]=0;}}for(let i=0;i<8;i++){r[8][SIZE-1-i]=true;r[SIZE-1-i][8]=true;m[8][SIZE-1-i]=0;m[SIZE-1-i][8]=0;}}
function placeData(m,r,code){const bits=[];code.forEach(b=>push(bits,b,8));let bi=0,up=true;for(let x=SIZE-1;x>0;x-=2){if(x===6)x--;for(let k=0;k<SIZE;k++){const y=up?SIZE-1-k:k;for(let dx=0;dx<2;dx++){const xx=x-dx;if(r[y][xx])continue;let bit=bits[bi++]??0;if((y+xx)%2===0)bit^=1;m[y][xx]=bit;}}up=!up;}}
function writeFormat(m,r,ecLevel,mask){ // ecLevel=1 => L (format bits 01)
  let data=(ecLevel<<3)|mask, v=data<<10; const poly=0x537; while(bitLen(v)>=bitLen(poly))v^=poly<<(bitLen(v)-bitLen(poly)); const fmt=((data<<10)|v)^0x5412;
  const bit=i=>(fmt>>i)&1;
  const a=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  const b=[[SIZE-1,8],[SIZE-2,8],[SIZE-3,8],[SIZE-4,8],[SIZE-5,8],[SIZE-6,8],[SIZE-7,8],[SIZE-8,8],[8,SIZE-7],[8,SIZE-6],[8,SIZE-5],[8,SIZE-4],[8,SIZE-3],[8,SIZE-2],[8,SIZE-1]];
  for(let i=0;i<15;i++){m[a[i][1]][a[i][0]]=bit(i);m[b[i][1]][b[i][0]]=bit(i);}
}
function bitLen(n){let l=0;while(n){l++;n>>=1}return l;}
function render(canvas,m,label){const ctx=canvas.getContext('2d'),quiet=4,scale=8,total=(SIZE+quiet*2)*scale;canvas.width=canvas.height=total;ctx.fillStyle='#fff';ctx.fillRect(0,0,total,total);ctx.fillStyle='#061018';for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(m[y][x])ctx.fillRect((x+quiet)*scale,(y+quiet)*scale,scale,scale);const box=38;ctx.fillStyle='#071117';ctx.fillRect((total-box)/2,(total-box)/2,box,box);ctx.strokeStyle='#00f0ff';ctx.lineWidth=2;ctx.strokeRect((total-box)/2+1,(total-box)/2+1,box-2,box-2);ctx.fillStyle='#00f0ff';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,total/2,total/2+1);}

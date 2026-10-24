/* Minimal ZIP writer (no dependencies) used for repo downloads */
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
const ub=s=>{const b=atob(s.replace(/\s/g,'')),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
function makeZip(files){const te=new TextEncoder(),parts=[],cen=[],n=new Date(),
  dt=(n.getHours()<<11)|(n.getMinutes()<<5)|(n.getSeconds()>>1),dd=((n.getFullYear()-1980)<<9)|((n.getMonth()+1)<<5)|n.getDate();let off=0,cs=0;
 for(const f of files){const nm=te.encode(f.name),crc=crc32(f.data),sz=f.data.length;
  const l=new DataView(new ArrayBuffer(30));l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x0800,true);l.setUint16(8,0,true);l.setUint16(10,dt,true);l.setUint16(12,dd,true);l.setUint32(14,crc,true);l.setUint32(18,sz,true);l.setUint32(22,sz,true);l.setUint16(26,nm.length,true);l.setUint16(28,0,true);
  const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,dt,true);c.setUint16(14,dd,true);c.setUint32(16,crc,true);c.setUint32(20,sz,true);c.setUint32(24,sz,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
  parts.push(l.buffer,nm,f.data);cen.push(c.buffer,nm);off+=30+nm.length+sz;cs+=46+nm.length}
 const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cen,e.buffer],{type:'application/zip'})}

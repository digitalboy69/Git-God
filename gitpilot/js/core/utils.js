/* Tiny helpers: DOM selector, HTML escape, time-ago, base64 encode/decode */
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ago=d=>{if(!d)return'—';const s=(Date.now()-new Date(d))/1e3;return s<3600?Math.max(1,s/60|0)+'m ago':s<86400?(s/3600|0)+'h ago':(s/86400|0)+'d ago'};
const dec=b=>new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g,'')),c=>c.charCodeAt(0)));
const enc=t=>{let b=new TextEncoder().encode(t),s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(s)};
const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode(...u.subarray(i,i+8192));return btoa(s)};

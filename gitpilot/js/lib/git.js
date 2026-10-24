/* Git helpers: repo path, safe hashing, full tree listing */
const rp=()=>'/repos/'+S.repo.full_name;
/* url-encode a branch name; read a queued file as bytes */
const R2=encodeURIComponent,bytes=async x=>x.file?new Uint8Array(await x.file.arrayBuffer()):new TextEncoder().encode(x.text);
async function bsha(u){if(!(window.crypto&&crypto.subtle))return null;const h=new TextEncoder().encode('blob '+u.length+'\0'),b=new Uint8Array(h.length+u.length);b.set(h);b.set(u,h.length);return[...new Uint8Array(await crypto.subtle.digest('SHA-1',b))].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function fullTree(api,sha){const t=await gh(`${api}/git/trees/${sha}?recursive=1`);if(!t.truncated)return t.tree;
 const out=[],rec=async(s,pre)=>{const n=await gh(`${api}/git/trees/${s}`);for(const e of n.tree){if(e.type=='tree')await rec(e.sha,pre+e.path+'/');else out.push({...e,path:pre+e.path})}};await rec(sha,'');return out}

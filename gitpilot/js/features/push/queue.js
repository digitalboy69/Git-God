/* Push queue: drag-and-drop files/folders, paste AI code, queue list */
let Q=[];const IGN=/(^|\/)(node_modules|\.git|\.DS_Store|__pycache__|dist|\.next)(\/|$)/;
async function walk(e,p=''){if(e.isFile)return new Promise(r=>e.file(f=>r([{path:p+f.name,file:f}]),()=>r([])));
 const rd=e.createReader(),all=[];for(;;){const b=await new Promise(r=>rd.readEntries(r,()=>r([])));if(!b.length)break;all.push(...b)}
 return(await Promise.all(all.map(c=>walk(c,p+e.name+'/')))).flat()}
async function drop(ev){ev.preventDefault();const it=[...ev.dataTransfer.items].map(i=>i.webkitGetAsEntry?.()).filter(Boolean);addQ((await Promise.all(it.map(e=>walk(e)))).flat())}
const pick=el=>{addQ([...el.files].map(f=>({path:f.webkitRelativePath||f.name,file:f})));el.value=''};
function addQ(a){const m=new Map(Q.map(x=>[x.path,x]));a.forEach(x=>{if(!IGN.test(x.path))m.set(x.path,x)});Q=[...m.values()];qr()}
const qsz=x=>x.file?x.file.size:x.text.length;
function qr(){const e=$('#ql');if(!e)return;e.innerHTML=Q.length?`<div class="dim">${Q.length} files · ${(Q.reduce((a,x)=>a+qsz(x),0)/1024).toFixed(1)} KB queued</div><div class="list" style="max-height:260px;overflow:auto">${Q.map((x,i)=>`<div class="item" style="cursor:default;padding:6px 12px"><div class="g">${esc(x.path)}</div><span class="dim">${(qsz(x)/1024).toFixed(1)} KB</span><button onclick="Q.splice(${i},1);qr()">✕</button></div>`).join('')}</div>`:'<div class="dim">Queue is empty</div>'}
function parsePaste(t){const re=/^(?:#{1,4}\s*|\/\/\s*|#\s*|<!--\s*|={2,}\s*|\*\*)?(?:file(?:name)?:\s*)?`?([\w@.\-\/]+\.\w+)`?(?:\s*(?:-->|={2,}|\*\*))?\s*$/i,out=[];let cur=null,buf=[];
 const fl=()=>{if(cur)out.push({path:cur,text:buf.join('\n').replace(/^\s*```[\w-]*\n/,'').replace(/\n```\s*$/,'').replace(/^\n+|\n+$/g,'')+'\n'})};
 for(const l of t.split('\n')){const m=l.match(re);if(m){fl();cur=m[1];buf=[]}else buf.push(l)}fl();return out}
const pasteMode=()=>form('Paste AI-generated code',[{l:'Put a line like  ### src/app.js  before each file’s code block',n:'t',t:'area'}],async v=>{const f=parsePaste(v.t);if(!f.length)throw Error('No file headers found. Use ### path/file.ext before each block.');addQ(f);toast(f.length+' files queued')},'Add to queue');

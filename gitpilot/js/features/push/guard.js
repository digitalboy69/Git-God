/* Safety Guard: on/off switch, safety check, secret detection, safe-choice popup */
/* ---------- Safety Guard for pushes ---------- */
const guardOn=()=>{try{return localStorage.getItem('gp.guard')!='0'}catch{return true}},setG=v=>{try{localStorage.setItem('gp.guard',v?'1':'0')}catch{}};
let lastPush=null;
const SECRET=/(^|\/)(\.env(\.[\w.-]+)?|[\w.-]*\.(pem|key|p12|pfx|keystore)|id_(rsa|dsa|ecdsa|ed25519)(\.pub)?|\.npmrc|\.pypirc|\.netrc|credentials(\.json)?|service-account[\w.-]*\.json)$/i,SAFEX=/\.(example|sample|template|pub)$/i;
const isSecret=p=>SECRET.test(p)&&!SAFEX.test(p);
const stamp=()=>new Date().toISOString().slice(0,16).replace(/[-:T]/g,'').replace(/^(\d{8})(\d{4})$/,'$1-$2');
function paintGuard(){const e=$('#gdc');if(!e)return;const on=guardOn();e.className='card guard '+(on?'on':'off');
 e.innerHTML=`<div class="gi">${on?'🛡️':'⚠️'}</div><div class="g"><b>Safety Guard</b> <span class="tag ${on?'ok':'warn'}">${on?'ON':'OFF'}</span><div class="dim">${on?'Before every push I compare your files with the repo, show what would be replaced, and offer safe choices (new branch, add-only, automatic backup). The last push can be undone.':'Guard is off: files go straight to the branch and files with the same name are replaced without asking.'}</div></div><label class="sw" title="Turn Safety Guard on or off"><input type="checkbox" ${on?'checked':''} onchange="toggleGuard(this)" aria-label="Safety Guard"><i></i></label>`}
function toggleGuard(el){if(el.checked){setG(1);paintGuard();toast('🛡 Safety Guard is ON');return}
 el.checked=true;confirmD('Turn <b>Safety Guard</b> off? Pushes will go straight to the branch and <b>files with the same name will be overwritten without asking</b>. (The last push can still be undone.)',async()=>{setG(0);paintGuard();toast('Safety Guard is OFF',1)})}
async function preflight(items,br){
 if(S.repo.archived)throw Error('This repository is archived (read-only). Unarchive it first.');
 if(S.repo.permissions&&S.repo.permissions.push===false)throw Error('Your token has no write access to this repository.');
 for(const x of items)if(!x.p||x.p.startsWith('/')||/(^|\/)\.\.?(\/|$)/.test(x.p)||/(^|\/)\.git(\/|$)/.test(x.p))throw Error('Unsafe file path blocked: '+x.p);
 let head=null,prot=false;const tree=new Map();
 try{head=(await gh(`${rp()}/git/ref/heads/${R2(br)}`)).object.sha}catch(e){if(!/Not found|Conflict|empty/i.test(e.message))throw e}
 if(head){const cm=await gh(`${rp()}/git/commits/${head}`);(await fullTree(rp(),cm.tree.sha)).forEach(e=>e.type=='blob'&&tree.set(e.path,e.sha));
  try{prot=!!(await gh(`${rp()}/branches/${R2(br)}`)).protected}catch{}}
 const nw=[],rep=[],same=[];
 for(const x of items){const old=tree.get(x.p);if(!old)nw.push(x);else{const s=await bsha(await bytes(x));(s&&s==old)?same.push(x):rep.push(x)}}
 return{head,exists:!!head,prot,nw,rep,same,isDef:br==S.repo.default_branch}}
function guardDialog(pf,br,sec){return new Promise(res=>{const d=$('#dlg'),rn=pf.rep.length,nn=pf.nw.length,sn='gitpilot/'+stamp();let done=false;
 const fin=v=>{if(done)return;done=true;d.close();res(v)},o=[];
 if(rn){o.push(['new','🌿 Push to a new safe branch','Recommended',`<b>${esc(br)}</b> is not touched at all. Your files go to a fresh branch that you can review on GitHub and merge later.`]);
  if(nn)o.push(['skip','➕ Add only the new files',`${nn} file${nn>1?'s':''}`,`Skips the ${rn} file${rn>1?'s that already exist':' that already exists'}, so nothing is overwritten on <b>${esc(br)}</b>.`]);
  o.push(['replace','♻️ Replace the changed files (with backup)','Careful',`A backup branch is created first so you can restore anytime. Then ${rn} file${rn>1?'s':''} on <b>${esc(br)}</b> will be replaced.`])}
 else{o.push(['direct','✅ Add the files to '+br,'Safe: nothing is overwritten','Only new files are added. No existing file is changed.']);o.push(['new','🌿 Use a new branch instead','',`Keeps <b>${esc(br)}</b> untouched until you merge.`])}
 d.innerHTML=`<h3>🛡️ Safety check</h3><p>Pushing <b>${pf.nw.length+rn+pf.same.length}</b> file${pf.nw.length+rn+pf.same.length>1?'s':''} to <b>${esc(br)}</b> in <b>${esc(S.repo.full_name)}</b>.</p>
 <div class="row" style="margin:8px 0"><span class="tag ok">✨ ${nn} new</span><span class="tag ${rn?'warn':''}">✏️ ${rn} would be replaced</span><span class="tag">＝ ${pf.same.length} identical (skipped)</span></div>
 ${(pf.isDef||pf.prot)?`<div class="card warn" style="padding:10px 14px;margin:8px 0">⚠ <b>${esc(br)}</b> is ${pf.isDef&&pf.prot?'the main and a protected':pf.prot?'a protected':'the main'} branch. Pushing straight to it changes what everyone sees.</div>`:''}
 ${rn?`<details style="margin:8px 0"><summary class="dim" style="cursor:pointer">Show the ${rn} file${rn>1?'s':''} that would be replaced</summary><pre style="max-height:150px">${pf.rep.slice(0,60).map(x=>esc(x.p)).join('\n')}${rn>60?'\n… and '+(rn-60)+' more':''}</pre></details>`:''}
 ${sec.length?`<div class="card warn" style="padding:10px 14px;margin:8px 0"><label style="display:flex;gap:10px;align-items:flex-start;margin:0;color:inherit"><input type="checkbox" id="gs" checked><span>🔑 <b>${sec.length} file${sec.length>1?'s look':' looks'} like secrets</b> (passwords, keys): ${esc(sec.slice(0,4).map(x=>x.p).join(', '))}${sec.length>4?'…':''}<br><span class="dim">Leave ticked to NOT upload ${sec.length>1?'them':'it'}. Leaked keys are a common mistake.</span></span></label></div>`:''}
 <label>Name for the safe branch (used if you pick a new branch)</label><input id="gn" value="${esc(sn)}" autocomplete="off">
 ${o.map(([k,t,tag,ds],i)=>`<button class="opt ${i==0?'rec':''}" data-k="${k}"><b>${t}</b> ${tag?`<span class="tag ${k=='replace'?'warn':'ok'}">${tag}</span>`:''}<div class="dim">${ds}</div></button>`).join('')}
 ${rn?`<label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="gu"> I understand “Replace” overwrites ${rn} existing file${rn>1?'s':''}</label>`:''}
 <div class="row" style="justify-content:flex-end;margin-bottom:0"><button id="gx">Cancel, change nothing</button></div>`;
 d.querySelector('#gx').onclick=()=>fin(null);
 d.querySelectorAll('.opt').forEach(b=>b.onclick=async()=>{const k=b.dataset.k,nm=d.querySelector('#gn').value.trim();
  if(k=='replace'&&!d.querySelector('#gu').checked)return toast('Tick “I understand” first, or pick a safer option',1);
  if(k=='new'){if(!/^[\w][\w\/.-]*$/.test(nm)||/\.\.|\.lock$|\/$|\/\//.test(nm))return toast('Branch name can use letters, numbers, - _ . /',1);
   try{await gh(`${rp()}/git/ref/heads/${R2(nm)}`);return toast('A branch named “'+nm+'” already exists. Pick another name.',1)}catch(e){if(!/Not found/i.test(e.message))return toast(e.message,1)}}
  fin({mode:k,branch:nm,skipSecrets:!!(d.querySelector('#gs')?.checked)})});
 d.addEventListener('close',()=>fin(null),{once:true});d.showModal()})}

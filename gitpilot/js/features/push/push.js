/* Push engine: one-commit push, new-branch/backup modes, undo */
async function doPush(){if(!Q.length)return toast('Nothing queued',1);const m=$('#pm').value||'Add files via GitPilot',br=$('#pb').value.trim()||S.branch,pre=$('#pp').value.trim().replace(/^\/|\/$/g,''),set=(n,t)=>{$('#pg').style.width=n+'%';$('#pt').textContent=t};
 if(window._pushing)return toast('A push is already running');window._pushing=true;
 try{let extra=0,items=Q.map(x=>({...x,p:(pre?pre+'/':'')+x.path})),base,mk=0,target=br,backup=null,guarded=guardOn();
  if(/\s|[~^:?*\[\\]|\.\.|\/$|^\/|\.lock$/.test(br))throw Error('Invalid branch name');
  if(guarded){set(4,'🛡 Safety check…');const pf=await preflight(items,br);
   if(pf.exists&&!pf.nw.length&&!pf.rep.length){set(0,'');toast('Nothing to push: every file is already identical in the repo ✅');return}
   const sec=items.filter(x=>isSecret(x.p)),need=pf.rep.length||sec.length||(pf.exists&&(pf.isDef||pf.prot));
   if(need){const ch=await guardDialog(pf,br,sec);if(!ch){set(0,'');toast('Push cancelled. Nothing was changed.');return}
    if(ch.skipSecrets)items=items.filter(x=>!isSecret(x.p));
    if(ch.mode=='skip')items=items.filter(x=>pf.nw.includes(x));
    if(ch.mode=='new'){target=ch.branch;base=pf.head;mk=1}
    if(ch.mode=='replace')backup='backup/'+br.replace(/\//g,'-')+'-'+stamp()}
   items=items.filter(x=>!pf.same.includes(x));
   if(!items.length){set(0,'');toast('Nothing left to push after the safety filters.');return}
   if(!mk&&pf.exists)base=pf.head}
  if(!base){try{base=(await gh(`${rp()}/git/ref/heads/${R2(target)}`)).object.sha}catch(e){
    if(target!=S.branch){base=(await gh(`${rp()}/git/ref/heads/${R2(S.branch)}`)).object.sha;mk=1}
    else{const f=items.shift();const r0=await gh(`${rp()}/contents/${f.p}`,{method:'PUT',body:{message:m,content:b64(await bytes(f)),branch:target}});base=(await gh(`${rp()}/git/ref/heads/${R2(target)}`)).object.sha;extra=1}}}
  if(backup){set(8,'Creating backup branch…');await gh(rp()+'/git/refs',{method:'POST',body:{ref:'refs/heads/'+backup,sha:base}})}
  const before=base,tree=[];let i=0,d=0,total=items.length;
  await Promise.all(Array.from({length:6},async()=>{while(i<items.length){const x=items[i++],r=await gh(rp()+'/git/blobs',{method:'POST',body:{content:b64(await bytes(x)),encoding:'base64'}});tree.push({path:x.p,mode:'100644',type:'blob',sha:r.sha});set(10+(++d/total)*80,`Uploading ${d}/${total}`)}}));
  let after=base;
  if(tree.length){set(92,'Building tree…');const bt=(await gh(`${rp()}/git/commits/${base}`)).tree.sha,t=await gh(rp()+'/git/trees',{method:'POST',body:{base_tree:bt,tree}});
   set(96,'Committing…');const c=await gh(rp()+'/git/commits',{method:'POST',body:{message:m,tree:t.sha,parents:[base]}});after=c.sha;
   if(mk)await gh(rp()+'/git/refs',{method:'POST',body:{ref:'refs/heads/'+target,sha:c.sha}});else await gh(`${rp()}/git/refs/heads/${R2(target)}`,{method:'PATCH',body:{sha:c.sha}})}
  const n=total+extra;
  lastPush=tree.length&&!extra?{repo:S.repo.full_name,branch:target,before:mk?null:before,after,created:!!mk,backup,def:S.repo.default_branch}:lastPush;
  set(100,'✅ Pushed '+n+' file'+(n>1?'s':'')+' to '+target);toast('Pushed '+n+' file'+(n>1?'s':'')+' to '+target+' in one commit'+(backup?' (backup: '+backup+')':''));Q=[];qr();showUndo()}
 catch(e){set(0,'');toast(e.message,1)}finally{window._pushing=false}}
function showUndo(){const e=$('#undo'),u=lastPush;if(!e)return;if(!u||u.repo!=S.repo.full_name){e.innerHTML='';return}
 e.innerHTML=`<div class="card" style="margin-top:12px"><b>Last push</b> → <code>${esc(u.branch)}</code> <span class="dim">${u.after.slice(0,7)}</span>${u.backup?`<div class="dim">🗄 Backup branch: <code>${esc(u.backup)}</code></div>`:''}<div class="row" style="margin-bottom:0">${u.created?`<a class="btn" target="_blank" rel="noopener" href="https://github.com/${u.repo}/compare/${encodeURIComponent(u.def)}...${u.branch.split('/').map(encodeURIComponent).join('/')}?expand=1">🔀 Open pull request on GitHub</a>`:''}<button class="dan" onclick="undoPush()">↩ Undo this push</button></div></div>`}
function undoPush(){const u=lastPush;if(!u)return;confirmD(u.created?`Undo: delete the branch <b>${esc(u.branch)}</b> that this push created? Your main branch is not affected.`:`Undo: move <b>${esc(u.branch)}</b> back to how it was before your push? The pushed files disappear from the branch (they stay in GitHub's history).`,async()=>{
 const rf='/repos/'+u.repo,cur=(await gh(`${rf}/git/ref/heads/${R2(u.branch)}`)).object.sha;
 if(cur!=u.after)throw Error('Someone pushed to this branch after you, so undo is not safe. Nothing was changed.');
 if(u.created)await gh(`${rf}/git/refs/heads/${R2(u.branch)}`,{method:'DELETE'});else await gh(`${rf}/git/refs/heads/${R2(u.branch)}`,{method:'PATCH',body:{sha:u.before,force:true}});
 lastPush=null;showUndo();toast('↩ Undone')})}

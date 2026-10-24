/* Automate page: run your own JavaScript against the GitHub API */
const EX={
'List repos by stars':"const r=await gp.gh('/user/repos?per_page=100');\nr.sort((a,b)=>b.stargazers_count-a.stargazers_count).forEach(x=>gp.log(x.stargazers_count+'★',x.full_name));",
'Structure of current repo':"const r=gp.repo||prompt('owner/repo');\nconst d=(await gp.gh('/repos/'+r)).default_branch;\ngp.log(await gp.tree(r,d));",
'Create + push files (1 commit)':"const r=gp.repo;if(!r)throw Error('Open a repo first');\nconst d=(await gp.gh('/repos/'+r)).default_branch;\nawait gp.commit(r,d,[{path:'notes/hello.txt',text:'Hello'},{path:'docs/a.md',text:'# A'}],'Add files via script');\ngp.log('Committed');",
'Close issues idle 90+ days':"const r=gp.repo;if(!r)throw Error('Open a repo first');\nconst i=(await gp.gh('/repos/'+r+'/issues?state=open&per_page=100')).filter(x=>!x.pull_request&&Date.now()-new Date(x.updated_at)>90*864e5);\ngp.log(i.length+' stale issues');\nif(i.length&&await gp.confirm('Close '+i.length+' issues?'))for(const x of i){await gp.gh(x.url,{method:'PATCH',body:{state:'closed'}});gp.log('closed #'+x.number)}"};
let stopF=false;
function auto(){cache.sc??='// Runs in your browser with your token. Use the gp object (see reference below).\nconst r=await gp.gh(\'/user/repos?per_page=100\');\ngp.log(r.length+\' repos\');';
 main(`<h2>⚡ Automate</h2><div class="card warn">Scripts run with your token's full access. Only run code you wrote or trust.</div><div class="row"><select id="ex" onchange="if(EX[this.value]){$('#sc').value=cache.sc=EX[this.value]}"><option value="">Examples…</option>${Object.keys(EX).map(k=>`<option>${k}</option>`).join('')}</select><label class="btn">Open .js<input type="file" accept=".js,.txt" hidden onchange="this.files[0].text().then(t=>$('#sc').value=cache.sc=t)"></label><button onclick="showTx('#lg2',$('#sc').value,'script.js')">Save .js</button></div>
 <textarea id="sc" spellcheck="false" oninput="cache.sc=this.value" onkeydown="if(event.ctrlKey&&event.key=='Enter')runS()">${esc(cache.sc)}</textarea>
 <div class="row"><button class="pri" onclick="runS()">▶ Run</button><button onclick="stopF=true">■ Stop</button><button onclick="$('#lg').textContent=''">Clear log</button><span class="dim">Ctrl+Enter runs · top-level await works${S.repo?' · current repo: '+esc(S.repo.full_name):''}</span></div>
 <div id="lg2"></div><pre id="lg" style="min-height:120px"></pre>
 <div class="card dim"><b>gp API</b> — <code>gp.gh(path,{method,body})</code> GitHub REST call · <code>gp.user</code> · <code>gp.repo</code> current repo · <code>gp.read(repo,path,branch?)</code> · <code>gp.write(repo,path,text,msg,branch?)</code> · <code>gp.commit(repo,branch,[{path,text}],msg)</code> multi-file single commit · <code>gp.tree(repo,branch)</code> structure text · <code>gp.log(...)</code> · <code>gp.sleep(ms)</code> · <code>gp.confirm(msg)</code></div>`)}
async function runS(){stopF=false;const L=$('#lg');L.textContent='';
 const log=(...a)=>{L.textContent+=a.map(x=>typeof x=='string'?x:JSON.stringify(x,null,1)).join(' ')+'\n';L.scrollTop=1e9},call=(p,o)=>{if(stopF)throw Error('Stopped');return gh(p,o)};
 const gp={gh:call,user:S.user,repo:S.repo?.full_name||null,log,sleep:ms=>new Promise(r=>setTimeout(r,ms)),confirm:async m=>confirm(m),
  read:async(r,p,b)=>dec((await call(`/repos/${r}/contents/${p}${b?'?ref='+b:''}`)).content),
  write:async(r,p,t,m,b)=>{let sha;try{sha=(await call(`/repos/${r}/contents/${p}${b?'?ref='+b:''}`)).sha}catch{}return call(`/repos/${r}/contents/${p}`,{method:'PUT',body:{message:m||'Update '+p,content:enc(t),sha,branch:b}})},
  commit:async(r,br,files,msg)=>{const rf='/repos/'+r,base=(await call(`${rf}/git/ref/heads/${br}`)).object.sha,bt=(await call(`${rf}/git/commits/${base}`)).tree.sha,tree=[];
   for(const f of files){const b=await call(rf+'/git/blobs',{method:'POST',body:{content:enc(f.text),encoding:'base64'}});tree.push({path:f.path,mode:'100644',type:'blob',sha:b.sha})}
   const t=await call(rf+'/git/trees',{method:'POST',body:{base_tree:bt,tree}}),c=await call(rf+'/git/commits',{method:'POST',body:{message:msg,tree:t.sha,parents:[base]}});await call(`${rf}/git/refs/heads/${br}`,{method:'PATCH',body:{sha:c.sha}});return c.sha},
  tree:async(r,br)=>asc((await call(`/repos/${r}/git/trees/${br}?recursive=1`)).tree.filter(x=>x.type=='blob').map(x=>x.path))};
 try{await new(Object.getPrototypeOf(async function(){}).constructor)('gp',$('#sc').value)(gp);log('✔ finished')}catch(e){log('✖ '+e.message)}}

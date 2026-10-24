/* Profiles: multiple saved GitHub tokens, login screen, switching, storage */
/* ---------- Profiles (saved in localStorage) ---------- */
const LS='gitpilot.profiles.v1';let P={list:[],active:null};
function pload(){try{const j=JSON.parse(localStorage.getItem(LS)||'null');if(j&&Array.isArray(j.list))P={list:j.list.filter(x=>x&&x.id&&x.token),active:j.active||null}}catch{}}
function psave(){try{localStorage.setItem(LS,JSON.stringify(P))}catch(e){toast('Could not save to browser storage: '+e.message,1)}}
const pid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const mask=t=>t.length>10?t.slice(0,4)+'••••'+t.slice(-4):'••••';
async function whoami(t){const o=S.token;S.token=t;try{return await gh('/user')}finally{S.token=o}}
const blank=()=>({token:null,user:null,repo:null,branch:null,tab:'files',path:'',view:'dash'});
async function login(p){const u=await whoami(p.token);
  S={...blank(),token:p.token,user:u};R=[];cache={};Q=[];
  p.login=u.login;p.avatar=u.avatar_url;if(!P.list.includes(p))P.list.push(p);P.active=p.id;psave();shell();go('dash')}
async function useProfile(id){const p=P.list.find(x=>x.id==id);if(!p)return;try{await login(p)}catch(e){toast(p.name+': '+e.message,1);if(!S.token)connect()}}
function switchP(v){if(v=='__m'){const s=$('#psw');if(s)s.value=P.active;return manageP()}if(v!=P.active)useProfile(v).then(()=>{const s=$('#psw');if(s)s.value=P.active})}
function connect(){$('#app').innerHTML=`<div id="conn"><h1><span class="lg">🧭</span><span class="gt">GitPilot</span></h1><p class="dim">Your entire GitHub universe. One command center.</p>
${P.list.length?`<div class="card" style="margin-bottom:16px"><b>Saved profiles</b><div class="list" style="margin-top:8px">${P.list.map(p=>`<div class="item" onclick="useProfile('${p.id}')"><div class="g"><b>${esc(p.name)}</b><div class="dim">${esc(p.login?'@'+p.login:'not verified yet')} · ${esc(mask(p.token))}</div></div><button class="pri">Connect</button></div>`).join('')}</div><div class="row"><button onclick="manageP()">⚙ Manage profiles</button></div></div>`:''}
<div class="card"><b>${P.list.length?'Add another profile':'Add a profile'}</b><label>Profile name</label><input id="pn" placeholder="e.g. Personal, Work" autocomplete="off"><label>Personal Access Token</label><div class="row"><input id="tk" type="password" placeholder="github_pat_… or ghp_…" autocomplete="off"><button onclick="const t=$('#tk');t.type=t.type=='password'?'text':'password'">👁</button></div><button class="pri" style="width:100%" onclick="addProfile()">Save &amp; connect</button><p class="dim">Profiles (name + token) are saved in this browser's localStorage so you stay connected next time. The token is sent only to api.github.com. Anyone with access to this browser profile can read it, so use minimal-scope tokens and don't use this on shared computers. For production, use a backend session or OAuth/GitHub App flow.</p><p class="dim">Create one at <a target="_blank" rel="noopener" href="https://github.com/settings/personal-access-tokens/new">GitHub settings</a>. Read-only views need read scopes; editing needs Contents/Issues/Pull requests/Actions write. Classic tokens: <code>repo</code>, <code>workflow</code>, <code>notifications</code>.</p></div></div>`}
async function addProfile(){const t=$('#tk').value.trim(),n=$('#pn').value.trim();if(!t)return toast('Enter a token',1);
  let p=P.list.find(x=>x.token==t);if(!p)p={id:pid(),name:n,token:t};else if(n)p.name=n;
  try{const u=await whoami(t);if(!p.name)p.name=u.login;await login(p)}catch(e){toast(e.message,1)}}
function after(){if(!S.user)return connect();const s=$('#psw');if(s)s.innerHTML=P.list.map(p=>`<option value="${p.id}" ${p.id==P.active?'selected':''}>${esc(p.name)}</option>`).join('')+'<option value="__m">⚙ Manage profiles…</option>'}
function manageP(){const d=$('#dlg');d.innerHTML=`<h3 style="margin-top:0">Profiles</h3><div class="list">${P.list.map(p=>`<div class="item" style="cursor:default"><div class="g"><b>${esc(p.name)}</b> ${p.id==P.active?'<span class="tag ok">active</span>':''}<div class="dim">${esc(p.login?'@'+p.login:'')} · ${esc(mask(p.token))}</div></div><button onclick="editP('${p.id}')">Edit</button><button class="dan" onclick="delP('${p.id}')">Delete</button></div>`).join('')||'<div class="item dim">No profiles saved</div>'}</div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="pri" onclick="addPD()">＋ Add profile</button><button onclick="$('#dlg').close()">Close</button></div>`;if(!d.open)d.showModal()}
function addPD(){$('#dlg').close();form('Add profile',[{l:'Profile name',n:'n',p:'e.g. Work'},{l:'Personal Access Token',n:'t',t:'pw',p:'github_pat_… or ghp_…'}],async v=>{
  if(!v.t)throw Error('Token required');if(P.list.some(x=>x.token==v.t))throw Error('This token is already saved');
  const u=await whoami(v.t);P.list.push({id:pid(),name:v.n||u.login,token:v.t,login:u.login,avatar:u.avatar_url});psave();toast('Saved '+(v.n||u.login));setTimeout(()=>{after();manageP()},0)},'Verify & save')}
function editP(id){const p=P.list.find(x=>x.id==id);if(!p)return;$('#dlg').close();form('Edit profile',[{l:'Profile name',n:'n',v:p.name},{l:'New token (leave blank to keep current)',n:'t',t:'pw'}],async v=>{
  let u=null;if(v.t&&v.t!=p.token){if(P.list.some(x=>x.token==v.t&&x!=p))throw Error('This token is already saved');u=await whoami(v.t)}
  p.name=v.n||p.name;if(u){p.token=v.t;p.login=u.login;p.avatar=u.avatar_url;if(p.id==P.active)S.token=v.t}
  psave();toast('Profile updated');setTimeout(()=>{after();manageP()},0)},'Save')}
function delP(id){const p=P.list.find(x=>x.id==id);if(!p)return;$('#dlg').close();confirmD(`Delete profile <b>${esc(p.name)}</b>? Its token is removed from this browser.`,async()=>{
  P.list=P.list.filter(x=>x.id!=id);const was=P.active==id;if(was)P.active=null;psave();toast('Profile deleted');
  if(was)disc();else setTimeout(()=>{after();manageP()},0)})}
function disc(){P.active=null;psave();S=blank();R=[];cache={};Q=[];connect()}

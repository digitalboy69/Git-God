/* Dashboard page */
async function load(){if(!R.length)R=await gh('/user/repos?per_page=100&sort=pushed&affiliation=owner,collaborator,organization_member');return R}
async function dash(){try{const r=await load(),own=r.filter(x=>x.owner.login==S.user.login),L={};r.forEach(x=>x.language&&(L[x.language]=(L[x.language]||0)+1));
  const tot=Object.values(L).reduce((a,b)=>a+b,0),cols=['#7C5CFC','#4F8CFF','#32D583','#F5B942','#F97066','#9BA7BA'];
  main(`<h2>Welcome, ${esc(S.user.name||S.user.login)} 👋</h2><div class="dim">Connected as ${esc(S.user.login)} · synced ${new Date().toLocaleTimeString()}</div>
  <div class="row"><button class="pri" onclick="newRepo()">＋ New repository</button><button onclick="go('repos')">Browse repositories</button></div>
  <div class="grid" style="margin:12px 0">${[['Accessible repos',r.length],['Owned',own.length],['Stars (loaded repos)',r.reduce((a,x)=>a+x.stargazers_count,0)],['Open issues + PRs',r.reduce((a,x)=>a+x.open_issues_count,0)]].map(([a,b])=>`<div class="card"><div class="dim">${a}</div><div class="m">${b}</div></div>`).join('')}</div>
  <div class="dim">Metrics cover the first 100 repos GitHub returned. GitHub counts PRs inside "open issues".</div>
  <h3>Languages</h3><div class="card"><div class="bar">${Object.entries(L).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v],i)=>`<div title="${k}" style="width:${v/tot*100}%;background:${cols[i]}"></div>`).join('')}</div><div class="dim" style="margin-top:6px">${Object.entries(L).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>k+' '+v).join(' · ')||'No language data'}</div></div>
  <h3>Recently pushed</h3><div class="list">${r.slice(0,8).map(x=>repoRow(x)).join('')}</div>`)}catch(e){err(e)}}
const repoRow=x=>`<div class="item" onclick="openRepo('${x.full_name}')"><div class="g"><b>${esc(x.full_name)}</b> <span class="tag">${x.private?'private':'public'}</span> ${x.archived?'<span class="tag warn">archived</span>':''}<div class="dim">${esc(x.description||'')}</div></div><div class="dim">${x.language||''} ★${x.stargazers_count} · ${ago(x.pushed_at)}</div></div>`;

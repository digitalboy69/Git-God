/* GitHub REST client with friendly error messages */
async function gh(p,o={}){
  const r=await fetch(p.startsWith('http')?p:'https://api.github.com'+p,{...o,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+S.token,...(o.body?{'Content-Type':'application/json'}:{})},body:o.body?JSON.stringify(o.body):undefined});
  if(r.status==204)return null;
  const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=t}
  if(!r.ok){const m=j?.message||r.statusText;
    throw new Error(r.status==401?'Token invalid, expired or revoked.':r.status==403?(r.headers.get('x-ratelimit-remaining')=='0'?'Rate limit hit — resets '+new Date(r.headers.get('x-ratelimit-reset')*1e3).toLocaleTimeString():'Forbidden: token lacks permission. '+m):r.status==404?'Not found, or your token cannot see it. '+m:r.status==409?'Conflict — the file/branch changed on GitHub. Reload and retry. '+m:r.status==422?'Rejected by GitHub: '+m+(j.errors?' '+JSON.stringify(j.errors):''):m)}
  return j}

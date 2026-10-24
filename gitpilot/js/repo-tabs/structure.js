/* Structure tab: export the repo folder tree as text */
T.tree=async()=>{const t=await gh(`${rp()}/git/trees/${encodeURIComponent(S.branch)}?recursive=1`);cache.tr=t.tree.filter(x=>x.type=='blob');
 $('#tb').innerHTML=`<div class="row"><span class="dim">${cache.tr.length} files on <b>${esc(S.branch)}</b>${t.truncated?' · <span class="warn">GitHub truncated this tree</span>':''}</span><label class="btn"><input type="checkbox" id="ig" checked onchange="mkTree()" style="width:auto"> hide node_modules/.git/dist</label></div><div id="to"></div>`;mkTree()};
function mkTree(){const ps=cache.tr.map(x=>x.path).filter(p=>!$('#ig').checked||!IGN.test(p));showTx('#to',`${S.repo.name}/  (${S.branch}, ${ps.length} files)\n`+asc(ps),S.repo.name+'-structure.txt')}

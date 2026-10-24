/* Download a repository as .zip (built in the browser, no redirect needed) */
/* ---------- ZIP download: built in the browser (the zipball endpoint redirects to codeload.github.com, which blocks CORS fetches) ---------- */
let zipBusy=false;
async function zipRepo(){if(zipBusy)return toast('A download is already running');zipBusy=true;
 const rn=S.repo.name,br=S.branch,api='/repos/'+S.repo.full_name,pt=document.createElement('div');pt.textContent='Preparing '+rn+'.zip…';$('#toast').append(pt);
 try{const ref=await gh(`${api}/git/ref/heads/${br.split('/').map(encodeURIComponent).join('/')}`),cm=await gh(`${api}/git/commits/${ref.object.sha}`),all=await fullTree(api,cm.tree.sha),
   blobs=all.filter(x=>x.type=='blob'),skipped=all.filter(x=>x.type=='commit').length;
  if(!blobs.length)throw Error('This branch has no files to download');
  if(blobs.length>60000)throw Error('Too many files ('+blobs.length+') to zip in the browser. Use git clone instead.');
  const total=blobs.reduce((a,x)=>a+(x.size||0),0);
  if(total>700*1048576)throw Error('Repository is about '+Math.round(total/1048576)+' MB — too large to zip in the browser. Use git clone or Code → Download ZIP on GitHub.');
  const root=`${rn}-${br.replace(/[\/\\]/g,'-')}/`,files=[];let i=0,d=0,fail=false;
  await Promise.all(Array.from({length:6},async()=>{while(i<blobs.length&&!fail){const x=blobs[i++];try{const b=await gh(`${api}/git/blobs/${x.sha}`);
    files.push({name:root+x.path,data:b.encoding=='base64'?ub(b.content):new TextEncoder().encode(b.content)});pt.textContent=`Fetching files ${++d}/${blobs.length}…`}catch(e){fail=true;throw e}}}));
  pt.textContent='Compressing…';files.sort((a,b)=>a.name<b.name?-1:1);
  const blob=makeZip(files),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${rn}-${br.replace(/[\/\\]/g,'-')}.zip`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),60000);
  toast('Downloaded '+a.download+' ('+(blob.size/1048576).toFixed(1)+' MB, '+files.length+' files'+(skipped?', '+skipped+' submodule(s) skipped':'')+')')}
 catch(e){toast('Zip failed: '+e.message,1)}finally{pt.remove();zipBusy=false}}

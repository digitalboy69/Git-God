/* UI primitives: toast notifications, form dialog, confirm dialog */
function toast(m,e){const d=document.createElement('div');d.textContent=m;if(e)d.style.borderLeftColor='var(--bad)';$('#toast').append(d);if($('#dlg').open){const t=$('#toast');try{t.hidePopover()}catch{}try{t.showPopover()}catch{}}setTimeout(()=>d.remove(),5000)}
function form(title,fields,cb,ok='Submit'){
  const d=$('#dlg');d.innerHTML=`<form method="dialog"><h3 style="margin-top:0">${title}</h3>${fields.map(f=>`<label>${f.l}</label>`+(f.t=='select'?`<select name="${f.n}">${f.o.map(o=>`<option ${o==f.v?'selected':''}>${esc(o)}</option>`).join('')}</select>`:f.t=='area'?`<textarea name="${f.n}" style="min-height:120px">${esc(f.v||'')}</textarea>`:f.t=='check'?`<input type="checkbox" name="${f.n}" style="width:auto" ${f.v?'checked':''}>`:`<input name="${f.n}" type="${f.t=='pw'?'password':'text'}" autocomplete="off" value="${esc(f.v||'')}" placeholder="${esc(f.p||'')}">`)).join('')}<div class="row" style="justify-content:flex-end;margin-top:16px"><button value="x">Cancel</button><button class="pri" id="ok">${ok}</button></div></form>`;
  d.showModal();
  d.querySelector('#ok').onclick=async e=>{e.preventDefault();const v={};d.querySelectorAll('[name]').forEach(i=>v[i.name]=i.type=='checkbox'?i.checked:i.value.trim());
    try{await cb(v);d.close()}catch(x){toast(x.message,1)}}}
const confirmD=(msg,fn)=>form('Confirm',[{l:msg,t:'x',n:'_',v:''}].slice(0,0),fn,'Confirm')||($('#dlg form').insertAdjacentHTML('afterbegin','')||$('#dlg h3').insertAdjacentHTML('afterend',`<p>${msg}</p>`));

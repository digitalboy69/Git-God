/* Boot: restore saved profiles and auto-connect to the last used one */
/* ---------- Boot: restore saved profiles, auto-connect to the last active one ---------- */
pload();
(async()=>{const p=P.list.find(x=>x.id==P.active);if(!p)return connect();try{await login(p)}catch(e){toast(p.name+': '+e.message,1);connect()}})();

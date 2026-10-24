/* Light/dark theme switching (remembered in localStorage) */
const setTheme=t=>{document.documentElement.dataset.t=t;try{localStorage.setItem('gp.theme',t)}catch{}const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t=='light'?'#F3F5FB':'#06080E'};
const toggleTheme=()=>setTheme(document.documentElement.dataset.t=='light'?'dark':'light');

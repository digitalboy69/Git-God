/* Runs first: sets light/dark before the page paints */
(function(){var t;try{t=localStorage.getItem('gp.theme')}catch(e){}if(t!='light'&&t!='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.t=t})()

(() => {
 const header=document.querySelector('.top');
 if(header&&'ResizeObserver'in window)new ResizeObserver(()=>document.documentElement.style.setProperty('--sticky-header-height',header.offsetHeight+'px')).observe(header);
 const toggle=document.querySelector('.mobile-menu-toggle'),nav=document.getElementById('site-navigation');
 function menu(open){toggle.setAttribute('aria-expanded',String(open));document.querySelectorAll('main,.site-footer,.back-to-top,.skip').forEach(e=>e.inert=open)}
 toggle.addEventListener('click',()=>menu(toggle.getAttribute('aria-expanded')!=='true'));
 nav.addEventListener('click',e=>{if(e.target.closest('a'))menu(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){menu(false);toggle.focus()}});
 matchMedia('(max-width:750px)').addEventListener('change',()=>menu(false));
 const back=document.querySelector('.back-to-top');function update(){back.hidden=scrollY<innerHeight}window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
})();

(() => {
 const english = document.documentElement.lang === 'en';
 try { localStorage.setItem('site-language', english ? 'en' : 'ru'); } catch {}
 const watched = new WeakSet();
 function watch(image) {
  if (!(image instanceof HTMLImageElement) || !image.getAttribute('src')) return;
  const settle = () => { image.classList.remove('image-loading'); image.removeAttribute('aria-busy'); if (image.naturalWidth) image.classList.remove('image-unavailable'); else image.classList.add('image-unavailable'); };
  if (!watched.has(image)) { watched.add(image); image.addEventListener('load', settle); image.addEventListener('error', settle); }
  image.classList.remove('image-unavailable');
  if (image.complete) { settle(); return; }
  image.setAttribute('aria-busy','true');
  setTimeout(() => { if (!image.complete) image.classList.add('image-loading'); },350);
 }
 document.querySelectorAll('img').forEach(watch);
 new MutationObserver(records => {
  for (const record of records) {
   if (record.type === 'attributes') watch(record.target);
   else record.addedNodes.forEach(node => { if (node.nodeType === 1) { if (node.tagName === 'IMG') watch(node); node.querySelectorAll('img').forEach(watch); } });
  }
 }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
 const notice = document.createElement('div'); notice.className='connection-notice'; notice.hidden=true; notice.setAttribute('role','status'); notice.setAttribute('aria-live','polite');
 const text=document.createElement('span'); const retry=document.createElement('button');retry.type='button';retry.textContent=english?'Try again':'Попробовать снова';retry.addEventListener('click',()=>location.reload());notice.append(text,retry);document.body.append(notice);
 let timer;
 function connection() {
  clearTimeout(timer);
  if (!navigator.onLine) {text.textContent=english?'You’re offline. You can keep reading this page.':'Соединение потеряно. Уже открытая страница остаётся доступной.';retry.hidden=false;notice.hidden=false;}
  else if(!notice.hidden) {text.textContent=english?'You’re back online.':'Соединение восстановлено.';retry.hidden=true;timer=setTimeout(()=>notice.hidden=true,3500);}
 }
 window.addEventListener('offline',connection);window.addEventListener('online',connection);connection();
 if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const register=()=>navigator.serviceWorker.register(new URL('service-worker.js',document.baseURI),{scope:new URL('./',document.baseURI).pathname}).catch(()=>{});
  if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
 }
})();

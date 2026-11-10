/* Finance Master PWA service worker. Do not cache finance records or HTML. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('push', event => {
 let payload={}; try{payload=event.data?event.data.json():{};}catch(_){payload={body:event.data?event.data.text():''};}
 const data=payload.data||payload; const title=data.title||payload.notification?.title||'Finance Master';
 event.waitUntil(self.registration.showNotification(title,{body:data.body||payload.notification?.body||'A borrower opened their private account link.',icon:'/icon-192.svg',badge:'/icon-192.svg',tag:data.tag||'finance-master-borrower-open',renotify:false,data:{url:data.url||'/'}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();const target=new URL(event.notification.data?.url||'/',self.location.origin).href;event.waitUntil((async()=>{const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of list){if(c.url.startsWith(self.location.origin)&&'focus'in c){await c.focus();if('navigate'in c)await c.navigate(target);return;}}if(self.clients.openWindow)await self.clients.openWindow(target);})());});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req));
});

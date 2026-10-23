const CACHE_NAME='finance-master-borrower-shell-v2-location-removed';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{await self.clients.claim();const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));})());});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 // Keep borrower data and tokenized URLs network-only; do not cache private account information.
 event.respondWith(fetch(req).catch(()=>new Response('အင်တာနက်ချိတ်ဆက်မှု မရှိပါ။ Finance Master ကို အသုံးပြုရန် အင်တာနက်ပြန်ချိတ်ပြီး ထပ်ဖွင့်ပါ။',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
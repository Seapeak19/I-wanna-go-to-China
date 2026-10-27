(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravelQuality=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const TTL={ticket:90,opening:30,restaurant:90,rates:7};
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 function age(date,now=today()){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;const n=Math.floor((Date.parse(now+'T00:00:00Z')-Date.parse(date+'T00:00:00Z'))/86400000);return Number.isFinite(n)&&n>=0?n:null;}
 function dated(verified,checked,ttl,now){if(!verified)return'pending';const n=age(checked,now);return n===null?'pending':n>ttl?'stale':'checked';}
 function openLicensed(image){return !!image&&(image.rightsStatus==='open-license'||/^(CC(?:0| BY)|Public domain)/i.test(image.license||''));}
 function attraction(d,now=today()){return{ticket:d.ticket?.validUntil&&d.ticket.validUntil<now?'expired':dated(d.ticket?.status==='verified',d.ticket?.checked,TTL.ticket,now),opening:dated(!!d.visitPolicy?.sourceUrl,d.visitPolicy?.checked,TTL.opening,now),photo:!d.image?'missing':openLicensed(d.image)?'open':'permission-pending',ticketChecked:d.ticket?.checked||null,openingChecked:d.visitPolicy?.checked||null};}
 function restaurant(f,now=today()){return{information:dated(!!f.url,f.checked,TTL.restaurant,now),opening:dated(!!f.hours?.verified,f.hours?.checked,TTL.opening,now),sampleDate:f.reviewSample?.date||null,checked:f.checked||null};}
 function health(code,challenge=false){return challenge||[401,403,429].includes(code)?'restricted':code>=200&&code<400?'reachable':'unavailable';}
 return Object.freeze({TTL,today,age,dated,openLicensed,attraction,restaurant,health});
});

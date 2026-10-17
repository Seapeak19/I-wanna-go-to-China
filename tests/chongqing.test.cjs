const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data=require('../data.json'),C=require('../city-core.js'),T=require('../ticket-core.js'),B=require('../budget-core.js');
const sights=data.destinations.filter(d=>d.region==='重庆'&&d.entryType==='attraction'),foods=data.foods.filter(f=>f.region==='重庆'),routes=data.foodGuides.filter(g=>g.region==='重庆'),get=id=>sights.find(d=>d.id===id);
test('Chongqing municipality preserves old identifiers and distinguishes districts without counting a county as an attraction',()=>{
 assert.equal(C.options(data,'重庆').length,1);assert.equal(C.options(data,'重庆')[0].name,'重庆');assert.equal(C.stats(data,'重庆','重庆').count,23);assert.equal(new Set(sights.map(d=>d.canonicalPlaceId)).size,23);
 assert(new Set(sights.map(d=>d.district)).size>=10);assert.equal(get('d210').name,'大足石刻');assert.equal(get('d211').name,'酉阳龚滩古镇');assert.equal(data.destinations.find(d=>d.id==='d212').entryType,'area');assert(!sights.some(d=>d.name==='丰都县'));
 assert.equal(data.latestRegion,'重庆');assert.equal(data.provinceUpdates['重庆'].count,sights.length);assert.equal(data.provinceUpdates['重庆'].added,21);assert.equal(data.provinceUpdates['重庆'].upgraded,2);
});
test('all Chongqing attraction photos are local real source images and bilingual guides retain limitations',()=>{
 for(const d of sights){assert(d.sources.length&&d.en.description&&d.guide.en.route&&d.guide.en.reservation);assert.equal(d.guide.complete,false);assert(fs.statSync(path.join(__dirname,'..',d.image.path)).size>2000);assert.equal(fs.readFileSync(path.join(__dirname,'..',d.image.path)).subarray(0,2).toString('hex'),'ffd8');if(d.id==='d210')assert.equal(d.image.license,'CC BY-SA 4.0');else{assert.equal(d.image.rightsStatus,'source-copyright');assert(d.sources.some(s=>s.url===d.image.url));assert(d.image.originalUrl.startsWith('https:'));}}
});
test('official scope, ended discounts, government ceilings and seasonal choices stay distinct in itinerary pricing',()=>{
 assert.equal(sights.filter(d=>d.ticket.status==='verified').length,9);
 assert.equal(T.planTicket(get('cq-sight-50223'),{}).ticketPrice,0);assert.equal(T.planTicket(get('cq-sight-45804'),{}).ticketPrice,0);assert.equal(T.planTicket(get('cq-sight-43819'),{}).ticketPrice,25);
 assert.equal(T.planTicket(get('cq-sight-10354'),{},'2026-10-17').ticketPrice,60);assert.equal(T.planTicket(get('cq-sight-10354'),{},'2026-09-24').ticketPrice,null);assert.match(get('cq-sight-10354').ticket.note,/30元限期优惠结束/);
 assert.equal(T.planTicket(get('cq-sight-109940'),{}).ticketPrice,null);assert.match(get('cq-sight-109940').ticket.note,/最高限价/);assert.equal(T.planTicket(get('cq-sight-76543'),{}).ticketPrice,null);
 const zoo=get('cq-sight-10377');assert.equal(T.planTicket(zoo,{}).ticketPrice,null);assert.equal(T.planTicket(zoo,{ticketOption:0,ticketOrigin:'auto'}).ticketPrice,25);assert.equal(T.planTicket(zoo,{ticketOption:1,ticketOrigin:'auto'}).ticketPrice,20);
 assert.match(get('cq-sight-45804').guide.reservation,/免预约/);assert.match(get('cq-sight-76543').ticket.note,/免预约不等于免票/);
});
test('local food references retain branch addresses, honest historical samples and editable non-menu averages',()=>{
 assert.equal(foods.length,15);assert.equal(new Set(foods.map(f=>f.url)).size,15);
 for(const f of foods){assert(f.district&&f.address&&f.en.name&&f.en.localSpecialty&&f.en.basis);assert.equal(f.reviewEvidence.independentVerified,false);assert(f.reviewEvidence.score>=4.3&&f.reviewEvidence.count>=6);assert.match(f.basis,/非现行菜单/);if(f.reviewEvidence.count<20)assert.match(f.caution,/小样本/);assert.equal(B.addFood([],f)[0].priceCNY,f.priceCNY.low);if(f.reviewSample){assert.match(f.reviewSample.date,/^\d{4}-\d{2}-\d{2}$/);assert(f.reviewSample.author&&f.reviewSample.summaryEn);assert(f.sources.some(s=>s.url===f.reviewSample.url));}}
 assert.match(foods.find(f=>f.id==='food-cq-15318356').caution,/地址存在差异/);assert(foods.some(f=>f.district==='武隆区'&&f.dishes.includes('碗碗羊肉')));
});
test('new Chongqing meal outlines import unchecked and preserve existing branch choices',()=>{
 assert.equal(routes.length,9);for(const r of routes){assert(r.editorial&&r.en.route&&r.en.note);let entries=[];for(const id of r.foodIds){const f=foods.find(f=>f.id===id);assert(f,r.id);entries=B.addFood(entries,f,false);}assert(entries.every(e=>!e.enabled));const existing={...entries[0],enabled:true,priceCNY:35};assert.deepEqual(B.addFood([existing],foods.find(f=>f.id===existing.id),false),[existing]);}
});

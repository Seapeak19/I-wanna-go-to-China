const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data=require('../data.json'),B=require('../budget-core.js'),T=require('../ticket-core.js');
const sights=data.destinations.filter(d=>d.id.startsWith('gx3-sight-')),foods=data.foods.filter(f=>f.id.startsWith('food-gx3-')),routes=data.foodGuides.filter(g=>g.region==='广西'&&g.researchBatch===3);
test('third Guangxi batch adds eleven photographed independent destinations with honest admission status',()=>{
 assert.equal(sights.length,11);assert.equal(data.provinceUpdates['广西'].count,156);assert.equal(data.provinceUpdates['广西'].batch,3);
 for(const d of sights){assert(d.en.name&&d.en.description&&d.guide.en.reservation);assert.equal(d.ticket.status,'unverified');assert.equal(T.planTicket(d,{}).ticketPrice,null);assert.equal(d.image.rightsStatus,'source-copyright');assert(d.sources.some(s=>s.url===d.image.url));assert(fs.statSync(path.join(__dirname,'..',d.image.path)).size>2000);}
 assert(!sights.some(d=>/平天山|高德古镇/.test(d.name)));
});
test('promotions and map indices never become visitor ratings or automatic spending amounts',()=>{
 assert.equal(foods.length,8);const leads=foods.filter(f=>f.evidenceLabel);assert.equal(leads.length,3);
 for(const f of leads){assert(!f.reviewEvidence);assert(!f.priceCNY);assert(f.en.evidenceLabel);assert.equal(B.addFood([],f)[0].priceCNY,null);assert.match(f.price,/待核实/);}
 for(const f of foods.filter(f=>f.reviewEvidence)){assert(f.reviewEvidence.score>=4.2);assert.equal(f.reviewEvidence.independentVerified,false);assert(f.en.localSpecialty&&f.en.basis);assert(f.priceCNY.low>0);if(f.reviewEvidence.count<20)assert.match(f.caution,/小样本/);}
 const promo=foods.find(f=>f.id==='food-gx3-006');assert.match(promo.basis,/年份未显示/);assert.match(foods.find(f=>f.id==='food-gx3-008').good,/不是五星用户评分/);
 const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');assert(app.includes("f.evidenceLabel?esc(L(f,'evidenceLabel'))"));
});
test('six meal outlines preserve city links, unchecked imports and unknown-price completeness',()=>{
 assert.equal(routes.length,6);for(const r of routes){assert(r.editorial&&r.en.route&&r.en.note);let stops=[];for(const id of r.foodIds){const f=data.foods.find(f=>f.id===id);assert.equal(f.city,r.city);stops=B.addFood(stops,f,false);}assert(stops.every(s=>!s.enabled));}
 const route=routes.find(r=>r.id==='route-gx3-02'),stops=route.foodIds.map(id=>B.addFood([],data.foods.find(f=>f.id===id),false)[0]);assert(stops.every(s=>s.priceCNY===null));
 const input={people:2,days:1,amounts:{roomRate:0,mealDaily:0,transitDaily:0,charterCost:0,intercityCost:0,longTransport:0,extraCost:0},foodStops:stops};assert(B.calculate(input).complete);stops[0].enabled=true;assert(!B.calculate(input).complete);stops[0].priceCNY=20;assert.equal(B.calculate(input).dining.guide.value,40);
});

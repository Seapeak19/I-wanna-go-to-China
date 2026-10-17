const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data=require('../data.json'),cities=require('../city-core.js'),tickets=require('../ticket-core.js');
const gx=data.destinations.filter(d=>d.region==='广西'&&d.entryType==='attraction'),foods=data.foods.filter(f=>f.region==='广西'&&f.id.startsWith('food-gx-'));
test('Guangxi has fourteen cities, a minimum of eight and greater depth in tourism hubs',()=>{
 assert.equal(cities.options(data,'广西').length,14);assert.equal(gx.length,156);assert.equal(new Set(gx.map(d=>d.canonicalPlaceId)).size,156);
 for(const c of cities.options(data,'广西'))assert(cities.stats(data,'广西',c.name).count>=8,c.name);
 for(const [city,n]of [['桂林',19],['南宁',15],['柳州',12],['北海',11]])assert.equal(cities.stats(data,'广西',city).count,n);
 assert.equal(data.latestRegion,'广西');assert.equal(data.destinations.find(d=>d.id==='d190').name,'兴坪古镇');assert.equal(data.destinations.find(d=>d.id==='d191').name,'靖西市');
});
test('each attraction retains a source, an actual local photo and honest guide status',()=>{
 for(const d of gx){assert(d.sources.some(s=>s.url===d.image.url));assert(d.en.name&&d.en.description&&d.guide.en.reservation);assert.equal(d.guide.complete,false);assert.equal(d.image.rightsStatus,'source-copyright');assert(d.image.originalUrl.startsWith('https:'));const p=path.join(__dirname,'..',d.image.path);assert(fs.statSync(p).size>2000,d.id);assert.equal(fs.readFileSync(p).subarray(0,2).toString('hex'),'ffd8');}
 assert.equal(gx.filter(d=>d.name.includes('峒那屿湾')).length,1);assert(!gx.some(d=>d.name.includes('小七孔')));
});
test('officially confirmed free entry and tariffs prefill while unknowns stay blank',()=>{
 for(const id of ['gx-guilin-01','gx-nanning-02','gx-nanning-07'])assert.equal(tickets.planTicket(gx.find(d=>d.canonicalPlaceId===id),{}).ticketPrice,0);
 assert.equal(tickets.planTicket(gx.find(d=>d.id==='gx-hezhou-01'),{}).ticketPrice,88);
 assert.equal(tickets.planTicket(gx.find(d=>d.id==='gx-nanning-01'),{}).ticketPrice,null);
 assert.equal(gx.filter(d=>d.ticket.status==='verified').length,4);
});
test('new food references identify branches and preserve platform limitations',()=>{
 assert.equal(foods.length,27);assert.equal(new Set(foods.map(f=>f.url)).size,27);
 for(const f of foods){assert(f.address&&f.en.dishes&&f.en.basis);assert(f.reviewEvidence.score>=4.3);assert(f.reviewEvidence.count>=20);assert.equal(f.reviewEvidence.independentVerified,false);assert(f.sources.some(s=>s.url===f.url));assert(f.priceCNY.low>0);}
 const routes=data.foodGuides.filter(g=>g.region==='广西'&&!g.researchBatch);assert.equal(routes.length,8);for(const g of routes)for(const id of g.foodIds)assert.equal(foods.find(f=>f.id===id)?.city,g.city);
});

const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../data.json'),audit=require('../research/guangxi-local-food-2026-10-17.json');
const foods=data.foods.filter(f=>f.id.startsWith('food-gx2-')),sights=data.destinations.filter(d=>d.id.startsWith('gx2-sight-'));
test('local-food expansion has twenty-seven distinct researched branches with honest small samples',()=>{
 assert.equal(foods.length,27);assert.equal(new Set(foods.map(f=>f.url)).size,27);assert.equal(new Set(foods.map(f=>f.name)).size,27);
 for(const f of foods){assert(f.localSpecialty&&f.en.localSpecialty);assert(!/[\u3400-\u9fff]/.test(f.en.name),f.name);assert(f.dishes&&f.en.dishes&&f.caution&&f.en.caution);assert(f.reviewEvidence.score>=4.2&&f.reviewEvidence.count>=5);assert.equal(f.reviewEvidence.independentVerified,false);if(f.reviewEvidence.count<20)assert.match(f.caution,/小样本/);assert(f.priceCNY.low>0);assert.match(f.basis,/非现行菜单/);assert(audit.restaurants.some(p=>p.name===f.name&&p.url===f.url));}
 for(const word of ['卷筒粉','扣肉','柠檬鸭','干捞粉','油茶','米饺','豆腐酿','五色糯米饭'])assert(foods.some(f=>(f.dishes+f.localSpecialty).includes(word)),word);
 assert(!foods.some(f=>/咖啡|西餐|披萨|汉堡|酒店/.test(f.name)));
});
test('seventeen independent destinations retain photographs and do not imply confirmed entry tariffs',()=>{
 assert.equal(sights.length,17);for(const d of sights){assert.equal(d.researchBatch,2);assert(d.sources.some(s=>s.url===d.image.url));assert(d.guide.route&&d.guide.en.route&&d.guide.en.reservation);assert.equal(d.ticket.status,'unverified');assert.equal(d.ticket.amount,undefined);}
 for(const name of ['火山岛','合浦东坡亭'])assert(audit.excludedAttractions.some(d=>d.name.includes(name)));
 assert.equal(data.provinceUpdates['广西'].count,145);assert.equal(data.provinceUpdates['广西'].batch,2);
});
test('new meal outlines link real branches in their own city and preserve existing saved identifiers',()=>{
 const routes=data.foodGuides.filter(g=>g.region==='广西'&&g.researchBatch===2);assert.equal(routes.length,13);
 for(const r of routes){assert(r.en.route&&r.en.note&&r.editorial);for(const id of r.foodIds){const f=foods.find(f=>f.id===id);assert(f,r.id);assert.equal(f.city,r.city);}}
 assert(data.foods.some(f=>f.id==='food-gx-  5'&&f.name.includes('舒记')));
 for(const f of foods.filter(f=>f.reviewSample)){assert.match(f.reviewSample.date,/^\d{4}-\d{2}-\d{2}$/);assert(f.reviewSample.author&&f.reviewSample.summaryEn);assert(f.sources.some(s=>s.url===f.reviewSample.url));assert.match(f.good,/历史/);}
});

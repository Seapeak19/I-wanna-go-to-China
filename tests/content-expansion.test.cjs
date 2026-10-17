const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../data.json'),cities=require('../city-core.js');
const foods=data.foods.filter(f=>f.id?.startsWith('food-gd-'));
test('food expansion has forty distinct branches across all twenty-one Guangdong cities',()=>{
 assert.equal(foods.length,40);assert.equal(new Set(foods.map(f=>f.city)).size,21);
 assert.equal(new Set(foods.map(f=>f.name)).size,40);
 for(const f of foods){assert.equal(f.region,'广东');assert(f.address);assert(f.dishes);assert(f.en.dishes);assert(f.en.caution);assert(f.basis);assert(f.sources.some(s=>s.url===f.url));assert.equal(f.checked,'2026-10-17');for(const s of f.sources)assert.equal(new URL(s.url).protocol,'https:')}
});
test('food amounts remain reference spending and unverified prices are never represented by zero',()=>{
 for(const f of foods){if(f.priceCNY){assert(Number.isFinite(f.priceCNY.low)&&f.priceCNY.low>0);assert(f.priceCNY.high>=f.priceCNY.low);assert.match(f.basis,/参考|消费/)}else assert.match(f.price,/待核实/)}
 const history=foods.find(f=>f.name.includes('同记'));assert.equal(history.priceCNY.historical,true);assert.match(history.basis,/2023-01-22/);
});
test('review samples and video-description evidence retain provenance and limitations',()=>{
 const platforms=new Set(foods.flatMap(f=>f.sources.map(s=>s.platform)));for(const p of ['携程','去哪儿','大众点评','B站','餐厅官方'])assert(platforms.has(p));
 for(const f of foods){if(f.reviewSample){assert(f.reviewSample.author);assert.match(f.reviewSample.date,/^\d{4}-\d{2}-\d{2}$/);assert(f.reviewSample.summaryEn)}else assert.match(f.good,/尚未核对/);for(const s of f.sources.filter(s=>s.platform==='B站')){assert.equal(s.evidenceType,'video-description');assert(s.author&&s.date);assert.match(s.title,/未完整观看/)}}
});
test('food routes are editorial outlines linked to real branches in the same city',()=>{
 assert.equal(data.foodGuides.length,29);for(const g of data.foodGuides){assert.equal(g.editorial,true);assert(g.en.route&&g.en.note);for(const id of g.foodIds)assert.equal(data.foods.find(f=>f.id===id)?.city,g.city)}
});
test('deeper food coverage is branch-specific, sourced, weighted and honest about public scores',()=>{
 const additions=data.foods.filter(f=>f.id?.startsWith('food-v6-'));assert.equal(additions.length,36);
 assert.equal(new Set(additions.map(f=>f.url)).size,36);
 for(const f of additions){assert(f.address&&f.en.name&&f.en.dishes&&f.en.basis&&f.en.caution);assert(f.priceCNY.low>0);assert.equal(f.reviewEvidence.independentVerified,false);assert(f.reviewEvidence.count>=8);assert(f.reviewEvidence.score>=4.2);assert.equal(f.reviewEvidence.url,f.url);assert(f.sources.some(s=>s.url===f.url));assert.match(f.basis,/非现行菜单/)}
 const count=c=>data.foods.filter(f=>f.city===c&&f.recommendationStatus!=='research-only').length;
 assert(count('广州')>count('深圳'));assert(count('深圳')>count('中山'));assert(count('佛山')>count('中山'));
 assert.equal(data.foodDepth.newRoutes,22);assert.match(data.foodDepth.method,/不是官方/);
 for(const id of ['food-gd-036','food-gd-029','food-gd-039'])assert.equal(data.foods.find(f=>f.id===id).recommendationStatus,'research-only');
 const audit=require('../research/food-depth-2026-10-17.json');assert.equal(audit.entries.length,36);assert(audit.excluded.some(f=>f.reason.includes('已下线')));
});
test('city expansion allocates more distinct attractions to large and popular cities without reducing the minimum',()=>{
 assert.equal(cities.minimum(data),8);const count=c=>cities.stats(data,'广东',c).count;
 assert.equal(count('广州'),20);assert.equal(count('深圳'),18);assert.equal(count('佛山'),14);assert.equal(count('珠海'),14);
 for(const c of data.cities.filter(c=>c.region==='广东'))assert(count(c.name)>=10);
 const newEntries=data.destinations.filter(d=>d.researchBatch===5);assert.equal(newEntries.length,36);
 assert(newEntries.some(d=>d.name==='大芬油画村'));assert(newEntries.some(d=>d.name==='平安金融中心云际观光层'));
 assert.match(data.cityExpansion.method,/不是官方/);assert(data.cityExpansion.sources.length>=2);
 const audit=require('../research/city-expansion-2026-10-17.json');for(const d of newEntries)assert.equal(audit.entries.find(e=>e.id===d.id).name,d.name);
});

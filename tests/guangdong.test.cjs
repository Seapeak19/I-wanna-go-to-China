const{test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8')),gd=data.destinations.filter(x=>x.region==='广东');
test('Guangdong batch has unique IDs, 21 cities and preserves all provincial directories',()=>{
 assert.equal(new Set(data.destinations.map(x=>x.id)).size,data.destinations.length);assert.equal(data.regions.length,34);
 for(const r of data.regions)assert(data.destinations.some(d=>d.region===r.id),r.id);
 assert.equal(gd.length,210);assert.equal(new Set(gd.map(x=>x.city)).size,21);assert.equal(data.provinceUpdates.广东.count,gd.length);
 const expected='广州 深圳 珠海 汕头 佛山 韶关 河源 梅州 惠州 汕尾 东莞 中山 江门 阳江 湛江 茂名 肇庆 清远 潮州 揭阳 云浮'.split(' ');assert.deepEqual([...new Set(gd.map(x=>x.city))].sort(),expected.sort());
});
test('every Guangdong guide has bilingual practical facts and inspectable sources',()=>{
 for(const d of gd){assert.equal(d.guide.checked,'2026-10-16');for(const k of ['admission','opening','reservation','route','accessibility']){assert(d.guide[k],d.id+': '+k);assert(d.guide.en[k],d.id+': English '+k)}assert(d.sources.length>=2,d.id);for(const s of d.sources)assert.equal(new URL(s.url).protocol,'https:');assert.equal(d.tier,d.researchBatch>=3?'景点资料':'景点攻略');if(d.researchBatch>=3)assert.equal(d.guide.complete,false)}
});
test('licensed images retain credits and missing photos are not replaced with invented scenes',()=>{
 for(const d of gd){const i=d.image;if(d.researchBatch>=3&&!i){assert(d.photoStatus);continue}if(d.id==='gd015'){assert.equal(i,undefined);continue}assert(i,d.id);assert(fs.statSync(path.join(root,i.path)).size>1000);for(const k of ['author','license','licenseUrl','url','caption'])assert(i[k],d.id+': '+k);assert.equal(typeof i.date,'string');if(!i.date)assert.equal(i.dateStatus,'unknown');assert(i.en.caption);assert.match(i.license,/CC|Public domain/)}
 assert.match(gd.find(d=>d.id==='gd005').image.url,/Zili_Village/);assert.match(gd.find(d=>d.id==='d182').image.caption,/南澳大桥/);
});
test('reviews stay attributable and conflicting or historical operations remain qualified',()=>{
 assert.equal(gd.filter(d=>d.reviews).length,12);for(const d of gd.filter(d=>d.reviews?.samples)){assert(d.reviews.samples[0].author);d.reviews.samples[0].date?assert.match(d.reviews.samples[0].date,/^\d{4}-\d{2}-\d{2}$/):assert.equal(d.reviews.samples[0].dateStatus,'not-shown');assert(d.reviews.negative)}
 assert.match(gd.find(d=>d.id==='gd005').guide.opening,/临时闭园/);assert.match(gd.find(d=>d.id==='gd009').guide.opening,/2月11日–3月8日/);assert.match(gd.find(d=>d.id==='gd009').guide.admission,/历史参考/);
});
test('second batch preserves provenance and labels changing operations',()=>{
 assert.equal(gd.filter(d=>d.researchBatch===2).length,9);assert.equal(data.provinceUpdates.广东.batches.length,4);
 assert.match(gd.find(d=>d.id==='gd016').name,/凤山民俗文化/);assert.match(gd.find(d=>d.id==='gd016').guide.admission,/历史参考/);
 assert.match(gd.find(d=>d.id==='gd013').guide.admission,/冲突/);assert.match(gd.find(d=>d.id==='gd014').guide.admission,/未注明时间/);
 assert.match(gd.find(d=>d.id==='gd017').guide.reservation,/免预约/);assert.equal(gd.find(d=>d.id==='gd015').photoStatus,'授权实景待补核');
});

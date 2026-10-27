const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');
const source=require('../data.json'),index=JSON.parse(fs.readFileSync('data/index.json'));
function loader(fail,version){
 const requests=[];
 const context={TRAVEL_BUILD_VERSION:version,DecompressionStream,Response,Blob,TextDecoder,fetch:async file=>{
  requests.push(file);const resource=file.split('?')[0];if(fail?.(resource))return{ok:false,status:503};
  const bytes=fs.readFileSync(resource);return{ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};
 }};
 vm.runInNewContext(fs.readFileSync('data-store.js','utf8'),context);
 return{api:context.TravelData,requests};
}
test('national browsing preserves ordering, search fields and ticket states without requesting province details',async()=>{
 const {api,requests}=loader(),data=await api.catalog();
 assert.deepEqual(Array.from(data.destinations,x=>x.id),source.destinations.map(x=>x.id));
 assert.deepEqual(Array.from(data.foods,x=>x.id),source.foods.map(x=>x.id));
 assert.equal(requests.filter(x=>x.includes('region-')).length,0);
 for(const actual of data.destinations){const expected=source.destinations.find(x=>x.id===actual.id);assert.equal(actual.description,expected.description);assert.equal(actual.ticket.status,expected.ticket.status);if(expected.ticket.status==='verified')assert.deepEqual(JSON.parse(JSON.stringify(actual.ticket)),expected.ticket);assert.equal(actual.sourceCount,expected.sources.length);assert.equal(api.isLoaded(actual),false);}
 assert(fs.statSync(index.browse).size<1_500_000);
});
test('saved cross-province selections hydrate only their owning provinces and preserve the national index',async()=>{
 const {api,requests}=loader(),data=await api.catalog();
 const ids=[source.destinations.find(x=>x.region==='广东').id,source.destinations.find(x=>x.region==='台湾').id,source.foods.find(x=>x.region==='广东').id];
 await Promise.all([api.hydrate(ids),api.hydrate(ids)]);
 assert.equal(new Set(requests.filter(x=>x.includes('region-'))).size,2);
 assert.equal(requests.filter(x=>x.includes('region-')).length,2);
 for(const id of ids){const record=[...data.destinations,...data.foods].find(x=>x.id===id);assert(api.isLoaded(record));}
 assert.equal(data.destinations.length,source.destinations.length);
 assert.equal(api.isLoaded(data.destinations.find(x=>x.region==='四川')),false);
 assert.deepEqual(Array.from(data.destinations,x=>x.id),source.destinations.map(x=>x.id));
});
test('failed province loads remain retryable and never replace summaries with incomplete records',async()=>{
 const file=index.regions.find(r=>r.region==='四川').file;let unavailable=true;
 const {api}=loader(p=>p===file&&unavailable),data=await api.catalog();
 const before=data.destinations.find(x=>x.region==='四川');
 await assert.rejects(api.hydrate([before.id]),/503/);
 assert.equal(data.destinations.find(x=>x.id===before.id),before);
 unavailable=false;await api.hydrate([before.id]);
 const after=data.destinations.find(x=>x.id===before.id);assert(api.isLoaded(after));assert(after.sources.some(x=>x.title));
});
test('published photos use local full-frame derivatives while canonical provenance remains intact',()=>{
 const images=JSON.parse(fs.readFileSync('data/images.json'));
 assert(!fs.existsSync('dist/data.json'));
 for(const r of index.regions){const piece=JSON.parse(zlib.gunzipSync(fs.readFileSync('dist/'+r.file)));for(const d of piece.destinations)if(d.image){
  const original=source.destinations.find(x=>x.id===d.id).image;
  assert.equal(d.image.url,original.url);assert.equal(d.image.originalUrl,original.originalUrl);assert.equal(d.image.author,original.author);
  assert.equal(d.image.display,images[original.path].display);
  for(const p of [d.image.display,d.image.thumbnail]){const b=fs.readFileSync('dist/'+p);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');}
 }}
});
test('published scripts and requested data share a release version to avoid mixing stale browse formats',async()=>{
 const html=fs.readFileSync('dist/index.html','utf8'),version=html.match(/TRAVEL_BUILD_VERSION="([a-f0-9]+)"/)[1];
 const scripts=[...html.matchAll(/src="([^"?]+\.js)\?v=([a-f0-9]+)"/g)];assert.equal(scripts.length,[...html.matchAll(/<script\b[^>]*src=/g)].length);assert(scripts.length>0);
 for(const[,file,actual]of scripts){assert.equal(actual,version);assert(fs.existsSync('dist/'+file));}
 const {api,requests}=loader(null,version);await api.hydrate(['gd013']);
 assert(requests.every(file=>file.endsWith('?v='+version)));
});

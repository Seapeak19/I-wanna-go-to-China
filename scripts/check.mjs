import fs from 'node:fs';import zlib from 'node:zlib';import assert from 'node:assert/strict';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const files=walk('dist'),total=files.reduce((n,f)=>n+fs.statSync(f).size,0);
assert(total<700_000_000,'Published site exceeds the optimized 700 MB budget');
assert(!fs.existsSync('dist/data.json'),'Duplicate canonical source must not ship');
for(const f of files)assert(fs.statSync(f).size<20_000_000,'File budget exceeded: '+f);
const home=fs.readFileSync('dist/index.html','utf8');assert(!home.includes('src="locale-extra.js"'),'Eager translation bundle');assert(home.includes('data-store.js'));
const m=JSON.parse(fs.readFileSync('dist/map-data/manifest.json'));assert(!m.files,'Unused geometry URLs must not ship in the card directory');
const size=zlib.gzipSync(fs.readFileSync('dist/map-data/manifest.json')).length;assert(size<250_000,'Home directory transfer budget exceeded');
for(const n of Object.values(m.nodes))if(n.cover){assert(fs.existsSync('dist/'+n.cover.image.display));assert(fs.existsSync('dist/'+n.cover.image.thumbnail));}
const i=JSON.parse(fs.readFileSync('dist/data/index.json'));const browse=fs.readFileSync('dist/'+i.browse);assert(browse.length<1_500_000,'National browse index transfer budget exceeded');
for(const r of i.regions){const p=JSON.parse(zlib.gunzipSync(fs.readFileSync('dist/'+r.file)));for(const d of p.destinations)if(d.image){assert(fs.existsSync('dist/'+d.image.display),d.id);assert(fs.existsSync('dist/'+d.image.thumbnail),d.id);}}
console.log(JSON.stringify({publishedBytes:total,remainingBytes:1_073_741_824-total,homeDirectoryGzip:size,browseIndexGzip:browse.length,files:files.length}));

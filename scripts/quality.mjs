import fs from 'node:fs';import zlib from 'node:zlib';import Q from '../quality-core.js';
const data=JSON.parse(fs.readFileSync('data.json')),now=Q.today(),health=fs.existsSync('research/source-health.json')?JSON.parse(fs.readFileSync('research/source-health.json')):{entries:[]};
const records=data.destinations.map(d=>({id:d.id,region:d.region,name:d.name,enName:d.en.name,...Q.attraction(d,now)}));
const ratios=new Map(data.regions.map(r=>{const rows=records.filter(x=>x.region===r.id);return[r.id,rows.filter(x=>x.ticket==='checked').length/rows.length]}));
const counts=rows=>({total:rows.length,ticketChecked:rows.filter(r=>r.ticket==='checked').length,ticketStale:rows.filter(r=>r.ticket==='stale'||r.ticket==='expired').length,openingChecked:rows.filter(r=>r.opening==='checked').length,photosOpen:rows.filter(r=>r.photo==='open').length,photosPending:rows.filter(r=>r.photo==='permission-pending').length});
const result={generated:now,ttl:Q.TTL,counts:counts(records),regions:data.regions.map(r=>({region:r.id,...counts(records.filter(d=>d.region===r.id)),restaurants:data.foods.filter(f=>f.region===r.id&&f.recommendationStatus!=='research-only').length})),health:{checked:health.checked||null,checkedLinks:health.entries.length,restricted:health.entries.filter(x=>x.status==='restricted').length,unavailable:health.entries.filter(x=>x.status==='unavailable').length},queue:records.filter(d=>d.ticket==='pending'||d.ticket==='stale'||d.opening!=='checked').sort((a,b)=>resultPriority(a)-resultPriority(b)).slice(0,100)};
function resultPriority(d){return ratios.get(d.region)||0;}
fs.writeFileSync('data/quality.json.gz',zlib.gzipSync(JSON.stringify(result),{level:9}));
console.log('Prepared evidence freshness and image-rights coverage.');

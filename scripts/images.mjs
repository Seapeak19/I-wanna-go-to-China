import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const data=JSON.parse(fs.readFileSync('data.json'));
const staticPhotos=['index.html','interface-motion.js','hero-deck.css'].flatMap(file=>[...fs.readFileSync(file,'utf8').matchAll(/assets\/[\w./-]+\.(?:jpg|jpeg|png|webp)/gi)].map(m=>m[0]));
const sources=[...new Set([...data.destinations.map(d=>d.image?.path).filter(Boolean),...staticPhotos])];
const images={},jobs=[],queued=new Set();
for(const source of sources){
  const bytes=fs.readFileSync(source);
  const hash=crypto.createHash('sha256').update('webp-v1:1280:76:480:68:').update(bytes).digest('hex').slice(0,24);
  const display='assets/optimized/'+hash+'-1280.webp',thumbnail='assets/optimized/'+hash+'-480.webp';
  images[source]={display,thumbnail};
  if((!fs.existsSync(display)||!fs.existsSync(thumbnail))&&!queued.has(display)){jobs.push({source,display,thumbnail});queued.add(display);}
}
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/image-jobs.json',JSON.stringify(jobs));
if(jobs.length){
  const result=spawnSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['scripts/images.py'],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)throw Error('Image optimization failed; install scripts/requirements-images.txt and retry.');
}
fs.writeFileSync('data/images.json',JSON.stringify(images));
console.log('Optimized photo sources:',sources.length,'; newly generated:',jobs.length);

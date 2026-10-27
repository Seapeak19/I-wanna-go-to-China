import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),out=path.resolve('dist');
assert.equal(out,path.join(root,'dist'));
assert(!fs.existsSync(out)||!fs.lstatSync(out).isSymbolicLink(),'Refuse to replace a linked output directory');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const images=JSON.parse(fs.readFileSync('data/images.json'));
const rewrite=text=>text.replace(/assets\/[\w./-]+\.(?:jpg|jpeg|png|webp)/gi,p=>images[p]?.display||p);
const sources=['index.html','.nojekyll','quality-core.js','quality-ui.js','trip-core.js','trip-ui.js','app.js','data-store.js','currency-core.js','locale-data.js','city-core.js','budget-core.js','ticket-core.js','locale-core.js','map-core.js','destination-cards.js','interface-motion.js','bundle.css'];
const digest=crypto.createHash('sha256');
for(const file of [...sources,'data.json','data/images.json','data/quality.json.gz'])digest.update(fs.readFileSync(file));
const version=digest.digest('hex').slice(0,16);
for(const file of sources){
 let text=rewrite(fs.readFileSync(file,'utf8'));
 if(file==='index.html')text=text.replace('globalThis.TravelInitialHash=','globalThis.TRAVEL_BUILD_VERSION="'+version+'";globalThis.TravelInitialHash=').replace(/((?:src|href)="[^"?]+\.(?:js|css))"/g,'$1?v='+version+'"');
 if(file==='destination-cards.js')text=text.replace(/(['"])(\.\/(?:map-core|interface-motion)\.js)\1/g,(_,quote,file)=>quote+file+'?v='+version+quote);
 fs.writeFileSync(path.join(out,file),text);
}
for(const dir of ['data','i18n'])fs.cpSync(dir,path.join(out,dir),{recursive:true,filter:p=>!['images.json','image-jobs.json','covers.json'].includes(path.basename(p))});
fs.mkdirSync(out+'/assets/optimized',{recursive:true});
for(const entry of new Set(Object.values(images).flatMap(v=>[v.display,v.thumbnail])))fs.copyFileSync(entry,path.join(out,entry));
fs.cpSync('assets/fonts',out+'/assets/fonts',{recursive:true});
fs.copyFileSync('assets/orbit-mark.svg',out+'/assets/orbit-mark.svg');
fs.mkdirSync(out+'/map-data',{recursive:true});
const manifest=JSON.parse(fs.readFileSync('map-data/manifest.json'));
for(const n of Object.values(manifest.nodes))if(n.cover)Object.assign(n.cover.image,images[n.cover.image.path]);
fs.writeFileSync(out+'/map-data/manifest.json',JSON.stringify(manifest));
fs.mkdirSync(out+'/research',{recursive:true});fs.copyFileSync('research/admin-map-audit.json',out+'/research/admin-map-audit.json');
console.log('Prepared optimized static site in dist/');

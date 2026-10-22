import fs from 'node:fs';import path from 'node:path';
const out='dist';fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','.nojekyll','app.js','data-store.js','currency-core.js','locale-data.js','city-core.js','budget-core.js','ticket-core.js','locale-core.js','map-core.js','destination-cards.js','bundle.css','data.json'])fs.copyFileSync(file,path.join(out,file));
for(const dir of ['assets','data','i18n'])fs.cpSync(dir,path.join(out,dir),{recursive:true});
fs.mkdirSync(out+'/map-data',{recursive:true});fs.copyFileSync('map-data/manifest.json',out+'/map-data/manifest.json');fs.mkdirSync(out+'/research',{recursive:true});fs.copyFileSync('research/admin-map-audit.json',out+'/research/admin-map-audit.json');
console.log('Prepared static site in dist/');

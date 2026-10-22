(function(root){
 'use strict';
 const cache=new Map();
 async function json(file){if(cache.has(file))return cache.get(file);const promise=(async()=>{const r=await fetch(file);if(!r.ok)throw Error('Could not load '+file+' ('+r.status+')');const raw=await r.arrayBuffer(),b=new Uint8Array(raw);if(b[0]===31&&b[1]===139){if(!root.DecompressionStream)throw Error('Please use an up-to-date browser to load compressed guides.');return JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text());}return JSON.parse(new TextDecoder().decode(raw));})();cache.set(file,promise);try{return await promise}catch(e){cache.delete(file);throw e}}
 const index=()=>json('data/index.json');
 async function region(name){const i=await index(),r=i.regions.find(x=>x.region===name);if(!r)throw Error('Unknown region');const [meta,piece]=await Promise.all([json(i.metadata),json(r.file)]);return{...meta,...piece};}
 let full;
 async function all(){if(full)return full;full=(async()=>{const i=await index(),meta=await json(i.metadata),parts=new Array(i.regions.length);let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<i.regions.length){const n=next++;parts[n]=await json(i.regions[n].file);}}));const destinations=new Map(parts.flatMap(x=>x.destinations).map(x=>[x.id,x])),foods=new Map(parts.flatMap(x=>x.foods).map(x=>[x.id,x]));return{...meta,destinations:i.destinationOrder.map(id=>destinations.get(id)),foods:i.foodOrder.map(id=>foods.get(id))};})();try{return await full}catch(e){full=null;throw e}}
 root.TravelData={json,region,all};
 const languageCache=new Map();
 async function language(code){if(['zh','en'].includes(code))return;if(languageCache.has(code))return languageCache.get(code);const p=(async()=>{const i=await json('i18n/index.json'),files=i.languages[code];if(!files)throw Error('Language unavailable');const [common,...chunks]=await Promise.all([json('i18n/common.json.gz'),...files.map(json)]);const pack=root.TRAVEL_TRANSLATIONS||(root.TRAVEL_TRANSLATIONS={messages:{}});Object.assign(pack,common);if(code==='zh-Hant')Object.assign(pack,...chunks);else pack.messages[code]=Object.assign({},...chunks);root.TravelI18n?.invalidate?.();})();languageCache.set(code,p);try{return await p}catch(e){languageCache.delete(code);throw e}}
 root.TravelLanguages={load:language};
})(globalThis);

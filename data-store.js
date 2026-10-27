(function(root){
 'use strict';
 const cache=new Map(),loaded=new Map();let catalogPromise,catalogValue;
 async function json(file){if(cache.has(file))return cache.get(file);const promise=(async()=>{const url=root.TRAVEL_BUILD_VERSION?file+(file.includes('?')?'&':'?')+'v='+root.TRAVEL_BUILD_VERSION:file;const r=await fetch(url);if(!r.ok)throw Error('Could not load '+file+' ('+r.status+')');const raw=await r.arrayBuffer(),b=new Uint8Array(raw);if(b[0]===31&&b[1]===139){if(!root.DecompressionStream)throw Error('Please use an up-to-date browser to load compressed guides.');return JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text());}return JSON.parse(new TextDecoder().decode(raw));})();cache.set(file,promise);try{return await promise}catch(e){cache.delete(file);throw e}}
 const index=()=>json('data/index.json');
 function merge(piece){if(!catalogValue)return;for(const key of ['destinations','foods']){const records=new Map(piece[key].map(x=>[x.id,x]));catalogValue[key]=catalogValue[key].map(x=>records.get(x.id)||x);}}
 async function region(name){const i=await index(),r=i.regions.find(x=>x.region===name);if(!r)throw Error('Unknown region');const [meta,piece]=await Promise.all([json(i.metadata),json(r.file)]);loaded.set(name,piece);merge(piece);return{...meta,...piece};}
 async function catalog(){if(catalogPromise)return catalogPromise;catalogPromise=(async()=>{const i=await index(),[meta,browse]=await Promise.all([json(i.metadata),json(i.browse)]);catalogValue={...meta,...browse};for(const piece of loaded.values())merge(piece);return catalogValue;})();try{return await catalogPromise}catch(e){catalogPromise=null;throw e}}
 async function hydrate(ids=[],regions=[]){const i=await index();await catalog();const wanted=new Set(regions.filter(r=>r!=='all'));const keys=new Set(ids);for(const r of i.regions)if(r.destinations.some(id=>keys.has(id))||r.foods.some(id=>keys.has(id)))wanted.add(r.region);const names=[...wanted].filter(r=>!loaded.has(r));let next=0;await Promise.all(Array.from({length:Math.min(4,names.length)},async()=>{while(next<names.length)await region(names[next++]);}));return catalogValue;}
 const isLoaded=record=>!!record&&!record._summary;
 async function all(){const i=await index();return hydrate([],i.regions.map(r=>r.region));}
 root.TravelData={json,region,catalog,hydrate,isLoaded,all};
 const languageCache=new Map();
 async function language(code){if(['zh','en'].includes(code))return;if(languageCache.has(code))return languageCache.get(code);const p=(async()=>{const i=await json('i18n/index.json'),files=i.languages[code];if(!files)throw Error('Language unavailable');const [common,...chunks]=await Promise.all([json('i18n/common.json.gz'),...files.map(json)]);const pack=root.TRAVEL_TRANSLATIONS||(root.TRAVEL_TRANSLATIONS={messages:{}});Object.assign(pack,common);if(code==='zh-Hant')Object.assign(pack,...chunks);else pack.messages[code]=Object.assign({},...chunks);root.TravelI18n?.invalidate?.();})();languageCache.set(code,p);try{return await p}catch(e){languageCache.delete(code);throw e}}
 root.TravelLanguages={load:language};
})(globalThis);

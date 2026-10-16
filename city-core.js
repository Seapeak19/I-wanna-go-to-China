(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravelCities=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function minimum(data){const n=data.contentPolicy?.cityMinimumAttractions;return Number.isInteger(n)&&n>=8?n:8}
 function options(data,region){return (data.cities||[]).filter(c=>c.region===region)}
 function stats(data,region,city){
  const entries=data.destinations.filter(d=>d.region===region&&d.city===city);
  const places=new Map();for(const d of entries)if(d.entryType==='attraction'&&d.tier!=='待调研'&&d.sources?.some(s=>{try{return new URL(s.url).protocol==='https:'}catch{return false}}))places.set(d.canonicalPlaceId||d.id,d);
  const count=places.size,deep=[...places.values()].filter(d=>d.tier==='景点攻略'&&d.guide?.complete!==false).length,target=minimum(data);
  return {count,deep,target,remaining:Math.max(0,target-count),ready:count>=target,entries:entries.length};
 }
 function accepts(d,region,city){return (region==='all'||d.region===region)&&(city==='all'||d.city===city)}
 return Object.freeze({minimum,options,stats,accepts});
});

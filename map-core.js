(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.TravelMap=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const chars={'臺':'台','區':'区','縣':'县','鄉':'乡','鎮':'镇','東':'东','華':'华','萬':'万','義':'义','蓮':'莲','雲':'云','蘭':'兰','門':'门','連':'连','馬':'马','澎':'澎','龍':'龙','園':'园','壽':'寿','橋':'桥','豐':'丰','樹':'树','頭':'头','岡':'冈','營':'营','觀':'观','鳥':'鸟','學':'学','寶':'宝','烏':'乌','龜':'龟','羅':'罗','蘆':'芦','莊':'庄','鹽':'盐','關':'关'};
 const normalize=s=>String(s||'').replace(/[臺區縣鄉鎮東華萬義蓮雲蘭門連馬龍園壽橋豐樹頭岡營觀鳥學寶烏龜羅蘆莊鹽關]/g,c=>chars[c]||c).replace(/\s/g,'');
 const regionShort=s=>normalize(s).replace(/特别行政区$|壮族自治区$|回族自治区$|维吾尔自治区$|自治区$|省$|市$/,'');
 function ancestry(nodes,id){const out=[],seen=new Set();while(id&&id!=='100000'){if(seen.has(id)||!nodes[id])return [];seen.add(id);out.unshift(nodes[id]);id=nodes[id].parent}return out;}
 function scope(data,nodes,id){if(!data)return{destinations:[],foods:[],region:null,city:null,pending:true};if(id==='100000')return{destinations:[],foods:[],region:null,city:null,pending:false};const chain=ancestry(nodes,id),province=chain.find(n=>n.level==='province');if(!province)return{destinations:[],foods:[],region:null,city:null,pending:false};const region=regionShort(province.name),cityNode=chain.find(n=>n.level==='city'),leaf=chain.at(-1),county=leaf?.level==='district'?normalize(leaf.name):null;
 const city=cityNode?(data.cities||[]).filter(c=>c.region===region&&normalize(cityNode.name).startsWith(normalize(c.name))).sort((a,b)=>b.name.length-a.name.length)[0]?.name:null;
 // A missing city crosswalk never falls back to all records in its province.
 // Older records may name the district only in their explicit street address.
 // Never infer it from a restaurant name, description or nearby landmark.
 const fits=x=>x.region===region&&(!cityNode||(city&&x.city===city))&&(!county||normalize(x.district)===county||(!x.district&&normalize(x.location||x.address).includes(county)));
 return{region,city,county,cityUnmapped:!!cityNode&&!city,destinations:data.destinations.filter(x=>x.entryType==='attraction'&&fits(x)),foods:data.foods.filter(x=>x.recommendationStatus!=='research-only'&&fits(x)),pending:false};
 }
 return Object.freeze({normalize,regionShort,ancestry,scope});
});

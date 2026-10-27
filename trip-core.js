(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./budget-core.js'):root.TravelBudget);if(typeof module==='object'&&module.exports)module.exports=api;else root.TravelTrips=api;})(typeof globalThis!=='undefined'?globalThis:this,function(B){
 'use strict';
 const FORMAT='china-travel-backup',MAX_BYTES=2_000_000,MAX_TRIPS=20;
 const moneyKeys=['roomRate','mealDaily','transitDaily','charterCost','intercityCost','longTransport','extraCost'];
 const text=(v,max=300)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,max):'';
 function date(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return'';const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value?value:'';}
 function array(value,max){if(value===undefined)return[];if(!Array.isArray(value)||value.length>max)throw Error('Invalid or oversized list');return value;}
 function price(value){if(value===null||value===undefined)return null;if(B.amount(value)===null)throw Error('Invalid budget amount');return value;}
 function id(value){if(typeof value!=='string'||!value.length||value.length>160||/[\u0000-\u001f]/.test(value))throw Error('Invalid record ID');return value;}
 function normalize(value={}){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid trip');
  const raw=value.settings||{},settings={people:String(B.integer(Number(raw.people??raw.planPeople),2,1,30)),days:String(B.integer(Number(raw.days??raw.planDays),3,1,30)),startDate:date(raw.startDate)};
  settings.planPeople=String(B.integer(Number(raw.planPeople),Number(settings.people),1,30));settings.planDays=String(B.integer(Number(raw.planDays),Number(settings.days),1,30));
  const plan=array(value.plan,300).map(p=>{if(!p||typeof p!=='object')throw Error('Invalid attraction');return{id:id(p.id),ticketPrice:price(p.ticketPrice),ticketOrigin:p.ticketOrigin==='manual'||(!p.ticketOrigin&&p.ticketPrice!==null&&p.ticketPrice!==undefined)?'manual':p.ticketOrigin==='auto'?'auto':'pending',ticketOption:B.integer(p.ticketOption,null,0,100),ticketCount:B.integer(p.ticketCount,null,0,10000),nights:B.integer(p.nights,null,1,30)};});
  if(new Set(plan.map(p=>p.id)).size!==plan.length)throw Error('Duplicate attractions');
  const foods=array(value.foodPlan,500);for(const f of foods){id(f?.id);price(f.priceCNY);}
  const foodPlan=B.normalizeFoods(foods),compare=[...new Set(array(value.compare,3).map(id))],foodRoutes=[...new Set(array(value.foodRoutes,300).map(v=>text(v,500)))];
  const amountsCNY={};for(const k of moneyKeys)amountsCNY[k]=price(Object.hasOwn(value.amountsCNY||{},k)?value.amountsCNY[k]:raw[k]??(['charterCost','intercityCost','extraCost'].includes(k)?0:null));
  const customRates={};for(const [code,r]of Object.entries(value.customRates||{}))if(/^[A-Z]{3}$/.test(code)&&r&&typeof r.rate==='number'&&r.rate>0&&r.rate<=1e6&&date(r.date))customRates[code]={rate:r.rate,date:r.date};
  const schedule={};if(value.planner?.schedule&&typeof value.planner.schedule==='object')for(const [key,s]of Object.entries(value.planner.schedule)){if(!/^[pf]:.{1,180}$/.test(key)||!s||typeof s!=='object')continue;schedule[key]={day:B.integer(s.day,0,0,30),time:/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s.time||'')?s.time:'',duration:B.integer(s.duration,90,5,1440),note:text(s.note)};}
  return{version:6,compare,plan,foodPlan,foodRoutes,settings,amountsCNY,budgetSettings:{rooms:B.integer(value.budgetSettings?.rooms,null,0,30),nights:B.integer(value.budgetSettings?.nights,null,0,365)},customRates,preferences:{lang:text(value.preferences?.lang,10)||'zh',currency:text(value.preferences?.currency,3)||'CNY'},filters:{region:text(value.filters?.region,50)||'all',city:text(value.filters?.city,80)||'all'},planner:{schedule}};
 }
 function backup(trips,exportedAt=new Date().toISOString()){return{format:FORMAT,version:1,exportedAt,trips:array(trips,MAX_TRIPS).map(t=>({name:text(t.name,80)||'My trip',state:normalize(t.state)}))};}
 function parseBackup(raw){if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_BYTES)throw Error('Backup too large');const value=JSON.parse(raw);if(value.format!==FORMAT||value.version!==1||!Array.isArray(value.trips)||!value.trips.length)throw Error('Unsupported backup');return backup(value.trips,value.exportedAt);}
 function dayDate(start,offset){if(!date(start))return'';const d=new Date(start+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
 const split=(cents,n)=>Array.from({length:n},(_,i)=>Math.floor(cents/n)+(i<cents%n?1:0));
 function entries(state,cost,data){
  const out=[];
  state.plan.forEach((p,i)=>{const record=data.destinations.find(d=>d.id===p.id);if(record)out.push({key:'p:'+p.id,record,kind:'place',active:true,known:cost.stops[i].ticket.known,cents:Math.round(cost.stops[i].total*100)});});
  for(const p of cost.dining.stops){const record=data.foods.find(f=>f.id===p.id);if(!record)continue;const amounts=split(Math.round(p.cost.value*100),p.visits);for(let i=0;i<p.visits;i++)out.push({key:'f:'+p.id+':'+(i+1),record,kind:'food',visit:i+1,active:p.enabled,known:p.cost.known,cents:amounts[i]});}
  return out.map((e,index)=>({...e,index,schedule:{day:0,time:'',duration:e.kind==='food'?60:90,note:'',...state.planner?.schedule?.[e.key]}}));
 }
 function daily(state,cost,data){
  const items=entries(state,cost,data),itemCents=items.reduce((s,e)=>s+e.cents,0),shared=split(Math.round(cost.total*100)-itemCents,cost.days);
  const days=Array.from({length:cost.days+1},(_,day)=>({day,date:day?dayDate(state.settings.startDate,day-1):'',sharedCents:day?shared[day-1]:0,items:[],warnings:[]}));
  for(const item of items){const day=item.schedule.day<=cost.days?item.schedule.day:0;days[day].items.push(item);}
  for(const d of days){
   d.items.sort((a,b)=>(a.schedule.time||'99:99').localeCompare(b.schedule.time||'99:99')||a.index-b.index);
   d.cents=d.sharedCents+d.items.reduce((s,e)=>s+e.cents,0);d.perPerson=d.cents/100/cost.people;
   d.complete=cost.complete&&d.items.every(e=>e.known);d.minutes=d.items.filter(e=>e.active).reduce((s,e)=>s+e.schedule.duration,0);
   let previousEnd=-1;for(const e of d.items.filter(e=>e.active)){
    const start=e.schedule.time?Number(e.schedule.time.slice(0,2))*60+Number(e.schedule.time.slice(3)):null;
    if(start!==null){if(start<previousEnd)d.warnings.push({type:'overlap',key:e.key});previousEnd=Math.max(previousEnd,start+e.schedule.duration);if(start+e.schedule.duration>1440)d.warnings.push({type:'overnight',key:e.key});}
    const rule=e.record.visitPolicy;if(d.date&&rule?.closedWeekdays?.includes(new Date(d.date+'T00:00:00Z').getUTCDay()))d.warnings.push({type:'closure',key:e.key,source:rule.sourceUrl});
   }
   if(d.minutes>480)d.warnings.push({type:'busy'});
  }
  return days;
 }
 function mapLinks(items){const stops=items.filter(e=>e.active).map(e=>[e.record.region,e.record.city,e.record.name,e.record.location||e.record.address].filter(Boolean).join(' '));const links=[];for(let i=0;i<stops.length-1;i+=4){const part=stops.slice(i,i+5),params=new URLSearchParams({api:'1',origin:part[0],destination:part.at(-1),travelmode:'driving'});if(part.length>2)params.set('waypoints',part.slice(1,-1).join('|'));const url='https://www.google.com/maps/dir/?'+params.toString();if(url.length<=2048)links.push(url);}return links;}
 return Object.freeze({FORMAT,MAX_BYTES,MAX_TRIPS,normalize,backup,parseBackup,date,dayDate,entries,daily,mapLinks});
});


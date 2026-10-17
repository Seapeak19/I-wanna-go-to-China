(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravelBudget=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function amount(v){return typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1e8?v:null}
 function integer(v,fallback,min=0,max=365){return Number.isInteger(v)&&v>=min&&v<=max?v:fallback}
 const cents=n=>Math.round((n+Number.EPSILON)*100);
 function calculate(input){
  const people=integer(input.people,1,1,30),days=integer(input.days,1,1,30),rooms=integer(input.rooms,Math.ceil(people/2),0,30),nights=integer(input.nights,Math.max(0,days-1)),a=input.amounts||{},missing=[];
  function line(key,v,mult=1){const n=amount(v),known=mult===0||n!==null;if(!known)missing.push(key);return {key,known,value:known?cents((n||0)*mult)/100:0}}
  const stops=(input.stops||[]).map((s,i)=>{const quantity=integer(s.ticketCount,people,0,10000),ticket=line('ticket:'+i,s.ticketPrice,quantity);return {quantity,ticket,total:ticket.value}});
  const tickets={key:'tickets',known:stops.every(s=>s.ticket.known),value:stops.reduce((sum,s)=>sum+cents(s.total),0)/100};
  const manualMeals=line('meals',a.mealDaily,people*days);
  const foodStops=normalizeFoods(input.foodStops).map(s=>{const quantity=integer(s.people,null,1,30)??people,visits=integer(s.visits,1,1,100),cost=s.enabled?line('food:'+s.id,s.priceCNY,quantity*visits):{key:'food:'+s.id,known:true,value:0};return {...s,quantity,visits,cost}});
  const guideMeals={known:foodStops.every(s=>s.cost.known),value:foodStops.reduce((sum,s)=>sum+cents(s.cost.value),0)/100};
  const meals={key:'meals',known:manualMeals.known&&guideMeals.known,value:(cents(manualMeals.value)+cents(guideMeals.value))/100};
  const lines=[tickets,line('hotel',a.roomRate,rooms*nights),meals,line('transit',a.transitDaily,people*days),line('charter',a.charterCost),line('intercity',a.intercityCost),line('longTransport',a.longTransport),line('extra',a.extraCost)];
  const total=lines.reduce((s,l)=>s+cents(l.value),0)/100;
  return {people,days,rooms,nights,stops,lines,total,perPerson:total/people,perPersonDay:total/people/days,hotelPerPersonNight:nights?lines[1].value/people/nights:0,hotelPerPersonDay:lines[1].value/people/days,missing,complete:missing.length===0,dining:{manual:manualMeals,guide:guideMeals,stops:foodStops,total:meals.value,known:meals.known,perPerson:meals.value/people,perPersonDay:meals.value/people/days}};
 }
 function normalizeFoods(values){return(Array.isArray(values)?values:[]).filter(s=>s&&typeof s.id==='string').filter((s,i,a)=>a.findIndex(x=>x.id===s.id)===i).map(s=>({id:s.id,enabled:s.enabled===true,priceCNY:amount(s.priceCNY),people:integer(s.people,null,1,30),visits:integer(s.visits,1,1,100)}))}
 function addFood(values,food,enabled=true){const list=normalizeFoods(values);if(!food||typeof food.id!=='string'||list.some(s=>s.id===food.id))return list;const p=food.priceCNY,price=p&&amount(p.low)!==null&&p.low===p.high?p.low:null;return [...list,{id:food.id,enabled:enabled===true,priceCNY:price,people:null,visits:1}]}
 function migrateExtras(stops,other){const extra=(stops||[]).reduce((s,p)=>s+cents(amount(p.siteExtra)||0),0)/100;return extra>0?(cents(amount(other)||0)+cents(extra))/100:amount(other)}
 return Object.freeze({calculate,amount,integer,migrateExtras,normalizeFoods,addFood});
});

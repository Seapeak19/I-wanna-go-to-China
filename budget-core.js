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
  const lines=[tickets,line('hotel',a.roomRate,rooms*nights),line('meals',a.mealDaily,people*days),line('transit',a.transitDaily,people*days),line('charter',a.charterCost),line('intercity',a.intercityCost),line('longTransport',a.longTransport),line('extra',a.extraCost)];
  const total=lines.reduce((s,l)=>s+cents(l.value),0)/100;
  return {people,days,rooms,nights,stops,lines,total,perPerson:total/people,perPersonDay:total/people/days,hotelPerPersonNight:nights?lines[1].value/people/nights:0,hotelPerPersonDay:lines[1].value/people/days,missing,complete:missing.length===0};
 }
 function migrateExtras(stops,other){const extra=(stops||[]).reduce((s,p)=>s+cents(amount(p.siteExtra)||0),0)/100;return extra>0?(cents(amount(other)||0)+cents(extra))/100:amount(other)}
 return Object.freeze({calculate,amount,integer,migrateExtras});
});

(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravelTickets=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const datePattern=/^\d{4}-\d{2}-\d{2}$/;
 function quote(destination,today=new Date().toISOString().slice(0,10)){
  const t=destination?.ticket;
  const pending={verified:false,reason:t?.note||'',expired:false};
  if(!t||t.status!=='verified')return pending;
  if(t.validUntil&&(!datePattern.test(t.validUntil)||today>t.validUntil))return {...pending,expired:true};
  if(t.validFrom&&(!datePattern.test(t.validFrom)||today<t.validFrom))return pending;
  if(!datePattern.test(t.checked||'')||!t.scope||!t.scopeEn||t.currency!=='CNY')return pending;
  try{if(new URL(t.sourceUrl).protocol!=='https:')return pending}catch{return pending}
  if(t.mode==='options'){
   if(!Array.isArray(t.options)||!t.options.length||t.options.some(o=>!o.label||!o.enLabel||!Number.isFinite(o.amount)||o.amount<0))return pending;
   const amounts=t.options.map(o=>o.amount);return {verified:true,multiple:true,min:Math.min(...amounts),max:Math.max(...amounts),free:amounts.every(n=>n===0)};
  }
  if(!Number.isFinite(t.amount)||t.amount<0)return pending;
  return {verified:true,multiple:false,min:t.amount,max:t.amount,free:t.amount===0};
 }
 function planTicket(destination,stop={},today){
  const current=Number.isFinite(stop.ticketPrice)&&stop.ticketPrice>=0?stop.ticketPrice:null;
  if(stop.ticketOrigin==='manual'||(!stop.ticketOrigin&&current!==null))return {ticketPrice:current,ticketOrigin:'manual',ticketOption:null};
  const q=quote(destination,today);
  if(!q.verified)return {ticketPrice:null,ticketOrigin:'pending',ticketOption:null};
  if(!q.multiple||q.free)return {ticketPrice:q.min,ticketOrigin:'auto',ticketOption:null};
  const index=stop.ticketOption;
  if(Number.isInteger(index)&&index>=0&&index<destination.ticket.options.length)return {ticketPrice:destination.ticket.options[index].amount,ticketOrigin:'auto',ticketOption:index};
  return {ticketPrice:null,ticketOrigin:'pending',ticketOption:null};
 }
 return Object.freeze({quote,planTicket});
});

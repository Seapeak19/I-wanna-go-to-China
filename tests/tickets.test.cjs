const {test}=require('node:test');
const assert=require('node:assert/strict');
const data=require('../data.json');
const {quote}=require('../ticket-core.js');
const get=id=>data.destinations.find(d=>d.id===id);
const day='2026-10-17';
test('admission audit preserves explicit unknowns and traceable confirmed scopes',()=>{
 const verified=data.destinations.filter(d=>d.ticket.status==='verified');
 assert.equal(verified.length,data.ticketAudit.verified);
 assert.equal(data.destinations.length,data.ticketAudit.entries);
 for(const d of data.destinations){
  assert.match(d.ticket.checked,/^\d{4}-\d{2}-\d{2}$/);
  if(d.ticket.status==='verified'){
   assert(quote(d,day).verified,d.id);assert(d.ticket.noteEn);assert(d.ticket.scopeEn);
   assert.equal(new URL(d.ticket.sourceUrl).protocol,'https:');
  }else{assert.equal(d.ticket.status,'unverified');assert.equal(d.ticket.amount,undefined);assert(!quote(d,day).verified)}
 }
 const audit=require('../research/ticket-audit-2026-10-16.json');
 assert.equal(audit.entries.length,data.destinations.length);
 for(const d of data.destinations)assert.deepEqual(audit.entries.find(a=>a.id===d.id),{id:d.id,name:d.name,region:d.region,...d.ticket});
});
test('free entry is distinct from unknown, historic guide text and budget estimates',()=>{
 assert.equal(quote(get('gd013'),day).free,true);
 assert.equal(quote(get('gd-dir-164'),day).free,true);
 assert.equal(quote(get('gd-dir-410'),day).min,25);
 assert.equal(quote(get('gd-dir-470'),day).min,98);
 assert(!quote(get('gd-dir-388'),day).verified);
 assert(!quote({guide:{complete:true,admission:'免费'},budget:0},day).verified);
 const base=get('gd002').ticket;
 for(const amount of [-1,'5',null,NaN])assert(!quote({ticket:{...base,amount}},day).verified);
 assert(!quote({ticket:{...base,sourceUrl:'http://example.com'}},day).verified);
});
test('dated tariffs expire and future policies never display as current prices',()=>{
 assert.equal(quote(get('gd006'),'2026-12-31').min,100);
 assert.equal(quote(get('gd006'),'2027-01-01').expired,true);
 assert(!quote({ticket:{...get('gd002').ticket,validFrom:'2027-01-01'}},day).verified);
});
test('separate parks and mixed free/paid venues retain their ranges and labels',()=>{
 const parks=quote(get('gd-dir-1'),day);assert.equal(parks.multiple,true);assert.equal(parks.min,100);assert.equal(parks.max,350);
 const mixed=quote(get('gd-dir-471'),day);assert.equal(mixed.min,0);assert.equal(mixed.max,25);assert.equal(mixed.free,false);
 const t=get('gd-dir-1').ticket;
 assert(!quote({ticket:{...t,options:[]}},day).verified);
 assert(!quote({ticket:{...t,options:[{label:'test',amount:10}]}},day).verified);
});

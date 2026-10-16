(function(root){
  'use strict';
  const euro={EUR:1,CNY:7.4993,USD:1.1208,GBP:0.84610,JPY:177.06,HKD:8.7953,SGD:1.4379,AUD:1.6218,CAD:1.5923,KRW:1508.48};
  const codes=['CNY','USD','EUR','GBP','JPY','HKD','SGD','AUD','CAD','KRW'];
  const snapshot={date:'2026-10-15',source:'European Central Bank',url:'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',rates:Object.fromEntries(codes.map(c=>[c,euro[c]/euro.CNY]))};
  function validRate(n){return Number.isFinite(n)&&n>0&&n<=1000000}
  function convert(cny,code,rates=snapshot.rates){if(!codes.includes(code)||!validRate(rates[code])||!Number.isFinite(cny))throw Error('Invalid currency or amount');return cny*rates[code]}
  function toCNY(value,code,rates=snapshot.rates){if(!codes.includes(code)||!validRate(rates[code])||!Number.isFinite(value)||value<0)throw Error('Invalid amount or currency');return value/rates[code]}
  function format(cny,code,lang='zh',rates=snapshot.rates){return new Intl.NumberFormat(lang==='en'?'en-US':'zh-CN',{style:'currency',currency:code,currencyDisplay:'code',maximumFractionDigits:['JPY','KRW'].includes(code)?0:2}).format(convert(cny,code,rates))}
  const api={codes,snapshot,validRate,convert,toCNY,format};root.TravelMoney=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

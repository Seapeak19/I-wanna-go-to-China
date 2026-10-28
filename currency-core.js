(function(root){
  'use strict';
  const euro={"EUR":1,"CNY":7.4343,"USD":1.115,"GBP":0.83658,"JPY":175.97,"HKD":8.7466,"SGD":1.4285,"AUD":1.5856,"CAD":1.5636,"KRW":1480.44};
  const codes=['CNY','USD','EUR','GBP','JPY','HKD','SGD','AUD','CAD','KRW','RUB','MOP','TWD'];
  const snapshot={date:'2026-10-27',source:'European Central Bank',url:'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',rates:Object.fromEntries(codes.map(c=>[c,c==='RUB'?12.0677:c==='MOP'?euro.HKD/euro.CNY*1.03:c==='TWD'?4.8759999999999994:euro[c]/euro.CNY]))};
  const rubReference={"date":"2026-10-28","source":"Bank of Russia","url":"https://www.cbr.ru/scripts/XML_daily.asp?date_req=28/10/2026","nominal":1,"value":12.0677,"rate":12.0677};
  function reference(code){return code==='RUB'?rubReference:code==='MOP'?{date:snapshot.date,source:'AMCM / ECB cross rate',url:'https://www.amcm.gov.mo/en/currency/currency-in-circulation-in-macao/coins/currency-in-circulation-in-macao',peg:1.03,baseCurrency:'HKD',baseSourceUrl:snapshot.url}:code==='TWD'?{"date":"2026-10-27","observedAt":"2026-10-27 07:51","source":"Bank of Taiwan / calculated midpoint","url":"https://rate.bot.com.tw/xrt?Lang=zh-TW","buy":4.846,"sell":4.906,"rate":4.8759999999999994}:snapshot}
  function validRate(n){return Number.isFinite(n)&&n>0&&n<=1000000}
  function convert(cny,code,rates=snapshot.rates){if(!codes.includes(code)||!validRate(rates[code])||!Number.isFinite(cny))throw Error('Invalid currency or amount');return cny*rates[code]}
  function toCNY(value,code,rates=snapshot.rates){if(!codes.includes(code)||!validRate(rates[code])||!Number.isFinite(value)||value<0)throw Error('Invalid amount or currency');return value/rates[code]}
  function formatNative(value,code,lang='zh'){return new Intl.NumberFormat(lang==='en'?'en-US':lang==='zh'?'zh-CN':lang,{style:'currency',currency:code,currencyDisplay:'code',maximumFractionDigits:['JPY','KRW'].includes(code)?0:2}).format(value)}
  function format(cny,code,lang='zh',rates=snapshot.rates){return formatNative(convert(cny,code,rates),code,lang)}
  const api={codes,snapshot,reference,validRate,convert,toCNY,format,formatNative};root.TravelMoney=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

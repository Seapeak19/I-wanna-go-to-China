(function(root){
  'use strict';
  const euro={"EUR":1,"CNY":7.466,"USD":1.1193,"GBP":0.83728,"JPY":175.51,"HKD":8.7793,"SGD":1.431,"AUD":1.5939,"CAD":1.5665,"KRW":1482.46};
  const codes=['CNY','USD','EUR','GBP','JPY','HKD','SGD','AUD','CAD','KRW','RUB','MOP','TWD'];
  const snapshot={date:'2026-10-23',source:'European Central Bank',url:'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',rates:Object.fromEntries(codes.map(c=>[c,c==='RUB'?12.0557:c==='MOP'?euro.HKD/euro.CNY*1.03:c==='TWD'?4.875:euro[c]/euro.CNY]))};
  const rubReference={"date":"2026-10-24","source":"Bank of Russia","url":"https://www.cbr.ru/scripts/XML_daily.asp?date_req=24/10/2026","nominal":1,"value":12.0557,"rate":12.0557};
  function reference(code){return code==='RUB'?rubReference:code==='MOP'?{date:snapshot.date,source:'AMCM / ECB cross rate',url:'https://www.amcm.gov.mo/en/currency/currency-in-circulation-in-macao/coins/currency-in-circulation-in-macao',peg:1.03,baseCurrency:'HKD',baseSourceUrl:snapshot.url}:code==='TWD'?{"date":"2026-10-26","businessDate":"2026-10-23","observedAt":"2026-10-26 19:45","source":"Bank of Taiwan / calculated midpoint","url":"https://rate.bot.com.tw/xrt?Lang=zh-TW","buy":4.845,"sell":4.905,"rate":4.875}:snapshot}
  function validRate(n){return Number.isFinite(n)&&n>0&&n<=1000000}
  function convert(cny,code,rates=snapshot.rates){if(!codes.includes(code)||!validRate(rates[code])||!Number.isFinite(cny))throw Error('Invalid currency or amount');return cny*rates[code]}
  function toCNY(value,code,rates=snapshot.rates){if(!codes.includes(code)||!validRate(rates[code])||!Number.isFinite(value)||value<0)throw Error('Invalid amount or currency');return value/rates[code]}
  function formatNative(value,code,lang='zh'){return new Intl.NumberFormat(lang==='en'?'en-US':lang==='zh'?'zh-CN':lang,{style:'currency',currency:code,currencyDisplay:'code',maximumFractionDigits:['JPY','KRW'].includes(code)?0:2}).format(value)}
  function format(cny,code,lang='zh',rates=snapshot.rates){return formatNative(convert(cny,code,rates),code,lang)}
  const api={codes,snapshot,reference,validRate,convert,toCNY,format,formatNative};root.TravelMoney=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

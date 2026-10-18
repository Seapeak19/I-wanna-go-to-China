(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.TravelI18n=api})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const languages=[
  {code:'zh',locale:'zh-CN',name:'简体中文',currencies:['CNY','SGD']},
  {code:'zh-Hant',locale:'zh-Hant',name:'繁體中文',currencies:['HKD','MOP','TWD']},
  {code:'en',locale:'en-US',name:'English',currencies:['USD','GBP','AUD','CAD','SGD']},
  {code:'ja',locale:'ja-JP',name:'日本語',currencies:['JPY']},
  {code:'ko',locale:'ko-KR',name:'한국어',currencies:['KRW']},
  {code:'fr',locale:'fr-FR',name:'Français',currencies:['EUR','CAD']},
  {code:'de',locale:'de-DE',name:'Deutsch',currencies:['EUR']},
  {code:'es',locale:'es-ES',name:'Español',currencies:['EUR','USD']},
  {code:'it',locale:'it-IT',name:'Italiano',currencies:['EUR']},
  {code:'pt',locale:'pt-PT',name:'Português',currencies:['EUR']},
  {code:'nl',locale:'nl-NL',name:'Nederlands',currencies:['EUR']},
  {code:'ru',locale:'ru-RU',name:'Русский',currencies:['RUB']}
 ];
 const codes=languages.map(l=>l.code),chinese=lang=>lang==='zh'||lang==='zh-Hant';
 function normalize(value){if(codes.includes(value))return value;const code=String(value||'').toLowerCase();if(/^zh-(tw|hk|mo|hant)/.test(code))return'zh-Hant';if(code.startsWith('zh'))return'zh';return codes.find(c=>code===c||code.startsWith(c+'-'))||'en'}
 function locale(lang){return languages.find(l=>l.code===lang)?.locale||'en-US'}
 const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 let compiled=null;
 function patterns(){if(!compiled)compiled=(root.TRAVEL_TRANSLATIONS?.patterns||[]).filter(p=>p.parts.some(s=>/[A-Za-z]/.test(s))).map(p=>({...p,re:new RegExp('^'+p.parts.map(escapeRE).join('([\\s\\S]*?)')+'$')}));return compiled}
 function traditional(value){const text=String(value??''),pack=root.TRAVEL_TRANSLATIONS||{};return pack.traditional?.[text]??[...text].map(c=>pack.characters?.[c]??c).join('')}
 function translate(value,lang){const text=String(value??'');if(lang==='zh'||lang==='en')return text;if(lang==='zh-Hant')return traditional(text);const dict=root.TRAVEL_TRANSLATIONS?.messages?.[lang]||{};if(Object.hasOwn(dict,text))return dict[text];for(const p of patterns()){const target=dict[p.key];if(!target||target===p.key)continue;const match=p.re.exec(text);if(match)return target.replace(/ZXQ(\d+)XZ/g,(_,i)=>match[Number(i)+1]??'')}return text}
 function resolve(zh,en,lang){return chinese(lang)?(lang==='zh-Hant'?traditional(zh):zh):translate(en,lang)}
 function field(o,key,lang){return chinese(lang)?(lang==='zh-Hant'?traditional(o?.[key]):o?.[key]):translate(o?.en?.[key]??o?.[key]??'',lang)}
 function localizeDom(container,lang){if(lang==='zh'||lang==='en')return;const doc=container.ownerDocument,skip='script,style,#language,.original-name,[lang="zh-CN"],input,textarea';const walk=doc.createTreeWalker(container,4);while(walk.nextNode()){const n=walk.currentNode;if(n.parentElement?.closest(skip)||!n.nodeValue.trim())continue;const value=translate(n.nodeValue,lang);if(value!==n.nodeValue)n.nodeValue=value}for(const el of container.querySelectorAll('[aria-label],[alt],[title]')){if(el.closest('#language'))continue;for(const attr of ['aria-label','alt','title'])if(el.hasAttribute(attr)){const before=el.getAttribute(attr),value=translate(before,lang);if(value!==before)el.setAttribute(attr,value)}}}
 return Object.freeze({languages,codes,chinese,normalize,locale,translate,traditional,resolve,field,localizeDom});
});

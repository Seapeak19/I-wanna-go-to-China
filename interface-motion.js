// Motion enhances navigation; it never owns navigation or budget state.
const body = document.body;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const precise = matchMedia('(hover: hover) and (pointer: fine)');
const toggle = document.querySelector('#motionToggle');
const hero = document.querySelector('.card-intro');
let preference = true;
try { preference = localStorage.getItem('china-interface-motion') !== 'off'; } catch {}
let activeCard = null, frame = 0, latestPointer = null;
const entrances = new Set();
const enabled = () => preference && !reduced.matches;
const copy = {
  'zh-Hant': ['想去哪裡？', '開始探索', '動效'],
  en: ['Where to next?', 'Start exploring', 'Motion'],
  ja: ['次はどこへ？', '探索を始める', 'アニメーション'],
  ko: ['다음은 어디로?', '둘러보기', '애니메이션'],
  fr: ['Où aller ensuite ?', 'Explorer', 'Animations'],
  de: ['Wohin als Nächstes?', 'Entdecken', 'Animationen'],
  es: ['¿Adónde vamos?', 'Explorar', 'Animaciones'],
  it: ['Quale sarà la prossima meta?', 'Esplora', 'Animazioni'],
  pt: ['Qual é o próximo destino?', 'Explorar', 'Animações'],
  nl: ['Waar ga je naartoe?', 'Ontdekken', 'Animaties'],
  ru: ['Куда отправимся дальше?', 'Начать путешествие', 'Анимация']
};
const sceneCopy = {
  'zh-Hant': ['沿著江岸，讀懂城市的晝與夜。', '山城夜景與街巷煙火。', '走進徽州，慢看村落與山水。'],
  en: ['Discover the city by the river, from day to night.', 'Hillside nights and lively local streets.', 'Slow down among Huizhou villages and landscapes.'],
  ja: ['川沿いで街の昼と夜に出会う。', '山の街の夜景と路地のにぎわい。', '徽州の村々と山水をゆっくり巡る。'],
  ko: ['강변을 따라 도시의 낮과 밤을 만나보세요.', '산악 도시의 야경과 활기찬 골목.', '후이저우의 마을과 산수를 천천히 둘러보세요.'],
  fr: ['Découvrez la ville au fil du fleuve, du jour à la nuit.', 'Nuits à flanc de colline et ruelles animées.', 'Prenez le temps de découvrir les villages et paysages du Huizhou.'],
  de: ['Entdecke die Stadt am Fluss, bei Tag und bei Nacht.', 'Nächtliche Hügel und lebendige Gassen.', 'Entdecke in Ruhe die Dörfer und Landschaften von Huizhou.'],
  es: ['Descubre la ciudad junto al río, de día y de noche.', 'Noches entre colinas y callejuelas llenas de vida.', 'Recorre sin prisa los pueblos y paisajes de Huizhou.'],
  it: ['Scopri la città lungo il fiume, di giorno e di notte.', 'Notti tra le colline e vicoli pieni di vita.', 'Esplora con calma i villaggi e i paesaggi di Huizhou.'],
  pt: ['Descubra a cidade junto ao rio, de dia e de noite.', 'Noites nas colinas e ruas cheias de vida.', 'Explore sem pressa as aldeias e paisagens de Huizhou.'],
  nl: ['Ontdek de stad aan de rivier, overdag en in de avond.', 'Avonden op de heuvels en levendige straatjes.', 'Ontdek op je gemak de dorpen en landschappen van Huizhou.'],
  ru: ['Откройте город у реки — днём и ночью.', 'Огни горного города и оживлённые улочки.', 'Неспешно исследуйте деревни и пейзажи Хуэйчжоу.']
};
const islandCopy={"山河很大，":["山河很大，","A world awaits.","山河は広い。","넓은 세상,","Le monde s’ouvre.","Die Welt ist weit.","Un mundo espera.","Un mondo ti aspetta.","Um mundo espera.","De wereld wacht.","Мир ждёт."],"去你想去。":["去你想去。","Go your way.","心の向く方へ。","마음 가는 곳으로.","Suivez vos envies.","Geh deinen Weg.","Sigue tu camino.","Segui la tua strada.","Siga o seu caminho.","Volg jouw weg.","В путь по-своему."],"从一处心动的风景，到一段属于你的行程。":["從一處心動的風景，到一段屬於你的行程。","From a place you love to a journey of your own.","心ひかれる風景から、自分だけの旅へ。","마음에 드는 풍경에서 나만의 여행으로.","D’un paysage aimé à un voyage à vous.","Vom Lieblingsort zur eigenen Reise.","De un paisaje que inspira a tu propio viaje.","Da un luogo amato a un viaggio tutto tuo.","De uma paisagem especial à sua viagem.","Van een mooie plek naar jouw eigen reis.","От любимого пейзажа — к своему путешествию."],"下一站，从哪里开始？":["下一站，從哪裡開始？","Where will you begin?","次の旅は、どこから？","어디에서 시작할까요?","Par où commencer ?","Wo beginnt deine Reise?","¿Por dónde empezar?","Da dove iniziare?","Por onde começar?","Waar begin je?","С чего начнём?"],"34 个省级行政区，选择城市，直接探索景点。":["34 個省級行政區，選擇城市，直接探索景點。","Explore 34 provincial-level regions, choose a city and discover its attractions.","34の省級行政区から都市を選び、観光スポットへ。","34개 성급 행정구에서 도시를 선택하고 명소를 바로 둘러보세요.","Explorez 34 régions, choisissez une ville et découvrez ses sites.","34 Regionen: Stadt wählen und Sehenswürdigkeiten entdecken.","Explora 34 regiones, elige una ciudad y descubre sus lugares.","Esplora 34 regioni, scegli una città e scopri le sue attrazioni.","Explore 34 regiões, escolha uma cidade e descubra as atrações.","Ontdek 34 regio’s, kies een stad en bekijk de bezienswaardigheden.","Выберите город в одном из 34 регионов и откройте его достопримечательности."],"实景来源：携程 · 拍摄日期未核实":["實景來源：攜程 · 拍攝日期未核實","Real photos: Trip.com · Capture dates unverified","実景：Trip.com · 撮影日未確認","실경: Trip.com · 촬영일 미확인","Photos : Trip.com · Dates non vérifiées","Fotos: Trip.com · Aufnahmedaten ungeprüft","Fotos: Trip.com · Fechas sin verificar","Foto: Trip.com · Date non verificate","Fotos: Trip.com · Datas não verificadas","Foto’s: Trip.com · Datums niet geverifieerd","Фото: Trip.com · Даты съёмки не проверены"]};
Object.assign(islandCopy,{"安徽 · 黄山 · 宏村":["安徽 · 黃山 · 宏村","Anhui · Huangshan · Hongcun","安徽 · 黄山 · 宏村","안후이 · 황산 · 훙춘","Anhui · Huangshan · Hongcun","Anhui · Huangshan · Hongcun","Anhui · Huangshan · Hongcun","Anhui · Huangshan · Hongcun","Anhui · Huangshan · Hongcun","Anhui · Huangshan · Hongcun","Аньхой · Хуаншань · Хунцунь"],"重庆 · 洪崖洞":["重慶 · 洪崖洞","Chongqing · Hongyadong","重慶 · 洪崖洞","충칭 · 훙야둥","Chongqing · Hongyadong","Chongqing · Hongyadong","Chongqing · Hongyadong","Chongqing · Hongyadong","Chongqing · Hongyadong","Chongqing · Hongyadong","Чунцин · Хунъядун"],"上海 · 外滩":["上海 · 外灘","Shanghai · The Bund","上海 · 外灘","상하이 · 와이탄","Shanghai · Le Bund","Shanghai · Bund","Shanghái · El Bund","Shanghai · Bund","Xangai · Bund","Shanghai · Bund","Шанхай · Вайтань"],"图片来源 ↗":["圖片來源 ↗","Photo source ↗","写真の出典 ↗","사진 출처 ↗","Source photo ↗","Bildquelle ↗","Fuente de foto ↗","Fonte foto ↗","Fonte da foto ↗","Fotobron ↗","Источник фото ↗"]});
const islandLanguages=['zh-Hant','en','ja','ko','fr','de','es','it','pt','nl','ru'];
export function interfaceText(original, lang) {
  if(islandCopy[original.trim()]) return islandCopy[original.trim()][islandLanguages.indexOf(lang)];
  const index = ['想去哪里？', '开始探索', '动效'].indexOf(original.trim());
  if (index >= 0) return copy[lang]?.[index];
  const sceneIndex = ['沿着江岸，读懂城市的昼与夜。', '山城夜景与街巷烟火。', '走进徽州，慢看村落与山水。'].indexOf(original.trim());
  return sceneIndex >= 0 ? sceneCopy[lang]?.[sceneIndex] : undefined;
}

function clearPointer() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (activeCard) {
    activeCard.classList.remove('is-tilting');
    for (const key of ['--tilt-x', '--tilt-y', '--shine-x', '--shine-y']) activeCard.style.removeProperty(key);
  }
  activeCard = null;
}
function syncMotion() {
  body.dataset.motion = enabled() ? 'on' : 'off';
  toggle?.setAttribute('aria-pressed', String(enabled()));
  // The OS setting is always honored, even if a previous visit enabled effects.
  if (toggle) toggle.disabled = reduced.matches;
  if (!enabled()) {
    clearPointer();
    for (const animation of entrances) animation.cancel();
    entrances.clear();
  }
}
toggle?.addEventListener('click', () => {
  preference = !preference;
  try { localStorage.setItem('china-interface-motion', preference ? 'on' : 'off'); } catch {}
  syncMotion();
});
reduced.addEventListener('change', syncMotion);
precise.addEventListener('change', clearPointer);
syncMotion();

// Run the ambient scene only while visible. No render loop or WebGL download.
if (hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    hero.classList.toggle('scene-visible', entry.isIntersecting);
    body.classList.toggle('hero-in-view', entry.isIntersecting);
  }).observe(hero);
}
document.addEventListener('visibilitychange', () => {
  body.classList.toggle('page-asleep', document.hidden);
  if (document.hidden) clearPointer();
});

document.addEventListener('pointermove', event => {
  if (!enabled() || !precise.matches || event.pointerType === 'touch') return;
  const card = event.target.closest('.destination-card');
  if (!card) { if (activeCard) clearPointer(); return; }
  if (card !== activeCard) { clearPointer(); activeCard = card; }
  latestPointer = { x: event.clientX, y: event.clientY };
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (!activeCard?.isConnected) return;
    const rect = activeCard.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (latestPointer.x - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (latestPointer.y - rect.top) / rect.height));
    activeCard.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`);
    activeCard.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`);
    activeCard.style.setProperty('--shine-x', `${x * 100}%`);
    activeCard.style.setProperty('--shine-y', `${y * 100}%`);
    activeCard.classList.add('is-tilting');
  });
}, { passive: true });
window.addEventListener('blur', clearPointer);
document.documentElement.addEventListener('pointerleave', clearPointer);
window.addEventListener('scroll', clearPointer, { passive: true });

export function animateDeck(root) {
  clearPointer();
  for (const animation of entrances) animation.cancel();
  entrances.clear();
  if (!enabled() || !root.animate) return;
  // Only animate visible cards, with a bounded stagger even in a large directory.
  for (const [i, card] of [...root.children].filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.top < innerHeight && rect.bottom > 0;
  }).slice(0, 12).entries()) {
    const animation = card.animate([
      { opacity: 0, transform: 'perspective(1000px) translateY(28px) rotateX(5deg) scale(.97)' },
      { opacity: 1, transform: 'perspective(1000px) translateY(0) rotateX(0) scale(1)' }
    ], { duration: 540, delay: i * 45, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    entrances.add(animation);
    animation.finished.catch(() => {}).finally(() => entrances.delete(animation));
  }
}

document.querySelector('.explore-launch')?.addEventListener('click', event => {
  event.preventDefault();
  const deck = document.querySelector('#destinationDeck');
  deck.scrollIntoView({ behavior: enabled() ? 'smooth' : 'instant', block: 'start' });
  const title = document.querySelector('#deckTitle');
  title.tabIndex = -1;
  title.focus({ preventScroll: true });
});

const additionalIslands=[{"area":"110000","label":"北京 · 故宫博物院","en":"Beijing · Palace Museum","image":"assets/bj-sight-229.jpg","source":"https://you.ctrip.com/sight/beijing1/229.html"},{"area":"510100","label":"成都 · 成都大熊猫繁育研究基地","en":"Chengdu · Chengdu Research Base of Giant Panda Breeding","image":"assets/sc-chengdu-sight-4229.jpg","source":"https://you.ctrip.com/sight/chengdu104/4229.html"},{"area":"320100","label":"南京 · 牛首山文化旅游区","en":"Nanjing · Niushou Mountain Cultural Tourism Zone","image":"assets/jz-nanjing-sight-18093.jpg","source":"https://you.ctrip.com/sight/nanjing9/18093.html"},{"area":"610100","label":"西安 · 西安博物院","en":"Xi’an · Xi'an Museum","image":"assets/ssas-xian-sight-52677.jpg","source":"https://you.ctrip.com/sight/xian7/52677.html"},{"area":"530100","label":"昆明 · 石林风景区","en":"Kunming · Stone Forest Scenic Area","image":"assets/yg-kunming-sight-44950.jpg","source":"https://you.ctrip.com/sight/shilin271/44950.html"},{"area":"350200","label":"厦门 · 鼓浪屿","en":"Xiamen · Kulangsu","image":"assets/jfh-xiamen-sight-57405.jpg","source":"https://you.ctrip.com/sight/xiamen21/57405.html"},{"area":"330100","label":"杭州 · 西溪国家湿地公园","en":"Hangzhou · Xixi National Wetland Park","image":"assets/jz-hangzhou-sight-25481.jpg","source":"https://you.ctrip.com/sight/hangzhou14/25481.html"},{"area":"810000","label":"香港 · 香港迪士尼乐园","en":"Hong Kong · Hong Kong Disneyland","image":"assets/hk-sight-22943.jpg","source":"https://you.ctrip.com/sight/hongkong38/22943.html"},{"area":"820000","label":"澳门 · 澳门旅游塔","en":"Macao · Macau Tower","image":"assets/mo-sight-136025.jpg","source":"https://you.ctrip.com/sight/macau39/136025.html"}];
additionalIslands.push(...[{"area":"120000","label":"天津 · 杨柳青古镇","en":"Tianjin · Yangliuqing Ancient Town","image":"assets/jh-tj-tianjin-sight-145540.jpg","source":"https://you.ctrip.com/sight/tianjin154/145540.html"},{"area":"230100","label":"哈尔滨 · 东北虎林园","en":"Harbin · Siberia Tiger Park","image":"assets/ne-hlj-harbin-sight-7707.jpg","source":"https://you.ctrip.com/sight/harbin151/7707.html"},{"area":"420100","label":"武汉 · 黄鹤楼","en":"Wuhan · Yellow Crane Tower","image":"assets/hh-wuhan-sight-8979.jpg","source":"https://you.ctrip.com/sight/wuhan145/8979.html"},{"area":"430100","label":"长沙 · 杜甫江阁","en":"Changsha · Du Fu Pavilion","image":"assets/hn-cs-sight-1415165.jpg","source":"https://you.ctrip.com/sight/changsha148/1415165.html"},{"area":"460200","label":"三亚 · 三亚南山文化旅游区","en":"Sanya · Sanya Nanshan Cultural Tourism Zone","image":"assets/jfh-sanya-sight-3227.jpg","source":"https://you.ctrip.com/sight/sanya61/3227.html"},{"area":"320500","label":"苏州 · 同里古镇","en":"Suzhou · Tongli Ancient Town","image":"assets/jz-suzhou-sight-115503.jpg","source":"https://you.ctrip.com/sight/suzhou11/115503.html"}]);
// Six independent destinations, reshuffled without repeating the visible cities.
const islandScene=document.querySelector('.island-scene');
if(islandScene){
 const cards=[...islandScene.querySelectorAll('.landscape-island')];
 const initial=cards.map(card=>({area:card.querySelector('button').dataset.mapArea,label:card.querySelector('.island-caption').textContent.trim(),image:card.querySelector('img').getAttribute('src'),source:card.querySelector('a').href}));
 initial[0].area='341000';
 additionalIslands.forEach(item=>{const short={'510100':'Chengdu · Panda Base','320100':'Nanjing · Niushou Mountain','530100':'Kunming · Stone Forest','330100':'Hangzhou · Xixi Wetland','810000':'Hong Kong · Disneyland','820000':'Macao · Tower'};item.en=short[item.area]||item.en;});
 const pool=[...initial,...additionalIslands];
 let current=pool.slice(0,6),busy=false;
 for(let i=3;i<6;i++){const card=cards[0].cloneNode(true);islandScene.insertBefore(card,islandScene.querySelector('.island-provenance'));cards.push(card);}
 cards.forEach((card,i)=>{card.className='landscape-island';card.style.setProperty('--island-angle',`${[-4,3,-2,3,-3,4][i]}deg`);});
 islandScene.classList.add('island-gallery');
 const bar=islandScene.querySelector('.island-refresh-bar'),refresh=document.querySelector('#refreshIslands'),status=document.querySelector('#islandRefreshStatus');bar.hidden=false;
 const ui={zh:['换一批城市','正在寻找新风景…','已换入 6 座城市','图片暂不可用，请重试'], 'zh-Hant':['換一批城市','正在尋找新風景…','已換入 6 座城市','圖片暫不可用，請重試'],en:['Shuffle cities','Finding new views…','6 new cities ready','Images unavailable. Try again.'],ja:['街を入れ替える','新しい風景を探しています…','6つの街を表示','画像を読み込めません。再試行してください。'],ko:['도시 새로 보기','새 풍경을 찾는 중…','새 도시 6곳','이미지를 불러올 수 없습니다. 다시 시도하세요.'],fr:['Changer de villes','Nouveaux paysages…','6 nouvelles villes','Images indisponibles. Réessayez.'],de:['Neue Städte','Neue Ansichten werden geladen…','6 neue Städte','Bilder nicht verfügbar. Erneut versuchen.'],es:['Cambiar ciudades','Buscando paisajes…','6 ciudades nuevas','Imágenes no disponibles. Reintenta.'],it:['Cambia città','Nuovi paesaggi…','6 nuove città','Immagini non disponibili. Riprova.'],pt:['Trocar cidades','Novas paisagens…','6 novas cidades','Imagens indisponíveis. Tente novamente.'],nl:['Andere steden','Nieuwe uitzichten…','6 nieuwe steden','Afbeeldingen niet beschikbaar. Probeer opnieuw.'],ru:['Новые города','Ищем новые виды…','6 новых городов','Фото недоступны. Повторите попытку.']};
 let message=-1;
 function display(){const lang=document.querySelector('#language').value,copy=ui[lang]||ui.en;refresh.querySelector('span').textContent=copy[0];refresh.setAttribute('aria-label',copy[0]);status.textContent=message<0?'':copy[message];
 cards.forEach((card,i)=>{const item=current[i],button=card.querySelector('button'),caption=card.querySelector('.island-caption');const label=lang==='zh'?item.label:interfaceText(item.label,lang)||(lang==='zh-Hant'?globalThis.TravelI18n?.translate(item.label,lang):globalThis.TravelI18n?.translate(item.en||item.label,lang))||item.en||item.label;caption.replaceChildren(document.createTextNode(label),caption.querySelector('svg'));button.dataset.mapArea=item.area;button.setAttribute('aria-label',label);const img=card.querySelector('img');img.src=item.image;img.alt=label;const source=card.querySelector('a');source.href=item.source;source.textContent=interfaceText('图片来源 ↗',lang)||'图片来源 ↗';});}
 function shuffled(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
 async function phase(enter){if(!enabled()||document.hidden)return;await Promise.all(cards.map(async(card,i)=>{const angle=card.style.getPropertyValue('--island-angle');const resting=`perspective(1100px) translate3d(0,0,0) rotate(${angle})`;const flight=`perspective(1100px) translate3d(${(i%3-1)*65}px,${enter?65:-45}px,-180px) rotateY(${enter?-72:80}deg) rotateZ(${enter?-12:12}deg) scale(.85)`;const a=card.animate(enter?[{transform:flight,opacity:.15,filter:'blur(4px)'},{transform:resting,opacity:1,filter:'blur(0px)'}]:[{transform:resting,opacity:1,filter:'blur(0px)'},{transform:flight,opacity:0,filter:'blur(3px)'}],{duration:enter?680:260,delay:i*35,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});await a.finished.catch(()=>{});if(enter)a.cancel();}));}
 refresh.addEventListener('click',async()=>{if(busy)return;busy=true;refresh.setAttribute('aria-disabled','true');islandScene.setAttribute('aria-busy','true');message=1;display();const target=shuffled(pool.filter(item=>!current.some(old=>old.area===item.area))).slice(0,6);
 try{const loaded=await Promise.all(target.map(item=>new Promise(resolve=>{const img=new Image(),timer=setTimeout(()=>resolve(false),8000);const done=ok=>{clearTimeout(timer);resolve(ok);};img.onload=()=>done(true);img.onerror=()=>done(false);img.src=item.image;if(img.complete)done(img.naturalWidth>0);})));if(loaded.some(ok=>!ok)){message=3;return;}await phase(false);cards.forEach(card=>card.getAnimations().forEach(a=>a.cancel()));current=target;message=2;display();await phase(true);
 }finally{busy=false;refresh.removeAttribute('aria-disabled');islandScene.removeAttribute('aria-busy');display();}});
 islandScene.addEventListener('click',event=>{if(busy&&event.target.closest('.landscape-island button')){event.preventDefault();event.stopPropagation();}},true);
 function settle(){if(!enabled()||document.hidden)cards.forEach(card=>card.getAnimations().forEach(a=>a.cancel()));}
 reduced.addEventListener('change',settle);toggle?.addEventListener('click',settle);document.addEventListener('visibilitychange',settle);
 document.addEventListener('travel:language',()=>queueMicrotask(display));document.querySelector('#language').addEventListener('change',()=>queueMicrotask(display));display();
}

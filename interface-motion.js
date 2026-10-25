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
const islandCopy={"山河很大，":["山河很大，","A world awaits.","山河は広い。","넓은 세상,","Le monde s’ouvre.","Die Welt ist weit.","Un mundo espera.","Un mondo ti aspetta.","Um mundo espera.","De wereld wacht.","Мир ждёт."],"去你想去。":["去你想去。","Go your way.","心の向く方へ。","마음 가는 곳으로.","Suivez vos envies.","Geh deinen Weg.","Sigue tu camino.","Segui la tua strada.","Siga o seu caminho.","Volg jouw weg.","В путь по-своему."],"从一处心动的风景，到一段属于你的行程。":["從一處心動的風景，到一段屬於你的行程。","From a place you love to a journey of your own.","心ひかれる風景から、自分だけの旅へ。","마음에 드는 풍경에서 나만의 여행으로.","D’un paysage aimé à un voyage à vous.","Vom Lieblingsort zur eigenen Reise.","De un paisaje que inspira a tu propio viaje.","Da un luogo amato a un viaggio tutto tuo.","De uma paisagem especial à sua viagem.","Van een mooie plek naar jouw eigen reis.","От любимого пейзажа — к своему путешествию."],"下一站，从哪里开始？":["下一站，從哪裡開始？","Where will you begin?","次の旅は、どこから？","어디에서 시작할까요?","Par où commencer ?","Wo beginnt deine Reise?","¿Por dónde empezar?","Da dove iniziare?","Por onde começar?","Waar begin je?","С чего начнём?"],"34 个省级行政区，逐级探索省份、城市与县区。":["34 個省級行政區，逐級探索省份、城市與縣區。","Explore 34 provincial-level regions, then their cities and counties.","34の省級行政区から、市や県へ。","34개 성급 행정구에서 도시와 현까지.","Explorez 34 régions, puis leurs villes et districts.","34 Regionen entdecken, dann Städte und Kreise.","Explora 34 regiones, sus ciudades y condados.","Esplora 34 regioni, poi città e contee.","Explore 34 regiões, suas cidades e distritos.","Ontdek 34 regio’s, hun steden en districten.","Исследуйте 34 региона, их города и уезды."],"实景来源：携程 · 拍摄日期未核实":["實景來源：攜程 · 拍攝日期未核實","Real photos: Trip.com · Capture dates unverified","実景：Trip.com · 撮影日未確認","실경: Trip.com · 촬영일 미확인","Photos : Trip.com · Dates non vérifiées","Fotos: Trip.com · Aufnahmedaten ungeprüft","Fotos: Trip.com · Fechas sin verificar","Foto: Trip.com · Date non verificate","Fotos: Trip.com · Datas não verificadas","Foto’s: Trip.com · Datums niet geverifieerd","Фото: Trip.com · Даты съёмки не проверены"]};
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

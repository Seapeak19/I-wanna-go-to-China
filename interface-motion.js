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
export function interfaceText(original, lang) {
  const index = ['想去哪里？', '开始探索', '动效'].indexOf(original.trim());
  return index >= 0 ? copy[lang]?.[index] : undefined;
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

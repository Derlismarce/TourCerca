/*! TourCerca · Proyecto final de la Licenciatura en Turismo · Desarrollado por Derlis Marcelo Fernández Rivas, 2026 · Todos los derechos reservados. Ver LICENSE. */
/* =====================================================================
   TourCerca · idiomas (español, inglés y portugués de Brasil)
   - tr('texto en español', {variables}) devuelve el texto en el idioma elegido
   - los textos fijos del HTML usan data-i18n="clave" (y data-i18n-ph,
     data-i18n-title, data-i18n-aria para placeholder, title y aria-label)
   - las traducciones están en js/i18n-textos.js
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.
   ===================================================================== */
const IDIOMAS = [
  {c:'es', n:'Español',   s:'ES', loc:'es-AR'},
  {c:'en', n:'English',   s:'EN', loc:'en-GB'},
  {c:'pt', n:'Português', s:'PT', loc:'pt-BR'},
];
const LANG_KEY = 'tourcerca.lang';
const I18N_REV = 0x444D;                 // revisión del formato de traducciones
const I18N = {es:{}, en:{}, pt:{}};

/* idioma inicial: el elegido antes o, la primera vez, el del celular / navegador */
let LANG = (()=>{
  try { const v = localStorage.getItem(LANG_KEY); if(IDIOMAS.some(x=>x.c === v)) return v; } catch(e){}
  const n = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return IDIOMAS.some(x=>x.c === n) ? n : 'es';
})();
const LOC = () => IDIOMAS.find(x=>x.c === LANG).loc;

/* traducir: si falta la traducción, queda en español (nunca se rompe) */
function tr(key, vars){
  let s = I18N[LANG][key] ?? I18N.es[key] ?? key;
  if(vars) s = s.replace(/\{(\w+)\}/g, (m, k)=> vars[k] ?? m);
  return s;
}
/* singular / plural */
const tn = (n, uno, varios, vars = {}) => tr(n === 1 ? uno : varios, {n, ...vars});
/* etiqueta que se retraduce sola al cambiar de idioma (para pantallas que no se redibujan) */
const Lt = k => `<span data-i18n="${esc(k)}">${tr(k)}</span>`;

function applyI18n(root = document){
  root.querySelectorAll('[data-i18n]').forEach(el=> el.innerHTML = tr(el.dataset.i18n));
  root.querySelectorAll('[data-i18n-ph]').forEach(el=> el.placeholder = tr(el.dataset.i18nPh));
  root.querySelectorAll('[data-i18n-title]').forEach(el=> el.title = tr(el.dataset.i18nTitle));
  root.querySelectorAll('[data-i18n-aria]').forEach(el=> el.setAttribute('aria-label', tr(el.dataset.i18nAria)));
}

const langSubs = [];
const onLang = f => langSubs.push(f);
function setLang(c){
  if(!IDIOMAS.some(x=>x.c === c) || c === LANG) return;
  LANG = c;
  try { localStorage.setItem(LANG_KEY, c); } catch(e){}
  document.documentElement.lang = c;
  applyI18n();
  pintarSelectores();
  langSubs.forEach(f=>{ try { f(); } catch(e){ console.error(e); } });
}

/* ---------- selector "🌐 ES ▾" (arriba a la derecha) ----------
   La lista desplegable se dibuja directamente sobre la página (fuera de la
   app), para que ningún aviso ni mapa la tape. */
let menuIdioma = null, btnAbierto = null;
function pintarSelectores(){
  const s = IDIOMAS.find(x=>x.c === LANG).s;
  document.querySelectorAll('.lang-btn').forEach(b=>{
    b.querySelector('.lang-cur').textContent = s;
    b.setAttribute('aria-label', tr('Idioma'));
  });
  if(menuIdioma) menuIdioma.querySelectorAll('[data-lang]').forEach(o=> o.classList.toggle('on', o.dataset.lang === LANG));
}
function cerrarMenuIdioma(){
  if(!menuIdioma) return;
  menuIdioma.classList.remove('open');
  if(btnAbierto){ btnAbierto.setAttribute('aria-expanded', false); btnAbierto.closest('.lang-sel')?.classList.remove('open'); }
  btnAbierto = null;
}
function abrirMenuIdioma(btn){
  const r = btn.getBoundingClientRect();
  menuIdioma.style.top = (r.bottom + 6) + 'px';
  menuIdioma.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
  menuIdioma.classList.add('open');
  btn.setAttribute('aria-expanded', true); btn.closest('.lang-sel')?.classList.add('open');
  btnAbierto = btn;
}
function montarSelectorIdioma(){
  if(!menuIdioma){
    menuIdioma = document.createElement('div');
    menuIdioma.className = 'lang-menu'; menuIdioma.setAttribute('role', 'menu');
    menuIdioma.innerHTML = IDIOMAS.map(x=>`<button type="button" role="menuitem" data-lang="${x.c}"><span class="ck">✓</span>${x.n}<small>${x.s}</small></button>`).join('');
    menuIdioma.onclick = e=>{
      const o = e.target.closest('[data-lang]'); if(!o) return;
      e.stopPropagation(); cerrarMenuIdioma(); setLang(o.dataset.lang);
    };
    document.body.appendChild(menuIdioma);
  }
  document.querySelectorAll('.lang-slot').forEach(slot=>{
    if(slot.querySelector('.lang-sel')) return;
    slot.innerHTML = `<div class="lang-sel"><button type="button" class="lang-btn" aria-haspopup="true" aria-expanded="false"><span class="glb">🌐</span><span class="lang-cur"></span><span class="car">▾</span></button></div>`;
    const btn = slot.querySelector('.lang-btn');
    btn.onclick = e=>{
      e.stopPropagation();
      const mismo = btnAbierto === btn;
      cerrarMenuIdioma();
      if(!mismo) abrirMenuIdioma(btn);
    };
  });
  pintarSelectores();
}
document.addEventListener('click', cerrarMenuIdioma);
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') cerrarMenuIdioma(); });
window.addEventListener('resize', cerrarMenuIdioma);
window.addEventListener('scroll', cerrarMenuIdioma, true);

/* al cargar cada página: idioma del documento, textos fijos y selector */
function iniciarIdioma(){
  document.documentElement.lang = LANG;
  applyI18n();
  montarSelectorIdioma();
}

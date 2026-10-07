/* =====================================================================
   TourCerca · capa de puntos de interés (V 3.9)
   - Lejos: solo los destacados; al acercar, todos (ver capaLugares).
   - Tocar un lugar: ficha (turista) o agregarlo como parada (editores).
   - Botón para mostrar u ocultar la capa (se recuerda en el navegador).
   Datos: js/lugares.js (Buenos Aires Data).
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.
   ===================================================================== */
const CATS_LUGAR = {
  monu:   {n:'Monumentos y edificios', u:'Monumento o lugar histórico', e:'🏛️'},
  teatro: {n:'Teatros',                u:'Teatro',                      e:'🎭'},
  museo:  {n:'Museos',                 u:'Museo',                       e:'🖼️'},
  estadio:{n:'Estadios',               u:'Estadio',                     e:'⚽'},
  iglesia:{n:'Iglesias',               u:'Iglesia',                     e:'⛪'},
  parque: {n:'Parques y plazas',       u:'Parque o plaza',              e:'🌳'},
  cafe:   {n:'Cafés notables',         u:'Café notable',                e:'☕'},
  tango:  {n:'Tango',                  u:'Milonga o tanguería',         e:'💃'},
};
const LUG = (typeof LUGARES === 'object' ? LUGARES : [])
  .map((a,i)=>({id:i, ll:[a[0], a[1]], n:a[2], cat:a[3], barrio:a[4], dir:a[5], dest:!!a[6]}));

/* mostrar u ocultar: preferencia de cada persona, guardada en el navegador */
const LUGARES_KEY = 'tourcerca.lugares';
function lugaresVisibles(){ try { return localStorage.getItem(LUGARES_KEY) !== '0'; } catch(e){ return true; } }
function setLugaresVisibles(v){ try { localStorage.setItem(LUGARES_KEY, v ? '1' : '0'); } catch(e){} }

/* distancia en metros de un punto a una línea (aproximación plana, alcanza para la Ciudad) */
function distALinea(ll, pts){
  const kx = 111320 * Math.cos(ll[0] * Math.PI / 180), ky = 111320;
  let m = Infinity;
  for(let i = 0; i < pts.length; i++){
    const ax = (pts[i][1] - ll[1]) * kx, ay = (pts[i][0] - ll[0]) * ky;
    if(i === 0 || pts.length === 1){ m = Math.min(m, Math.hypot(ax, ay)); continue; }
    const bx = (pts[i-1][1] - ll[1]) * kx, by = (pts[i-1][0] - ll[0]) * ky;
    const dx = ax - bx, dy = ay - by, L2 = dx*dx + dy*dy;
    const u = L2 ? Math.max(0, Math.min(1, -(bx*dx + by*dy) / L2)) : 0;
    m = Math.min(m, Math.hypot(bx + u*dx, by + u*dy));
  }
  return m;
}
/* ¿el recorrido del tour pasa por el lugar? (a menos de 80 m del camino) */
const pasaPor = (t, l) => distALinea(l.ll, lineaTour(t)) <= 80;

/* V 3.12 (tanda 2): de lejos solo los destacados, para que los tours sean lo principal.
   zoom <= 15: puntitos de los ~23 destacados (suaves)
   zoom 16:    puntitos de todos (más chicos) + íconos de los destacados
   zoom >= 17: íconos de todos los que se ven
   V 3.13: los íconos van SIN nombre; el nombre aparece al tocar (ficha), al pasar el
   mouse, y en los lugares a menos de 150 m de la ubicación del usuario (cerca()).
   Los lugares van en capas propias por DEBAJO de los tours y de su recorrido. */
const RADIO_NOMBRES = 150;     // metros
function capaLugares(map, {onClick, cerca} = {}){
  if(!map.getPane('lugares')){ map.createPane('lugares').style.zIndex = 390; }            // debajo de los recorridos (400+)
  if(!map.getPane('lugaresIconos')){ map.createPane('lugaresIconos').style.zIndex = 580; } // debajo de los pines de tours (600)
  const renderer = L.canvas({padding:.3, pane:'lugares'});
  const clic = l => onClick && onClick(l);
  const punto = (l, r, op) => L.circleMarker(l.ll, {renderer, pane:'lugares', radius:r, color:'#fff', weight:1.2, fillColor:'#1D9E75', fillOpacity:op, bubblingMouseEvents:false})
    .bindTooltip(esc(l.n), {direction:'top', offset:[0,-4]}).on('click', ()=>clic(l));
  const puntosDest = L.layerGroup(LUG.filter(l=>l.dest).map(l=>punto(l, 4.5, .8)));
  const puntosTodos = L.layerGroup(LUG.filter(l=>!l.dest).map(l=>punto(l, 3, .55)));
  const iconos = L.layerGroup();
  let visible = false;
  const icono = (l, nombre) => L.divIcon({className:'', iconSize:[28,28], iconAnchor:[14,14],
    html:`<div class="poi ${l.dest ? 'dest' : ''}"><span class="pi">${CATS_LUGAR[l.cat].e}</span>${nombre ? `<span class="pn">${esc(l.n)}</span>` : ''}</div>`});
  const poner = (capa, si) => { if(si && !map.hasLayer(capa)) capa.addTo(map); if(!si && map.hasLayer(capa)) map.removeLayer(capa); };
  function dibujar(){
    if(!visible) return;
    const z = map.getZoom(), b = map.getBounds().pad(.25);
    poner(puntosDest, z <= 15);
    poner(puntosTodos, z === 16);
    poner(iconos, z >= 16);
    iconos.clearLayers();
    if(z < 16) return;
    const yo = cerca && cerca();
    for(const l of LUG){
      if(z === 16 && !l.dest) continue;                  // en 16, los demás quedan como puntitos
      if(!b.contains(l.ll)) continue;
      const conNombre = !!yo && distM(yo, l.ll) <= RADIO_NOMBRES;
      const m = L.marker(l.ll, {pane:'lugaresIconos', icon:icono(l, conNombre), keyboard:false, title:l.n}).on('click', ()=>clic(l));
      if(!conNombre) m.bindTooltip(esc(l.n), {direction:'top', offset:[0,-14]});   // nombre al pasar el mouse
      iconos.addLayer(m);
    }
  }
  map.on('zoomend moveend', dibujar);
  return {
    mostrar(v){
      visible = !!v;
      if(visible) dibujar(); else [puntosDest, puntosTodos, iconos].forEach(c=>poner(c, false));
    },
    get visible(){ return visible; },
    redibujar(){ if(visible){ iconos.clearLayers(); dibujar(); } },
    /* con un tour abierto, los lugares se ven más suaves para que resalte el recorrido */
    atenuar(si){ ['lugares','lugaresIconos'].forEach(p=> map.getPane(p).style.opacity = si ? .45 : ''); },
  };
}

/* botón "mostrar u ocultar lugares" (mismo estado en todas las pantallas) */
function botonLugares(btn, capa, alCambiar){
  const pintar = () => { btn.classList.toggle('on', capa.visible); btn.title = capa.visible ? tr('Ocultar lugares de interés') : tr('Mostrar lugares de interés'); btn.setAttribute('aria-label', btn.title); btn.setAttribute('aria-pressed', capa.visible); };
  btn.onclick = e=>{
    e.stopPropagation();
    capa.mostrar(!capa.visible); setLugaresVisibles(capa.visible); pintar();
    if(alCambiar) alCambiar(capa.visible);
  };
  capa.mostrar(lugaresVisibles()); pintar();
  onLang(()=>{ if(btn.isConnected){ pintar(); capa.redibujar(); } });
}

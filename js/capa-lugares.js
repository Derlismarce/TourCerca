/* =====================================================================
   TourCerca · capa de puntos de interés (V 3.9)
   - Lejos (zoom < 16): puntitos verde agua, todos los lugares.
   - Cerca (zoom 16+): ícono según el tipo; los destacados con el nombre,
     y desde zoom 17 todos con el nombre.
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

function capaLugares(map, {onClick, zoomIconos = 16} = {}){
  const renderer = L.canvas({padding:.3});
  const clic = l => onClick && onClick(l);
  const puntos = L.layerGroup(LUG.map(l=>
    L.circleMarker(l.ll, {renderer, radius:l.dest ? 5 : 3.5, color:'#fff', weight:1.5, fillColor:'#1D9E75', fillOpacity:.95, bubblingMouseEvents:false})
      .bindTooltip(esc(l.n), {direction:'top', offset:[0,-4]}).on('click', ()=>clic(l))));
  const iconos = L.layerGroup();
  let visible = false;
  const icono = (l, nombre) => L.divIcon({className:'', iconSize:[28,28], iconAnchor:[14,14],
    html:`<div class="poi ${l.dest ? 'dest' : ''}"><span class="pi">${CATS_LUGAR[l.cat].e}</span>${nombre ? `<span class="pn">${esc(l.n)}</span>` : ''}</div>`});
  function dibujar(){
    if(!visible) return;
    if(map.getZoom() < zoomIconos){
      if(map.hasLayer(iconos)) map.removeLayer(iconos);
      if(!map.hasLayer(puntos)) puntos.addTo(map);
      return;
    }
    if(map.hasLayer(puntos)) map.removeLayer(puntos);
    if(!map.hasLayer(iconos)) iconos.addTo(map);
    const b = map.getBounds().pad(.25), todos = map.getZoom() >= 17;
    iconos.clearLayers();
    for(const l of LUG){
      if(!b.contains(l.ll)) continue;
      iconos.addLayer(L.marker(l.ll, {icon:icono(l, todos || l.dest), zIndexOffset:l.dest ? -500 : -1000, keyboard:false, title:l.n})
        .on('click', ()=>clic(l)));
    }
  }
  map.on('zoomend moveend', dibujar);
  return {
    mostrar(v){
      visible = !!v;
      if(visible) dibujar(); else { map.removeLayer(puntos); map.removeLayer(iconos); }
    },
    get visible(){ return visible; },
    redibujar(){ if(visible){ iconos.clearLayers(); dibujar(); } },
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

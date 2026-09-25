/* =====================================================================
   TourCerca · código compartido entre la vista cliente (index.html)
   y el panel del guía (guia.html)
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.
   ===================================================================== */

/* ---------- versión ---------- */
const VERSION = '2.2';
const COPYRIGHT = '© 2026 Derlis Marcelo Fernandez Rivas · Todos los derechos reservados';
const CHANGELOG = [
  {v:'2.2', f:'2026-09-25', items:[
    'Mapa sin las líneas blancas entre los mosaicos en pantallas con escala distinta de 100 %.',
  ]},
  {v:'2.1', f:'2026-09-23', items:[
    'Licencia "Todos los derechos reservados" y aviso de copyright.',
    'Términos y condiciones de uso (terminos.html), enlazados desde el pie y desde la reserva.',
  ]},
  {v:'2.0', f:'2026-09-23', items:[
    'Panel del guía: programar salidas, armar el recorrido en el mapa y ver las reservas.',
    'Modo "en vivo" del guía: comparte su ubicación y los turistas lo ven moverse en el mapa.',
    'Las salidas publicadas por el guía aparecen en la vista del cliente.',
    'Número de versión y novedades debajo del logo.',
  ]},
  {v:'1.0', f:'2026-09-23', items:[
    'Vista del cliente: mapa, lista "Cerca tuyo ahora", filtros y ficha del tour.',
    'Guías simulados en vivo, alertas de proximidad y reserva simulada.',
    'Modo presentación (ubicación de demo y tiempo acelerado).',
    'Lista y mapa redimensionables con el mouse o con el dedo.',
  ]},
];
const MIN = 60000;

/* =====================================================================
   DATOS DE EJEMPLO (prototipo)
   Guías y tours ficticios. En la versión real los carga cada guía.
   first = minutos desde que se abre la app hasta la primera salida
           (negativo = ya empezó y está en curso)
   every = cada cuántos minutos se repite la salida
   route = paradas [lat, lng, nombre]
   ===================================================================== */
const CATS = {
  historico:{n:'Históricos', e:'🏛️'},
  gastro:{n:'Gastronomía', e:'🍴'},
  arquitectura:{n:'Arquitectura', e:'🏘️'},
  arte:{n:'Arte', e:'🎨'},
  nocturno:{n:'Nocturnos', e:'🌙'},
  tematico:{n:'Temáticos', e:'🎬'},
  familia:{n:'En familia', e:'👨‍👩‍👧'},
  foto:{n:'Fotográficos', e:'📸'},
  misterio:{n:'Misterio', e:'👻'},
};
const GUIDES = {
  lucia:{n:'Lucía Fernández', c:'#E07FA3', r:4.9, rv:214, y:8, bio:'Historiadora y guía matriculada. Nació en San Telmo y conoce cada adoquín.'},
  martin:{n:'Martín Sosa', c:'#8C7AE6', r:4.8, rv:167, y:6, bio:'Cocinero y guía gastronómico. Te lleva a comer donde comen los porteños.'},
  carla:{n:'Carla Benítez', c:'#F0A15B', r:4.9, rv:98, y:4, bio:'Arquitecta. Recorre la ciudad mirando para arriba: cúpulas, balcones y fachadas.'},
  diego:{n:'Diego Ramírez', c:'#4FB0A5', r:4.7, rv:302, y:11, bio:'Guía de la Ciudad desde hace más de 10 años. Tours a la gorra para todos.'},
  sofia:{n:'Sofía Paz', c:'#D46BC7', r:5.0, rv:61, y:3, bio:'Fotógrafa. Te enseña a sacar la mejor foto de cada rincón porteño.'},
  tomas:{n:'Tomás Acosta', c:'#5B8DEF', r:4.8, rv:143, y:7, bio:'Narrador de leyendas urbanas, crímenes y fantasmas de Buenos Aires.'},
  vale:{n:'Valentina Ruiz', c:'#EF6F7A', r:4.9, rv:188, y:5, bio:'Licenciada en Artes. Museos, murales y arte callejero.'},
  julian:{n:'Julián Morales', c:'#6BAF5C', r:4.6, rv:77, y:3, bio:'Fanático de la tele y el cine argentino. Chimentos garantizados.'},
  paula:{n:'Paula Giménez', c:'#C98B4F', r:4.9, rv:120, y:9, bio:'Bailarina de tango y guía. Noches porteñas auténticas.'},
  nico:{n:'Nicolás Herrera', c:'#3FA1C9', r:4.8, rv:95, y:5, bio:'Guía bilingüe de La Boca, hincha de toda la vida.'},
};
const TOURS = [
  {id:1, name:'San Telmo colonial', cat:'historico', barrio:'San Telmo', g:'lucia', price:18000, first:25, every:240, dur:120, cupos:15, ocup:9, langs:['ES','EN'],
   desc:'Del Cabildo a Parque Lezama por la calle Defensa: casonas coloniales, conventillos, la Plaza Dorrego y la historia del barrio más antiguo de la ciudad.',
   route:[[-34.6083,-58.3712,'Plaza de Mayo'],[-34.6100,-58.3719,'Defensa y Alsina'],[-34.6130,-58.3720,'Defensa y Belgrano'],[-34.6178,-58.3719,'Defensa e Independencia'],[-34.6205,-58.3713,'Plaza Dorrego'],[-34.6268,-58.3703,'Defensa y Brasil'],[-34.6280,-58.3695,'Parque Lezama']]},
  {id:2, name:'Sabores de San Telmo', cat:'gastro', barrio:'San Telmo', g:'martin', price:45000, first:-40, every:240, dur:150, cupos:10, ocup:10, langs:['ES','EN'],
   desc:'Empanadas, choripán, vermut y alfajores. Cinco paradas en bodegones y puestos del Mercado de San Telmo.',
   route:[[-34.6206,-58.3733,'Mercado de San Telmo'],[-34.6205,-58.3713,'Plaza Dorrego'],[-34.6218,-58.3702,'Balcarce y Humberto 1º'],[-34.6195,-58.3690,'Pasaje Giuffra'],[-34.6178,-58.3719,'Bodegón de Defensa']]},
  {id:3, name:'Casco Histórico en 90 minutos', cat:'historico', barrio:'Microcentro', g:'diego', price:0, first:40, every:180, dur:90, cupos:30, ocup:12, langs:['ES','EN','PT'],
   desc:'La Plaza de Mayo, la Catedral, la Casa Rosada y la Manzana de las Luces. Ideal para ubicarte el primer día. A la gorra.',
   route:[[-34.6088,-58.3736,'Cabildo'],[-34.6076,-58.3730,'Catedral Metropolitana'],[-34.6081,-58.3703,'Casa Rosada'],[-34.6117,-58.3740,'Manzana de las Luces'],[-34.6088,-58.3736,'Cabildo']]},
  {id:4, name:'Leyendas y fantasmas de San Telmo', cat:'misterio', barrio:'San Telmo', g:'tomas', price:22000, first:95, every:300, dur:100, cupos:18, ocup:15, langs:['ES'],
   desc:'Casas embrujadas, crímenes del 1900 y las leyendas que los vecinos cuentan en voz baja. Apto mayores de 12.',
   route:[[-34.6179,-58.3712,'El Zanjón de Granados'],[-34.6160,-58.3708,'Casa Mínima'],[-34.6205,-58.3713,'Plaza Dorrego'],[-34.6230,-58.3712,'La casa de los Ezeiza'],[-34.6268,-58.3703,'Defensa y Brasil']]},
  {id:5, name:'Arquitectura de Avenida de Mayo', cat:'arquitectura', barrio:'Microcentro', g:'carla', price:15000, first:-20, every:180, dur:90, cupos:16, ocup:11, langs:['ES','EN'],
   desc:'Art nouveau, cafés notables y el Palacio Barolo, inspirado en la Divina Comedia. Una avenida pensada como bulevar parisino.',
   route:[[-34.6088,-58.3787,'Café Tortoni'],[-34.6092,-58.3825,'Hotel Chile'],[-34.6096,-58.3857,'Palacio Barolo'],[-34.6098,-58.3926,'Congreso de la Nación']]},
  {id:6, name:'Teatro Colón y alrededores', cat:'arte', barrio:'Microcentro', g:'diego', price:0, first:55, every:180, dur:75, cupos:25, ocup:8, langs:['ES','EN'],
   desc:'Del Obelisco al Teatro Colón: la historia de la 9 de Julio, los teatros de Corrientes y la Plaza Lavalle. A la gorra.',
   route:[[-34.6037,-58.3816,'Obelisco'],[-34.6010,-58.3831,'Teatro Colón'],[-34.6020,-58.3855,'Plaza Lavalle'],[-34.6040,-58.3790,'Av. Corrientes'],[-34.6037,-58.3816,'Obelisco']]},
  {id:7, name:'Microcentro fotográfico', cat:'foto', barrio:'Microcentro', g:'sofia', price:20000, first:12, every:240, dur:120, cupos:8, ocup:6, langs:['ES','EN'],
   desc:'Galerías, pasajes y edificios icónicos, con tips para sacar fotos increíbles con el celular.',
   route:[[-34.6045,-58.3749,'Galería Güemes'],[-34.5990,-58.3748,'Galerías Pacífico'],[-34.5953,-58.3750,'Plaza San Martín'],[-34.5950,-58.3736,'Edificio Kavanagh']]},
  {id:8, name:'Recoleta: cementerio y palacios', cat:'historico', barrio:'Recoleta', g:'lucia', price:25000, first:35, every:240, dur:120, cupos:20, ocup:14, langs:['ES','EN','FR'],
   desc:'Evita, Sarmiento y los mausoleos más impactantes del Cementerio de la Recoleta. Después, palacios de la Belle Époque.',
   route:[[-34.5876,-58.3927,'Cementerio de la Recoleta'],[-34.5862,-58.3910,'Plaza Francia'],[-34.5840,-58.3930,'Museo Nacional de Bellas Artes'],[-34.5816,-58.3931,'Floralis Genérica']]},
  {id:9, name:'Museos de Recoleta', cat:'arte', barrio:'Recoleta', g:'vale', price:12000, first:-50, every:240, dur:120, cupos:14, ocup:7, langs:['ES'],
   desc:'Las obras imperdibles de Bellas Artes, el Palais de Glace y el Centro Cultural Recoleta, en un recorrido ágil.',
   route:[[-34.5840,-58.3930,'Museo Nacional de Bellas Artes'],[-34.5857,-58.3897,'Palais de Glace'],[-34.5868,-58.3925,'Centro Cultural Recoleta'],[-34.5816,-58.3931,'Floralis Genérica']]},
  {id:10, name:'Palermo Soho street art', cat:'arte', barrio:'Palermo', g:'vale', price:20000, first:20, every:240, dur:120, cupos:15, ocup:5, langs:['ES','EN'],
   desc:'Murales, grafiti y artistas callejeros de Palermo Soho. Terminamos con un café en Plaza Serrano.',
   route:[[-34.5886,-58.4302,'Plaza Serrano'],[-34.5876,-58.4285,'Honduras y Thames'],[-34.5902,-58.4280,'Gurruchaga y El Salvador'],[-34.5890,-58.4315,'Costa Rica y Armenia'],[-34.5886,-58.4302,'Plaza Serrano']]},
  {id:11, name:'Bosques de Palermo en familia', cat:'familia', barrio:'Palermo', g:'diego', price:0, first:65, every:180, dur:90, cupos:30, ocup:10, langs:['ES'],
   desc:'Jardín Japonés, Planetario y Rosedal, con juegos y desafíos para chicos. A la gorra.',
   route:[[-34.5791,-58.4103,'Jardín Japonés'],[-34.5696,-58.4116,'Planetario'],[-34.5716,-58.4175,'El Rosedal']]},
  {id:12, name:'Palermo Hollywood: TV, cine y chimentos', cat:'tematico', barrio:'Palermo', g:'julian', price:28000, first:-30, every:240, dur:120, cupos:15, ocup:13, langs:['ES'],
   desc:'Los canales, productoras y bares donde pasaron los grandes escándalos de la tele argentina. Con anécdotas y chimentos.',
   route:[[-34.5818,-58.4353,'Fitz Roy y Honduras'],[-34.5800,-58.4330,'Productoras de Humboldt'],[-34.5785,-58.4380,'Canal de Dorrego'],[-34.5830,-58.4400,'Bar de los famosos']]},
  {id:13, name:'La Boca: Caminito y Bombonera', cat:'historico', barrio:'La Boca', g:'nico', price:22000, first:45, every:240, dur:120, cupos:20, ocup:11, langs:['ES','EN','PT'],
   desc:'Conventillos de colores, la inmigración italiana, la Vuelta de Rocha y la cancha de Boca Juniors.',
   route:[[-34.6394,-58.3627,'Caminito'],[-34.6379,-58.3610,'Vuelta de Rocha'],[-34.6363,-58.3575,'Fundación Proa'],[-34.6356,-58.3647,'La Bombonera']]},
  {id:14, name:'La Boca: arte y conventillos', cat:'arte', barrio:'La Boca', g:'nico', price:15000, first:-15, every:240, dur:90, cupos:12, ocup:8, langs:['ES','EN'],
   desc:'De la Usina del Arte a Caminito: Quinquela Martín, talleres de artistas y los conventillos que inspiraron el barrio.',
   route:[[-34.6284,-58.3570,'Usina del Arte'],[-34.6330,-58.3568,'Pedro de Mendoza y Suárez'],[-34.6363,-58.3575,'Fundación Proa'],[-34.6394,-58.3627,'Caminito']]},
  {id:15, name:'Noche de tango en San Telmo', cat:'nocturno', barrio:'San Telmo', g:'paula', price:60000, first:150, every:360, dur:180, cupos:12, ocup:9, langs:['ES','EN'],
   desc:'Clase de tango para principiantes, milonga en un salón histórico y cena porteña. La noche más auténtica de Buenos Aires.',
   route:[[-34.6205,-58.3713,'Plaza Dorrego'],[-34.6190,-58.3730,'Salón de clases'],[-34.6215,-58.3740,'Milonga del barrio']]},
  {id:16, name:'Puerto Madero al atardecer', cat:'foto', barrio:'Microcentro', g:'sofia', price:18000, first:110, every:300, dur:90, cupos:10, ocup:3, langs:['ES','EN'],
   desc:'El Puente de la Mujer, la Fragata Sarmiento y la Costanera Sur, con la mejor luz del día para fotos.',
   route:[[-34.6078,-58.3650,'Puente de la Mujer'],[-34.6070,-58.3654,'Fragata Sarmiento'],[-34.6110,-58.3625,'Dique 3'],[-34.6135,-58.3605,'Costanera Sur']]},
];
const BARRIOS = {
  'San Telmo':{c:[-34.6200,-58.3715],e:'🎭',bg:'linear-gradient(150deg,#FDEAF0,#F6C1D3)'},
  'Microcentro':{c:[-34.6060,-58.3770],e:'🏛️',bg:'linear-gradient(150deg,#FFF1E6,#F9D5E2)'},
  'Recoleta':{c:[-34.5855,-58.3925],e:'🌸',bg:'linear-gradient(150deg,#F3EAFD,#F6C1D3)'},
  'Palermo':{c:[-34.5840,-58.4230],e:'🌳',bg:'linear-gradient(150deg,#EAF7F0,#F9D5E2)'},
  'La Boca':{c:[-34.6370,-58.3620],e:'🎨',bg:'linear-gradient(150deg,#FFF6D9,#F6C1D3)'},
};
const DEMO_SPOTS = {
  '9 de Julio':[-34.6086,-58.3816],
  'San Telmo':[-34.6160,-58.3735],
  'Recoleta':[-34.5890,-58.3950],
  'Palermo':[-34.5870,-58.4260],
  'La Boca':[-34.6340,-58.3640],
};
const OBELISCO = [-34.6037,-58.3816];

/* =====================================================================
   GEO
   ===================================================================== */
function distM(a,b){
  const R=6371000, toR=Math.PI/180;
  const dLat=(b[0]-a[0])*toR, dLng=(b[1]-a[1])*toR;
  const s=Math.sin(dLat/2)**2+Math.cos(a[0]*toR)*Math.cos(b[0]*toR)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
/* precalcula punto de encuentro y largo del recorrido */
function prepTour(t){
  t.meet = t.route[0];
  t.segs = []; let acc = 0;
  for(let i=1;i<t.route.length;i++){ const d=distM(t.route[i-1],t.route[i]); t.segs.push({from:acc,len:d}); acc+=d; }
  t.len = acc;
  return t;
}
TOURS.forEach(prepTour);
function pointAlong(t, p){
  const target = Math.max(0,Math.min(1,p)) * t.len;
  for(let i=0;i<t.segs.length;i++){
    const s=t.segs[i];
    if(target <= s.from + s.len || i===t.segs.length-1){
      const f = s.len ? (target - s.from)/s.len : 0, a=t.route[i], b=t.route[i+1];
      return {ll:[a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f], seg:i};
    }
  }
  return {ll:t.route[0], seg:0};
}

/* =====================================================================
   UTILIDADES DE FORMATO
   ===================================================================== */
const hhmm = ms => new Date(ms).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',hour12:false});
const fmtIn = m => m < 60 ? `${m} min` : `${Math.floor(m/60)} h${m%60?` ${String(m%60).padStart(2,'0')}`:''}`;
const fmtDist = d => d < 1000 ? `${Math.round(d/10)*10} m` : `${(d/1000).toFixed(1).replace('.',',')} km`;
const cuadras = d => Math.max(1,Math.round(d/100));
const walkMin = d => Math.max(1,Math.round(d/75));   // ~4,5 km/h
const money = n => n===0 ? 'A la gorra' : '$ ' + n.toLocaleString('es-AR');
const initials = n => n.split(' ').map(w=>w[0]).slice(0,2).join('');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- mapa base ---------- */
function baseTiles(){
  const k = atob('Y2IxXzI3dWlfMV9jOTg4MDc2YjUxYTY0MmRlMDRkODAwYzU=');
  return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key='+k, {
    maxZoom:19, subdomains:'abcd', attribution:'&copy; OpenStreetMap &copy; CARTO'
  });
}
/* barrio más cercano a un punto (para salidas nuevas) */
function nearestBarrio(ll){
  let best = 'Microcentro', bd = Infinity;
  for(const [n,b] of Object.entries(BARRIOS)){ const d = distM(ll, b.c); if(d < bd){ bd = d; best = n; } }
  return best;
}

/* ---------- avisos ---------- */
function toast({ic, title, text, action, ttl=7000}){
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = `<span class="ic">${ic}</span><div style="flex:1"><b>${esc(title)}</b><p>${esc(text)}</p>
    <div class="acts">${action?`<button class="go">${esc(action.label)}</button>`:''}<button class="x">Cerrar</button></div></div>`;
  el.querySelector('.x').onclick = ()=>el.remove();
  if(action) el.querySelector('.go').onclick = ()=>{ el.remove(); action.fn(); };
  document.getElementById('toasts').prepend(el);
  setTimeout(()=>el.remove(), ttl);
}

/* ---------- versión debajo del logo + novedades ---------- */
function mountVersion(){
  document.querySelectorAll('.logo').forEach(lg=>{
    if(lg.querySelector('.ver')) return;
    const v = document.createElement('button');
    v.className = 'ver'; v.type = 'button'; v.textContent = 'V ' + VERSION; v.title = 'Novedades de esta versión';
    v.onclick = e=>{ e.preventDefault(); e.stopPropagation(); openChangelog(); };
    (lg.querySelector('.brand') || lg).appendChild(v);
  });
}
function openChangelog(){
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="modal"><h3>Novedades</h3><p class="muted">TourCerca · prototipo</p>
    ${CHANGELOG.map(c=>`<h5>V ${c.v}${c.v===VERSION?' · actual':''}</h5><ul class="clog">${c.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`).join('')}
    <p class="muted" style="font-size:12px;margin:16px 0 0;text-align:center">${esc(COPYRIGHT)}</p>
    <div style="margin-top:14px"><button class="btn btn-primary" style="width:100%" data-x>Cerrar</button></div></div>`;
  ov.onclick = e=>{ if(e.target===ov || e.target.hasAttribute('data-x')) ov.remove(); };
  document.body.appendChild(ov);
}

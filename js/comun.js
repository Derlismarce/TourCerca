/* =====================================================================
   TourCerca · código compartido entre la vista cliente (index.html)
   y el panel del guía (guia.html)
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.
   ===================================================================== */

/* ---------- versión ---------- */
const VERSION = '3.7';
const COPYRIGHT = '© 2026 Derlis Marcelo Fernandez Rivas · Todos los derechos reservados';
const CHANGELOG = [
  {v:'3.7', f:'2026-10-05', items:[
    'Los 48 barrios oficiales de la Ciudad: el barrio de cada salida y de cada pedido sale de los límites reales (por ejemplo, Parque Centenario es Caballito).',
    'El editor de recorridos muestra en qué barrio está el punto de encuentro.',
    'En la portada se suman Monserrat, San Nicolás (Microcentro) y Puerto Madero, y una tarjeta para ver toda la Ciudad.',
  ]},
  {v:'3.6', f:'2026-10-04', items:[
    'Si el guía cancela una salida, el turista recibe el aviso de que se le reembolsa el total de lo abonado.',
    'Antes de cancelar, el guía ve "¿Cancelar la salida?" con cuántas personas tienen reserva y cuánto se les devuelve.',
  ]},
  {v:'3.5', f:'2026-10-04', items:[
    'Las reservas de los tours de ejemplo ahora le llegan al guía: aparecen en sus próximas salidas y recibe el aviso al reservar y al cancelar.',
    'Cada salida del guía muestra cuántos lugares van reservados y cuántos faltan para completar, con una barra de avance.',
    'Nuevo bloque "Actividad reciente" en el panel del guía con las reservas y cancelaciones de los turistas.',
  ]},
  {v:'3.4', f:'2026-10-04', items:[
    'Las reservas se pagan al reservar (pago simulado en el prototipo).',
    'Política de cancelación: gratis hasta 24 h antes; entre 24 h y 1 h antes se devuelve el 50%; con menos de 1 h o si no vas, no hay reembolso.',
    'La política se muestra en la ficha, antes de confirmar y en "Mis tours", y la ventana de cancelar dice cuánto se devuelve.',
    'Si el guía cancela la salida se devuelve todo. El guía ve lo que cobra por las cancelaciones tardías.',
  ]},
  {v:'3.3', f:'2026-10-04', items:[
    '"Mis tours": el turista ve sus reservas y sus pedidos en un solo lugar.',
    'Se puede cancelar una reserva antes de que empiece el tour; el lugar queda libre y el guía recibe el aviso.',
    'Antes de reservar se muestra un resumen para confirmar ("¿Confirmás la reserva?"), así no se reserva por error.',
  ]},
  {v:'3.2', f:'2026-10-04', items:[
    'La app en tres idiomas: español, inglés y portugués, con selector arriba a la derecha.',
    'Detecta el idioma del celular la primera vez y recuerda el que elijas.',
  ]},
  {v:'3.1', f:'2026-09-28', items:[
    'Botón de emergencia (🆘) para turistas y guías: SAME 107, 911, bomberos 100 y compartir la ubicación.',
    'Primeros pasos ante golpe de calor, desmayo o caída.',
    'Cada tour muestra su dificultad y recomendaciones (agua, calzado, protector), con aviso si hace calor según el clima real de Buenos Aires.',
    'El guía puede registrar incidentes durante el tour y los ve en su panel.',
  ]},
  {v:'3.0', f:'2026-09-25', items:[
    '"Pedí tu tour": el turista programa una visita guiada con día, hora, punto de salida y lugares a visitar.',
    'Reglas del pedido: mínimo 5 personas, 1 hora de recorrido y $ 15.000 por persona; de 2 horas a 30 días de anticipación.',
    'Panel del guía: pedidos de turistas cerca de su zona (radio a elección), alerta al aparecer uno nuevo y botón "Tomar pedido".',
    'El turista sigue su pedido en "Mis pedidos" y recibe un aviso cuando un guía lo toma.',
  ]},
  {v:'2.3', f:'2026-09-25', items:[
    'Política de privacidad (privacidad.html), enlazada desde el pie, la reserva y los términos.',
  ]},
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
  {id:3, name:'Casco Histórico en 90 minutos', cat:'historico', barrio:'Monserrat', g:'diego', price:0, first:40, every:180, dur:90, cupos:30, ocup:12, langs:['ES','EN','PT'],
   desc:'La Plaza de Mayo, la Catedral, la Casa Rosada y la Manzana de las Luces. Ideal para ubicarte el primer día. A la gorra.',
   route:[[-34.6088,-58.3736,'Cabildo'],[-34.6076,-58.3730,'Catedral Metropolitana'],[-34.6081,-58.3703,'Casa Rosada'],[-34.6117,-58.3740,'Manzana de las Luces'],[-34.6088,-58.3736,'Cabildo']]},
  {id:4, name:'Leyendas y fantasmas de San Telmo', cat:'misterio', barrio:'San Telmo', g:'tomas', price:22000, first:95, every:300, dur:100, cupos:18, ocup:15, langs:['ES'],
   desc:'Casas embrujadas, crímenes del 1900 y las leyendas que los vecinos cuentan en voz baja. Apto mayores de 12.',
   route:[[-34.6179,-58.3712,'El Zanjón de Granados'],[-34.6160,-58.3708,'Casa Mínima'],[-34.6205,-58.3713,'Plaza Dorrego'],[-34.6230,-58.3712,'La casa de los Ezeiza'],[-34.6268,-58.3703,'Defensa y Brasil']]},
  {id:5, name:'Arquitectura de Avenida de Mayo', cat:'arquitectura', barrio:'Monserrat', g:'carla', price:15000, first:-20, every:180, dur:90, cupos:16, ocup:11, langs:['ES','EN'],
   desc:'Art nouveau, cafés notables y el Palacio Barolo, inspirado en la Divina Comedia. Una avenida pensada como bulevar parisino.',
   route:[[-34.6088,-58.3787,'Café Tortoni'],[-34.6092,-58.3825,'Hotel Chile'],[-34.6096,-58.3857,'Palacio Barolo'],[-34.6098,-58.3926,'Congreso de la Nación']]},
  {id:6, name:'Teatro Colón y alrededores', cat:'arte', barrio:'San Nicolás', g:'diego', price:0, first:55, every:180, dur:75, cupos:25, ocup:8, langs:['ES','EN'],
   desc:'Del Obelisco al Teatro Colón: la historia de la 9 de Julio, los teatros de Corrientes y la Plaza Lavalle. A la gorra.',
   route:[[-34.6037,-58.3816,'Obelisco'],[-34.6010,-58.3831,'Teatro Colón'],[-34.6020,-58.3855,'Plaza Lavalle'],[-34.6040,-58.3790,'Av. Corrientes'],[-34.6037,-58.3816,'Obelisco']]},
  {id:7, name:'Microcentro fotográfico', cat:'foto', barrio:'San Nicolás', g:'sofia', price:20000, first:12, every:240, dur:120, cupos:8, ocup:6, langs:['ES','EN'],
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
  {id:16, name:'Puerto Madero al atardecer', cat:'foto', barrio:'Puerto Madero', g:'sofia', price:18000, first:110, every:300, dur:90, cupos:10, ocup:3, langs:['ES','EN'],
   desc:'El Puente de la Mujer, la Fragata Sarmiento y la Costanera Sur, con la mejor luz del día para fotos.',
   route:[[-34.6078,-58.3650,'Puente de la Mujer'],[-34.6070,-58.3654,'Fragata Sarmiento'],[-34.6110,-58.3625,'Dique 3'],[-34.6135,-58.3605,'Costanera Sur']]},
];
/* barrios destacados en la portada (los nombres son los oficiales; ver js/barrios.js con los 48) */
const BARRIOS = {
  'San Telmo':{c:[-34.6200,-58.3715],spot:[-34.6160,-58.3735],e:'🎭',bg:'linear-gradient(150deg,#FDEAF0,#F6C1D3)'},
  'Monserrat':{c:[-34.6095,-58.3780],spot:[-34.6095,-58.3760],e:'🏛️',bg:'linear-gradient(150deg,#FFF1E6,#F9D5E2)',alias:'Casco histórico'},
  'San Nicolás':{c:[-34.6030,-58.3790],spot:[-34.6050,-58.3800],e:'🌆',bg:'linear-gradient(150deg,#EAF1FD,#F9D5E2)',alias:'Microcentro'},
  'Recoleta':{c:[-34.5855,-58.3925],spot:[-34.5890,-58.3950],e:'🌸',bg:'linear-gradient(150deg,#F3EAFD,#F6C1D3)'},
  'Palermo':{c:[-34.5840,-58.4230],spot:[-34.5870,-58.4260],e:'🌳',bg:'linear-gradient(150deg,#EAF7F0,#F9D5E2)'},
  'La Boca':{c:[-34.6370,-58.3620],spot:[-34.6340,-58.3640],e:'🎨',bg:'linear-gradient(150deg,#FFF6D9,#F6C1D3)'},
  'Puerto Madero':{c:[-34.6100,-58.3630],spot:[-34.6090,-58.3660],e:'⚓',bg:'linear-gradient(150deg,#E6F4FA,#F6C1D3)'},
};
/* fondo y centro de cualquiera de los 48 barrios (los no destacados usan un fondo genérico) */
const BARRIO_BG = 'linear-gradient(150deg,#FDEAF0,#F9D5E2)';
const bgBarrio = n => BARRIOS[n]?.bg || BARRIO_BG;
const centroBarrio = n => BARRIOS[n]?.c || (typeof datosBarrio === 'function' && datosBarrio(n)?.c) || OBELISCO;
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
const hhmm = ms => new Date(ms).toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit',hour12:false});
const hora = ms => hhmm(ms) + (LANG === 'es' ? ' h' : '');      // "10:00 h" en español, "10:00" en inglés y portugués
const dec1 = x => x.toLocaleString(LOC(), {minimumFractionDigits:1, maximumFractionDigits:1});
const fmtIn = m => m < 60 ? `${m} min` : `${Math.floor(m/60)} h${m%60?` ${String(m%60).padStart(2,'0')}`:''}`;
const fmtDist = d => d < 1000 ? `${Math.round(d/10)*10} m` : `${dec1(d/1000)} km`;
const cuadras = d => Math.max(1,Math.round(d/100));
const walkMin = d => Math.max(1,Math.round(d/75));   // ~4,5 km/h
const money = n => n===0 ? tr('A la gorra') : (LANG === 'es' ? '$ ' : 'ARS ') + n.toLocaleString(LOC());
const initials = n => n.split(' ').map(w=>w[0]).slice(0,2).join('');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- mapa base ---------- */
function baseTiles(){
  const k = atob('Y2IxXzI3dWlfMV9jOTg4MDc2YjUxYTY0MmRlMDRkODAwYzU=');
  return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key='+k, {
    maxZoom:19, subdomains:'abcd', attribution:'&copy; OpenStreetMap &copy; CARTO'
  });
}
/* barrio oficial de un punto (para salidas y pedidos nuevos): usa los límites de js/barrios.js */
function nearestBarrio(ll){
  if(typeof barrioDe === 'function') return barrioDe(ll);
  let best = 'San Nicolás', bd = Infinity;          // respaldo si la página no cargó los límites
  for(const [n,b] of Object.entries(BARRIOS)){ const d = distM(ll, b.c); if(d < bd){ bd = d; best = n; } }
  return best;
}

/* ---------- fechas y calles ---------- */
const pad = n => String(n).padStart(2,'0');
const toLocalInput = ms => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
function diaLabel(ms){
  const d = new Date(ms), t = new Date();
  const dd = Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate()) - new Date(t.getFullYear(),t.getMonth(),t.getDate())) / 864e5);
  return dd === 0 ? tr('Hoy') : dd === 1 ? tr('Mañana') : dd === -1 ? tr('Ayer') : d.toLocaleDateString(LOC(),{weekday:'short', day:'numeric', month:'numeric'});
}
/* nombre de la calle de un punto (OpenStreetMap / Nominatim) */
async function nombreDe(ll){
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&accept-language=es&lat=${ll[0].toFixed(6)}&lon=${ll[1].toFixed(6)}`);
    const j = await r.json(), a = j.address || {};
    if(j.name && j.name !== a.road) return j.name;
    if(a.road) return a.road + (a.house_number ? ' ' + a.house_number : '');
  } catch(e){}
  return null;
}

/* ---------- nombres guardados en español (datos compartidos) que se muestran traducidos ---------- */
function verLugar(s){
  s = String(s ?? ''); let m;
  if(s === 'Punto de salida' || s === 'Punto de encuentro') return tr(s);
  if((m = s.match(/^(Lugar|Parada) (\d+)$/))) return tr(m[1] + ' {n}', {n:m[2]});
  return tr(s);
}
const nombreTour = n => (n || '').startsWith('Tour a pedido · ') ? tr('Tour a pedido') + ' · ' + n.slice(16) : tr(n);

/* ---------- reglas de "Pedí tu tour" (las mismas para turista y guía) ---------- */
const PEDIDO = {minPersonas:5, maxPersonas:40, minDur:60, minPrecio:15000, anticipacionH:2, maxDias:30};
const PEDIDO_DURACIONES = [60, 90, 120, 150, 180, 240];

/* ---------- política de cancelación de reservas (V 3.4) ----------
   El turista paga al reservar. Si cancela:
   - hasta 24 h antes: se le devuelve todo (cancelación gratuita)
   - entre 24 h y 1 h antes: se le devuelve el 50%
   - con menos de 1 h, o si no va: no hay reembolso
   Si el guía cancela la salida, se devuelve todo. Los tours a la gorra no se pagan. */
const CANCEL = {gratisH:24, mitadH:1, mitad:.5};
function politicaCancel(start, pagado, T = Date.now()){
  const gratisHasta = start - CANCEL.gratisH * 60 * MIN, mitadHasta = start - CANCEL.mitadH * 60 * MIN;
  const tipo = !pagado || T <= gratisHasta ? 'gratis' : T <= mitadHasta ? 'mitad' : 'total';
  const reembolso = tipo === 'gratis' ? pagado : tipo === 'mitad' ? Math.round(pagado * CANCEL.mitad) : 0;
  return {tipo, reembolso, cargo:pagado - reembolso, gratisHasta, mitadHasta};
}
/* texto corto de la política según el momento: para la confirmación, la ficha y "Mis tours" */
function textoPolitica(start, pagado, T = Date.now()){
  if(!pagado) return tr('Reserva sin pago: si no podés ir, cancelala así el lugar queda libre.');
  const p = politicaCancel(start, pagado, T);
  if(p.tipo === 'gratis') return tr('Cancelación gratuita hasta {f}. Después, y hasta 1 h antes, se devuelve el 50%. Con menos de 1 h o si no vas, no hay reembolso.', {f:fechaLarga(p.gratisHasta)});
  if(p.tipo === 'mitad') return tr('Sin cancelación gratuita (faltan menos de 24 h). Si cancelás hasta {f} se te devuelve el 50%. Después, o si no vas, no hay reembolso.', {f:fechaLarga(p.mitadHasta)});
  return tr('Sin reembolso: el tour empieza en menos de 1 hora.');
}

/* devuelve la lista de reglas con si se cumplen o no */
function reglasPedido(p, T = Date.now()){
  const desde = T + PEDIDO.anticipacionH * 60 * MIN, hasta = T + PEDIDO.maxDias * 24 * 60 * MIN;
  return [
    {k:'personas', ok: p.personas >= PEDIDO.minPersonas && p.personas <= PEDIDO.maxPersonas,
     txt:tr('Mínimo {n} personas', {n:PEDIDO.minPersonas}), err:tr('El grupo tiene que ser de {a} a {b} personas.', {a:PEDIDO.minPersonas, b:PEDIDO.maxPersonas})},
    {k:'dur', ok: p.dur >= PEDIDO.minDur, txt:tr('Mínimo 1 hora'), err:tr('El recorrido tiene que durar al menos 1 hora.')},
    {k:'precio', ok: p.price >= PEDIDO.minPrecio, txt:tr('Mínimo {m} c/u', {m:money(PEDIDO.minPrecio)}), err:tr('El precio mínimo es {m} por persona.', {m:money(PEDIDO.minPrecio)})},
    {k:'fecha', ok: !isNaN(p.startAt) && p.startAt >= desde && p.startAt <= hasta,
     txt:tr('De {h} h a {d} días', {h:PEDIDO.anticipacionH, d:PEDIDO.maxDias}), err:tr('Pedilo con al menos {h} horas de anticipación y hasta {d} días.', {h:PEDIDO.anticipacionH, d:PEDIDO.maxDias})},
    {k:'ruta', ok: (p.route || []).length >= 2, txt:tr('Salida + 1 lugar'), err:tr('Marcá en el mapa el punto de salida y al menos un lugar para visitar.')},
    {k:'nombre', ok: !!(p.nombre || '').trim(), txt:tr('Tu nombre'), err:tr('Poné tu nombre para que el guía te reconozca.')},
  ];
}
/* estado real: un pedido pendiente cuya hora ya pasó está vencido */
function estadoPedido(p){ return p.status === 'pendiente' && Date.now() > p.startAt ? 'vencido' : p.status; }
const fechaLarga = ms => `${diaLabel(ms)} ${hora(ms)}`;
function fechaFrase(ms){                   // "mañana a las 10:00", "el sáb 27/9 a las 10:00"
  const d = new Date(ms), hoy = new Date(), h = hhmm(ms);
  const dd = Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate()) - new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate())) / 864e5);
  return dd === 0 ? tr('hoy a las {h}', {h}) : dd === 1 ? tr('mañana a las {h}', {h}) : tr('el {d} a las {h}', {d:diaLabel(ms), h});
}

/* ---------- seguridad ---------- */
const EMERGENCIAS = [
  {e:'🚑', n:'SAME · emergencias médicas', tel:'107'},
  {e:'🚓', n:'Emergencias · policía', tel:'911'},
  {e:'🚒', n:'Bomberos', tel:'100'},
];
const PRIMEROS_AUXILIOS = [
  {t:'Golpe de calor', d:'Llevá a la persona a la sombra, aflojale la ropa y mojale la nuca y las muñecas. Si está consciente, dale agua de a sorbos. Si está confundida o no mejora, llamá al 107.'},
  {t:'Desmayo o no responde', d:'Llamá al 107 de inmediato. Si no respira normalmente y sabés hacerlo, empezá RCP hasta que llegue la ambulancia.'},
  {t:'Caída o golpe', d:'No muevas a la persona si le duele el cuello o la espalda. Si sangra, presioná la herida con un paño limpio. Ante la duda, llamá al 107.'},
  {t:'Persona perdida', d:'Llamala por teléfono y compartile el punto de encuentro. Si es un menor o no aparece, avisá al 911.'},
];

/* dificultad estimada según lo que se camina y lo que dura */
function dificultad(tour){
  const km = (tour.len || 0) / 1000, dur = tour.dur || 0, kmTxt = dec1(km);
  // manda lo que se camina; la duración solo suma si además hay bastante caminata
  const v = {km:kmTxt, d:fmtIn(dur)};
  if(km >= 4 || (km >= 2.5 && dur >= 180)) return {n:tr('Alta'), cls:'alta', e:'🔴', txt:tr('{km} km a pie en {d}: exigente, con muchas cuadras y poco descanso.', v)};
  if(km >= 2 || (km >= 1 && dur >= 150)) return {n:tr('Media'), cls:'media', e:'🟠', txt:tr('{km} km a pie en {d}: se camina bastante, con algunas paradas.', v)};
  return {n:tr('Baja'), cls:'baja', e:'🟢', txt:tr('{km} km a pie en {d}: tranquilo, con paradas frecuentes.', v)};
}

/* clima actual de Buenos Aires (Open-Meteo, sin datos del usuario) */
let climaBA = null;
async function cargarClima(){
  if(climaBA) return climaBA;
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-34.61&longitude=-58.38&current=temperature_2m,apparent_temperature&timezone=America%2FArgentina%2FBuenos_Aires');
    const j = await r.json();
    climaBA = {t:Math.round(j.current.temperature_2m), st:Math.round(j.current.apparent_temperature)};
  } catch(e){}
  return climaBA;
}
function recomendaciones(tour){
  const r = [tr('💧 Llevá agua'), tr('👟 Calzado cómodo'), tr('🧴 Protector solar y gorra')];
  if(climaBA && climaBA.st >= 28) r.unshift(tr('🌡️ Hoy hay {c} °C de sensación térmica: tomá agua seguido y buscá la sombra', {c:climaBA.st}));
  else if(climaBA && climaBA.st <= 8) r.unshift(tr('🧥 Hoy hay {c} °C de sensación térmica: abrigate', {c:climaBA.st}));
  if((tour.dur || 0) >= 150) r.push(tr('🍎 Algo para comer'));
  return r;
}

/* ventana de emergencia (turista y guía) */
function abrirEmergencia({ll = null, extra = ''} = {}){
  const ov = document.createElement('div'); ov.className = 'overlay';
  const link = ll ? `https://www.google.com/maps?q=${ll[0].toFixed(6)},${ll[1].toFixed(6)}` : '';
  ov.innerHTML = `<div class="modal sos">
    <h3>🆘 ${tr('Emergencia')}</h3>
    <p class="muted">${tr('Si alguien está en peligro, llamá primero. Las llamadas son gratuitas.')}</p>
    ${LANG !== 'es' ? `<p class="muted" style="font-size:12.5px">${tr('Números de emergencia de Argentina.')}</p>` : ''}
    <div class="sos-tels">${EMERGENCIAS.map(x=>`<a class="sos-tel" href="tel:${x.tel}"><span>${x.e}</span><b>${x.tel}</b><small>${esc(tr(x.n))}</small></a>`).join('')}</div>
    ${ll ? `<button class="btn btn-ghost sos-share" data-share>📍 ${tr('Compartir mi ubicación')}</button>` : ''}
    ${extra}
    <h5>${tr('Primeros pasos')}</h5>
    ${PRIMEROS_AUXILIOS.map(x=>`<details class="aux"><summary>${esc(tr(x.t))}</summary><p>${esc(tr(x.d))}</p></details>`).join('')}
    <p class="muted" style="font-size:11.5px;margin-top:10px">${tr('Orientación general. No reemplaza la atención médica ni las indicaciones del 107.')}</p>
    <div style="margin-top:12px"><button class="btn btn-primary" style="width:100%" data-x>${tr('Cerrar')}</button></div>
  </div>`;
  ov.onclick = async e=>{
    if(e.target === ov || e.target.hasAttribute('data-x')) return ov.remove();
    if(e.target.closest('[data-share]')){
      const txt = tr('Necesito ayuda. Estoy acá: {link}', {link});
      try {
        if(navigator.share){ await navigator.share({title:tr('Mi ubicación'), text:txt}); }
        else { await navigator.clipboard.writeText(txt); toast({ic:'📋', title:tr('Ubicación copiada'), text:tr('Pegala en un mensaje de WhatsApp o SMS.')}); }
      } catch(err){}
    }
  };
  document.body.appendChild(ov);
  return ov;
}

/* ---------- avisos ---------- */
function toast({ic, title, text, action, ttl=7000}){
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = `<span class="ic">${ic}</span><div style="flex:1"><b>${esc(title)}</b><p>${esc(text)}</p>
    <div class="acts">${action?`<button class="go">${esc(action.label)}</button>`:''}<button class="x">${tr('Cerrar')}</button></div></div>`;
  el.querySelector('.x').onclick = ()=>el.remove();
  if(action) el.querySelector('.go').onclick = ()=>{ el.remove(); action.fn(); };
  document.getElementById('toasts').prepend(el);
  setTimeout(()=>el.remove(), ttl);
}

/* ventana "¿estás seguro?": devuelve true si confirma */
function confirmBox(title, text, okLabel, danger){
  return new Promise(res=>{
    const ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = `<div class="modal"><h3>${esc(title)}</h3><p class="muted">${esc(text).replace(/\n/g, '<br>')}</p>
      <div style="display:flex;gap:8px"><button class="btn btn-ghost" style="flex:1;border:1.5px solid var(--line)" data-no>${tr('Volver')}</button>
      <button class="btn ${danger?'btn-danger':'btn-primary'}" style="flex:1" data-yes>${esc(okLabel)}</button></div></div>`;
    ov.onclick = e=>{
      if(e.target === ov || e.target.hasAttribute('data-no')){ ov.remove(); res(false); }
      else if(e.target.hasAttribute('data-yes')){ ov.remove(); res(true); }
    };
    document.body.appendChild(ov);
  });
}

/* ---------- versión debajo del logo + novedades ---------- */
function mountVersion(){
  document.querySelectorAll('.logo').forEach(lg=>{
    if(lg.querySelector('.ver')) return;
    const v = document.createElement('button');
    v.className = 'ver'; v.type = 'button'; v.textContent = 'V ' + VERSION; v.dataset.i18nTitle = 'Novedades de esta versión'; v.title = tr('Novedades de esta versión');
    v.onclick = e=>{ e.preventDefault(); e.stopPropagation(); openChangelog(); };
    (lg.querySelector('.brand') || lg).appendChild(v);
  });
}
function openChangelog(){
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="modal"><h3>${tr('Novedades')}</h3><p class="muted">${tr('TourCerca · prototipo')}</p>
    ${CHANGELOG.map(c=>`<h5>V ${c.v}${c.v===VERSION?' · '+tr('actual'):''}</h5><ul class="clog">${c.items.map(i=>`<li>${esc(tr(i))}</li>`).join('')}</ul>`).join('')}
    <p class="muted" style="font-size:12px;margin:16px 0 0;text-align:center">${esc(tr(COPYRIGHT))}</p>
    <div style="margin-top:14px"><button class="btn btn-primary" style="width:100%" data-x>${tr('Cerrar')}</button></div></div>`;
  ov.onclick = e=>{ if(e.target===ov || e.target.hasAttribute('data-x')) ov.remove(); };
  document.body.appendChild(ov);
}

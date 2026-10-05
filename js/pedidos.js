/* =====================================================================
   TourCerca · "Pedí tu tour" (vista del turista)
   El turista programa una visita guiada (día, hora, punto de salida y
   lugares) y un guía cercano la toma, como los viajes programados.
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.
   ===================================================================== */

/* ---------- mis pedidos (sin cuentas: se recuerdan en este navegador) ---------- */
const MIS_KEY = 'tourcerca.mispedidos', NOMBRE_KEY = 'tourcerca.nombre';
function misPedidosIds(){ try { return JSON.parse(localStorage.getItem(MIS_KEY) || '[]'); } catch(e){ return []; } }
function guardarMiPedido(id){
  const a = misPedidosIds();
  if(!a.includes(id)){ a.push(id); try { localStorage.setItem(MIS_KEY, JSON.stringify(a)); } catch(e){} }
}
const misPedidos = () => { const ids = misPedidosIds(); return Store.pedidos().filter(p=>ids.includes(p.id)).sort((a,b)=>a.startAt - b.startAt); };
const misPedidosActivos = () => misPedidos().filter(p=>['pendiente','tomado'].includes(estadoPedido(p)) &&
  !(p.salidaId && Store.get().salidas[p.salidaId]?.status === 'finalizada'));

/* ---------- mis reservas (V 3.3; sin cuentas: se recuerdan en este navegador) ---------- */
const RES_KEY = 'tourcerca.misreservas';
function misReservas(){ try { return JSON.parse(localStorage.getItem(RES_KEY) || '[]'); } catch(e){ return []; } }
function setMisReservas(a){ try { localStorage.setItem(RES_KEY, JSON.stringify(a)); } catch(e){} }
function guardarMiReserva(r){
  r.id = 'mr_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); r.ts = Date.now();
  setMisReservas(misReservas().concat(r)); badgeMis();
  if(viva(r)) resVivas.add(r.id);
}
/* reservas que siguen en pie en los datos compartidos: si una desaparece sin que yo la cancele, la canceló el guía */
const viva = r => !r.cancelada && !!r.rid && Store.existeReserva(r.rid);
let resVivas = new Set(misReservas().filter(viva).map(r=>r.id));
/* reloj: los tours de ejemplo usan el de la app (acelerable); las salidas de los guías, el real */
const relojDe = ext => ext ? Date.now() : now();
const pagadoDe = r => r.pagado ?? r.price * r.qty;
/* caja de color con la política de cancelación vigente (V 3.4) */
function cajaPolitica(start, pagado, T){
  const tipo = pagado ? politicaCancel(start, pagado, T).tipo : 'libre';
  const ic = {gratis:'✅', mitad:'⚠️', total:'⛔', libre:'ℹ️'}[tipo];
  return `<div class="poli ${tipo}"><span>${ic}</span><span>${esc(textoPolitica(start, pagado, T))}</span></div>`;
}
/* estado: 'prox' | 'vivo' | 'hecho' | 'cancelada' (el guía canceló la salida) | 'yo' (la cancelé yo) */
function estadoReserva(r){
  if(r.cancelada) return 'yo';
  if(r.ext){
    const s = Store.get().salidas[r.tourId];
    if(!s || (r.rid && !Store.existeReserva(r.rid))) return s && s.status === 'finalizada' ? 'hecho' : 'cancelada';
    return s.status === 'en_curso' ? 'vivo' : s.status === 'finalizada' ? 'hecho' : 'prox';
  }
  if(r.rid && !Store.existeReserva(r.rid)) return 'cancelada';     // el guía canceló la copia de la salida
  const T = now();                                  // tours de ejemplo: reloj de la app (acelerable)
  return T < r.start ? 'prox' : T < r.start + r.dur*MIN ? 'vivo' : 'hecho';
}
/* se muestran las vigentes y, hasta un día después, las terminadas o canceladas */
const misReservasVisibles = () => misReservas()
  .filter(r=> ['prox','vivo','cancelada'].includes(estadoReserva(r)) || Date.now() - (r.cancelada ? r.cancelada.ts : r.start + r.dur*MIN) < 864e5)
  .map(r=>({r, act:['prox','vivo'].includes(estadoReserva(r))}))
  .sort((a,b)=> (b.act - a.act) || (a.r.start - b.r.start))     // primero las vigentes
  .map(x=>x.r);
const misReservasActivas = () => misReservas().filter(r=>['prox','vivo'].includes(estadoReserva(r)));
const reservaDe = (tourId, start) => misReservas().find(r=>String(r.tourId) === String(tourId) && r.start === start && estadoReserva(r) === 'prox');

/* ---------- vistas del panel ---------- */
function panelView(v){                 // 'list' | 'detail' | 'pedido' | 'mis'
  document.getElementById('listView').style.display = v === 'list' ? 'flex' : 'none';
  document.getElementById('detailView').hidden = v !== 'detail';
  document.getElementById('pedidoView').hidden = v !== 'pedido';
  document.getElementById('misView').hidden = v !== 'mis';
}
function badgeMis(){
  const n = misPedidosActivos().length + misReservasActivas().length, b = document.getElementById('misBadge');
  if(b){ b.textContent = n; b.hidden = !n; }
}

/* =====================================================================
   FORMULARIO
   ===================================================================== */
let pedidoMode = false, pedLayer = null, pedRoute = [], pedEdit = null;
/* los nombres por defecto se guardan en español (son datos compartidos) y se muestran traducidos */
const pedDefName = i => i === 0 ? 'Punto de salida' : `Lugar ${i}`;
const esDefPed = s => /^(Punto de salida|Lugar \d+)$/.test(s);
const verNombrePed = verLugar;

function openPedido(editId, base){
  if(!map) startApp('demo');
  if(selected) closeDetail();
  pedEdit = editId ? Store.get().pedidos[editId] : null;
  const src = pedEdit || base || null;
  pedRoute = src ? src.route.map(r=>r.slice()) : [];
  pedidoMode = true;
  panelView('pedido');
  if(isMobile()) setSheet(sheetH(.6));
  renderPedidoForm(src);
  if(!pedLayer) pedLayer = L.layerGroup().addTo(map);
  drawPedido();
  if(pedRoute.length) map.flyToBounds(L.latLngBounds(pedRoute.map(r=>[r[0],r[1]])).pad(.3), {duration:.6});
  showHint(pedRoute.length ? tr('Tocá el mapa para sumar lugares') : tr('Tocá el mapa para marcar el punto de salida'));
}
function salirPedido(){
  pedidoMode = false; pedEdit = null;
  if(pedLayer) pedLayer.clearLayers();
  panelView('list'); render(true);
}

/* keep = true: se redibuja con lo que ya escribió el turista (al cambiar de idioma) */
function renderPedidoForm(src, keep = false){
  const T = Date.now();
  const man = new Date(T + 24*60*MIN); man.setHours(10, 0, 0, 0);          // por defecto: mañana 10:00
  const d = src ? {startAt: (pedEdit || keep) ? src.startAt : man.getTime(), personas:src.personas, dur:src.dur, price:src.price,
                   langs:[...src.langs], cat:src.cat, nombre:src.nombre, comentario:src.comentario || ''}
                : {startAt:man.getTime(), personas:PEDIDO.minPersonas, dur:90, price:0, langs:[LANG.toUpperCase()], cat:'historico', nombre:'', comentario:''};
  if(!d.price) d.price = minimoPedido(d);
  precioTocado = !!src && d.price !== minimoPedido(d);        // si el turista no lo cambió, sigue a la referencia AGuiTBA
  if(!d.nombre && !keep){ try { d.nombre = localStorage.getItem(NOMBRE_KEY) || ''; } catch(e){} }
  const min = toLocalInput(T + PEDIDO.anticipacionH*60*MIN), max = toLocalInput(T + PEDIDO.maxDias*24*60*MIN);
  const LANGS = ['ES','EN','PT','FR','IT','DE'];

  document.getElementById('pedidoView').innerHTML = `
    <div class="d-top"><button class="icon-btn" onclick="salirPedido()" aria-label="${tr('Volver')}">←</button><span class="t">✨ ${pedEdit ? tr('Editar pedido') : tr('Pedí tu tour')}</span></div>
    <div class="pv">
      <p class="pv-lead">${tr('Elegí cuándo, desde dónde y qué querés conocer. Un guía cercano toma tu pedido.')}</p>
      <div class="rules" id="pRules"></div>
      <div class="field"><label>${tr('Día y hora de salida')}</label><input class="inp" type="datetime-local" id="pStart" min="${min}" max="${max}" value="${isNaN(d.startAt) ? '' : toLocalInput(d.startAt)}"></div>
      <div class="row2c">
        <div class="field"><label>${tr('Personas')}</label><input class="inp" type="number" id="pPers" min="${PEDIDO.minPersonas}" max="${PEDIDO.maxPersonas}" value="${d.personas}"></div>
        <div class="field"><label>${tr('Duración')}</label><select class="inp" id="pDur">${PEDIDO_DURACIONES.map(m=>`<option value="${m}" ${m===d.dur?'selected':''}>${fmtIn(m)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>${tr('Precio por persona que ofrecés ($)')}</label>
        <input class="inp" type="number" id="pPrice" min="0" step="500" value="${d.price}">
        <div class="total" id="pTotal"></div>
        <div class="ref-ag" id="pRef"></div></div>
      <div class="field"><label>${tr('Idiomas')}</label><div class="langs" id="pLangs">${LANGS.map(l=>`<button type="button" class="chip ${d.langs.includes(l)?'on':''}" data-l="${l}">${l}</button>`).join('')}</div></div>
      <div class="field"><label>${tr('Tipo de tour')}</label><select class="inp" id="pCat">${Object.entries(CATS).map(([k,c])=>`<option value="${k}" ${k===d.cat?'selected':''}>${c.e} ${tr(c.n)}</option>`).join('')}</select></div>
      <div class="field"><label>${tr('Recorrido')}</label>
        <div class="help">${tr('👆 Tocá el mapa para marcar el <b>punto de salida</b> y después los <b>lugares que querés conocer</b>. Podés arrastrarlos y cambiarles el nombre.')}</div>
        <ul class="stops" id="pStops"></ul>
        <div class="stop-tools"><button type="button" class="mini" onclick="pedidoDesdeMi()">📍 ${tr('Salir desde donde estoy')}</button><button type="button" class="mini" onclick="pedidoDeshacer()">↶ ${tr('Deshacer')}</button></div>
      </div>
      <div class="field"><label>${tr('Tu nombre')}</label><input class="inp" id="pNombre" maxlength="40" placeholder="${esc(tr('Para que el guía te reconozca'))}" value="${esc(d.nombre)}"></div>
      <div class="field"><label>${tr('Comentario para el guía (opcional)')}</label><textarea class="inp" id="pCom" maxlength="300" placeholder="${esc(tr('Ej: somos una familia con chicos, nos interesa la historia del tango…'))}">${esc(d.comentario)}</textarea></div>
      <div class="pv-actions"><button class="btn btn-ghost" style="border:1.5px solid var(--line)" onclick="salirPedido()">${tr('Cancelar')}</button><button class="btn btn-primary" onclick="publicarPedido()">${pedEdit ? tr('Guardar cambios') : '📣 ' + tr('Publicar pedido')}</button></div>
      <p class="muted" style="font-size:12px;text-align:center;margin-top:8px">${tr('Pagás directamente al guía. Al publicar aceptás los <a href="terminos.html" target="_blank" rel="noopener">Términos</a> y la <a href="privacidad.html" target="_blank" rel="noopener">Política de privacidad</a>.')}</p>
    </div>`;
  const v = document.getElementById('pedidoView');
  v.oninput = v.onchange = e=>{
    if(e.target.dataset.i != null){ pedRoute[+e.target.dataset.i][2] = e.target.value; drawPedidoMap(); }
    if(e.target.id === 'pPrice') precioTocado = true;
    reglasUI();
  };
  document.getElementById('pLangs').onclick = e=>{ const b = e.target.closest('[data-l]'); if(b){ b.classList.toggle('on'); reglasUI(); } };
  drawPedidoList(); reglasUI();
}

function leerPedido(){
  const val = id => document.getElementById(id).value;
  return {
    startAt: new Date(val('pStart')).getTime(),
    personas: Math.round(+val('pPers') || 0),
    dur: +val('pDur'),
    price: Math.round(+val('pPrice') || 0),
    langs: [...document.querySelectorAll('#pLangs .chip.on')].map(x=>x.dataset.l),
    cat: val('pCat'),
    nombre: val('pNombre').trim(),
    comentario: val('pCom').trim(),
    route: pedRoute,
  };
}
let precioTocado = false;
function reglasUI(){
  const p0 = leerPedido(), ref = minimoPedido(p0);
  if(!precioTocado && p0.personas > 0){ document.getElementById('pPrice').value = ref; }   // sigue a la referencia AGuiTBA
  const p = leerPedido(), rs = reglasPedido(p);
  document.getElementById('pRules').innerHTML = rs.map(r=>`<span class="rule ${r.ok?'ok':''}">${r.ok?'✓':'○'} ${esc(r.txt)}</span>`).join('');
  const tot = p.personas > 0 && p.price > 0 ? tr('Total que recibe el guía: <b>{t}</b> ({n} × {p})', {t:money(p.personas * p.price), n:p.personas, p:money(p.price)}) : '';
  document.getElementById('pTotal').innerHTML = tot;
  const h = honorarioAguitba({langs:p.langs, dur:p.dur, personas:p.personas, cat:p.cat, start:p.startAt});
  document.getElementById('pRef').innerHTML = p.personas > 0 ? `🤝 ${tr('Referencia AGuiTBA para este grupo: <b>{t}</b> ({m} por persona).', {t:money(h.total), m:money(ref)})}`
    + (precioTocado && p.price !== ref ? ` <button type="button" class="link" onclick="usarRefPedido()">${tr('Usar la referencia')}</button>` : '') : '';
}
function usarRefPedido(){ precioTocado = false; reglasUI(); }

/* ---------- recorrido en el mapa ---------- */
function drawPedido(){ drawPedidoMap(); drawPedidoList(); if(document.getElementById('pRules')) reglasUI(); }
/* recorrido por la calle del pedido: se vuelve a pedir solo cuando cambian los puntos */
let pedLegs = null, pedLegsKey = '', pedTrazo = null;
const clavePed = () => pedRoute.map(r=>`${(+r[0]).toFixed(5)},${(+r[1]).toFixed(5)}`).join(';');
function trazarPedido(){
  const key = clavePed();
  if(key === pedLegsKey) return;
  pedLegsKey = key; pedLegs = null;
  if(pedRoute.length < 2){ pedTrazo = null; return; }
  pedTrazo = trazarCalles(pedRoute.map(r=>[+r[0], +r[1]])).then(l=>{
    if(key !== pedLegsKey) return;                 // ya cambiaron los puntos
    pedLegs = l; pedTrazo = null; drawPedidoMap();
  });
}
const pedidoConTramos = () => ({route:pedRoute, legs: pedLegs && pedLegs.length === pedRoute.length - 1 && clavePed() === pedLegsKey ? pedLegs : undefined});
function drawPedidoMap(){
  if(!pedLayer) return;
  pedLayer.clearLayers();
  trazarPedido();
  if(pedRoute.length > 1){
    const t = pedidoConTramos(), ll = lineaTour(t), calle = !!t.legs;
    L.polyline(ll,{color:'#fff',weight:9,opacity:calle ? .9 : .6}).addTo(pedLayer);
    L.polyline(ll,{color:'#9E4468',weight:5,dashArray:'2 10',lineCap:'round',opacity:calle ? 1 : .55}).addTo(pedLayer);
  }
  pedRoute.forEach((r,i)=>{
    const m = L.marker([r[0],r[1]], {draggable:true, zIndexOffset:900, icon:L.divIcon({className:'', html:`<div class="snum ${i===0?'meet':''}">${i===0?'★':i}</div>`, iconSize:i===0?[34,34]:[28,28], iconAnchor:i===0?[17,17]:[14,14]})})
      .addTo(pedLayer).bindTooltip(esc(verNombrePed(r[2])), {direction:'top', offset:[0,-14]});
    m.on('dragend', ()=>{ const p = m.getLatLng(); r[0] = p.lat; r[1] = p.lng; drawPedidoMap(); });
  });
}
function drawPedidoList(){
  const ul = document.getElementById('pStops'); if(!ul) return;
  ul.innerHTML = pedRoute.map((r,i)=>`<li><span class="n ${i===0?'meet':''}">${i===0?'★':i}</span>
      <input class="inp" data-i="${i}" maxlength="60" value="${esc(verNombrePed(r[2]))}">
      <button type="button" class="del" onclick="pedidoQuitar(${i})" title="${esc(tr('Quitar'))}">✕</button></li>`).join('')
    || `<li style="color:var(--ink-3);font-weight:700;font-size:14px">${tr('Todavía no marcaste puntos.')}</li>`;
}
/* nombre: si se tocó un lugar de interés, ya viene con su nombre (no hace falta buscar la calle) */
async function addPedidoStop(ll, nombre){
  const entry = [ll[0], ll[1], nombre || pedDefName(pedRoute.length)];
  pedRoute.push(entry); drawPedido();
  if(pedRoute.length === 1) showHint(tr('Ahora tocá los lugares que querés conocer'));
  if(nombre) return;
  const nm = await nombreDe(ll);
  if(nm && pedRoute.includes(entry) && entry[2] === pedDefName(pedRoute.indexOf(entry))){ entry[2] = nm; drawPedido(); }
}
function pedidoQuitar(i){
  pedRoute.splice(i, 1);
  pedRoute.forEach((r,j)=>{ if(esDefPed(r[2])) r[2] = pedDefName(j); });
  drawPedido();
}
function pedidoDeshacer(){ pedRoute.pop(); drawPedido(); }
async function pedidoDesdeMi(){
  if(!me) return toast({ic:'📍', title:tr('Todavía no sabemos dónde estás'), text:tr('Marcá el punto de salida tocando el mapa.')});
  const entry = [me[0], me[1], 'Punto de salida'];
  if(pedRoute.length) pedRoute[0] = entry; else pedRoute.push(entry);
  drawPedido(); map.setView(me, 16);
  const nm = await nombreDe(me); if(nm && pedRoute[0] === entry){ entry[2] = nm; drawPedido(); }
}

/* ---------- publicar ---------- */
async function publicarPedido(){
  if(pedTrazo) await pedTrazo;                       // esperar el recorrido por la calle
  const p = leerPedido();
  const falla = reglasPedido(p).find(r=>!r.ok);
  if(falla) return toast({ic:'✋', title:tr('Falta algo'), text:falla.err});
  if(!p.langs.length) return toast({ic:'✋', title:tr('Falta algo'), text:tr('Elegí al menos un idioma.')});
  pedRoute.forEach((r,i)=>{ if(!String(r[2]).trim()) r[2] = pedDefName(i); });
  const datos = {...p, route:pedRoute.map(r=>[+r[0].toFixed(6), +r[1].toFixed(6), String(r[2]).trim()]), barrio:nearestBarrio(pedRoute[0])};
  const tl = pedidoConTramos().legs; datos.legs = tl || null;
  try { localStorage.setItem(NOMBRE_KEY, p.nombre); } catch(e){}
  if(pedEdit){
    if(!Store.editarPedido(pedEdit.id, datos)) return toast({ic:'ℹ️', title:tr('No se pudo editar'), text:tr('Un guía ya tomó este pedido o fue cancelado.')});
    toast({ic:'✏️', title:tr('Pedido actualizado'), text:tr('Los guías ya ven los cambios.')});
  } else {
    const nuevo = Store.crearPedido(datos);
    guardarMiPedido(nuevo.id);
    pedAntes = pedFoto(); badgeMis();          // ya es "mío": desde ahora avisamos sus cambios
    toast({ic:'📣', title:tr('¡Pedido publicado!'), text:tr('Los guías cerca de {lugar} ya lo ven. Te avisamos cuando uno lo tome.', {lugar:verNombrePed(datos.route[0][2])}), ttl:9000});
  }
  pedidoMode = false; pedEdit = null; if(pedLayer) pedLayer.clearLayers();
  openMisPedidos();
}

/* =====================================================================
   MIS PEDIDOS
   ===================================================================== */
function openMisPedidos(){
  if(!map) startApp('demo');
  if(selected) closeDetail();
  if(pedidoMode){ pedidoMode = false; if(pedLayer) pedLayer.clearLayers(); }
  panelView('mis');
  if(isMobile() && document.getElementById('panel').offsetHeight < sheetH(.4)) setSheet(sheetH(.5));
  renderMis();
}
function renderMis(){
  const v = document.getElementById('misView'); if(v.hidden) return;
  const ps = misPedidos().filter(p=>p.status !== 'cancelado' || Date.now() - p.createdAt < 864e5);
  const rs = misReservasVisibles();
  v.innerHTML = `
    <div class="d-top"><button class="icon-btn" onclick="panelView('list')" aria-label="${tr('Volver')}">←</button><span class="t">🎟️ ${tr('Mis tours')}</span></div>
    <div class="pv">
      <h4 class="mis-h">🎟️ ${tr('Mis reservas')} ${rs.length ? `<small>· ${rs.length}</small>` : ''}</h4>
      ${rs.length ? rs.map(reservaCardTurista).join('') : `<div class="mis-empty">${tr('Todavía no reservaste ningún tour. Elegí uno de la lista y tocá "Reservar lugar".')}</div>`}
      <div class="mis-sep"></div>
      <h4 class="mis-h">🙋 ${tr('Mis pedidos')} ${ps.length ? `<small>· ${ps.length}</small>` : ''}<span style="flex:1"></span><button class="mini go" onclick="openPedido()">＋ ${tr('Nuevo')}</button></h4>
      ${ps.length ? ps.map(pedidoCardTurista).join('') : `<div class="empty-ped"><div style="font-size:42px">🗺️</div><b>${tr('Todavía no pediste ningún tour')}</b><p>${tr('Elegí día, hora y los lugares que querés conocer. Un guía cercano lo toma.')}</p><button class="btn btn-primary" onclick="openPedido()">✨ ${tr('Pedí tu tour')}</button></div>`}
    </div>`;
}
function reservaCardTurista(r){
  const st = estadoReserva(r), g = GUIDES[r.g], pag = pagadoDe(r);
  let estado, acciones, pago = '';
  if(st === 'prox'){
    estado = `<div class="pst ok">✅ <span>${tr('Reservado · te esperan en el punto de encuentro')}</span></div>`;
    acciones = `${findTour(r.tourId) ? `<button class="mini go" onclick="verTourReservado('${r.id}')">${tr('Ver detalle')}</button>` : ''}<button class="mini danger" onclick="cancelarMiReserva('${r.id}')">${tr('Cancelar reserva')}</button>`;
    pago = cajaPolitica(r.start, pag, relojDe(r.ext));
  } else if(st === 'vivo'){
    estado = `<div class="pst live"><span class="dot"></span> ${tr('¡Tu tour está en vivo!')}</div>`;
    acciones = findTour(r.tourId) ? `<button class="mini go" onclick="verTourReservado('${r.id}')">🔴 ${tr('Ver en el mapa')}</button>` : '';
  } else if(st === 'hecho'){
    estado = `<div class="pst done">🎉 ${g ? tr('Tour realizado con {g}', {g:esc(g.n)}) : tr('Tour realizado')}</div>`;
    acciones = `<button class="mini danger" onclick="borrarMiReserva('${r.id}')">${tr('Borrar')}</button>`;
  } else if(st === 'yo'){
    const c = r.cancelada;
    estado = `<div class="pst off">↩️ ${tr('Cancelaste esta reserva')}${pag ? ` <span>· ${c.reembolso ? tr('se te devolvieron {d}', {d:money(c.reembolso)}) : tr('sin reembolso')}</span>` : ''}</div>`;
    acciones = `<button class="mini danger" onclick="borrarMiReserva('${r.id}')">${tr('Borrar')}</button>`;
  } else {
    estado = `<div class="pst off">${tr('El guía canceló esta salida')}${pag ? ` <span>· ${tr('se te devuelve todo ({d})', {d:money(pag)})}</span>` : ''}</div>`;
    acciones = `<button class="mini danger" onclick="borrarMiReserva('${r.id}')">${tr('Borrar')}</button>`;
  }
  return `<div class="pcard">
    <div class="pc-top"><span class="pc-when"><small>${diaLabel(r.start)}</small><b>${hhmm(r.start)}</b></span>
      <span class="pc-info"><b>${CATS[r.cat].e} ${esc(nombreTour(r.name))}</b>
      <span>📍 ${esc(verLugar(r.meet[2]))}${g ? ' · ' + esc(g.n) : ''}</span>
      <span>👥 ${tn(r.qty, '{n} persona', '{n} personas')} · ⏱️ ${fmtIn(r.dur)} · 💳 ${pag ? tr('pagado {t}', {t:money(pag)}) : tr('A la gorra')}</span></span></div>
    ${estado}
    ${pago ? `<div style="margin-top:8px">${pago}</div>` : ''}
    <div class="acts">${acciones}</div></div>`;
}
function verTourReservado(id){
  const r = misReservas().find(x=>x.id === id); if(!r) return;
  openDetail(r.tourId);
}
/* cancelar: la ventana dice cuánto se devuelve según la política (gratis / 50% / sin reembolso) */
async function cancelarMiReserva(id){
  const r = misReservas().find(x=>x.id === id); if(!r) return;
  if(estadoReserva(r) !== 'prox') return toast({ic:'ℹ️', title:tr('Ya no se puede cancelar'), text:tr('El tour ya empezó.')});
  const pag = pagadoDe(r), pol = politicaCancel(r.start, pag, relojDe(r.ext));
  const base = tn(r.qty, '¿Seguro que querés cancelar tu reserva de {n} lugar para "{t}" ({f})? El lugar queda libre para otra persona.',
              '¿Seguro que querés cancelar tu reserva de {n} lugares para "{t}" ({f})? Los lugares quedan libres para otras personas.',
              {t:nombreTour(r.name), f:fechaLarga(r.start)});
  const plata = !pag ? ''
    : pol.tipo === 'gratis' ? tr('La cancelación es gratuita: se te devuelve todo ({d}).', {d:money(pol.reembolso)})
    : pol.tipo === 'mitad' ? tr('Ya no es gratuita: faltan menos de 24 h. Se te devuelve el 50% ({d}) y se cobran {c}.', {d:money(pol.reembolso), c:money(pol.cargo)})
    : tr('Ya no tiene reembolso: falta menos de 1 hora. Se cobra el total ({c}), pero igual liberás el lugar.', {c:money(pol.cargo)});
  const ok = await confirmBox(pol.tipo === 'gratis' ? tr('Cancelar reserva') : tr('Cancelar reserva con cargo'),
    base + (plata ? '\n\n' + plata : ''), pol.tipo === 'gratis' ? tr('Sí, cancelar') : tr('Cancelar igual'), true);
  if(!ok) return;
  setMisReservas(misReservas().map(x=>x.id === id ? {...x, cancelada:{ts:Date.now(), reembolso:pol.reembolso, cargo:pol.cargo}} : x));
  resVivas.delete(id);                                                      // la cancelé yo: no es aviso del guía
  if(r.rid) Store.cancelarReserva(r.rid, pol.cargo);                       // el guía recibe el aviso; los cupos se recalculan solos
  toast({ic:'↩️', title:tr('Reserva cancelada'), ttl:9000, text:!pag ? tr('Tu lugar quedó libre. Podés reservar otro tour cuando quieras.')
    : pol.reembolso ? tr('Tu lugar quedó libre. Se te devuelven {d}.', {d:money(pol.reembolso)}) : tr('Tu lugar quedó libre. Esta cancelación no tiene reembolso.')});
  badgeMis(); renderMis();
  if(typeof render === 'function'){ render(true); if(selected) renderDetail(true); }
}
function borrarMiReserva(id){ setMisReservas(misReservas().filter(x=>x.id !== id)); badgeMis(); renderMis(); }
function pedidoCardTurista(p){
  const st = estadoPedido(p), s = p.salidaId ? Store.get().salidas[p.salidaId] : null, g = p.g ? GUIDES[p.g] : null;
  let estado, acciones;
  if(st === 'pendiente'){
    estado = `<div class="pst wait">🔎 ${tr('Buscando guía…')} <span>${tr('vence {f}', {f:fechaLarga(p.startAt)})}</span></div>`;
    acciones = `<button class="mini" onclick="openPedido('${p.id}')">✏️ ${tr('Editar')}</button><button class="mini danger" onclick="cancelarMiPedido('${p.id}')">${tr('Cancelar pedido')}</button>`;
  } else if(st === 'tomado' && s){
    if(s.status === 'en_curso'){
      estado = `<div class="pst live"><span class="dot"></span> ${tr('¡Tu tour está en vivo con {g}!', {g:esc(g.n.split(' ')[0])})}</div>`;
      acciones = `<button class="mini go" onclick="openDetail('${s.id}')">🔴 ${tr('Ver en el mapa')}</button>`;
    } else if(s.status === 'finalizada'){
      estado = `<div class="pst done">🎉 ${tr('Tour realizado con {g}', {g:esc(g.n)})}</div>`;
      acciones = `<button class="mini" onclick="openPedido(null, Store.get().pedidos['${p.id}'])">🔁 ${tr('Pedir otro igual')}</button>`;
    } else {
      estado = `<div class="pst ok"><span class="avatar" style="background:${g.c}">${initials(g.n)}</span><span><b>${tr('{g} tomó tu tour', {g:esc(g.n)})}</b><br>⭐ ${g.r} · ${tr('te espera en el punto de salida')}</span></div>`;
      acciones = `<button class="mini go" onclick="openDetail('${s.id}')">${tr('Ver detalle')}</button>`;
    }
  } else if(st === 'vencido'){
    estado = `<div class="pst off">⌛ ${tr('Ningún guía lo tomó a tiempo')}</div>`;
    acciones = `<button class="mini go" onclick="openPedido(null, Store.get().pedidos['${p.id}'])">🔁 ${tr('Volver a pedir')}</button><button class="mini danger" onclick="borrarMiPedido('${p.id}')">${tr('Borrar')}</button>`;
  } else {
    estado = `<div class="pst off">${tr('Cancelado')}</div>`;
    acciones = `<button class="mini danger" onclick="borrarMiPedido('${p.id}')">${tr('Borrar')}</button>`;
  }
  const lugares = p.route.length - 1;
  return `<div class="pcard">
    <div class="pc-top"><span class="pc-when"><small>${diaLabel(p.startAt)}</small><b>${hhmm(p.startAt)}</b></span>
      <span class="pc-info"><b>${CATS[p.cat].e} ${tr('Tour a pedido')} · ${esc(p.barrio)}</b>
      <span>📍 ${esc(verNombrePed(p.route[0][2]))} · ${tn(lugares, '{n} lugar', '{n} lugares')}</span>
      <span>👥 ${p.personas} · ⏱️ ${fmtIn(p.dur)} · 💰 ${tr('{p} c/u ({t})', {p:money(p.price), t:money(p.price * p.personas)})}</span></span></div>
    ${estado}
    <div class="acts">${acciones}</div></div>`;
}
async function cancelarMiPedido(id){
  if(!await confirmBox(tr('Cancelar pedido'), tr('¿Seguro que querés cancelar tu pedido? Los guías dejan de verlo.'), tr('Sí, cancelar'), true)) return;
  Store.cancelarPedido(id); toast({ic:'🗑', title:tr('Pedido cancelado'), text:tr('Ya no lo ven los guías.')}); }
function borrarMiPedido(id){ Store.borrarPedido(id); }

/* ---------- avisos cuando cambia el estado de mis pedidos ---------- */
const pedFoto = () => Object.fromEntries(misPedidos().map(p=>[p.id, estadoPedido(p) + ':' + (Store.get().salidas[p.salidaId]?.status || '')]));
let pedAntes = pedFoto();
Store.on(()=>{
  const ahora = pedFoto();
  for(const p of misPedidos()){
    const [a, sa] = (pedAntes[p.id] || ':').split(':'), [b, sb] = ahora[p.id].split(':');
    const g = p.g ? GUIDES[p.g] : null;
    if(a === 'pendiente' && b === 'tomado' && g)
      toast({ic:'🎉', title:tr('¡{g} tomó tu tour!', {g:g.n.split(' ')[0]}), text:tr('{f} en {lugar}. Tu guía: {g} (⭐ {r}).', {f:fechaLarga(p.startAt), lugar:verNombrePed(p.route[0][2]), g:g.n, r:g.r}), action:{label:tr('Ver'), fn:openMisPedidos}, ttl:12000});
    else if(a === 'tomado' && b === 'pendiente')
      toast({ic:'ℹ️', title:tr('El guía canceló tu tour'), text:tr('Tu pedido volvió a estar disponible para otros guías.'), action:{label:tr('Ver'), fn:openMisPedidos}});
    else if(b === 'tomado' && sa !== 'en_curso' && sb === 'en_curso')
      toast({ic:'🔴', title:tr('¡Tu tour empezó!'), text:tr('Tu guía ya está en el punto de salida. Seguilo en vivo.'), action:{label:tr('Ver en el mapa'), fn:()=>openDetail(p.salidaId)}, ttl:12000});
  }
  pedAntes = ahora;
  avisosReservas();
  badgeMis(); renderMis();
});

/* ---------- aviso cuando el guía cancela una salida que reservé ---------- */
function avisosReservas(){
  for(const r of misReservas()){
    if(!resVivas.has(r.id) || viva(r)) continue;
    resVivas.delete(r.id);
    const pag = pagadoDe(r);
    toast({ic:'⚠️', title:tr('El guía canceló tu tour'), ttl:20000,
      text:tr('"{t}" ({f}) fue cancelado por el guía.', {t:nombreTour(r.name), f:fechaLarga(r.start)}) + ' '
        + (pag ? tr('Se te reembolsa el total de lo abonado: {d}.', {d:money(pag)}) : tr('Era un tour a la gorra: no tenías nada pagado.')),
      action:{label:tr('Ver mis tours'), fn:openMisPedidos}});
  }
  for(const r of misReservas()) if(viva(r)) resVivas.add(r.id);
}

/* ---------- cambio de idioma ---------- */
onLang(()=>{
  if(pedidoMode && document.getElementById('pRules')){
    const cur = leerPedido();
    renderPedidoForm({...cur, route:pedRoute}, true);
    drawPedidoMap();
  }
  renderMis();
});

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

/* ---------- vistas del panel ---------- */
function panelView(v){                 // 'list' | 'detail' | 'pedido' | 'mis'
  document.getElementById('listView').style.display = v === 'list' ? 'flex' : 'none';
  document.getElementById('detailView').hidden = v !== 'detail';
  document.getElementById('pedidoView').hidden = v !== 'pedido';
  document.getElementById('misView').hidden = v !== 'mis';
}
function badgeMis(){
  const n = misPedidosActivos().length, b = document.getElementById('misBadge');
  if(b){ b.textContent = n; b.hidden = !n; }
}

/* =====================================================================
   FORMULARIO
   ===================================================================== */
let pedidoMode = false, pedLayer = null, pedRoute = [], pedEdit = null;
const pedDefName = i => i === 0 ? 'Punto de salida' : `Lugar ${i}`;

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
  showHint(pedRoute.length ? 'Tocá el mapa para sumar lugares' : 'Tocá el mapa para marcar el punto de salida');
}
function salirPedido(){
  pedidoMode = false; pedEdit = null;
  if(pedLayer) pedLayer.clearLayers();
  panelView('list'); render(true);
}

function renderPedidoForm(src){
  const T = Date.now();
  const man = new Date(T + 24*60*MIN); man.setHours(10, 0, 0, 0);          // por defecto: mañana 10:00
  const d = src ? {startAt: pedEdit ? src.startAt : man.getTime(), personas:src.personas, dur:src.dur, price:src.price,
                   langs:[...src.langs], cat:src.cat, nombre:src.nombre, comentario:src.comentario || ''}
                : {startAt:man.getTime(), personas:PEDIDO.minPersonas, dur:90, price:PEDIDO.minPrecio, langs:['ES'], cat:'historico', nombre:'', comentario:''};
  if(!d.nombre){ try { d.nombre = localStorage.getItem(NOMBRE_KEY) || ''; } catch(e){} }
  const min = toLocalInput(T + PEDIDO.anticipacionH*60*MIN), max = toLocalInput(T + PEDIDO.maxDias*24*60*MIN);
  const LANGS = ['ES','EN','PT','FR','IT','DE'];

  document.getElementById('pedidoView').innerHTML = `
    <div class="d-top"><button class="icon-btn" onclick="salirPedido()" aria-label="Volver">←</button><span class="t">✨ ${pedEdit ? 'Editar pedido' : 'Pedí tu tour'}</span></div>
    <div class="pv">
      <p class="pv-lead">Elegí cuándo, desde dónde y qué querés conocer. Un guía cercano toma tu pedido.</p>
      <div class="rules" id="pRules"></div>
      <div class="field"><label>Día y hora de salida</label><input class="inp" type="datetime-local" id="pStart" min="${min}" max="${max}" value="${toLocalInput(d.startAt)}"></div>
      <div class="row2c">
        <div class="field"><label>Personas</label><input class="inp" type="number" id="pPers" min="${PEDIDO.minPersonas}" max="${PEDIDO.maxPersonas}" value="${d.personas}"></div>
        <div class="field"><label>Duración</label><select class="inp" id="pDur">${PEDIDO_DURACIONES.map(m=>`<option value="${m}" ${m===d.dur?'selected':''}>${fmtIn(m)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>Precio por persona que ofrecés ($)</label>
        <input class="inp" type="number" id="pPrice" min="${PEDIDO.minPrecio}" step="500" value="${d.price}">
        <div class="total" id="pTotal"></div></div>
      <div class="field"><label>Idiomas</label><div class="langs" id="pLangs">${LANGS.map(l=>`<button type="button" class="chip ${d.langs.includes(l)?'on':''}" data-l="${l}">${l}</button>`).join('')}</div></div>
      <div class="field"><label>Tipo de tour</label><select class="inp" id="pCat">${Object.entries(CATS).map(([k,c])=>`<option value="${k}" ${k===d.cat?'selected':''}>${c.e} ${c.n}</option>`).join('')}</select></div>
      <div class="field"><label>Recorrido</label>
        <div class="help">👆 Tocá el mapa para marcar el <b>punto de salida</b> y después los <b>lugares que querés conocer</b>. Podés arrastrarlos y cambiarles el nombre.</div>
        <ul class="stops" id="pStops"></ul>
        <div class="stop-tools"><button type="button" class="mini" onclick="pedidoDesdeMi()">📍 Salir desde donde estoy</button><button type="button" class="mini" onclick="pedidoDeshacer()">↶ Deshacer</button></div>
      </div>
      <div class="field"><label>Tu nombre</label><input class="inp" id="pNombre" maxlength="40" placeholder="Para que el guía te reconozca" value="${esc(d.nombre)}"></div>
      <div class="field"><label>Comentario para el guía (opcional)</label><textarea class="inp" id="pCom" maxlength="300" placeholder="Ej: somos una familia con chicos, nos interesa la historia del tango…">${esc(d.comentario)}</textarea></div>
      <div class="pv-actions"><button class="btn btn-ghost" style="border:1.5px solid var(--line)" onclick="salirPedido()">Cancelar</button><button class="btn btn-primary" onclick="publicarPedido()">${pedEdit ? 'Guardar cambios' : '📣 Publicar pedido'}</button></div>
      <p class="muted" style="font-size:12px;text-align:center;margin-top:8px">Pagás directamente al guía. Al publicar aceptás los <a href="terminos.html" target="_blank" rel="noopener">Términos</a> y la <a href="privacidad.html" target="_blank" rel="noopener">Política de privacidad</a>.</p>
    </div>`;
  const v = document.getElementById('pedidoView');
  v.oninput = v.onchange = e=>{
    if(e.target.dataset.i != null){ pedRoute[+e.target.dataset.i][2] = e.target.value; drawPedidoMap(); }
    reglasUI();
  };
  document.getElementById('pLangs').onclick = e=>{ const b = e.target.closest('[data-l]'); if(b) b.classList.toggle('on'); };
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
function reglasUI(){
  const p = leerPedido(), rs = reglasPedido(p);
  document.getElementById('pRules').innerHTML = rs.map(r=>`<span class="rule ${r.ok?'ok':''}">${r.ok?'✓':'○'} ${esc(r.txt)}</span>`).join('');
  const tot = p.personas > 0 && p.price > 0 ? `Total que recibe el guía: <b>${money(p.personas * p.price)}</b> (${p.personas} × ${money(p.price)})` : '';
  document.getElementById('pTotal').innerHTML = tot;
}

/* ---------- recorrido en el mapa ---------- */
function drawPedido(){ drawPedidoMap(); drawPedidoList(); if(document.getElementById('pRules')) reglasUI(); }
function drawPedidoMap(){
  if(!pedLayer) return;
  pedLayer.clearLayers();
  if(pedRoute.length > 1){
    const ll = pedRoute.map(r=>[r[0],r[1]]);
    L.polyline(ll,{color:'#fff',weight:9,opacity:.9}).addTo(pedLayer);
    L.polyline(ll,{color:'#9E4468',weight:5,dashArray:'2 10',lineCap:'round'}).addTo(pedLayer);
  }
  pedRoute.forEach((r,i)=>{
    const m = L.marker([r[0],r[1]], {draggable:true, zIndexOffset:900, icon:L.divIcon({className:'', html:`<div class="snum ${i===0?'meet':''}">${i===0?'★':i}</div>`, iconSize:i===0?[34,34]:[28,28], iconAnchor:i===0?[17,17]:[14,14]})})
      .addTo(pedLayer).bindTooltip(esc(r[2]), {direction:'top', offset:[0,-14]});
    m.on('dragend', ()=>{ const p = m.getLatLng(); r[0] = p.lat; r[1] = p.lng; drawPedidoMap(); });
  });
}
function drawPedidoList(){
  const ul = document.getElementById('pStops'); if(!ul) return;
  ul.innerHTML = pedRoute.map((r,i)=>`<li><span class="n ${i===0?'meet':''}">${i===0?'★':i}</span>
      <input class="inp" data-i="${i}" maxlength="60" value="${esc(r[2])}">
      <button type="button" class="del" onclick="pedidoQuitar(${i})" title="Quitar">✕</button></li>`).join('')
    || '<li style="color:var(--ink-3);font-weight:700;font-size:14px">Todavía no marcaste puntos.</li>';
}
async function addPedidoStop(ll){
  const entry = [ll[0], ll[1], pedDefName(pedRoute.length)];
  pedRoute.push(entry); drawPedido();
  if(pedRoute.length === 1) showHint('Ahora tocá los lugares que querés conocer');
  const nm = await nombreDe(ll);
  if(nm && pedRoute.includes(entry) && entry[2] === pedDefName(pedRoute.indexOf(entry))){ entry[2] = nm; drawPedido(); }
}
function pedidoQuitar(i){
  pedRoute.splice(i, 1);
  pedRoute.forEach((r,j)=>{ if(/^(Punto de salida|Lugar \d+)$/.test(r[2])) r[2] = pedDefName(j); });
  drawPedido();
}
function pedidoDeshacer(){ pedRoute.pop(); drawPedido(); }
async function pedidoDesdeMi(){
  if(!me) return toast({ic:'📍', title:'Todavía no sabemos dónde estás', text:'Marcá el punto de salida tocando el mapa.'});
  const entry = [me[0], me[1], 'Punto de salida'];
  if(pedRoute.length) pedRoute[0] = entry; else pedRoute.push(entry);
  drawPedido(); map.setView(me, 16);
  const nm = await nombreDe(me); if(nm && pedRoute[0] === entry){ entry[2] = nm; drawPedido(); }
}

/* ---------- publicar ---------- */
function publicarPedido(){
  const p = leerPedido();
  const falla = reglasPedido(p).find(r=>!r.ok);
  if(falla) return toast({ic:'✋', title:'Falta algo', text:falla.err});
  if(!p.langs.length) return toast({ic:'✋', title:'Falta algo', text:'Elegí al menos un idioma.'});
  pedRoute.forEach((r,i)=>{ if(!String(r[2]).trim()) r[2] = pedDefName(i); });
  const datos = {...p, route:pedRoute.map(r=>[+r[0].toFixed(6), +r[1].toFixed(6), String(r[2]).trim()]), barrio:nearestBarrio(pedRoute[0])};
  try { localStorage.setItem(NOMBRE_KEY, p.nombre); } catch(e){}
  if(pedEdit){
    if(!Store.editarPedido(pedEdit.id, datos)) return toast({ic:'ℹ️', title:'No se pudo editar', text:'Un guía ya tomó este pedido o fue cancelado.'});
    toast({ic:'✏️', title:'Pedido actualizado', text:'Los guías ya ven los cambios.'});
  } else {
    const nuevo = Store.crearPedido(datos);
    guardarMiPedido(nuevo.id);
    pedAntes = pedFoto(); badgeMis();          // ya es "mío": desde ahora avisamos sus cambios
    toast({ic:'📣', title:'¡Pedido publicado!', text:`Los guías cerca de ${datos.route[0][2]} ya lo ven. Te avisamos cuando uno lo tome.`, ttl:9000});
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
  v.innerHTML = `
    <div class="d-top"><button class="icon-btn" onclick="panelView('list')" aria-label="Volver">←</button><span class="t">🙋 Mis pedidos</span>
      <span style="flex:1"></span><button class="mini go" onclick="openPedido()">＋ Nuevo</button></div>
    <div class="pv">
      ${ps.length ? ps.map(pedidoCardTurista).join('') : `<div class="empty-ped"><div style="font-size:42px">🗺️</div><b>Todavía no pediste ningún tour</b><p>Elegí día, hora y los lugares que querés conocer. Un guía cercano lo toma.</p><button class="btn btn-primary" onclick="openPedido()">✨ Pedí tu tour</button></div>`}
    </div>`;
}
function pedidoCardTurista(p){
  const st = estadoPedido(p), s = p.salidaId ? Store.get().salidas[p.salidaId] : null, g = p.g ? GUIDES[p.g] : null;
  let estado, acciones;
  if(st === 'pendiente'){
    estado = `<div class="pst wait">🔎 Buscando guía… <span>vence ${fechaLarga(p.startAt)}</span></div>`;
    acciones = `<button class="mini" onclick="openPedido('${p.id}')">✏️ Editar</button><button class="mini danger" onclick="cancelarMiPedido('${p.id}')">Cancelar pedido</button>`;
  } else if(st === 'tomado' && s){
    if(s.status === 'en_curso'){
      estado = `<div class="pst live"><span class="dot"></span> ¡Tu tour está en vivo con ${esc(g.n.split(' ')[0])}!</div>`;
      acciones = `<button class="mini go" onclick="openDetail('${s.id}')">🔴 Ver en el mapa</button>`;
    } else if(s.status === 'finalizada'){
      estado = `<div class="pst done">🎉 Tour realizado con ${esc(g.n)}</div>`;
      acciones = `<button class="mini" onclick="openPedido(null, Store.get().pedidos['${p.id}'])">🔁 Pedir otro igual</button>`;
    } else {
      estado = `<div class="pst ok"><span class="avatar" style="background:${g.c}">${initials(g.n)}</span><span><b>${esc(g.n)} tomó tu tour</b><br>⭐ ${g.r} · te espera en el punto de salida</span></div>`;
      acciones = `<button class="mini go" onclick="openDetail('${s.id}')">Ver detalle</button>`;
    }
  } else if(st === 'vencido'){
    estado = `<div class="pst off">⌛ Ningún guía lo tomó a tiempo</div>`;
    acciones = `<button class="mini go" onclick="openPedido(null, Store.get().pedidos['${p.id}'])">🔁 Volver a pedir</button><button class="mini danger" onclick="borrarMiPedido('${p.id}')">Borrar</button>`;
  } else {
    estado = `<div class="pst off">Cancelado</div>`;
    acciones = `<button class="mini danger" onclick="borrarMiPedido('${p.id}')">Borrar</button>`;
  }
  return `<div class="pcard">
    <div class="pc-top"><span class="pc-when"><small>${diaLabel(p.startAt)}</small><b>${hhmm(p.startAt)}</b></span>
      <span class="pc-info"><b>${CATS[p.cat].e} Tour a pedido · ${esc(p.barrio)}</b>
      <span>📍 ${esc(p.route[0][2])} · ${p.route.length - 1} lugar${p.route.length === 2 ? '' : 'es'}</span>
      <span>👥 ${p.personas} · ⏱️ ${fmtIn(p.dur)} · 💰 ${money(p.price)} c/u (${money(p.price * p.personas)})</span></span></div>
    ${estado}
    <div class="acts">${acciones}</div></div>`;
}
function cancelarMiPedido(id){ Store.cancelarPedido(id); toast({ic:'🗑', title:'Pedido cancelado', text:'Ya no lo ven los guías.'}); }
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
      toast({ic:'🎉', title:`¡${g.n.split(' ')[0]} tomó tu tour!`, text:`${fechaLarga(p.startAt)} en ${p.route[0][2]}. Tu guía: ${g.n} (⭐ ${g.r}).`, action:{label:'Ver', fn:openMisPedidos}, ttl:12000});
    else if(a === 'tomado' && b === 'pendiente')
      toast({ic:'ℹ️', title:'El guía canceló tu tour', text:'Tu pedido volvió a estar disponible para otros guías.', action:{label:'Ver', fn:openMisPedidos}});
    else if(b === 'tomado' && sa !== 'en_curso' && sb === 'en_curso')
      toast({ic:'🔴', title:'¡Tu tour empezó!', text:'Tu guía ya está en el punto de salida. Seguilo en vivo.', action:{label:'Ver en el mapa', fn:()=>openDetail(p.salidaId)}, ttl:12000});
  }
  pedAntes = ahora;
  badgeMis(); renderMis();
});

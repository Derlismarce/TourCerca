/* =====================================================================
   TourCerca · pedidos de turistas en el panel del guía
   El guía ve los pedidos cerca de su zona, recibe una alerta cuando
   aparece uno nuevo y el primero que lo toma se lo queda.
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.
   ===================================================================== */

/* ---------- zona del guía: alrededor de los puntos de encuentro de sus tours ---------- */
const RADIOS = [1, 3, 5, 10, 0];                 // km; 0 = todos
function radioGuia(){ try { const v = localStorage.getItem('tourcerca.radio.' + guia); return v == null ? 3 : +v; } catch(e){ return 3; } }
function setRadioGuia(v){ try { localStorage.setItem('tourcerca.radio.' + guia, v); } catch(e){} }
function distZona(ll){
  const z = misTours().map(tour=>tour.route[0]);
  return z.length ? Math.min(...z.map(p=>distM(ll, p))) : 0;
}
const pedidosAbiertos = () => Store.pedidos().filter(p=>estadoPedido(p) === 'pendiente');
function pedidosParaGuia(){
  const r = radioGuia() * 1000;
  const todos = pedidosAbiertos().map(p=>({p, d:distZona(p.route[0])})).sort((a,b)=>a.p.startAt - b.p.startAt);
  return {cerca: r ? todos.filter(x=>x.d <= r) : todos, lejos: r ? todos.filter(x=>x.d > r).length : 0};
}

/* ---------- sección en "Mis salidas" ---------- */
function seccionPedidos(){
  const {cerca, lejos} = pedidosParaGuia(), r = radioGuia();
  return `<section class="g-sec">
    <h2>🙋 ${tr('Pedidos de turistas')} <small>${cerca.length ? (r ? tr('{n} cerca tuyo', {n:cerca.length}) : tr('{n} en total', {n:cerca.length})) : ''}</small></h2>
    <div class="radios">${tr('Mostrar pedidos a')} ${RADIOS.map(v=>`<button class="chip ${v===r?'on':''}" data-act="radio" data-id="${v}">${v ? v + ' km' : tr('Todos')}</button>`).join('')}
      <span class="radio-help">${tr('de los puntos de encuentro de tus tours')}</span></div>
    ${cerca.length ? cerca.map(({p,d})=>pedidoCardGuia(p, d)).join('')
      : `<div class="empty-box">${r ? tr('No hay pedidos a menos de {r} km de tu zona en este momento.', {r}) : tr('No hay pedidos abiertos en este momento.')}<br>
         ${tr('Te avisamos apenas aparezca uno.')}${lejos ? ` <br><button class="mini" data-act="radio" data-id="0" style="margin-top:8px">${tn(lejos, 'Ver {n} pedido más lejos', 'Ver {n} pedidos más lejos')}</button>` : ''}
         <br><button class="mini" data-act="ped-demo" style="margin-top:8px">🧪 ${tr('Crear un pedido de ejemplo')}</button></div>`}
    ${cerca.length && lejos ? `<p class="radio-help" style="text-align:center">${tn(lejos, 'y {n} pedido más lejos', 'y {n} pedidos más lejos')} · <button class="mini" data-act="radio" data-id="0">${tr('Ver todos')}</button></p>` : ''}
  </section>`;
}
function pedidoCardGuia(p, d){
  const m = Math.ceil((p.startAt - Date.now()) / MIN);
  return `<div class="sal ped">
    <div class="when"><small>${diaLabel(p.startAt)}</small><b>${hhmm(p.startAt)}</b><i>${m <= 24*60 ? tr('en {t}', {t:fmtIn(m)}) : ''}</i></div>
    <div class="info">
      <h3>${CATS[p.cat].e} ${tr('Pedido de {n}', {n:esc(p.nombre)})} <span class="ped-total">${money(p.price * p.personas)}</span></h3>
      <div class="meta"><span>📍 ${tr('{lugar} · a {d} de tu zona', {lugar:esc(verLugar(p.route[0][2])), d:fmtDist(d)})}</span><span>👥 ${tr('{n} personas', {n:p.personas})}</span><span>⏱️ ${fmtIn(p.dur)}</span><span>💰 ${tr('{p} c/u', {p:money(p.price)})}</span><span>🗣️ ${p.langs.join(' · ')}</span></div>
      ${p.comentario ? `<p class="ped-com">"${esc(p.comentario)}"</p>` : ''}
      <div class="acts"><button class="mini go" data-act="ped-tomar" data-id="${p.id}">✋ ${tr('Tomar pedido')}</button><button class="mini" data-act="ped-ver" data-id="${p.id}">🗺️ ${tn(p.route.length - 1, 'Ver recorrido ({n} lugar)', 'Ver recorrido ({n} lugares)')}</button></div>
    </div></div>`;
}

/* ---------- ver el pedido con su recorrido ---------- */
function verPedido(id){
  const p = Store.get().pedidos[id];
  if(!p || estadoPedido(p) !== 'pendiente') return toast({ic:'ℹ️', title:tr('Este pedido ya no está disponible'), text:tr('Otro guía lo tomó o el turista lo canceló.')});
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="modal" style="width:min(520px,100%)">
    <h3>${CATS[p.cat].e} ${tr('Pedido de {n}', {n:esc(p.nombre)})}</h3>
    <p class="muted">${fechaLarga(p.startAt)} · ${tr('{n} personas', {n:p.personas})} · ${fmtIn(p.dur)} · ${p.langs.join(' · ')}</p>
    <div class="minimap" id="pedMap"></div>
    <ul class="timeline">${p.route.map((r,i)=>`<li>${i===0?`<b>${tr('Salida:')}</b> `:''}${esc(verLugar(r[2]))}</li>`).join('')}</ul>
    ${p.comentario ? `<p class="ped-com">"${esc(p.comentario)}"</p>` : ''}
    <div class="ped-pay"><span>${tr('Cobrás')}</span><b>${money(p.price * p.personas)}</b><small>${tr('{n} × {p}, directamente del grupo', {n:p.personas, p:money(p.price)})}</small></div>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn-ghost" style="flex:1;border:1.5px solid var(--line)" data-x>${tr('Cerrar')}</button><button class="btn btn-primary" style="flex:1" data-tomar>✋ ${tr('Tomar pedido')}</button></div>
  </div>`;
  document.body.appendChild(ov);
  const mm = L.map('pedMap', {zoomControl:false, attributionControl:false});
  baseTiles().addTo(mm);
  const ll = p.route.map(r=>[r[0],r[1]]);
  L.polyline(ll,{color:'#fff',weight:8}).addTo(mm);
  L.polyline(ll,{color:'#E07FA3',weight:4,dashArray:'2 9',lineCap:'round'}).addTo(mm);
  p.route.forEach((r,i)=>L.marker([r[0],r[1]], {icon:L.divIcon({className:'', html:`<div class="snum ${i===0?'meet':''}">${i===0?'★':i}</div>`, iconSize:[28,28], iconAnchor:[14,14]})}).addTo(mm).bindTooltip(esc(verLugar(r[2]))));
  mm.fitBounds(L.latLngBounds(ll).pad(.25));
  const cerrar = ()=>{ mm.remove(); ov.remove(); };
  ov.onclick = e=>{
    if(e.target === ov || e.target.hasAttribute('data-x')) return cerrar();
    if(e.target.hasAttribute('data-tomar')){ cerrar(); tomarPedidoUI(id); }
  };
}

/* ---------- tomar un pedido ---------- */
async function tomarPedidoUI(id){
  const p = Store.get().pedidos[id];
  if(!p || estadoPedido(p) !== 'pendiente') return toast({ic:'ℹ️', title:tr('Este pedido ya no está disponible'), text:tr('Otro guía lo tomó o el turista lo canceló.')});
  const ok = await confirmBox(tr('Tomar pedido'),
    tr('Vas a guiar a {n} personas {f} desde {lugar} ({d}). Cobrás {t}. El pedido pasa a tus próximas salidas.', {n:p.personas, f:fechaFrase(p.startAt), lugar:verLugar(p.route[0][2]), d:fmtIn(p.dur), t:money(p.price * p.personas)}),
    '✋ ' + tr('Lo tomo'), false);
  if(!ok) return;
  const s = Store.tomarPedido(id, guia);
  if(!s) return toast({ic:'😕', title:tr('Llegaste tarde'), text:tr('Otro guía tomó este pedido un instante antes.')});
  toast({ic:'🎉', title:tr('¡El pedido es tuyo!'), text:tr('Ya está en tus próximas salidas. {n} recibe el aviso de que lo tomaste.', {n:p.nombre}), ttl:9000});
  if(curView === 'dash') vDash();
}

/* ---------- pedido de ejemplo (para mostrar la función en la presentación) ---------- */
function crearPedidoDemo(){
  const tour = misTours()[0] || TOURS[0];
  const man = new Date(Date.now() + 24*60*MIN); man.setHours(11, 0, 0, 0);
  const nombres = ['Ana y familia', 'Grupo de Mendoza', 'Julieta', 'Colegio San Martín', 'Pedro y amigos'];
  const p = Store.crearPedido({
    startAt: man.getTime(), personas: 6, dur: 120, price: 18000, langs: ['ES','EN'], cat: tour.cat,
    nombre: nombres[Math.floor(Math.random() * nombres.length)], comentario: tr('Nos interesa mucho la historia del barrio. Vamos con dos chicos de 10 años.'),
    route: tour.route.map(r=>[r[0] + .0006, r[1] - .0005, r[2]]).slice(0, 4), barrio: nearestBarrio(tour.route[0]),
  });
  return p;
}

/* ---------- alerta cuando aparece un pedido nuevo cerca ---------- */
const pedidosVistos = new Set(Store.pedidos().map(p=>p.id));
Store.on(()=>{
  for(const p of pedidosAbiertos()){
    if(pedidosVistos.has(p.id)) continue;
    pedidosVistos.add(p.id);
    if(!guia) continue;
    const r = radioGuia(), d = distZona(p.route[0]);
    if(r && d > r * 1000) continue;
    toast({ic:'🔔', title:tr('¡Nuevo pedido cerca tuyo!'),
      text:tr('{n} personas · {f} · {lugar} (a {d}) · {t}', {n:p.personas, f:fechaLarga(p.startAt), lugar:verLugar(p.route[0][2]), d:fmtDist(d), t:money(p.price * p.personas)}),
      action:{label:tr('Ver pedido'), fn:()=>verPedido(p.id)}, ttl:15000});
  }
});

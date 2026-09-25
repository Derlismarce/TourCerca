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
  const z = misTours().map(t=>t.route[0]);
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
    <h2>🙋 Pedidos de turistas <small>${cerca.length ? `${cerca.length} ${r ? 'cerca tuyo' : 'en total'}` : ''}</small></h2>
    <div class="radios">Mostrar pedidos a ${RADIOS.map(v=>`<button class="chip ${v===r?'on':''}" data-act="radio" data-id="${v}">${v ? v + ' km' : 'Todos'}</button>`).join('')}
      <span class="radio-help">de los puntos de encuentro de tus tours</span></div>
    ${cerca.length ? cerca.map(({p,d})=>pedidoCardGuia(p, d)).join('')
      : `<div class="empty-box">No hay pedidos ${r ? `a menos de ${r} km de tu zona` : 'abiertos'} en este momento.<br>
         Te avisamos apenas aparezca uno.${lejos ? ` <br><button class="mini" data-act="radio" data-id="0" style="margin-top:8px">Ver ${lejos} pedido${lejos>1?'s':''} más lejos</button>` : ''}
         <br><button class="mini" data-act="ped-demo" style="margin-top:8px">🧪 Crear un pedido de ejemplo</button></div>`}
    ${cerca.length && lejos ? `<p class="radio-help" style="text-align:center">y ${lejos} pedido${lejos>1?'s':''} más lejos · <button class="mini" data-act="radio" data-id="0">Ver todos</button></p>` : ''}
  </section>`;
}
function pedidoCardGuia(p, d){
  const m = Math.ceil((p.startAt - Date.now()) / MIN);
  return `<div class="sal ped">
    <div class="when"><small>${diaLabel(p.startAt)}</small><b>${hhmm(p.startAt)}</b><i>${m <= 24*60 ? 'en ' + fmtIn(m) : ''}</i></div>
    <div class="info">
      <h3>${CATS[p.cat].e} Pedido de ${esc(p.nombre)} <span class="ped-total">${money(p.price * p.personas)}</span></h3>
      <div class="meta"><span>📍 ${esc(p.route[0][2])} · a ${fmtDist(d)} de tu zona</span><span>👥 ${p.personas} personas</span><span>⏱️ ${fmtIn(p.dur)}</span><span>💰 ${money(p.price)} c/u</span><span>🗣️ ${p.langs.join(' · ')}</span></div>
      ${p.comentario ? `<p class="ped-com">"${esc(p.comentario)}"</p>` : ''}
      <div class="acts"><button class="mini go" data-act="ped-tomar" data-id="${p.id}">✋ Tomar pedido</button><button class="mini" data-act="ped-ver" data-id="${p.id}">🗺️ Ver recorrido (${p.route.length - 1} lugares)</button></div>
    </div></div>`;
}

/* ---------- ver el pedido con su recorrido ---------- */
function verPedido(id){
  const p = Store.get().pedidos[id];
  if(!p || estadoPedido(p) !== 'pendiente') return toast({ic:'ℹ️', title:'Este pedido ya no está disponible', text:'Otro guía lo tomó o el turista lo canceló.'});
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="modal" style="width:min(520px,100%)">
    <h3>${CATS[p.cat].e} Pedido de ${esc(p.nombre)}</h3>
    <p class="muted">${fechaLarga(p.startAt)} · ${p.personas} personas · ${fmtIn(p.dur)} · ${p.langs.join(' · ')}</p>
    <div class="minimap" id="pedMap"></div>
    <ul class="timeline">${p.route.map((r,i)=>`<li>${i===0?'<b>Salida:</b> ':''}${esc(r[2])}</li>`).join('')}</ul>
    ${p.comentario ? `<p class="ped-com">"${esc(p.comentario)}"</p>` : ''}
    <div class="ped-pay"><span>Cobrás</span><b>${money(p.price * p.personas)}</b><small>${p.personas} × ${money(p.price)}, directamente del grupo</small></div>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn-ghost" style="flex:1;border:1.5px solid var(--line)" data-x>Cerrar</button><button class="btn btn-primary" style="flex:1" data-tomar>✋ Tomar pedido</button></div>
  </div>`;
  document.body.appendChild(ov);
  const mm = L.map('pedMap', {zoomControl:false, attributionControl:false});
  baseTiles().addTo(mm);
  const ll = p.route.map(r=>[r[0],r[1]]);
  L.polyline(ll,{color:'#fff',weight:8}).addTo(mm);
  L.polyline(ll,{color:'#E07FA3',weight:4,dashArray:'2 9',lineCap:'round'}).addTo(mm);
  p.route.forEach((r,i)=>L.marker([r[0],r[1]], {icon:L.divIcon({className:'', html:`<div class="snum ${i===0?'meet':''}">${i===0?'★':i}</div>`, iconSize:[28,28], iconAnchor:[14,14]})}).addTo(mm).bindTooltip(esc(r[2])));
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
  if(!p || estadoPedido(p) !== 'pendiente') return toast({ic:'ℹ️', title:'Este pedido ya no está disponible', text:'Otro guía lo tomó o el turista lo canceló.'});
  const ok = await confirmBox('Tomar pedido',
    `Vas a guiar a ${p.personas} personas ${fechaFrase(p.startAt)} desde ${p.route[0][2]} (${fmtIn(p.dur)}). Cobrás ${money(p.price * p.personas)}. El pedido pasa a tus próximas salidas.`,
    '✋ Lo tomo', false);
  if(!ok) return;
  const s = Store.tomarPedido(id, guia);
  if(!s) return toast({ic:'😕', title:'Llegaste tarde', text:'Otro guía tomó este pedido un instante antes.'});
  toast({ic:'🎉', title:'¡El pedido es tuyo!', text:`Ya está en tus próximas salidas. ${p.nombre} recibe el aviso de que lo tomaste.`, ttl:9000});
  if(curView === 'dash') vDash();
}

/* ---------- pedido de ejemplo (para mostrar la función en la presentación) ---------- */
function crearPedidoDemo(){
  const t = misTours()[0] || TOURS[0];
  const man = new Date(Date.now() + 24*60*MIN); man.setHours(11, 0, 0, 0);
  const nombres = ['Ana y familia', 'Grupo de Mendoza', 'Julieta', 'Colegio San Martín', 'Pedro y amigos'];
  const p = Store.crearPedido({
    startAt: man.getTime(), personas: 6, dur: 120, price: 18000, langs: ['ES','EN'], cat: t.cat,
    nombre: nombres[Math.floor(Math.random() * nombres.length)], comentario: 'Nos interesa mucho la historia del barrio. Vamos con dos chicos de 10 años.',
    route: t.route.map(r=>[r[0] + .0006, r[1] - .0005, r[2]]).slice(0, 4), barrio: nearestBarrio(t.route[0]),
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
    toast({ic:'🔔', title:'¡Nuevo pedido cerca tuyo!',
      text:`${p.personas} personas · ${fechaLarga(p.startAt)} · ${p.route[0][2]} (a ${fmtDist(d)}) · ${money(p.price * p.personas)}`,
      action:{label:'Ver pedido', fn:()=>verPedido(p.id)}, ttl:15000});
  }
});

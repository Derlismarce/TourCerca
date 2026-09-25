/* =====================================================================
   TourCerca · almacén de datos compartido entre guía y turista
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.

   V 3.0: suma los pedidos de turistas ("Pedí tu tour").
   Guarda todo en el navegador (localStorage). Guía y turista se
   ven en tiempo real si están en el MISMO navegador (por ejemplo, dos
   pestañas en la misma computadora o en el mismo celular).

   Próximo paso: cambiar el interior de este archivo por Firebase para
   que funcione entre celulares distintos. El resto de la app no cambia
   porque solo usa las funciones de acá.
   ===================================================================== */
const Store = (()=>{
  const KEY = 'tourcerca.datos.v2';
  const empty = ()=>({tours:{}, salidas:{}, live:{}, reservas:[], pedidos:{}});
  const subs = [];
  let cache = load();

  function load(){
    try { return Object.assign(empty(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch(e){ return empty(); }
  }
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch(e){}
    subs.forEach(f=>f());
  }
  // cambios hechos en otra pestaña
  window.addEventListener('storage', e=>{
    if(e.key === KEY){ cache = load(); subs.forEach(f=>f()); }
  });
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

  return {
    get: ()=>cache,
    on: f=>subs.push(f),

    /* tours propios del guía (plantillas para programar salidas) */
    guardarTour(t){ if(!t.id) t.id = uid('t_'); cache.tours[t.id] = t; save(); return t; },
    borrarTour(id){ delete cache.tours[id]; save(); },

    /* salidas programadas (lo que ve el turista) */
    salidas: ()=>Object.values(cache.salidas),
    guardarSalida(s){ if(!s.id) s.id = uid('s_'); cache.salidas[s.id] = s; save(); return s; },
    borrarSalida(id){
      const s = cache.salidas[id], p = s && s.pedidoId && cache.pedidos[s.pedidoId];
      if(p && p.status === 'tomado' && s.status !== 'finalizada'){
        p.status = 'pendiente'; p.liberadoPor = p.g; delete p.g; delete p.salidaId; delete p.tomadoAt;
      }
      delete cache.salidas[id]; delete cache.live[id];
      cache.reservas = cache.reservas.filter(r=>r.salidaId !== id);
      save();
    },

    /* tour en vivo */
    iniciar(id, ll){
      const s = cache.salidas[id]; if(!s) return;
      s.status = 'en_curso'; s.startedAt = Date.now();
      cache.live[id] = {ll, stop:0, ts:Date.now()};
      save();
    },
    posicion(id, data){
      if(!cache.salidas[id]) return;
      cache.live[id] = {...cache.live[id], ...data, ts:Date.now()};
      save();
    },
    finalizar(id){
      const s = cache.salidas[id];
      if(s){ s.status = 'finalizada'; s.endedAt = Date.now(); }
      delete cache.live[id];
      save();
    },

    /* reservas */
    reservar(salidaId, qty, name){
      cache.reservas.push({id:uid('r_'), salidaId, qty, name:(name||'').trim(), ts:Date.now()});
      save();
    },
    reservasDe: id=>cache.reservas.filter(r=>r.salidaId === id),
    ocupados: id=>cache.reservas.filter(r=>r.salidaId === id).reduce((a,r)=>a + r.qty, 0),

    /* pedidos de turistas ("Pedí tu tour"): el turista pide, un guía lo toma */
    pedidos: ()=>Object.values(cache.pedidos),
    crearPedido(p){
      p.id = uid('p_'); p.status = 'pendiente'; p.createdAt = Date.now();
      cache.pedidos[p.id] = p; save(); return p;
    },
    editarPedido(id, data){
      const p = cache.pedidos[id];
      if(!p || p.status !== 'pendiente') return false;
      Object.assign(p, data); save(); return true;
    },
    cancelarPedido(id){
      const p = cache.pedidos[id];
      if(p && p.status === 'pendiente'){ p.status = 'cancelado'; save(); }
    },
    borrarPedido(id){ delete cache.pedidos[id]; save(); },
    /* el primer guía que lo toma se lo queda: se crea su salida (privada) con la reserva del turista */
    tomarPedido(id, g){
      cache = load();                                   // datos frescos, por si otro guía lo tomó recién
      const p = cache.pedidos[id];
      if(!p || p.status !== 'pendiente' || Date.now() > p.startAt) return null;
      const s = {id:uid('s_'), g, name:p.titulo || `Tour a pedido · ${p.barrio}`, cat:p.cat, desc:p.comentario || '',
                 price:p.price, dur:p.dur, cupos:p.personas, langs:p.langs, route:p.route, barrio:p.barrio,
                 startAt:p.startAt, status:'programada', createdAt:Date.now(), privado:true, pedidoId:p.id, cliente:p.nombre};
      cache.salidas[s.id] = s;
      cache.reservas.push({id:uid('r_'), salidaId:s.id, qty:p.personas, name:p.nombre, ts:Date.now()});
      p.status = 'tomado'; p.g = g; p.salidaId = s.id; p.tomadoAt = Date.now();
      save();
      return s;
    },

    borrarTodo(){ cache = empty(); save(); },
  };
})();

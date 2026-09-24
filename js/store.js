/* =====================================================================
   TourCerca · almacén de datos compartido entre guía y turista
   © 2026 Derlis Marcelo Fernandez Rivas. Todos los derechos reservados. Ver LICENSE.

   V 2.0: guarda todo en el navegador (localStorage). Guía y turista se
   ven en tiempo real si están en el MISMO navegador (por ejemplo, dos
   pestañas en la misma computadora o en el mismo celular).

   Próximo paso: cambiar el interior de este archivo por Firebase para
   que funcione entre celulares distintos. El resto de la app no cambia
   porque solo usa las funciones de acá.
   ===================================================================== */
const Store = (()=>{
  const KEY = 'tourcerca.datos.v2';
  const empty = ()=>({tours:{}, salidas:{}, live:{}, reservas:[]});
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

    borrarTodo(){ cache = empty(); save(); },
  };
})();

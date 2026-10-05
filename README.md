# TourCerca

Prototipo de app de **turismo por proximidad** para la Ciudad de Buenos Aires: un mapa interactivo muestra los tours de guías que están cerca tuyo, cuándo empiezan y a los guías en vivo.

> "No busques qué hacer en Buenos Aires. Descubrí qué podés hacer cerca tuyo, ahora."

Proyecto final de la Licenciatura en Turismo. **Prototipo:** los guías, los tours y las reservas son ficticios o simulados.

- Vista del turista: https://derlismarce.github.io/TourCerca/
- Panel del guía: https://derlismarce.github.io/TourCerca/guia.html

## Versiones

- **V 3.10**: precios de referencia según los honorarios sugeridos por AGuiTBA (vigentes desde el 15/09/2026), pasados a precio por persona; mínimo de "Pedí tu tour" calculado con esa referencia; el editor del guía la sugiere; sección "Precios justos para los guías" en la portada.
- **V 3.9**: 629 lugares de interés de Buenos Aires Data (monumentos, teatros, museos, estadios, iglesias, parques, cafés notables y tango) con ficha, "Ver tours", "Cómo llegar"; en los editores se suman como parada; botón para mostrar u ocultar.
- **V 3.8**: recorridos por la calle con el ruteo a pie de OpenStreetMap (routing.openstreetmap.de): editor del guía, "Pedí tu tour", mapa, modo en vivo y guías simulados; km y dificultad con el camino real; tours de ejemplo precalculados en `js/rutas.js`; sin conexión, línea recta.
- **V 3.7**: los 48 barrios oficiales de la Ciudad (`js/barrios.js`, límites del dataset de Buenos Aires Data simplificados); el barrio de salidas y pedidos sale del punto de encuentro; el editor lo muestra; portada con 7 barrios destacados y "Toda la Ciudad".
- **V 3.6**: si el guía cancela una salida, el turista recibe el aviso con el reembolso total; el guía confirma antes con "¿Cancelar la salida?" (personas con reserva y monto a devolver).
- **V 3.5**: las reservas de los tours de ejemplo le llegan al guía (copia de la salida en su panel); barra de cupos "X de Y lugares · faltan N" y "Actividad reciente" con reservas y cancelaciones.
- **V 3.4**: pago al reservar (simulado) y política de cancelación: gratis hasta 24 h antes, 50% de reembolso entre 24 h y 1 h antes, sin reembolso con menos de 1 h; si el guía cancela se devuelve todo; los tours a la gorra no se pagan.
- **V 3.3**: "Mis tours" (reservas y pedidos del turista en un solo lugar), cancelar una reserva antes de que empiece (el guía recibe el aviso) y ventana "¿Confirmás la reserva?" antes de reservar.
- **V 3.2**: la app en español, inglés y portugués de Brasil. Selector "🌐 ES ▾" arriba a la derecha; detecta el idioma del celular la primera vez y recuerda la elección.
- **V 3.1**: seguridad. Botón de emergencia (107, 911, 100 y compartir ubicación), primeros pasos ante incidentes, dificultad y recomendaciones en cada tour (con el clima real) y registro de incidentes del guía.
- **V 3.0**: "Pedí tu tour". El turista programa una visita guiada (día, hora, punto de salida y lugares; mínimo 5 personas, 1 hora y $ 15.000 por persona) y un guía cercano la toma. El guía elige el radio de su zona y recibe una alerta con cada pedido nuevo.
- **V 2.3**: política de privacidad.
- **V 2.2**: mapa sin líneas blancas entre los mosaicos.
- **V 2.1**: licencia "Todos los derechos reservados", aviso de copyright y términos y condiciones.
- **V 2.0**: panel del guía (programar salidas, armar el recorrido en el mapa, ver reservas, salir en vivo compartiendo la ubicación). Las salidas publicadas aparecen en la vista del turista.
- **V 1.0**: vista del turista (mapa, lista de tours cercanos, ficha, guías simulados en vivo, alertas, modo presentación).

En la V 2.0 los datos se guardan en el navegador: guía y turista se ven en tiempo real si están abiertos en el mismo navegador (por ejemplo, dos pestañas). Para que funcione entre celulares distintos falta conectar una base de datos en tiempo real (Firebase).

## Archivos

- `index.html`: vista del turista
- `guia.html`: panel del guía
- `terminos.html`: términos y condiciones de uso
- `privacidad.html`: política de privacidad
- `js/i18n.js`: idiomas (traducción, selector y detección del idioma)
- `js/i18n-textos.js`: traducciones al inglés y al portugués
- `js/barrios.js`: los 48 barrios oficiales de CABA y `barrioDe()` (qué barrio es un punto)
- `js/rutas.js`: recorridos por la calle de los tours de ejemplo (precalculados)
- `js/lugares.js`: lugares de interés (Buenos Aires Data, CC BY 2.5 AR)
- `js/capa-lugares.js`: capa de lugares en el mapa, ficha y botón
- `js/comun.js`: datos de ejemplo, utilidades y número de versión
- `js/store.js`: datos compartidos entre guía y turista
- `js/pedidos.js`: "Pedí tu tour" en la vista del turista
- `js/pedidos-guia.js`: pedidos de turistas en el panel del guía
- `css/tourcerca.css`: estilos

## Licencia

© 2026 Derlis Marcelo Fernandez Rivas. **Todos los derechos reservados.**

Que el código esté visible en GitHub no otorga permiso para copiarlo, modificarlo, distribuirlo ni usarlo comercialmente. Ver el archivo [LICENSE](LICENSE). Los componentes de terceros (Leaflet, OpenStreetMap, CARTO, Nunito) conservan sus propias licencias.

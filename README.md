# TourCerca

Prototipo de app de **turismo por proximidad** para la Ciudad de Buenos Aires: un mapa interactivo muestra los tours de guías que están cerca tuyo, cuándo empiezan y a los guías en vivo.

> "No busques qué hacer en Buenos Aires. Descubrí qué podés hacer cerca tuyo, ahora."

Proyecto final de la Licenciatura en Turismo. **Prototipo:** los guías, los tours y las reservas son ficticios o simulados.

- Vista del turista: https://derlismarce.github.io/TourCerca/
- Panel del guía: https://derlismarce.github.io/TourCerca/guia.html

## Versiones

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
- `js/comun.js`: datos de ejemplo, utilidades y número de versión
- `js/store.js`: datos compartidos entre guía y turista
- `js/pedidos.js`: "Pedí tu tour" en la vista del turista
- `js/pedidos-guia.js`: pedidos de turistas en el panel del guía
- `css/tourcerca.css`: estilos

## Licencia

© 2026 Derlis Marcelo Fernandez Rivas. **Todos los derechos reservados.**

Que el código esté visible en GitHub no otorga permiso para copiarlo, modificarlo, distribuirlo ni usarlo comercialmente. Ver el archivo [LICENSE](LICENSE). Los componentes de terceros (Leaflet, OpenStreetMap, CARTO, Nunito) conservan sus propias licencias.

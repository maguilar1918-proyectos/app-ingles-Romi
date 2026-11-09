# Mi Pasaporte de Inglés

App instalable (PWA) para practicar vocabulario y escritura en inglés (nivel Cambridge Pre‑A1 Starters), 20 minutos al día, pensada para niños de 6 a 10 años con dificultades de atención.

> **Herramienta de apoyo al aprendizaje, no una terapia.** No reemplaza a su especialista.

## Instalar en la tablet
1. Abre la URL de la app en **Chrome (Android)** o **Safari (iPad)** con internet.
2. Menú ⋮ (Chrome) o botón Compartir (Safari) → **Agregar a pantalla de inicio**.
3. Ábrela una vez con internet para que quede guardada; después funciona sin conexión.

## Privacidad
No hay cuentas ni servidor. Todo el progreso vive solo en la tablet (localStorage). Haz respaldos desde el panel de padres (mantén pulsado ⚙️ en la pantalla de inicio 1 s; PIN de 4 dígitos que se crea la primera vez).

## Actualizaciones
Cada cambio sube `CACHE_VERSION` en `sw.js`. El aviso de nueva versión aparece solo en el panel de padres.

## Ampliar palabras
Edita `js/data.js`. Audio grabado: añade `audio: "audio/en/cat.mp3"` a una palabra.

## Probar días siguientes
Abre la app con `#dev` al final de la URL: el panel de padres muestra «Avanzar un día».

## Estado
Etapa 1: base PWA, sesión de 20 min en 4 bloques, calentamiento en frío, niveles de dominio y repaso espaciado (12 palabras).

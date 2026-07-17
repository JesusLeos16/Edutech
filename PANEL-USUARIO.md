# Panel de usuario — documentación para el reporte

## Qué se hizo

Se construyó el **panel de usuario** de Edutech: un área privada (solo con sesión iniciada) donde el estudiante ve su progreso y, más adelante, las recomendaciones de YouTube.

### Secciones del panel

| Ruta | Pantalla | Qué muestra hoy |
|------|----------|-----------------|
| `/panel/dashboard` | Dashboard | Resumen (contadores en 0) + estado vacío con CTA al test |
| `/panel/cursos` | Todos los cursos | Estado vacío (sin datos falsos). Aquí irán las recomendaciones de YouTube |
| `/panel/mis-cursos` | Mis cursos | Estado vacío. Aquí irán los cursos que el usuario guarde |

También existe `/panel`, que redirige automáticamente a `/panel/dashboard`.

---

## Arquitectura Angular usada

Se respetaron las mismas prácticas del resto del proyecto:

- **Componentes standalone** (sin `NgModule`)
- **Control flow moderno**: `@if` en plantillas
- **`inject()`** para servicios (Auth, Router, ChangeDetectorRef)
- **Rutas hijas** con un layout padre (`Panel`) y `<router-outlet>`
- **Clases CSS orgánicas** en español (`barraside`, `cajavacia`, `linkpanel`, etc.)
- **Misma identidad visual** de la landing: Inter, azul `#0053db`, morado `#831ada`, gradientes y cards blancas

### Archivos creados

```
src/guards/auth-guard.ts
src/app/pages/panel/
  panel.ts | panel.html | panel.scss          → layout (sidebar + topbar)
  dashboard/dashboard.ts|html|scss
  cursos/cursos.ts|html|scss
  mis-cursos/mis-cursos.ts|html|scss
PANEL-USUARIO.md                              → este documento
```

### Archivos modificados

- `src/app/app.routes.ts` — se registró la ruta `panel` con hijos y el guard
- `src/app/pages/landing/landing.html` — el menú del usuario ahora enlaza a **Mi panel** y **Mis cursos** (antes apuntaba a `/perfil` y `/configuracion`, que no existían)

---

## Protección de rutas (authGuard)

Archivo: `src/guards/auth-guard.ts`

Es un **functional guard** (`CanActivateFn`):

1. Lee `AuthService.usuario$` (Observable de Firebase Auth).
2. Toma el primer valor (`take(1)`).
3. Si hay usuario → deja pasar.
4. Si no hay sesión → redirige al landing (`/`).

Así nadie puede abrir `/panel/...` sin haber iniciado sesión.

---

## Diseño del layout

- **Sidebar fija** a la izquierda con:
  - Logo Edutech
  - Links: Dashboard, Todos los cursos, Mis cursos
  - Avatar con inicial del nombre + botón Salir
- **Topbar** con saludo y link al inicio
- **Responsive**: en móvil la sidebar se oculta y se abre con hamburguesa + velo oscuro

Los estados vacíos usan borde punteado, ícono circular con el gradiente de marca y un CTA claro. **No se inventaron cursos falsos**: cuando conectemos YouTube, esas cajas se llenan sin rediseñar.

---

## Integración con YouTube (segunda etapa, ya implementada)

### Cómo funciona el flujo completo

1. El usuario inicia sesión → va directo a `/panel/dashboard`.
2. Hace el test (4 preguntas). Al responder la última:
   - Se arma la búsqueda con las respuestas: `respuestas[0] + ' ' + respuestas[1] + ' curso'`
     (ej. "Programación Principiante curso").
   - Se guarda en Firestore: `usuarios/{uid}` → campos `test` (las 4 respuestas) y `busqueda`.
   - Redirige al dashboard.
3. **Todos los cursos** lee `busqueda` de Firestore y llama a la **YouTube Data API v3**
   (`search.list`) con `fetch`. Pinta 12 videos con miniatura, título y canal.
4. Botón **Guardar** en cada video → escribe el curso en
   `usuarios/{uid}/misCursos/{videoId}`.
5. **Mis cursos** lee esa subcolección y permite **Quitar** (deleteDoc).
6. El **Dashboard** muestra datos reales: si hizo el test y cuántos cursos guardó.

### La llamada a YouTube (lo importante para explicar)

```
GET https://www.googleapis.com/youtube/v3/search
  ?part=snippet        → pide título, canal, miniaturas
  &type=video          → solo videos
  &maxResults=12       → cuántos regresa
  &relevanceLanguage=es
  &q=<busqueda>        → las palabras clave del test
  &key=<API_KEY>       → la key de YouTube Data API v3
```

La respuesta es JSON; de cada item usamos `id.videoId`, `snippet.title`,
`snippet.channelTitle` y `snippet.thumbnails.medium.url`. El link final es
`https://www.youtube.com/watch?v=<videoId>`.

No es inteligencia artificial: las respuestas del test se convierten en
palabras clave y personalizan la búsqueda.

### Servicios nuevos

- `src/services/youtube.ts` — un solo método `buscarVideos(busqueda)` con `fetch`.
- `src/services/preferencias.ts` — Firestore: guardar/leer test, guardar/quitar/listar mis cursos.

### La API key de YouTube

- Va en `src/app/environments/environment.ts` y `environment.development.ts`
  en el campo `youtubeApiKey` (archivos gitignoreados, cada quien pega la suya).
- Se crea en Google Cloud Console → proyecto `edutech-62b02` → habilitar
  **YouTube Data API v3** → Credenciales → Clave de API.
- Es **distinta** a la apiKey de Firebase.
- Limitación conocida (decisión consciente para la demo escolar): la key viaja
  en el navegador. La versión "profesional" sería moverla a una Cloud Function.
- Cuota gratis: 10,000 unidades/día; cada búsqueda cuesta 100 (~100 búsquedas diarias).

---

## Cómo probarlo

1. Pega tu API key de YouTube en `youtubeApiKey` dentro de
   `src/app/environments/environment.development.ts` (y `environment.ts`).
2. `ng serve`
3. Inicia sesión desde la landing (email o Google) → te manda al dashboard.
4. Haz el test → al terminar te regresa al dashboard.
5. Entra a **Todos los cursos** → deben salir videos reales de YouTube.
6. Guarda un par → revisa **Mis cursos** → prueba **Quitar**.
7. Sin sesión, entra a `http://localhost:4200/panel` → te debe mandar al landing.

---

## Ideas para el reporte (texto sugerido)

> Se implementó un panel de usuario protegido por autenticación Firebase, compuesto por un layout con barra lateral y tres vistas: dashboard, catálogo de cursos y cursos guardados. Las vistas usan estados vacíos preparados para recibir, en una etapa posterior, las recomendaciones generadas a partir del test de gustos mediante la YouTube Data API a través de Cloud Functions. El diseño mantiene la identidad visual de Edutech (tipografía Inter, paleta azul-morado) y sigue el patrón de componentes standalone de Angular 22 del proyecto.

---

## Próximos pasos sugeridos

1. Mover la llamada a YouTube a una Cloud Function (esconder la API key).
2. Cachear resultados en Firestore para no gastar cuota en cada visita.
3. Usar la respuesta 4 del test ("tipo de contenido") para pedir playlists
   cuando el usuario prefiera listas de reproducción (`type=playlist`).
4. Progreso por curso (visto / en curso / terminado) en Mis cursos.

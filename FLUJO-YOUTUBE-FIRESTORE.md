# Flujo del test, Firestore y YouTube — EduTech

Documentación para el reporte. Explica **qué ruta usa cada pantalla**, **qué archivo la controla** y **cómo se guardan los datos en Firestore** antes de llamar a la API de YouTube.

---

## Resumen en una frase

El usuario responde 4 preguntas en `/test`. Esas respuestas se guardan en Firestore (`usuarios/{uid}`). Con ellas se arma un texto de búsqueda. En `/panel/cursos` ese texto se manda a YouTube en el parámetro `q`. La API key va aparte en el parámetro `key`. Los cursos que el usuario guarda viven en `usuarios/{uid}/misCursos/{videoId}` y se listan en `/panel/mis-cursos` sin volver a llamar a YouTube.

---

## Rutas del navegador (URLs)

Definidas en `src/app/app.routes.ts`.

| URL | Pantalla | ¿Requiere login? |
|-----|----------|------------------|
| `/` | Landing (inicio, login, registro) | No |
| `/test` | Encuesta de 4 preguntas | No* |
| `/recomendaciones` | Página legacy (casi sin uso) | No |
| `/panel` | Redirige a `/panel/dashboard` | **Sí** |
| `/panel/dashboard` | Dashboard del usuario | **Sí** |
| `/panel/cursos` | Todos los cursos (resultados YouTube) | **Sí** |
| `/panel/mis-cursos` | Cursos guardados por el usuario | **Sí** |

\* Para **guardar** las respuestas del test en Firestore el usuario debe tener sesión iniciada. Sin sesión puede contestar, pero no se persisten los gustos.

Si alguien entra a `/panel/...` sin sesión, `src/guards/auth-guard.ts` lo redirige a `/`.

---

## Archivos del proyecto (dónde está cada cosa)

```
src/app/app.routes.ts              → Define todas las URLs de la tabla anterior

src/app/pages/landing/             → Pantalla / (auth)
src/app/pages/test/                → Pantalla /test (encuesta)
src/app/pages/panel/
  panel.ts | panel.html | panel.scss     → Layout del panel (sidebar + topbar)
  dashboard/                             → /panel/dashboard
  cursos/                                → /panel/cursos
  mis-cursos/                            → /panel/mis-cursos

src/guards/auth-guard.ts           → Protege rutas /panel/*

src/services/auth.ts               → Login, registro, Google, logout (Firebase Auth)
src/services/preferencias.ts       → Guardar/leer test y cursos en Firestore
src/services/youtube.ts            → Llamada HTTP a YouTube Data API v3

src/app/environments/
  environment.ts                   → Config local (gitignore): Firebase + youtubeApiKey
  environment.development.ts       → Igual, usado en ng serve

src/app/app.config.ts              → Inicializa Firebase App, Auth y Firestore
```

Documentación adicional del panel: `PANEL-USUARIO.md`.

---

## Estructura en Firestore (base de datos)

Firestore no usa tablas SQL. Usa **colecciones** (carpetas) y **documentos** (JSON).

### Documento del usuario (al registrarse / login con Google)

Ruta: `usuarios/{uid}`

`{uid}` = identificador único de Firebase Authentication (no es el email).

Ejemplo (campos que crea `src/services/auth.ts` al registrarse):

```json
{
  "uid": "abc123xyz",
  "nombre": "Jesus",
  "email": "usuario@ejemplo.com",
  "foto": "",
  "uiltimoAcceso": "2026-07-16T..."
}
```

### Después de completar el test

`src/services/preferencias.ts` → `guardarTest()` agrega campos con `setDoc(..., { merge: true })` (no borra lo que ya existía):

```json
{
  "uid": "abc123xyz",
  "nombre": "Jesus",
  "email": "usuario@ejemplo.com",
  "test": [
    "Programación",
    "Principiante",
    "Aprender desde cero",
    "Cursos completos"
  ],
  "busqueda": "Programación Principiante curso"
}
```

- **`test`**: las 4 respuestas tal cual las eligió el usuario.
- **`busqueda`**: string armado para YouTube. Hoy se forma así:
  `respuestas[0] + ' ' + respuestas[1] + ' curso'`
  (interés + nivel + la palabra "curso").

### Cursos guardados (subcolección)

Ruta: `usuarios/{uid}/misCursos/{videoId}`

Cada documento = un video que el usuario marcó con **Guardar** en `/panel/cursos`.

```json
{
  "videoId": "dQw4w9WgXcQ",
  "titulo": "Curso de Python para principiantes",
  "canal": "Nombre del canal",
  "imagen": "https://i.ytimg.com/vi/.../mqdefault.jpg"
}
```

`/panel/mis-cursos` solo lee esta subcolección. **No vuelve a llamar a YouTube.**

---

## Flujo paso a paso (con rutas)

### 1. Login → Dashboard

| | |
|---|---|
| **URL** | `/` |
| **Archivo** | `src/app/pages/landing/landing.ts` |
| **Servicio** | `src/services/auth.ts` |
| **Destino** | Tras login/registro/Google → `/panel/dashboard` |

Firebase Auth crea la sesión. Los datos del perfil ya están (o se crean) en `usuarios/{uid}`.

---

### 2. Test → guardar gustos → Dashboard

| | |
|---|---|
| **URL** | `/test` |
| **Archivo** | `src/app/pages/test/test.ts` |
| **Servicio** | `src/services/preferencias.ts` → `guardarTest()` |
| **Destino** | `/panel/dashboard` |

1. Cada clic en una opción ejecuta `elegir(opcion)` y llena el arreglo `respuestas[]`.
2. En la 4ª pregunta, si hay sesión:
   - Se arma `busqueda` a partir de las respuestas.
   - Se escribe en Firestore: `usuarios/{uid}`.
   - Redirige al dashboard.

---

### 3. Dashboard → estado del test

| | |
|---|---|
| **URL** | `/panel/dashboard` |
| **Archivo** | `src/app/pages/panel/dashboard/dashboard.ts` |
| **Servicio** | `preferencias.obtenerBusqueda()`, `preferencias.obtenerMisCursos()` |

- Lee `usuarios/{uid}.busqueda` → si existe, el test ya se hizo.
- Cuenta documentos en `usuarios/{uid}/misCursos` → cursos guardados.
- Si hay test → enlace a `/panel/cursos`.
- Si no → enlace a `/test`.

---

### 4. Todos los cursos → YouTube

| | |
|---|---|
| **URL** | `/panel/cursos` |
| **Archivo** | `src/app/pages/panel/cursos/cursos.ts` |
| **Servicios** | `preferencias.obtenerBusqueda()` + `youtube.buscarVideos()` |

1. Lee `busqueda` de Firestore.
2. Si no hay `busqueda` → muestra “Primero haz el test” con link a `/test`.
3. Si hay `busqueda` → llama a YouTube (`src/services/youtube.ts`).

**Llamada a la API** (simplificada):

```
GET https://www.googleapis.com/youtube/v3/search
  ?part=snippet
  &type=video
  &maxResults=12
  &relevanceLanguage=es
  &q=<busqueda desde Firestore>
  &key=<youtubeApiKey desde environment>
```

| Parámetro | Origen | Función |
|-----------|--------|---------|
| `q` | Campo `busqueda` en `usuarios/{uid}` | Qué videos buscar (gustos del usuario) |
| `key` | `environment.youtubeApiKey` | Permiso para usar la API (no guarda gustos) |

La respuesta JSON trae `items[]`. De cada item se usa:

- `id.videoId` → link `https://www.youtube.com/watch?v={videoId}`
- `snippet.title` → título en la tarjeta
- `snippet.channelTitle` → nombre del canal
- `snippet.thumbnails.medium.url` → miniatura

**En este paso no se escribe nada nuevo en Firestore** (solo lectura de `busqueda`).

---

### 5. Guardar curso

| | |
|---|---|
| **URL** | `/panel/cursos` (botón Guardar en cada tarjeta) |
| **Archivo** | `src/app/pages/panel/cursos/cursos.ts` → `guardar()` |
| **Servicio** | `preferencias.guardarCurso(curso)` |
| **Firestore** | `usuarios/{uid}/misCursos/{videoId}` |

Se guarda el objeto del video (videoId, título, canal, imagen) para no depender de YouTube después.

---

### 6. Mis cursos

| | |
|---|---|
| **URL** | `/panel/mis-cursos` |
| **Archivo** | `src/app/pages/panel/mis-cursos/mis-cursos.ts` |
| **Servicio** | `preferencias.obtenerMisCursos()` / `quitarCurso()` |
| **Firestore** | Lee o borra en `usuarios/{uid}/misCursos/` |

- **Listar**: `getDocs` sobre la subcolección `misCursos`.
- **Quitar**: `deleteDoc` en `usuarios/{uid}/misCursos/{videoId}`.

---

## Diagrama del flujo

```
/  (landing)
  │
  ├─ login / registro / Google
  │     └─► Firebase Auth + usuarios/{uid}
  │     └─► redirect /panel/dashboard
  │
/test
  │
  ├─ 4 respuestas → respuestas[]
  ├─ guardarTest() → usuarios/{uid} { test, busqueda }
  └─► redirect /panel/dashboard

/panel/dashboard
  │
  ├─ lee usuarios/{uid}.busqueda
  ├─ lee usuarios/{uid}/misCursos (conteo)
  └─► link /panel/cursos  o  /test

/panel/cursos
  │
  ├─ lee busqueda (Firestore)
  ├─ fetch YouTube search?q=busqueda&key=API_KEY
  ├─ muestra tarjetas
  └─ Guardar → usuarios/{uid}/misCursos/{videoId}

/panel/mis-cursos
  │
  └─ solo lee misCursos/ (sin YouTube)
```

---

## API key de YouTube (configuración local)

- Archivo: `src/app/environments/environment.development.ts` (y `environment.ts`).
- Campo: `youtubeApiKey`.
- Es **distinta** a la `apiKey` de Firebase.
- Se crea en Google Cloud Console → proyecto `edutech-62b02` → habilitar **YouTube Data API v3** → Credenciales → Clave de API.
- Estos archivos están en `.gitignore`; cada desarrollador pega la suya localmente.

**Nota para el reporte:** en esta versión la key viaja en el navegador (camino A, demo escolar). La alternativa “profesional” es mover la llamada a una Cloud Function para no exponer la key.

Cuota gratuita aproximada: 10 000 unidades/día; cada búsqueda `search.list` consume 100 (~100 búsquedas por día).

---

## Cómo ver los datos en Firebase Console

1. Entrar a [Firebase Console](https://console.firebase.google.com/).
2. Proyecto **edutech-62b02**.
3. **Firestore Database** → pestaña **Data**.
4. Colección `usuarios` → documento con tu `uid`.
5. Ver campos `test` y `busqueda`.
6. Abrir subcolección `misCursos` para los videos guardados.

---

## Cómo probar el flujo completo

1. Pegar `youtubeApiKey` en `environment.development.ts`.
2. `ng serve`
3. `/` → iniciar sesión → debe ir a `/panel/dashboard`.
4. `/test` → responder 4 preguntas → debe volver al dashboard.
5. En Firebase Console, confirmar `test` y `busqueda` en `usuarios/{uid}`.
6. `/panel/cursos` → deben aparecer videos de YouTube.
7. Guardar uno o dos → `/panel/mis-cursos` → deben listarse.
8. Quitar uno → debe desaparecer de Firestore y de la pantalla.

---

## Texto sugerido para el reporte

> Se implementó un flujo de personalización basado en un cuestionario de cuatro preguntas. Las respuestas se almacenan en Firestore en el documento del usuario autenticado (`usuarios/{uid}`), junto con un campo `busqueda` derivado de las preferencias de interés y nivel. La pantalla de cursos consume ese campo para consultar la YouTube Data API v3 mediante el endpoint `search.list`, enviando las palabras clave en el parámetro `q` y la clave de API en el parámetro `key`. Los recursos seleccionados por el usuario se persisten en la subcolección `misCursos`, permitiendo listarlos sin realizar nuevas peticiones a YouTube. El acceso al panel está protegido mediante un guard de autenticación que redirige al landing si no hay sesión activa.

---

## Próximos pasos (opcional, fuera del alcance actual)

1. Mover la llamada a YouTube a Cloud Functions (`functions/src/index.ts`).
2. Cachear resultados de búsqueda en Firestore para ahorrar cuota.
3. Usar la 4ª respuesta del test (tipo de contenido) para buscar playlists (`type=playlist`).
4. Incluir más palabras del test en `busqueda` (objetivo, formato de contenido).

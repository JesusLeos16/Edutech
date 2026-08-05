# Planeación de deploy — EduTech en Vercel

## Qué falló en el intento actual

```
Could not resolve "./environments/environment"
```

La carpeta `src/app/environments/` estaba completa en `.gitignore`.  
En tu máquina el build funciona; en Vercel clona GitHub **sin** esos archivos, y `ng build` se rompe.

## Arquitectura final

```
GitHub (main)
    │
    ▼
Vercel build
    1. npm install
    2. scripts/generate-env.mjs  → escribe environment.ts con env vars
    3. ng build                  → dist/edutech/browser
    4. Publica SPA + rewrites (/panel/*, /test, etc. → index.html)
    │
    ▼
Navegador
    ├── Firebase Auth / Firestore / Functions
    └── YouTube Data API
```

| Pieza | Dónde vive |
|---|---|
| Frontend Angular | **Vercel** |
| Auth + Firestore + Functions | **Firebase** (`edutech-62b02`) |
| Keys de producción | **Variables de entorno de Vercel** (no en el repo) |
| Keys locales | `environment.development.ts` (gitignored) |

## Checklist de deploy

### 1. Subir estos cambios al repo

Archivos nuevos/cambiados:

- `scripts/generate-env.mjs` — genera `environment.ts` en el build de Vercel  
- `src/app/environments/environment.ts` — stub commiteable (sin secretos)  
- `src/app/environments/environment.example.ts` — plantilla local  
- `vercel.json` — output `dist/edutech/browser` + SPA rewrites  
- `.gitignore` — ya no ignora toda la carpeta `environments`  
- `package.json` — `build` corre el generador antes de `ng build`

Tu `environment.development.ts` local **sigue gitignored** y no se sube.

### 2. Variables en Vercel

Vercel → Project → **Settings → Environment Variables**  
Marcar al menos **Production** (y Preview si quieres previews con backend real).

| Variable | Valor (desde tu `environment*.ts` local) |
|---|---|
| `FIREBASE_API_KEY` | `firebaseConfig.apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `firebaseConfig.authDomain` |
| `FIREBASE_PROJECT_ID` | `firebaseConfig.projectId` |
| `FIREBASE_STORAGE_BUCKET` | `firebaseConfig.storageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | `firebaseConfig.messagingSenderId` |
| `FIREBASE_APP_ID` | `firebaseConfig.appId` |
| `FIREBASE_MEASUREMENT_ID` | `firebaseConfig.measurementId` (opcional) |
| `YOUTUBE_API_KEY` | `youtubeApiKey` |

Sin estas variables el build de Vercel fallará a propósito con un mensaje claro.

### 3. Ajustes en Firebase (después del primer deploy)

1. Consola Firebase → **Authentication → Settings → Authorized domains**  
   Agregar el dominio de Vercel, por ejemplo:
   - `tu-proyecto.vercel.app`
   - y dominios de preview si usas login en PRs  
2. (Recomendado) Google Cloud → YouTube API key → **restricción HTTP referrer** al dominio de Vercel.

### 4. Config del proyecto en Vercel (si no autodetecta)

| Campo | Valor |
|---|---|
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `dist/edutech/browser` |
| Install Command | `npm install` |
| Root Directory | `.` (raíz del monorepo) |
| Node | 20.x (recomendado) |

`vercel.json` ya define build, output y rewrites.

### 5. Redeploy

1. Push a `main` (o Redeploy desde el dashboard).  
2. Revisar logs: debe aparecer `[generate-env] Wrote ...` y luego `ng build` OK.  
3. Abrir la URL, probar login, test y panel.

## Desarrollo local (sin cambios de hábito)

```bash
# Si aún no tienes el archivo local:
cp src/app/environments/environment.example.ts src/app/environments/environment.development.ts
# Pega tus keys reales en environment.development.ts

npm start   # ng serve usa development via fileReplacements
```

El script **no pisa** tu `environment.ts` local a menos que exista `VERCEL=1` (solo en la nube) o pongas `FORCE_ENV_GENERATE=1`.

## Orden sugerido al equipo

1. Un integrante configura el proyecto en Vercel y las env vars.  
2. Merge/push de la fix de environments + `vercel.json`.  
3. Primer deploy verde.  
4. Agregar dominio autorizado en Firebase Auth.  
5. Probar flujo completo en producción.  
6. (Opcional) Proteger rama `main` y usar Preview Deployments por PR.

## Problemas frecuentes

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Could not resolve "./environments/environment"` | No llegó el stub ni el script | Verifica que esos archivos estén en `main` en GitHub |
| `Missing environment variables` | Faltan vars en Vercel | Completar tabla del paso 2 y redeploy |
| 404 al recargar `/panel/dashboard` | Faltan rewrites SPA | Confirmar `vercel.json` en el repo |
| Login Google falla en producción | Dominio no autorizado | Firebase Auth → Authorized domains |
| YouTube “API key not valid” | Key sin restricción o dominio mal restringido | Revisar key y referrers en Google Cloud |
| Blank page | Output directory incorrecto | Debe ser `dist/edutech/browser` |

# Guía de colaboración - EduTech

Este documento explica cómo trabajamos los 3 en este repo con Git/GitHub, y cómo usar IA sin generar un desastre en el proyecto.

## Flujo de trabajo con Git

**Nunca se trabaja ni se hace push directo a `main`.** Cada quien trabaja en su propia rama y sube cambios a `main` mediante Pull Request.

1. Antes de empezar cualquier tarea, actualiza tu `main` local:
   ```
   git checkout main
   git pull origin main
   ```

2. Crea una rama para tu funcionalidad:
   ```
   git checkout -b feature/nombre-corto
   ```
   Convención de nombres:
   - `feature/login` — Firebase Authentication
   - `feature/cursos` — listado/consulta de cursos
   - `feature/videos` — integración YouTube Data API
   - `feature/materiales` — Google Drive API / Cloudinary
   - `feature/notificaciones` — EmailJS
   - `fix/descripcion-del-bug` — para correcciones

3. Trabaja y haz commits pequeños y descriptivos (evita commits gigantes que mezclan varias cosas):
   ```
   git add <archivos especificos>
   git commit -m "mensaje claro de lo que se hizo"
   ```

4. Sube tu rama (no `main`):
   ```
   git push origin feature/nombre-corto
   ```

5. Abre un **Pull Request** en GitHub hacia `main`. Pide que otro integrante lo revise antes de aprobar el merge.

6. Ya mergeado, borra la rama remota/local y vuelve a actualizar tu `main`.

### Reglas básicas
- Nunca `git push --force`.
- Si hay conflictos, resuélvanlos hablando entre ustedes — no simplemente aceptar "la mía" o "la del otro" sin revisar.
- Antes de empezar algo nuevo, avisa en el chat del equipo qué vas a hacer para no pisar el trabajo de otro (evita que dos personas toquen el mismo componente al mismo tiempo).

## Trabajando con IA (ChatGPT, Claude, Copilot, etc.)

La IA es una herramienta de apoyo, pero cada quien es responsable de lo que sube al repo. Para que no se haga un desastre entre los 3:

1. **Revisa todo** lo que la IA genera antes de aceptarlo. No copies/pegues código que no entiendes — si algo falla, tienes que poder explicarlo.
2. No dejes que la IA modifique archivos fuera de tu tarea actual (si estás en login, no debería tocar el módulo de cursos de otro compañero).
3. No instales dependencias nuevas ni cambies la estructura del proyecto (carpetas, arquitectura) sin avisar al equipo primero — eso afecta a los 3.
4. Antes de hacer commit, verifica que el proyecto compila y corre:
   ```
   ng build
   ng serve
   ```
5. Haz commits pequeños enfocados en una sola cosa. No mezcles en un solo commit cambios generados por distintas conversaciones/sesiones de IA.
6. Revisa el diff (`git status` / `git diff`) antes de subir — nunca subas API keys, tokens o archivos `.env` que la IA haya generado o pegado.
7. Si la IA sugiere borrar o reescribir código de un compañero, no lo hagas sin hablar con esa persona primero.
8. Cada quien trabaja en su propia rama — nunca le pidas a la IA que commitee o haga push directo a `main`.

## Estructura del proyecto

Workspace Angular generado con `ng new` (SCSS + Routing + standalone components):
- `src/app` — componentes, rutas y lógica de la aplicación
- `public` — assets estáticos (favicon, imágenes, etc.)

## Comandos útiles

- `npm install` — instalar dependencias
- `ng serve` — correr en desarrollo (http://localhost:4200)
- `ng generate component nombre` — crear un componente nuevo
- `ng build` — compilar para producción

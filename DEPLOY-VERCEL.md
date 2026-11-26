# Publicar el portafolio en Vercel conservando los datos

El proyecto está preparado para servir React/Vite y la API Express en el mismo dominio. Necesita una base PostgreSQL externa. Los datos actuales no se obtienen de `src/content.js`: se importan desde el respaldo privado de la base local.

## 1. Respaldo de los datos actuales

El archivo preparado para esta migración es `backups/portfolio-actual-2026-11-25.json`. Contiene el contenido publicado, cuenta administradora con su contraseña cifrada, mensajes, certificados, archivos y las imágenes locales vinculadas a cursos y proyectos. Incluye un checksum para detectar daños. Las sesiones activas se excluyen: iniciarás sesión otra vez, con tu cuenta y contraseña actuales.

`backups/portfolio-actual-2026-11-25.dump` es una copia adicional de PostgreSQL en formato nativo. Para el procedimiento de esta guía usa el JSON.

Estos respaldos contienen información privada. `backups/`, `.env.migration` y `.env` están excluidos de Git y de Vercel. No los subas al repositorio ni a la carpeta `public`.

Para generar otro respaldo actualizado desde Docker, con la base local iniciada:

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
docker compose build app
docker compose run --rm --no-deps -T --volume "${PWD}/backups:/backups" app node scripts/export-data.mjs /backups/portfolio-nuevo.json
```

El exportador solo lee la base. Elige un nombre nuevo: no sobrescribe un respaldo existente.

## 2. Crear PostgreSQL en Neon

1. Entra en [Neon](https://console.neon.tech/) y crea una cuenta o inicia sesión.
2. Crea un proyecto, por ejemplo `portfolio-carol`, con PostgreSQL 17 o superior. Elige una región cercana a la de tus funciones de Vercel.
3. Usa una base o rama **vacía** para esta importación. Puedes conservar la base predeterminada `neondb` de un proyecto nuevo.
4. Abre **Connect**, selecciona esa base y desactiva **Connection pooling** para copiar la conexión directa. Conserva los parámetros SSL que proporciona Neon.
5. En la carpeta del portafolio ejecuta:

```powershell
Copy-Item .env.migration.example .env.migration
```

Abre `.env.migration` en tu editor y sustituye la URL de ejemplo por la conexión **directa** de Neon. El archivo solo debe configurar `DATABASE_URL`; no uses aquí la URL local con host `db`.

Neon recomienda conexión directa para migraciones y conexión con pooling para funciones serverless: [conexiones y pooling](https://neon.com/docs/connect/connection-pooling).

## 3. Importar los datos

Desde la raíz del proyecto, con Node.js 22 y dependencias instaladas:

```powershell
npm.cmd ci
npm.cmd run db:import -- backups/portfolio-actual-2026-11-25.json
npm.cmd run db:migrate
```

El primer comando de datos crea el esquema, comprueba que el destino esté vacío e importa todos los registros dentro de una transacción. También repone las imágenes del respaldo en `public/assets/imagenes_cursos/` y `public/assets/imagenes_proyectos/` si faltan. Si encuentra un archivo del mismo nombre con contenido distinto, se detiene sin reemplazarlo.

La importación se niega a sobrescribir una base que ya contenga datos. Si informa que está ocupada, crea otra base o rama vacía en Neon y cambia `.env.migration`; no borres tu base local. Ejecuta `db:migrate` **después** de importar, porque inicializar el contenido antes haría que el destino dejase de estar vacío.

Una importación correcta imprime los recuentos y `"imported":true`. Las publicaciones, imágenes, enlaces y fechas se conservan. Las futuras migraciones respetan los marcadores que ya se habían aplicado en la base original.

## 4. Subir los cambios del código a GitHub

Revisa los archivos antes de subirlos:

```powershell
git status
git check-ignore backups/portfolio-actual-2026-11-25.json .env.migration
git add .
git commit -m "Prepare Vercel deployment and data migration"
git push origin main
```

Los archivos de `public/assets/` sí deben estar en Git: Vercel publica las imágenes actuales desde esa carpeta. Los respaldos y archivos de entorno deben seguir excluidos.

## 5. Crear el proyecto en Vercel

1. Entra en [Vercel](https://vercel.com/new), elige **Import Git Repository** y selecciona `carol104/Portafolio`.
2. Selecciona la raíz del repositorio, preset **Vite** y Node.js **22.x**. La configuración `vercel.json` ya define:

   | Campo | Valor |
   | --- | --- |
   | Build Command | `npm run build:vercel` |
   | Output Directory | `dist` |
   | API | `api/index.js` |

3. En Neon abre de nuevo **Connect**, activa **Connection pooling** y copia esa URL.
4. En las variables de entorno de Vercel añade **`DATABASE_URL`** con la URL **con pooling**. Configúrala para Production. Si habilitas Preview, usa una base o rama separada para que las pruebas no modifiquen los datos de producción.
5. Pulsa **Deploy**.

La cuenta administradora ya está incluida en el respaldo. No hace falta copiar el código local de configuración ni definir `ADMIN_SETUP_TOKEN`. No uses prefijos `VITE_` para la conexión o cualquier otro secreto: esos nombres se reservan para datos que puede recibir el navegador.

## 6. Comprobar el despliegue

En el dominio que devuelve Vercel:

- `/api/health` debe mostrar `status: "ok"` y `database: "connected"`.
- `/proyectos`, `/cursos` y `/aptitudes` deben abrir directamente y conservar el contenido.
- En `/admin`, inicia sesión con tu correo y contraseña actuales. Comprueba los certificados y prueba una subida pequeña antes de publicar cambios.
- El formulario de contacto guarda los mensajes en PostgreSQL; puedes consultarlos desde el panel.

Las nuevas subidas en Vercel se guardan en PostgreSQL y usan enlaces `/api/media/...`; no dependen de carpetas temporales de una función. La aplicación local con Docker conserva su guardado en las carpetas de imágenes. Las imágenes actuales siguen sirviéndose como archivos estáticos del despliegue.

En Vercel se permiten nuevas subidas de hasta **3 MB** para mantener la petición JSON/base64 dentro del límite estándar de las funciones. Los archivos actuales de hasta 4 MB se conservan y siguen descargándose desde la base de datos. Los límites de intentos son por instancia; esta adaptación no añade un servicio externo de rate limiting.

## Archivos preparados y verificación local

- `vercel.json`: compilación, función Node y rutas para API y páginas de React.
- `api/index.js` y `server/vercel-app.js`: API sin iniciar un servidor permanente ni ejecutar migraciones durante los arranques de las funciones.
- `scripts/export-data.mjs`, `scripts/import-data.mjs` y `server/data-transfer.js`: exportación e importación comprobadas.
- `scripts/migrate-db.mjs`: esquema y migraciones tras la importación.
- `.env.migration.example`: plantilla local para la conexión directa.

```powershell
npm.cmd test
npm.cmd run build:vercel
docker compose exec -T app node --test server/admin.integration.test.js server/data-transfer.integration.test.js
```

La restauración se prueba en bases aisladas, conservando bytes de archivos, cuenta, mensajes y secuencias. Si el despliegue todavía no tiene `DATABASE_URL`, la API informa un error real; no se ha publicado una base de datos automáticamente.

Documentación de referencia: [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite), [funciones Node.js](https://vercel.com/docs/functions/runtimes/node-js), [límites de funciones](https://vercel.com/docs/functions/limitations) y [Neon desde una aplicación](https://neon.com/docs/connect/connect-from-any-app).

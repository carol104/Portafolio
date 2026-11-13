# Dev.folio

La interfaz usa una escala compartida en `src/interface.css`: texto principal de 1 rem, etiquetas de .875 rem y controles de al menos 44 px. Las miniaturas de aplicaciones conservan su escala ilustrativa. Los componentes de `src/components/` comparten encabezados, enlaces externos, redes profesionales, etiquetas de tecnologías, tarjetas, detalles de proyectos y el formulario de contacto. GitHub, LinkedIn, repositorios y certificados se abren en otra pestaña con `noopener noreferrer` y un aviso para lectores de pantalla.

## Administrar sin tocar código

Abre **http://localhost:8080/admin**. En el primer acceso, utiliza el código privado de `ADMIN-ACCESO.local.txt` (archivo local excluido de Git y Docker) y crea tu correo administrador y una contraseña de al menos 12 caracteres. También puedes abrir el enlace de configuración que contiene ese archivo. El enlace usa un fragmento que no se envía en peticiones HTTP y el panel lo retira de la barra de direcciones al cargar. Una vez creada la cuenta, el código deja de permitir nuevas cuentas.

En el panel encontrarás perfil, proyectos, cursos, tecnologías, experiencia, intereses, diseño y textos, mensajes y seguridad. Los formularios permiten añadir, editar, reordenar y ocultar elementos. **Guardar y publicar** guarda el conjunto de cambios en PostgreSQL y actualiza lo que ve el público. Los cambios pendientes permanecen en memoria mientras navegas entre los apartados; publícalos antes de cerrar la página. Los archivos subidos se almacenan al seleccionarlos y se vinculan al contenido al publicar.

Puedes subir capturas PNG/JPG/WebP y tu CV PDF de máximo 4 MB. Si una imagen externa falla, se muestra la vista local de respaldo. Si no subes un CV, se genera uno resumido con los datos públicos. Los cursos solo aparecen en la web después de añadir un curso visible. El público obtiene las publicaciones al abrir la página, regresar a la pestaña o durante su actualización periódica (cada minuto); para ver cambios de inmediato puedes recargar.

La primera migración carga el contenido actual como punto de partida y conserva los mensajes y el volumen existentes. Las siguientes reconstrucciones no sobrescriben tus publicaciones. Los datos se guardan en `site_content`, los archivos en `portfolio_media`, y las cuentas y sesiones en tablas privadas. Las publicaciones usan control de revisión para evitar sobrescribir cambios de otra pestaña.

Para otro despliegue, genera un `ADMIN_SETUP_TOKEN` aleatorio de al menos 32 caracteres en `.env`. No compartas el archivo de acceso ni el código de configuración. Usa HTTPS para el dominio público; las cookies llevan `Secure` cuando la solicitud es HTTPS (configura `TRUST_PROXY` según tu proxy). Las contraseñas se guardan con scrypt y las sesiones con tokens aleatorios almacenados como hashes, cookies HttpOnly/SameSite y verificación de origen y CSRF. Referencias: [OWASP sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) y [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

Las pruebas de integración crean y eliminan una base de datos aislada sin alterar el contenido del portafolio:

```powershell
docker compose exec -T app node --test server/admin.integration.test.js
```

Portafolio responsive en español con React, Express, PostgreSQL y Docker. Azul marino, animaciones de entrada, editor de código flotante, filtros de proyectos, detalles en modal, vistas conceptuales locales, CV PDF y formulario persistente. Respeta movimiento reducido, navegación por teclado y foco del modal.

## Arrancar con Docker

1. Abre Docker Desktop y espera a que el motor esté listo.
2. Copia `.env.example` a `.env` y cambia `POSTGRES_PASSWORD`. Para contraseñas con caracteres especiales, utiliza su codificación URL en la conexión; el ejemplo está pensado para una contraseña larga alfanumérica.
3. Ejecuta `docker compose up --build -d`.
4. Abre **http://localhost:8080**.

La base no expone puertos al exterior. Los mensajes se conservan en el volumen `portfolio_data`. `docker compose down` detiene los servicios y conserva los datos. Evita `down -v` si quieres mantenerlos. Para cambiar el puerto público, configura `APP_PORT` en `.env`.

## Desarrollo

Requiere Node.js 22 y PostgreSQL (o Docker).

```powershell
Copy-Item .env.example .env
npm.cmd install
docker compose -f compose.yaml -f compose.dev.yaml up db -d
```

El archivo `compose.dev.yaml` publica PostgreSQL únicamente en `127.0.0.1:5432`. Actualiza `DATABASE_URL` en `.env` usando la misma contraseña de `POSTGRES_PASSWORD`. Si ya tienes un PostgreSQL local en ese puerto, usa otro puerto en el override y en la URL.

```powershell
# Node carga la configuración del backend desde .env:
node --env-file=.env --watch server/index.js
# En otra terminal:
npx.cmd vite --host 127.0.0.1
```

Abre **http://127.0.0.1:5173**. `npm.cmd run dev` también arranca ambos procesos y carga las variables de `.env`. La vista funciona sin PostgreSQL, pero el formulario informa un error real y no simula envíos. En producción, el backend exige conexión a PostgreSQL antes de arrancar.

## Contenido inicial para nuevas instalaciones

La interfaz de administración es la forma recomendada de personalizar el portafolio. **`src/content.js`** define únicamente la semilla de una instalación nueva; editar este archivo no reemplaza el contenido que ya se guardó en PostgreSQL:

- `profile`: nombre, iniciales, cargo, ciudad, objetivo, presentación, correo, GitHub, LinkedIn y formación. Usa URLs completas con `https://`. Cuando termines, cambia `isExample` a `false`.
- `projects`: reemplaza conceptos por proyectos reales. Incluye descripción, contribución, tecnologías, `url` y `github`; cambia `example` a `false`. Sin enlaces, la página muestra detalles internos y explica que no hay demo o repositorio. No genera enlaces rotos.
- `experience`: empresas, clientes, cargos, fechas y aportes verificables. Personaliza también los hobbies en `src/main.jsx`.

Las vistas de proyectos están hechas con HTML/CSS/SVG; son conceptos visuales, no productos funcionales. No se usan fotos ni fuentes externas. Puedes reemplazar cada componente `Preview` por capturas o videos locales en `public/`. Configura el PDF en `server/app.js` para añadir experiencia real; actualmente se genera una hoja resumida con el perfil y proyectos, identificada como ejemplo. Adapta la tipografía PDF si necesitas caracteres fuera del alfabeto latino.

## Mensajes y privacidad

`POST /api/contact` valida nombre, correo, tema, mensaje y consentimiento. Usa consultas parametrizadas, límite de cuerpo, honeypot y máximo de cinco intentos por IP cada 15 minutos. Guarda los mensajes en PostgreSQL; **no envía correos**. No existe endpoint público para leer consultas. Para revisarlas:

```powershell
docker compose exec db psql -U portfolio -d portfolio -c "SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC;"
```

Define una política de retención de datos adecuada y elimina consultas cuando dejen de ser necesarias. Para publicar en un VPS, apunta el dominio al servidor y coloca un proxy HTTPS delante de `app`. Ajusta `TRUST_PROXY` solo al número real de proxies de confianza. El limitador es local a una instancia; para varias réplicas añade un almacenamiento compartido. Haz copias de seguridad del volumen de PostgreSQL. No publiques `.env`.

## Verificación

```powershell
npm.cmd test
npm.cmd run build
docker compose config --quiet
```

`GET /api/health` verifica la conexión a PostgreSQL. Las pruebas de API usan un pool inyectado para comprobar validación, SQL parametrizado, fallos, PDF y límites. Para verificar persistencia real, arranca Docker, envía el formulario y consulta la tabla.

## Referencias de diseño

Se consultaron [Brittany Chiang](https://brittanychiang.com/) para jerarquía y presentación profesional y [Bruno Simon](https://bruno-simon.com/html/) para narrativa de proyectos y exploración creativa. El diseño y los componentes de este proyecto son propios.

# Guía de Instalación — Elecciones Municipales 2026
### VPS Ubuntu + aaPanel

---

## Requisitos previos

- VPS con Ubuntu 20.04 o 22.04 (mínimo 1 GB RAM)
- aaPanel instalado y funcionando
- Dominio o subdominio apuntando al IP del VPS (ej: `voto.softwarepar.lat`)
- Cuenta en [Neon PostgreSQL](https://neon.tech) con la base de datos creada

---

## Paso 1 — Instalar dependencias desde aaPanel

Ingresá al panel de aaPanel (`http://IP-DEL-VPS:8888`) y desde el **App Store** instalá:

- **Nginx** (versión estable)
- **Node.js** (versión 20.x o superior) → ir a App Store → Node.js → instalar
- **PM2** (gestor de procesos) → desde el módulo de Node.js en aaPanel

Si PM2 no está disponible en aaPanel, instalalo manualmente en el paso siguiente.

---

## Paso 2 — Conectarse al servidor por SSH

```bash
ssh root@IP-DEL-VPS
```

---

## Paso 3 — Instalar pnpm

```bash
npm install -g pnpm
```

Verificar instalación:

```bash
pnpm --version
```

Si PM2 no se instaló desde aaPanel:

```bash
npm install -g pm2
```

---

## Paso 4 — Subir el código al servidor

**Opción A — Desde GitHub (recomendado):**

```bash
cd /www/wwwroot
git clone https://github.com/TU-USUARIO/TU-REPOSITORIO.git elecciones
cd elecciones
```

**Opción B — Subir con FTP/SFTP:**

Desde aaPanel → File Manager → subir el ZIP del proyecto a `/www/wwwroot/elecciones/` y descomprimir.

---

## Paso 5 — Configurar variables de entorno

Dentro de la carpeta del proyecto, creá el archivo de variables:

```bash
cd /www/wwwroot/elecciones
nano .env
```

Pegá el siguiente contenido y completá con tus valores:

```env
# Base de datos Neon PostgreSQL
NEON_DATABASE_URL=postgresql://usuario:password@host.neon.tech/nombredb?sslmode=require

# Puerto del servidor API (puede ser cualquier puerto libre)
PORT=3001

# Entorno de producción
NODE_ENV=production

# Clave secreta de sesión (generá una cadena aleatoria larga)
SESSION_SECRET=pon-aqui-una-clave-secreta-muy-larga-y-aleatoria
```

Guardá con `Ctrl+O` y salí con `Ctrl+X`.

---

## Paso 6 — Instalar dependencias del proyecto

```bash
cd /www/wwwroot/elecciones
pnpm install
```

---

## Paso 7 — Compilar el proyecto

Compilar el servidor API:

```bash
pnpm --filter @workspace/api-server run build
```

Compilar el frontend:

```bash
pnpm --filter @workspace/elecciones run build
```

Los archivos compilados quedarán en:
- **Frontend:** `/www/wwwroot/elecciones/artifacts/elecciones/dist/`
- **API Server:** `/www/wwwroot/elecciones/artifacts/api-server/dist/`

---

## Paso 8 — Levantar el servidor API con PM2

```bash
cd /www/wwwroot/elecciones/artifacts/api-server

# Cargar variables de entorno y arrancar
PORT=3001 NODE_ENV=production NEON_DATABASE_URL="postgresql://usuario:password@host.neon.tech/nombredb?sslmode=require" SESSION_SECRET="tu-clave-secreta" pm2 start dist/index.mjs --name elecciones-api

# Guardar la lista de procesos para que se reinicie solo si el VPS se reinicia
pm2 save
pm2 startup
```

Verificar que esté corriendo:

```bash
pm2 status
pm2 logs elecciones-api
```

---

## Paso 9 — Configurar el sitio en aaPanel (Nginx)

1. En aaPanel ir a **Website → Add Site**
2. Completar:
   - **Domain:** `voto.softwarepar.lat`
   - **Root Directory:** `/www/wwwroot/elecciones/artifacts/elecciones/dist`
   - **PHP Version:** Ninguna (Pure Static)
3. Hacer clic en **Submit**

---

## Paso 10 — Configurar Nginx como proxy inverso

En aaPanel ir a **Website → (tu sitio) → Config** o **Nginx Config** y reemplazar el contenido por esto:

```nginx
server {
    listen 80;
    server_name voto.softwarepar.lat;

    # Archivos del frontend (React compilado)
    root /www/wwwroot/elecciones/artifacts/elecciones/dist;
    index index.html;

    # Redirigir rutas del frontend (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para el API → redirige /api/* al servidor Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50m;
    }
}
```

Guardá y hacé clic en **Save** o ejecutá:

```bash
nginx -t && nginx -s reload
```

---

## Paso 11 — Activar SSL (HTTPS) gratuito

En aaPanel ir a **Website → (tu sitio) → SSL → Let's Encrypt**:

1. Seleccionar el dominio `voto.softwarepar.lat`
2. Hacer clic en **Apply**
3. Activar **Force HTTPS** para redirigir todo el tráfico a HTTPS

---

## Paso 12 — Verificar que todo funciona

Abrí en el navegador:

```
https://voto.softwarepar.lat
```

El panel de administración está en:

```
https://voto.softwarepar.lat/admin
```

**Credenciales iniciales del admin:**
- Usuario: `admin`
- Contraseña: `admin123`

> ⚠️ Cambiá la contraseña del admin inmediatamente desde el panel.

---

## Comandos útiles de mantenimiento

```bash
# Ver estado del servidor API
pm2 status

# Ver logs en tiempo real
pm2 logs elecciones-api

# Reiniciar el servidor API
pm2 restart elecciones-api

# Actualizar el código (si usaste Git)
cd /www/wwwroot/elecciones
git pull
pnpm install
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/elecciones run build
pm2 restart elecciones-api
```

---

## Problemas comunes

| Problema | Solución |
|---|---|
| La página carga pero el API no responde | Verificar que PM2 esté corriendo con `pm2 status` |
| Error de base de datos | Revisar que `NEON_DATABASE_URL` esté correcta en `.env` |
| Las fotos no cargan | El límite de Nginx debe ser 50m (`client_max_body_size 50m`) |
| Página en blanco | Verificar que el `root` de Nginx apunte al directorio `dist` correcto |
| El admin no recuerda el token | Los tokens se borran al reiniciar PM2, volver a loguearse |

---

**Desarrollado por [SoftwarePar](https://softwarepar.lat/)**

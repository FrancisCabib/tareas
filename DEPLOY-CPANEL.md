# Deploy en cPanel (GitHub → web)

Cada `git push` a `main` puede desplegar solo si completás estos pasos **una vez**.

## Paso 1 — Probar SSH desde tu PC

En PowerShell, desde la carpeta del proyecto:

```powershell
cd "C:\Users\Lenovo\Desktop\tarea semanales"
ssh -i github-actions-cpanel -p 2200 proyec19@s490.v2nets.com
```

Si conecta, ves un prompt del servidor. Escribí `exit` para salir.

### Si no conecta

1. **cPanel** → *Seguridad* → *Acceso SSH* / *Manage Shell* → activá SSH para `proyec19`.
2. Confirmá que el puerto es **2200** (no 22).
3. Agregá la clave pública: en cPanel → *SSH Access* → *Manage SSH Keys* → *Import* → pegá el contenido de `github-actions-cpanel.pub`.
4. Autorizá la clave (*Authorize*).
5. Si el hosting filtra por IP, agregá la IP de tu casa en *Allow IP*.

---

## Paso 2 — Clonar el repo en el servidor (solo la primera vez)

Conectado por SSH:

```bash
cd ~
git clone https://github.com/FrancisCabib/tareas.git tareas_app
cd tareas_app
chmod +x scripts/deploy.sh
```

---

## Paso 3 — Configurar `.env` en el servidor (solo la primera vez)

El deploy **no** sube archivos `.env` (van en `.gitignore`). Creálos en el servidor:

```bash
cd ~/tareas_app
cp .env.example .env
cp backend/.env.example backend/.env
```

Editá `~/tareas_app/.env` y poné la URL real de tu sitio:

```env
VITE_API_URL=https://TU-DOMINIO.com/api
```

Editá `~/tareas_app/backend/.env`:

```bash
cd ~/tareas_app/backend
nano .env
```

Mínimo:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://TU-DOMINIO.com
DB_CONNECTION=sqlite
```

Generá la clave de Laravel:

```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan key:generate
```

---

## Paso 4 — Primer deploy manual

```bash
bash ~/tareas_app/scripts/deploy.sh
```

Si termina con *"Deploy completado"*, la web debería responder en tu dominio (docroot apuntando a `tareas_app/backend/public`).

---

## Paso 5 — Secret en GitHub (para deploy automático)

1. Abrí [github.com/FrancisCabib/tareas/settings/secrets/actions](https://github.com/FrancisCabib/tareas/settings/secrets/actions)
2. *New repository secret*
3. Nombre: `CPANEL_SSH_KEY`
4. Valor: **todo** el contenido del archivo `github-actions-cpanel` (la clave **privada**, incluyendo `-----BEGIN...` y `-----END...`)

---

## Paso 6 — Subir el workflow

Commiteá y pusheá `.github/workflows/deploy-cpanel.yml`. A partir de ahí, cada push a `main` ejecuta el deploy en el servidor.

Podés ver el resultado en GitHub → pestaña **Actions**.

---

## Resumen del flujo

```
Tu PC: git push
    ↓
GitHub Actions (SSH con CPANEL_SSH_KEY)
    ↓
Servidor: scripts/deploy.sh
    ↓
git pull + npm build + composer + migraciones
    ↓
Sitio actualizado
```

## Importante

- **Nunca** subas `github-actions-cpanel` (privada) a GitHub; solo el secret `CPANEL_SSH_KEY`.
- Tus tareas en producción viven en `~/tareas_app/backend/database/database.sqlite` en el servidor (distinto a tu PC).
- Si cambiás dominio, actualizá `VITE_API_URL` en el `.env` del servidor y volvé a correr el deploy.

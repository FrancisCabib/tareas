# Cómo ejecutar el cronograma

La app tiene dos partes: el **frontend** (React + Vite) y el **backend** (Laravel + SQLite)
que guarda las tareas en una base de datos.

## 0. Primera vez — preparar la base de datos

Solo hace falta una vez por instalación:

```powershell
cd backend
New-Item -Path database\database.sqlite -ItemType File -Force
php artisan migrate
```

Eso crea `backend/database/database.sqlite` con las tablas necesarias. Ahí quedan
guardadas tus tareas al marcarlas o agregarlas; al cerrar y volver a abrir la app,
O ejecutá el script desde la raíz del proyecto:

```powershell
.\setup-backend.ps1
```

## 1. Backend (Laravel) — guarda los datos

```powershell
cd backend
php artisan serve --port=8000
```

Queda escuchando en `http://127.0.0.1:8000`. La base de datos es el archivo
`backend/database/database.sqlite` (no requiere MySQL). La primera vez que se abre la app
se siembran las tareas por defecto automáticamente.

### Endpoints
- `GET    /api/days`              → cronograma actual (siembra los datos por defecto si está vacío)
- `PUT    /api/days`              → guarda el estado completo `{ "days": [...] }` (usado al marcar/reordenar)
- `POST   /api/reset`             → restaura el cronograma por defecto
- `POST   /api/days/{day}/tasks`  → crea una tarea en un día
- `PATCH  /api/tasks/{task}`      → edita una tarea (nombre, beneficiario, tipo, responsable, done)
- `DELETE /api/tasks/{task}`      → elimina una tarea

Todos los endpoints devuelven el cronograma completo actualizado, así el frontend
solo reemplaza su estado con la respuesta.

## 2. Frontend (React) — la interfaz

En otra terminal, desde la raíz del proyecto:

```powershell
npm install   # solo la primera vez
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

La URL del backend se configura en el archivo `.env` (`VITE_API_URL`).
Por defecto apunta a `http://127.0.0.1:8000/api`.

## Cómo funciona el guardado
- Al abrir, el frontend carga las tareas desde `GET /api/days`.
- Cada cambio (marcar completada, agregar, editar, arrastrar/reordenar) se guarda en SQLite.
- Podés cerrar el navegador: al volver a abrir, el backend devuelve tus tareas como las dejaste.
- Si el backend no está disponible, la app sigue funcionando con una copia local
  (localStorage) y avisa con un toast. Cuando el backend vuelva, la próxima carga
  sincroniza desde el servidor.

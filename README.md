# CONDOLEO

Plataforma médica integral para gestión de solicitudes de órtesis y prótesis.

**Estado:** ✅ Producción — LISTO PARA DEPLOY
**Tipo:** SaaS — Plataforma web responsiva
**Última Auditoría:** 5 de mayo de 2026
**Build Status:** ✅ Exitoso | **TypeScript:** ✅ 0 errores | **Lint:** ✅ 0 warnings

---

## 📊 Tech Stack

| Categoría            | Tecnología                   | Versión         |
| -------------------- | ---------------------------- | --------------- |
| **Frontend**         | Next.js + React              | 16.1.6 + 19.2.3 |
| **Language**         | TypeScript                   | 5.9.2 (strict)  |
| **Styling**          | Tailwind CSS                 | 4.x             |
| **Backend**          | Node.js + Next.js API Routes | 18+             |
| **Database**         | PostgreSQL (Neon)            | Latest          |
| **ORM**              | Drizzle                      | 0.45.1          |
| **Auth**             | Clerk                        | 7.0.4           |
| **Validation**       | Zod                          | 4.3.6           |
| **Storage**          | Cloudinary                   | 2.9.0           |
| **Email**            | Resend                       | 6.9.4           |
| **Cache/Rate-Limit** | Upstash Redis                | 1.37.0          |
| **Monorepo**         | Turbo                        | 2.8.16          |
| **Linting**          | ESLint                       | Latest          |
| **Formatting**       | Prettier                     | Latest          |

### Funcionalidades principales

- **Gestión de Solicitudes**: Pacientes solicitan órtesis/prótesis, admins aprueban y definen precios
- **Autenticación Segura**: Integración con Clerk para auth multi-factor
- **Gestión de Pagos**: Transferencias bancarias con confirmación por email
- **Seguimiento de Envíos**: Integración con Andreani para logística
- **Panel Administrativo**: Dashboard para gestionar solicitudes, productos y configuración
- **Notificaciones por Email**: Cambios de estado automáticos vía Resend

---

## 🏗️ Arquitectura

### 📦 Stack Tecnológico Completo

#### Frontend & Framework

| Tecnología          | Versión | Propósito                                       |
| ------------------- | ------- | ----------------------------------------------- |
| **Next.js**         | 16.1.6  | Framework React con SSR, API Routes, middleware |
| **React**           | 19.2.3  | Librería UI con Concurrent Features             |
| **TypeScript**      | 5.9.2   | Type safety (strict mode habilitado)            |
| **Tailwind CSS**    | 4       | Utility-first CSS framework                     |
| **React Hook Form** | Latest  | Gestión de formularios eficiente                |

#### Backend & Base de Datos

| Tecnología      | Versión | Propósito                                  |
| --------------- | ------- | ------------------------------------------ |
| **Node.js**     | 18+     | Runtime JavaScript backend                 |
| **PostgreSQL**  | Latest  | Base de datos relacional (Neon Serverless) |
| **Drizzle ORM** | 0.45.1  | Query builder type-safe                    |
| **Drizzle Kit** | Latest  | Migrations y schema management             |

#### Autenticación & Seguridad

| Tecnología           | Versión       | Propósito                              |
| -------------------- | ------------- | -------------------------------------- |
| **Clerk**            | 7.0.4         | Auth multi-factor con webhooks         |
| **Middleware Clerk** | Latest        | Protección de rutas                    |
| **Rate Limiting**    | Upstash Redis | Prevención de abuso (10 requests/hora) |

#### Servicios Externos

| Servicio          | Versión  | Propósito                          |
| ----------------- | -------- | ---------------------------------- |
| **Cloudinary**    | 2.9.0    | Storage y optimización de imágenes |
| **Resend**        | 6.9.4    | Email delivery transaccional       |
| **Upstash Redis** | 1.37.0   | Cache distribuido y rate limiting  |
| **Andreani**      | API REST | Integración logística (futuro)     |

#### Validación & Tipos

| Tecnología   | Versión | Propósito                        |
| ------------ | ------- | -------------------------------- |
| **Zod**      | 4.3.6   | Schema validation con TypeScript |
| **Next Env** | Latest  | Validación variables de entorno  |

#### Monorepo & Build

| Tecnología   | Versión | Propósito             |
| ------------ | ------- | --------------------- |
| **Turbo**    | 2.8.16  | Build system monorepo |
| **ESLint**   | Latest  | Code linting          |
| **Prettier** | Latest  | Code formatting       |

---

### 📁 Apps del Workspace

- **`apps/web`** — Plataforma principal Next.js (producción 🚀)
  - ✅ Dashboard admin
  - ✅ Portal pacientes
  - ✅ API REST completamente tipada
  - ✅ Autenticación y autorización
  - ✅ Gestión de solicitudes y pagos
  - ✅ Notificaciones por email

- **`apps/mobile`** — React Native Expo (scaffolding)
  - 🚧 Estructura base Expo
  - 📋 Listo para expansión futura
  - 🔄 Compartirá tipos con `apps/web`

### 🎨 Packages Compartidos

- **`packages/ui`** — Componentes React reutilizables
- **`packages/eslint-config`** — Configuración ESLint centralizada
- **`packages/typescript-config`** — Configuración TypeScript compartida

---

## 🚀 Quick Start

### Requisitos

- Node.js 18+
- npm o yarn
- Git

### 1. Clonar e instalar

```bash
git clone https://github.com/marianocondoleo/condoleo.git
cd condoleo
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example apps/web/.env.local
```

Editá `apps/web/.env.local` y completá cada variable:

```env
# Database (Neon)
DATABASE_URL=postgresql://...

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Resend (Email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@condoleo.com
ADMIN_EMAIL=admin@condoleo.com

# Upstash Redis (Rate Limiting - opcional)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Ver `.env.example` para detalles completos.

### 3. Setup Base de Datos

```bash
cd apps/web
npm run db:migrate
```

### 4. Correr en Desarrollo

```bash
npm run dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:3000/api

---

## 📁 Estructura del Proyecto

```
condoleo/
├── apps/
│   ├── web/                          # Plataforma Next.js (producción)
│   │   ├── src/
│   │   │   ├── app/                 # Next.js app directory
│   │   │   │   ├── admin/           # Panel administrativo
│   │   │   │   ├── api/             # API routes
│   │   │   │   ├── auth-redirect/
│   │   │   │   ├── mis-solicitudes/ # Panel del paciente
│   │   │   │   ├── perfil/
│   │   │   │   ├── productos/
│   │   │   │   └── solicitar/       # Crear solicitud
│   │   │   ├── components/          # Componentes React
│   │   │   └── lib/                 # Utilidades
│   │   │       ├── db/              # Drizzle ORM
│   │   │       ├── cloudinary.ts
│   │   │       ├── email.ts
│   │   │       ├── logger.ts
│   │   │       └── rateLimit.ts
│   │   ├── drizzle/                 # Migrations SQL
│   │   └── .env.example
│   └── mobile/                      # React Native Expo (scaffolding)
│
├── packages/
│   ├── ui/                          # Componentes reutilizables
│   ├── eslint-config/
│   └── typescript-config/
│
├── turbo.json
└── package.json
```

### `apps/web/src/app/` — Next.js App Router

```
app/
├── page.tsx                          # Home page
├── layout.tsx                        # Root layout con Clerk provider
├── globals.css
├── middleware.ts                     # Auth middleware
├── admin/                            # 🔒 Admin-only routes
│   ├── dashboard/page.tsx
│   ├── productos/page.tsx
│   ├── solicitudes/page.tsx
│   └── metodos-pago/page.tsx
├── api/                              # 🚀 REST API endpoints
│   ├── admin/
│   │   ├── dashboard/route.ts
│   │   ├── payment-config/[id]/route.ts
│   │   ├── productos/[id]/route.ts
│   │   ├── productos/route.ts
│   │   └── solicitudes/[id]/route.ts
│   ├── files/download/route.ts
│   ├── mis-solicitudes/route.ts
│   ├── perfil/route.ts
│   ├── products/route.ts
│   ├── solicitudes/[id]/route.ts
│   ├── solicitudes/products/route.ts
│   ├── solicitudes/route.ts
│   └── webhooks/clerk/route.ts
├── mis-solicitudes/page.tsx          # 🔒 Panel del usuario
├── perfil/page.tsx                   # 🔒 Editor de perfil
├── productos/page.tsx                # Catálogo público
└── solicitar/page.tsx                # 🔒 Crear solicitud
```

### `apps/web/src/lib/` — Lógica Compartida

```
lib/
├── auth.ts
├── cloudinary.ts
├── cloudinary-client.ts
├── email.ts
├── env.ts                  # Validación variables (Zod)
├── logger.ts
├── rateLimit.ts
├── validations.ts
├── db/
│   ├── index.ts
│   ├── schema.ts
│   └── relations.ts
└── emails/
    ├── solicitud-recibida.ts
    ├── solicitud-en-produccion.ts
    ├── solicitud-despachada.ts
    ├── solicitud-cancelada.ts
    ├── solicitud-pago.ts
    └── utils.ts
```

---

## 💻 Comandos Disponibles

```bash
# Build
npm run build              # Build web + packages

# Desarrollo
npm run dev                # Dev server
npm run type-check         # TypeScript check en watch mode

# Calidad de código
npm run lint               # ESLint en todos los apps
npm run format             # Prettier format

# Base de datos
npm run db:migrate         # Ejecutar migrations
npm run db:push            # Push schema a DB
npm run db:studio          # Drizzle Studio (UI visual)
```

---

## 🔌 API Reference

### Endpoints Públicos

```
GET  /api/products                     # Listar productos activos (sin auth)
```

### User Endpoints (auth requerida)

```
GET    /api/perfil                     # Ver perfil del usuario
PUT    /api/perfil                     # Actualizar perfil

GET    /api/mis-solicitudes            # Ver mis solicitudes (paginado)
GET    /api/solicitudes/[id]           # Ver detalle de solicitud
POST   /api/solicitudes                # Crear nueva solicitud (FormData)
GET    /api/solicitudes/products       # Listar productos para crear solicitud

GET    /api/files/download?url=...     # Descargar archivo desde Cloudinary
```

### Admin Endpoints (auth + rol admin requerido)

```
GET    /api/admin/dashboard                    # Stats y reportes
POST   /api/admin/payment-config               # Crear método de pago
PATCH  /api/admin/payment-config/[id]          # Actualizar método de pago
DELETE /api/admin/payment-config/[id]          # Eliminar método de pago

GET    /api/admin/productos                    # Listar todos los productos
POST   /api/admin/productos                    # Crear producto
PUT    /api/admin/productos/[id]               # Editar producto
DELETE /api/admin/productos/[id]               # Eliminar producto

GET    /api/admin/solicitudes                  # Listar todas las solicitudes
PATCH  /api/admin/solicitudes/[id]             # Cambiar estado + enviar email
```

### Webhooks

```
POST   /api/webhooks/clerk             # Clerk user sync
```

### Query Parameters

```
?page=1&limit=10
?status=pending|production|dispatched|cancelled
?search=query
?sort=created_at|updated_at&order=asc|desc
```

### Response Format

```json
{
  "success": true,
  "data": {
    /* payload */
  },
  "error": null
}
```

```json
{ "success": false, "data": null, "error": "Description of error" }
```

---

## 🔒 Seguridad

- **Multi-Factor Auth** via Clerk (2FA, WebAuthn)
- **Role-based Access Control** (admin, customer)
- **Server-side validation** con Zod en todas las APIs
- **SQL Injection prevention** via Drizzle ORM (prepared statements)
- **XSS protection** via React (auto-escaping)
- **Rate limiting**: 10 requests/hora por usuario con Redis, fallback en-memory
- **CSRF protection** via Clerk middleware
- **Webhook verification** con Clerk signature validation
- **File upload validation**: solo imágenes, máximo 5MB
- **CSP, X-Frame-Options, X-Content-Type-Options** headers configurados
- **Proxy endpoint** `/api/files/download` para proteger URLs de Cloudinary

---

## ⚡ Performance

- **Image Optimization** con `next/image` (WebP automático, lazy loading, srcSet)
- **Code Splitting** automático por ruta + dynamic imports
- **Caching** con Next.js data cache e ISR
- **Índices** en columnas frecuentes de PostgreSQL
- **N+1 queries** evitadas con Drizzle relations
- **Connection pooling** vía Neon serverless
- **Email async** con Resend + templates pre-compiladas

---

## 🚢 Deployment

### Pre-flight checks

```bash
npm run build
npm run type-check
npm run lint
cd apps/web && npm run db:push --dry-run
```

### Variables de entorno en producción (CRÍTICO)

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_prod_...
CLERK_SECRET_KEY=sk_prod_...
CLERK_WEBHOOK_SECRET=whsec_prod_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Resend
RESEND_API_KEY=re_prod_...
RESEND_FROM_EMAIL=noreply@condoleo.com
ADMIN_EMAIL=admin@condoleo.com

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Node
NODE_ENV=production
```

### Hosting recomendado

**Vercel** (recomendado — optimizado para Next.js): auto-environment detection, preview deployments, built-in monitoring.

**Railway**: excelente alternativa con soporte PostgreSQL nativo.

**AWS / DigitalOcean**: máximo control, requiere configuración manual.

### Checklist de deploy

- [ ] Todos los cambios commiteados
- [ ] Build exitoso (`npm run build`)
- [ ] TypeScript sin errores
- [ ] Lint pasando
- [ ] PostgreSQL provisioned (Neon) y migrations ejecutadas
- [ ] Clerk: aplicación creada y webhooks configurados
- [ ] Cloudinary: cuenta y API keys listas
- [ ] Resend: dominio verificado y setup completo
- [ ] Upstash Redis provisioned
- [ ] Dominio apuntando + SSL activo + HTTPS redirect configurado
- [ ] Monitoring configurado (Sentry + logs centralizados)
- [ ] Secrets no hardcodeados en el repo

---

## 🐛 Troubleshooting

**"DATABASE_URL no configurada"** — Verificá que `apps/web/.env.local` existe y tiene `DATABASE_URL` completa.

**"Build falla con TypeScript errors"** — Corré `npm run type-check` para ver los archivos afectados. Evitá `any`; usá `Record<string, unknown>` o tipos explícitos.

**"Rate limiting no funciona"** — Si `UPSTASH_REDIS_REST_URL` no está configurada, el sistema usa fallback en-memory (funciona pero sin persistencia entre instancias).

**"Emails no se envían"** — Verificá `RESEND_API_KEY`, que el dominio esté verificado en Resend y que `ADMIN_EMAIL` sea válido. Revisá logs en `lib/logger.ts`.

**"Imágenes no se suben a Cloudinary"** — Verificá credenciales, que el archivo sea menor a 5MB y que el MIME type sea imagen.

**"middleware file convention is deprecated"** — Advertencia de Next.js 16.1.6; es seguro ignorarla por ahora. Se migrará a proxy middleware en el futuro.

---

## 📊 Monitoreo

### Stack recomendado

- **Sentry** — Error tracking: `npm install @sentry/nextjs` + `npx @sentry/wizard@latest -i nextjs`
- **Better Stack** — Logs centralizados con real-time streaming y alertas
- **Vercel Analytics** — Web Vitals y performance (si usás Vercel)
- **Checkly / StatusCake** — Uptime monitoring con alertas SMS/Slack

### Métricas target

- Response time: < 500ms
- Error rate: < 0.1%
- DB query time: < 100ms
- Email delivery rate: > 99%
- Uptime: 99.9%

---

## 🗺️ Roadmap

### ✅ Fase 1 — MVP (Actual, en producción)

- [x] Autenticación con Clerk
- [x] Gestión de solicitudes
- [x] Panel administrativo
- [x] Notificaciones por email
- [x] Procesamiento de pagos (manual)
- [x] Upload de documentos a Cloudinary
- [x] Type-safe database con Drizzle

### 🚧 Fase 2 — Mejoras (Q3 2026)

- [ ] Integración con MercadoPago API
- [ ] SMS notifications
- [ ] Reportes avanzados (Excel export)
- [ ] Dashboard analytics con gráficas
- [ ] API documentation (Swagger/OpenAPI)

### 📱 Fase 3 — Mobile (Q4 2026)

- [ ] React Native app (Expo)
- [ ] Push notifications
- [ ] Offline support
- [ ] Tipos TypeScript compartidos

### 🔮 Fase 4 — Advanced (2027+)

- [ ] ML para predicción de costos
- [ ] Integración con ERP
- [ ] Multi-tenant support
- [ ] Marketplace de proveedores

---

## 🤝 Contribución

### Workflow

```bash
git checkout -b feature/nueva-feature
# ... cambios ...
npm run build && npm run type-check && npm run lint
git commit -m "feat: descripción clara"
git push origin feature/nueva-feature
# Crear PR
```

### Commit messages

```
feat:      nueva funcionalidad
fix:       corrección de bug
docs:      actualización de documentación
refactor:  cambio sin funcionalidad nueva
style:     cambios de formato
test:      agregar tests
chore:     build, deps, etc.
```

### Code style

- TypeScript strict mode siempre
- Prettier para formatting automático
- Imports absolutos con `@/*` alias
- Components: PascalCase, exportados por default
- Functions: camelCase, tipos explícitos, sin `any`

---

## 📞 Contacto

- **Ortopedia FOC**: ortopediafoc@gmail.com
- Para bugs: crear GitHub Issue con descripción, steps to reproduce y versión de Node/Next.js
- Para features: crear GitHub Discussion con caso de uso e impacto en arquitectura

---

## 🎉 Status: PRODUCTION READY ✅

```
✅ Build:        Exitoso
✅ TypeScript:   0 errores
✅ Lint:         0 warnings
✅ Security:     Implementada
✅ Performance:  Optimizada
✅ Deployment:   Listo

🚀 ¡LANZAMIENTO AUTORIZADO!
```

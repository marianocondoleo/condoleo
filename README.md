# CONDOLEO

Plataforma médica integral para gestión de solicitudes de órtesis y prótesis.

**Estado:** Producción  
**Tipo:** SaaS - Plataforma web responsiva  

---

## 🎯 Características Principales

- **Gestión de Solicitudes**: Pacientes solicitan órtesis/prótesis, admins aprueban y definen precios
- **Autenticación Segura**: Integración con Clerk para auth multi-factor
- **Gestión de Pagos**: Transferencias bancarias con confirmación por email
- **Seguimiento de Envíos**: Integración con Andreani para logística
- **Panel Administrativo**: Dashboard para gestionar solicitudes, productos y configuración
- **Notificaciones por Email**: Cambios de estado automáticos vía Resend

---

## 🏗️ Arquitectura

**Stack Tecnológico:**

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16.1 + React 19 + TypeScript |
| Backend | Next.js API Routes (Node.js) |
| Base de Datos | PostgreSQL (Neon Serverless) |
| Autenticación | Clerk |
| Storage | Cloudinary (imágenes) |
| Email | Resend |
| Rate Limiting | Upstash Redis |
| Envíos | Andreani |
| Monorepo | Turbo |

**Apps del Workspace:**
- `apps/web` - Plataforma principal (producción)
- `apps/mobile` - React Native Expo (scaffolding para futuro)

---

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- npm o yarn
- Git

### 1️⃣ Clonar e instalar

```bash
git clone https://github.com/tu-org/condoleo.git
cd condoleo
npm install
```

### 2️⃣ Configurar variables de entorno

```bash
cp .env.example apps/web/.env.local
```

Edita `apps/web/.env.local` y rellena cada variable:

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

Ver `.env.example` para detalles completos → [.env.example](.env.example)

### 3️⃣ Setup Base de Datos

```bash
cd apps/web
npm run db:migrate
```

### 4️⃣ Correr en Desarrollo

```bash
npm run dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Clerk**: Panel de autenticación en signIn/signUp

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
│   │   │       ├── cloudinary.ts    # Upload a Cloudinary
│   │   │       ├── email.ts         # Plantillas email
│   │   │       ├── logger.ts        # Logging
│   │   │       └── rateLimit.ts     # Rate limiting
│   │   ├── drizzle/                 # Migrations SQL
│   │   └── .env.example             # Variables de entorno
│   └── mobile/                       # React Native Expo (scaffolding)
│
├── packages/
│   ├── ui/                          # Componentes reutilizables
│   ├── eslint-config/               # Configuración ESLint
│   └── typescript-config/           # Configuración TypeScript
│
├── .env.example                     # Variables de entorno (root)
├── turbo.json                       # Configuración Turbo
└── package.json
```

---

## 💻 Desarrollo

### Iniciar servidor con todas las herramientas

**Terminal 1: Dev Server (con hot reload)**
```bash
npm run dev
```

**Terminal 2: Type Checking (watch mode)**
```bash
npm run type-check
```

**Terminal 3: Linting**
```bash
npm run lint
```

**Terminal 4: Base de datos (push schema)**
```bash
cd apps/web && npm run db:push
```

### Comandos Disponibles

```bash
# Build
npm run build              # Build web + packages

# Development
npm run dev                # Dev server
npm run type-check         # TypeScript check

# Linting
npm run lint               # ESLint en todos los apps
npm run format             # Prettier format

# Database
npm run db:migrate         # Ejecutar migrations
npm run db:push            # Push schema a DB
npm run db:studio          # Drizzle Studio (UI)
```

---

## 🚢 Deployment

### Production Build

```bash
# Build todo el monorepo
npm run build

# Partir servidor (requiere .env.local)
npm run start
```

### Configurar en Hosting (Vercel, Railway, etc.)

Establece estas variables de entorno:

```env
DATABASE_URL=postgresql://user:pass@host/db
CLERK_SECRET_KEY=sk_prod_...
CLERK_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_prod_...
RESEND_FROM_EMAIL=noreply@condoleo.com
ADMIN_EMAIL=admin@condoleo.com
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NODE_ENV=production
```

### Checklist de Deploy

- [ ] Variables de entorno configuradas
- [ ] Database migrada (`npm run db:migrate`)
- [ ] Build pasando (`npm run build`)
- [ ] Tests pasando (si existen)
- [ ] Clerk webhooks configurados
- [ ] Dominios DNS apuntando correctamente

---

## 📱 App Mobile

🚧 **Estado: Scaffolding Inicial**

La app mobile (`apps/mobile`) es una estructura base de Expo. Actualmente no está incluida en deployment.

Para futuro desarrollo de la app mobile:
- Integrar autenticación Clerk
- Conectar a API de `apps/web`
- Compartir tipos TypeScript
- Mantener consistencia visual

Ver [apps/mobile/README_STATUS.md](apps/mobile/README_STATUS.md)

---

## 🔒 Seguridad

- ✅ Validación en servidor y cliente
- ✅ Rate limiting con Upstash Redis
- ✅ Webhook verification de Clerk
- ✅ Variables de entorno segregadas
- ✅ Headers de seguridad (CSP, X-Frame-Options, etc.)
- ✅ Autenticación mediante Clerk (MFA ready)
- ✅ Proxy para servir archivos (evita CORS issues)

---

## 📊 Monitoreo

Recomendado implementar:
- [Sentry](https://sentry.io) para error tracking
- [Better Stack](https://betterstack.com) para logging
- [Vercel Analytics](https://vercel.com/analytics) para performance

---

## 📝 Licencia

Propietario - CONDOLEO (Privado)

---

## 🤝 Contacto & Support

- **Email**: ortopediafoc@gmail.com
- **Docs**: Ver [.env.example](.env.example) para setup detallado

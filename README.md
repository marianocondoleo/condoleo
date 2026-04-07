# CONDOLEO

Plataforma médica integral para gestión de solicitudes de órtesis y prótesis.

## Tecnología

**Stack:**

- Next.js 16.1 + React 19 (Web)
- Expo React Native (Mobile - scaffolding inicial)
- PostgreSQL (Neon)
- TypeScript
- Turbo (monorepo)

**Servicios:**

- Clerk (autenticación)
- Cloudinary (almacenamiento)
- Resend (email)
- Upstash (rate limiting)
- Andreani (envíos)

## Quick Start

### 1. Clonar y instalar

```bash
git clone <repo>
cd condoleo
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example apps/web/.env.local
```

Edita `apps/web/.env.local` y rellena:

- `DATABASE_URL` → [Neon](https://neon.tech)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → [Clerk](https://clerk.com)
- `CLERK_SECRET_KEY` → [Clerk](https://clerk.com)
- `CLOUDINARY_*` → [Cloudinary](https://cloudinary.com)
- `RESEND_API_KEY` → [Resend](https://resend.com)
- `UPSTASH_REDIS_*` → [Upstash](https://upstash.com) (opcional)

Ver `.env.example` para todos los detalles.

### 3. Setup base de datos

```bash
cd apps/web
npm run db:migrate
```

### 4. Correr desarrollo

```bash
npm run dev
```

- **Web**: http://localhost:3000
- **Mobile**: No incluida en desarrollo actual

## Estructura

```
condoleo/
├── apps/
│   ├── web/           # Next.js principal (producción)
│   └── mobile/        # Expo (scaffolding, no en deploy)
├── packages/
│   ├── ui/            # Componentes compartidos
│   ├── eslint-config/
│   └── typescript-config/
├── .env.example       # Variables de entorno (documentadas)
└── turbo.json
```

## Desarrollo Web

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Base de datos
cd apps/web && npm run db:push

# Terminal 3: Type checking
npm run type-check

# Lint
npm run lint
```

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Variablespara producción

Configurar en el hosting:

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLOUDINARY_API_*`
- `RESEND_API_KEY`
- `UPSTASH_REDIS_*`
- `ADMIN_EMAIL`

## App Mobile

⚠️ **Actualmente en scaffolding inicial**

La app mobile (`apps/mobile`) es solo estructura base:

- Sin pantallas implementadas
- Sin integración con API
- No incluida en deploy actual

Ver [apps/mobile/README_STATUS.md](apps/mobile/README_STATUS.md) para detalles.

## Licencia

Privado - Condoleo
yarn dlx turbo build
pnpm exec turbo build

````

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
````

Without global `turbo`:

```sh
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)

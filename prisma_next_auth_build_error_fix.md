# Fix: PrismaClientConstructorValidationError in Next.js App Router

## Error

```
PrismaClientConstructorValidationError:
Unknown property datasources provided to PrismaClient constructor
```

This error usually occurs during `next build` while collecting page data for:

```
/api/auth/[...nextauth]
```

---

## Root Cause

The issue is caused by passing `datasources` to the `PrismaClient` constructor.

### ❌ Invalid / Outdated Code

```ts
new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
```

### Why this fails

- Modern Prisma **does not support** `datasources` in the constructor
- Prisma now reads database configuration **only** from `schema.prisma`
- Next.js App Router executes API routes at build time
- Prisma throws → build fails

---

## Correct Modern Prisma Setup

### 1. `schema.prisma`

All datasource configuration must live here.

```prisma
datasource db {
  provider = "postgresql" // or mysql / sqlite
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

### 2. Environment Variables

`.env`

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

---

### 3. Shared Prisma Client (REQUIRED)

Create a single shared Prisma instance to avoid hot-reload and build-time issues.

**`lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
```

❌ Do NOT pass `datasources`
❌ Do NOT create `PrismaClient` inside API routes

---

## NextAuth (App Router) Integration

**`app/api/auth/[...nextauth]/route.ts`**

```ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth providers
  ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### Important Rules

- Never instantiate `PrismaClient` inside the route
- Never pass Prisma config options to `PrismaAdapter`
- Always reuse the shared Prisma instance

---

## Version Consistency Check

Ensure Prisma CLI and client versions match:

```bash
npm ls prisma @prisma/client
```

They must be on the **same major version**.

---

## Validation Commands

Run after fixing:

```bash
npx prisma generate
npx prisma validate
npm run build
```

---

## Summary

### ❌ What breaks builds

```ts
new PrismaClient({ datasources: {...} })
```

### ✅ What works

- Datasource config in `schema.prisma`
- `new PrismaClient()` with no overrides
- Shared Prisma client via `lib/prisma.ts`
- Reused Prisma instance in NextAuth adapter

---

## Key Insight

In Next.js App Router, **API routes execute during build**.
Any Prisma constructor error will fail the entire build.

This is expected behaviour, not a Next.js bug.


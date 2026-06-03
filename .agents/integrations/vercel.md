````md
# File: .agents/integrations/vercel.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Complete Vercel deployment reference for CareFlow — vercel.json configuration, serverless function timeouts, environment variables, build settings, Edge vs Node.js runtime, preview deployments, custom domains, analytics, logging, and common deployment errors.

## Overview

CareFlow is deployed on **Vercel** using the Next.js framework preset. All API routes (including DeepSeek AI calls) run as serverless functions. The frontend is statically generated where possible, with dynamic routes for discharge records and audit logs.

---

## Vercel Project Setup

### Install Vercel CLI

```bash
npm i -g vercel
```
````

### Deploy for First Time

```bash
vercel
```

**Follow the prompts:**

- Set up and deploy: `Y`
- Which scope: Select your Vercel team或个人account
- Link to existing project: `N`
- Project name: `careflow`
- Directory: `./`
- Override settings: `N`

### Link to Existing Project (After First Deploy)

```bash
vercel link
```

### Deploy to Production

```bash
vercel --prod
```

---

## vercel.json Configuration

**File:** `vercel.json` (in project root)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",

  "functions": {
    "app/api/discharge/generate/route.ts": {
      "maxDuration": 30,
      "runtime": "nodejs20.x"
    },
    "app/api/discharge/[id]/route.ts": {
      "maxDuration": 10,
      "runtime": "nodejs20.x"
    },
    "app/api/discharge/[id]/finalise/route.ts": {
      "maxDuration": 10,
      "runtime": "nodejs20.x"
    },
    "app/api/translation/request/route.ts": {
      "maxDuration": 30,
      "runtime": "nodejs20.x"
    },
    "app/api/audit/[recordId]/route.ts": {
      "maxDuration": 10,
      "runtime": "nodejs20.x"
    }
  },

  "env": {
    "NODE_VERSION": "20.x"
  },

  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ],

  "redirects": [
    {
      "source": "/",
      "destination": "/dashboard",
      "permanent": false,
      "has": [
        {
          "type": "cookie",
          "key": "sb-access-token"
        }
      ]
    }
  ]
}
```

---

## Serverless Function Timeouts

| Plan         | Default Timeout | Maximum Timeout | CareFlow Setting |
| ------------ | --------------- | --------------- | ------------------- |
| Hobby (Free) | 10s             | 60s             | 30s for AI routes   |
| Pro          | 15s             | 300s            | 30s for AI routes   |
| Enterprise   | Custom          | Custom          | 30s for AI routes   |

### Why 30 Seconds?

- DeepSeek API calls take 10-25 seconds
- Additional processing (validation, DB writes) takes 2-5 seconds
- 30s leaves a 5-second buffer before Vercel's 60s hard limit

### Important Note for Hobby Plan

The Hobby plan has a **60-second hard limit**. Setting `maxDuration: 30` is safe. Do not set it higher than 30 unless you upgrade to Pro.

---

## Runtime: Node.js vs Edge Functions

| Runtime      | Use Case                                          | CareFlow Usage                          |
| ------------ | ------------------------------------------------- | ------------------------------------------ |
| Node.js 20.x | Long-running tasks, AI calls, database operations | ✅ **All API routes**                      |
| Edge         | Low-latency, simple responses, geolocation        | ❌ Not used (DeepSeek calls would timeout) |

**Why not Edge Runtime?**

- Edge functions have a 5-30 second timeout (varies by region)
- DeepSeek calls often exceed 15 seconds
- Supabase connections are less reliable in Edge runtime

**Force Node.js runtime in API routes:**

```ts
export const runtime = "nodejs"; // Add to top of route.ts files
```

Example:

```ts
// app/api/discharge/generate/route.ts
export const runtime = "nodejs";

export async function POST(req: Request) {
  // ... implementation
}
```

---

## Environment Variables in Vercel

### Set Environment Variables via CLI

```bash
# Development (local)
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
vercel env add SUPABASE_SERVICE_ROLE_KEY development
vercel env add DEEPSEEK_API_KEY development
vercel env add NEXTAUTH_SECRET development
vercel env add NEXTAUTH_URL development

# Preview (PR deployments)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
vercel env add DEEPSEEK_API_KEY preview
vercel env add NEXTAUTH_SECRET preview

# Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DEEPSEEK_API_KEY production
vercel env add NEXTAUTH_SECRET production
```

### Set Environment Variables via Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with appropriate environments (Production, Preview, Development)
3. Redeploy for changes to take effect

### Required Environment Variables Checklist

| Variable                        | Production         | Preview   | Development |
| ------------------------------- | ------------------ | --------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅                 | ✅        | ✅          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅                 | ✅        | ✅          |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅                 | ✅        | ✅          |
| `DEEPSEEK_API_KEY`              | ✅                 | ✅        | ✅          |
| `DEEPSEEK_API_URL`              | Optional           | Optional  | Optional    |
| `DEEPSEEK_MODEL`                | Optional           | Optional  | Optional    |
| `DEEPSEEK_MAX_TOKENS`           | Optional           | Optional  | Optional    |
| `DEEPSEEK_TEMPERATURE`          | Optional           | Optional  | Optional    |
| `DEEPSEEK_TIMEOUT_MS`           | Optional           | Optional  | Optional    |
| `NEXT_PUBLIC_APP_URL`           | ✅ (custom domain) | ✅ (auto) | ✅          |
| `CFW_AI_PROMPT_VERSION`         | ✅                 | ✅        | ✅          |
| `CFW_AI_MODEL_VERSION`          | ✅                 | ✅        | ✅          |
| `NEXTAUTH_SECRET`               | ✅                 | ✅        | ✅          |
| `NEXTAUTH_URL`                  | ✅ (custom domain) | ✅ (auto) | ✅          |

---

## Build Settings

### Next.js Configuration (next.config.ts)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Optimized for Vercel deployment
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true,

  images: {
    domains: [], // No external images in v1.0
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // For large patient inputs
    },
  },

  // Redirect HTTP to HTTPS
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Build Command (package.json)

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

### Vercel Build Settings (via Dashboard)

| Setting             | Value           |
| ------------------- | --------------- |
| Build Command       | `npm run build` |
| Output Directory    | `.next`         |
| Install Command     | `npm install`   |
| Development Command | `npm run dev`   |
| Node.js Version     | `20.x`          |

---

## Preview Deployments

Every pull request automatically gets a preview deployment.

### Benefits for CareFlow:

- Test AI generation with real DeepSeek API (use separate API key for preview)
- Verify Supabase RLS policies with preview database
- Test translations without affecting production data

### Configure Preview Environment Variables

Set environment variables for Preview environment (same as production but can use dev Supabase project).

### Access Preview Deployment

Vercel automatically comments on PR with preview URL:

```
https://careflow-git-feature-branch.vercel.app
```

---

## Custom Domain Configuration

### Add Custom Domain

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add domain (e.g., `careflow.ng` or `app.careflow.health`)
3. Configure DNS records:
   - **A record:** `76.76.21.21` (Vercel IP)
   - **CNAME record:** `cname.vercel-dns.com`

### Update Environment Variables

After domain is configured:

```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Value: https://careflow.ng

vercel env add NEXTAUTH_URL production
# Value: https://careflow.ng
```

### Force HTTPS

Vercel automatically provisions SSL certificates (Let's Encrypt). HTTPS is enforced by default.

---

## Vercel Analytics

### Enable Analytics

```bash
npm install @vercel/analytics
```

### Add to Layout (app/layout.tsx)

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### What Analytics Tracks (No PHI)

- Page views
- User interactions (clicks on buttons)
- Performance metrics (Core Web Vitals)
- API route latency

**Important:** Vercel Analytics automatically anonymizes IP addresses. No patient health information (PHI) is tracked.

---

## Logging and Monitoring

### Vercel Log Drains (Pro Plan)

Send logs to external services like Datadog, Logtail, or Axiom.

### Build Logs

View build logs in Vercel Dashboard → Deployments → Click deployment → Logs.

### Runtime Logs (API Routes)

Access via:

- Vercel Dashboard → Functions → Select function → Logs
- `vercel logs --function=api/discharge/generate`

### Structured Logging in API Routes

```ts
export async function POST(req: Request) {
  const startTime = Date.now();
  console.log(
    JSON.stringify({
      level: "info",
      message: "Generation started",
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    }),
  );

  // ... implementation

  console.log(
    JSON.stringify({
      level: "info",
      message: "Generation completed",
      durationMs: Date.now() - startTime,
      status: "success",
    }),
  );
}
```

**Do not log:** PHI, API keys, JWT tokens, patient names, hospital numbers.

---

## Performance Monitoring

### Core Web Vitals Targets for CareFlow

| Metric                         | Target | Measurement        |
| ------------------------------ | ------ | ------------------ |
| LCP (Largest Contentful Paint) | <2.5s  | Page load time     |
| FID (First Input Delay)        | <100ms | Form interactivity |
| CLS (Cumulative Layout Shift)  | <0.1   | Visual stability   |
| TTFB (Time to First Byte)      | <200ms | API response time  |

### API Route Performance Tracking

Add custom metrics in Vercel dashboard or use `@vercel/speed-insights`:

```bash
npm install @vercel/speed-insights
```

```tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## Common Deployment Errors and Fixes

### Error 1: Function Timeout

**Error message:** `Task timed out after 10 seconds`

**Cause:** Default timeout is 10s, but DeepSeek call takes >10s

**Fix:** Add `maxDuration` to function in `vercel.json`:

```json
{
  "functions": {
    "app/api/discharge/generate/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Error 2: Edge Runtime not supported

**Error message:** `The Edge runtime does not support `fetch` with long timeouts`

**Cause:** API route defaulting to Edge runtime

**Fix:** Add `export const runtime = 'nodejs';` to route.ts

### Error 3: Environment Variables missing

**Error message:** `DEEPSEEK_API_KEY is not defined`

**Cause:** Environment variable not set in Vercel dashboard

**Fix:** Add variable for all environments (Production, Preview, Development)

### Error 4: Supabase connection timeout

**Error message:** `Connection pool timeout`

**Cause:** Supabase IPv6 connectivity issue from Vercel

**Fix:**

1. Use IPv4 connection string
2. Or add `?pgbouncer=true` to connection string
3. Or move Supabase to same region as Vercel (e.g., AWS us-east-1)

### Error 5: Build fails due to TypeScript errors

**Error message:** `Type error: Property 'xxx' does not exist`

**Cause:** Strict TypeScript checking

**Fix:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "noEmit": true,
    "strict": false, // Temporarily for build
    "skipLibCheck": true
  }
}
```

### Error 6: Image optimization failing

**Error message:** `Image optimization failed`

**Cause:** No images used in v1.0, but Next.js tries to optimize

**Fix:** Disable image optimization:

```ts
// next.config.ts
{
  images: {
    unoptimized: true;
  }
}
```

### Error 7: Preview deployment can't access Supabase

**Error message:** `Connection refused` or `RLS policy violation`

**Cause:** Preview deployment using production Supabase URL

**Fix:**

1. Create separate Supabase project for preview/testing
2. Set `NEXT_PUBLIC_SUPABASE_URL` preview env var to test project URL

---

## Deployment Checklist (Pre-Flight)

Before deploying to production:

- [ ] All environment variables set in Vercel dashboard (Production environment)
- [ ] Supabase production project has RLS policies applied
- [ ] DeepSeek API key is valid and has credits
- [ ] `vercel.json` has correct `maxDuration` settings (30s for AI routes)
- [ ] All API routes have `export const runtime = 'nodejs'`
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] Build succeeds locally: `npm run build`
- [ ] Preview deployment works and connects to dev Supabase
- [ ] Custom domain DNS configured (if using)
- [ ] SSL certificate provisioned (automatic with Vercel)

---

## Post-Deployment Monitoring

### Daily Checks

- [ ] Vercel Analytics dashboard for error rates
- [ ] API route response times (p99 < 25s for generation)
- [ ] Supabase connection pool usage (<80%)
- [ ] DeepSeek rate limit usage (<70%)

### Weekly Checks

- [ ] Review failed deployments (if any)
- [ ] Check log drains for unexpected errors
- [ ] Verify audit logs are being written correctly

### Monthly Checks

- [ ] Rotate `DEEPSEEK_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Review DeepSeek token usage and costs
- [ ] Update `CFW_AI_PROMPT_VERSION` if prompts changed
- [ ] Test disaster recovery: deploy from backup

---

## Rollback Procedure

### Rollback to Previous Deployment

1. Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click three dots (⋮) → "Promote to Production"

### Via CLI

```bash
# List recent deployments
vercel list

# Rollback to deployment ID
vercel rollback <deployment-id>
```

---

## Constraints for this file

- **Never set `maxDuration` higher than 30s on Hobby plan** — functions will be cancelled
- **Never use Edge runtime for AI routes** — DeepSeek calls will timeout
- **Never expose environment variables to client** — use `NEXT_PUBLIC_` prefix only for safe values
- **Never skip `export const runtime = 'nodejs'`** — ensures correct runtime
- **Never hardcode environment values** — always use Vercel environment variables
- **Never deploy without running migrations** — schema and RLS must be applied first
- **Never forget to update `NEXTAUTH_URL` after custom domain change** — breaks authentication

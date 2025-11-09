# 🚀 Vercel + Vercel Postgres Setup Guide

## Overview

We're using:
- **Vercel** for hosting frontend + backend
- **Vercel Postgres** (powered by Neon) for database
- **Prisma** as our ORM (keeps all the code we wrote!)

## Step 1: Set Up Vercel Postgres (5 minutes)

### Option A: Via Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project (or select existing)
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name (e.g., "tutoring-db")
7. Select region closest to your users
8. Click **Create**

Vercel will provide you with:
- `POSTGRES_URL` - Full connection string with pooling
- `POSTGRES_PRISMA_URL` - For Prisma migrations
- `POSTGRES_URL_NON_POOLING` - Direct connection

### Option B: Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
cd tutoringapp
vercel link

# Create database
vercel postgres create tutoring-db
```

## Step 2: Update Environment Variables

### Local Development

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Vercel Postgres - Get from Vercel dashboard
# Use POSTGRES_PRISMA_URL for migrations
DATABASE_URL="postgres://user:password@region.postgres.vercel-storage.com/verceldb?sslmode=require"

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# OpenAI
OPENAI_API_KEY=sk-your-key-here

FRONTEND_URL=http://localhost:3000
```

### Production (Vercel Dashboard)

1. Go to your Vercel project
2. **Settings** > **Environment Variables**
3. Add these variables:

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
OPENAI_API_KEY
FRONTEND_URL (your production URL)
```

Note: `DATABASE_URL` is automatically set by Vercel Postgres integration!

## Step 3: Run Database Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (will use DATABASE_URL from .env)
npm run prisma:migrate dev --name init

# View your data (optional)
npm run prisma:studio
```

## Step 4: Test Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd tutoring-platform
npm start
```

Try registering a user - it should save to Vercel Postgres!

## Step 5: Deploy to Vercel

### Frontend Deployment

```bash
cd tutoring-platform

# Add environment variables to .env.production (don't commit!)
# Or set in Vercel dashboard

# Deploy
vercel --prod
```

Or use Vercel's GitHub integration (automatic deploys).

### Backend Deployment Options

#### Option A: Vercel Serverless Functions (Recommended for MVP)

Convert Express routes to Vercel serverless functions:

```
backend/
  api/
    auth/
      register.js
      me.js
```

Each file exports a handler:
```javascript
module.exports = (req, res) => {
  // Your route logic
};
```

#### Option B: Deploy Backend Separately (Easier, keeps Express as-is)

Deploy backend to:
- **Railway** (free tier, easy)
- **Render** (free tier)
- **Fly.io** (free tier)

Then update `REACT_APP_API_URL` to point to deployed backend.

## Step 6: Configure Vercel Project Settings

### For Frontend:

**Build Settings:**
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

**Root Directory**: `tutoring-platform`

### For Backend (if using Vercel serverless):

**Build Settings:**
- **Framework Preset**: Other
- **Build Command**: `npm install && npm run prisma:generate`
- **Output Directory**: (leave empty)

**Root Directory**: `backend`

## Vercel Postgres Free Tier Limits

- **Storage**: 256 MB
- **Compute**: 60 hours/month
- **Data Transfer**: 256 MB/month
- **Databases**: 1 per project

**Good for MVP!** Upgrade to Pro ($20/mo) when you need more.

## Connection Pooling

Vercel Postgres uses **connection pooling** by default (via PgBouncer).

**Important for Prisma:**
- Use `POSTGRES_PRISMA_URL` for migrations
- Use `POSTGRES_URL` for app queries (pooled)

Update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

Then in `.env`:
```env
DATABASE_URL="postgres://..." # Pooled connection
DIRECT_URL="postgres://..." # Direct connection (for migrations)
```

## Troubleshooting

### "Too many connections" error
- You're hitting connection limits
- Make sure you're using connection pooling (`POSTGRES_URL`)
- Close Prisma connections properly

### Migrations failing
- Use `POSTGRES_PRISMA_URL` or `DIRECT_URL` for migrations
- Don't run migrations on pooled connections

### Can't connect from local
- Check IP allowlist in Vercel Postgres settings
- Ensure SSL is enabled (`?sslmode=require`)

## Quick Commands Reference

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# View database
npm run prisma:studio

# Reset database (careful!)
npx prisma migrate reset

# Deploy frontend
vercel --prod

# View logs
vercel logs
```

## Next Steps

1. ✅ Set up Vercel Postgres database
2. ✅ Run migrations locally
3. ✅ Test authentication flow
4. 🚀 Deploy frontend to Vercel
5. 🚀 Deploy backend (Vercel serverless or Railway)
6. 🎉 Your app is live!

## Cost Estimate (Free Tier)

- Vercel Postgres: **Free** (256MB)
- Vercel Hosting: **Free** (100GB bandwidth)
- Firebase Auth: **Free** (50k users)
- OpenAI API: **Pay per use** (~$0.01-0.10 per report)
- Jitsi: **Free** (public instance)

**Total: ~$0-5/month** for MVP! 🎉




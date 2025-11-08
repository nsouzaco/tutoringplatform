# 🔐 Your Environment Variables

## Frontend Environment Variables (Add to Vercel)

Go to: https://vercel.com/dashboard → **tutoring-platform** → **Settings** → **Environment Variables**

Add these for **Production, Preview, and Development**:

```
REACT_APP_API_URL = (will add after Railway deployment)
REACT_APP_SOCKET_URL = (will add after Railway deployment)
REACT_APP_JITSI_DOMAIN = meet.jit.si

REACT_APP_FIREBASE_API_KEY = AIzaSyC6dHjyw6rrJ84e24GwfwTZt-1Cibuex8k
REACT_APP_FIREBASE_AUTH_DOMAIN = tutoring-f5d07.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = tutoring-f5d07
REACT_APP_FIREBASE_STORAGE_BUCKET = tutoring-f5d07.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 233846612932
REACT_APP_FIREBASE_APP_ID = 1:233846612932:web:05e3f9c9675ee503b3fa91
```

---

## Backend Environment Variables (Add to Railway)

**⚠️ CRITICAL**: You need to get your Firebase Admin SDK private key!

### How to Get Firebase Admin SDK Key:

1. Go to https://console.firebase.google.com/
2. Select your project: **tutoring-f5d07**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Open it and copy these values:
   - `project_id`
   - `private_key`
   - `client_email`

### Add to Railway:

```
PORT = 5000
NODE_ENV = production

DATABASE_URL = prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19OZjNPaGNRS3R0R1J2UGNmRUhWRHAiLCJhcGlfa2V5IjoiMDFLOUc4NVNWS1JWODc0RjFRM0I0NE1FOVQiLCJ0ZW5hbnRfaWQiOiI2NzZiMDcwMzhlNGJlNmE4NDA1ZTJhNmE3YmIxZmFjMDhjZWJmYzI4ZmM0NTg4ODBhMjY0YjYwYjAxOTc0MWU3IiwiaW50ZXJuYWxfc2VjcmV0IjoiYzM0ZGQyNmUtZjc1Ni00NzEwLTg3YWItZjAxYWFkMTliZGViIn0.tARYHRt0fxVWBvkBE_8Lw7Kw4A157lSVMEbmKuqCVVg

DIRECT_URL = postgres://676b07038e4be6a8405e2a6a7bb1fac08cebfc28fc458880a264b60b019741e7:sk_Nf3OhcQKttGRvPcfEHVDp@db.prisma.io:5432/postgres?sslmode=require

FIREBASE_PROJECT_ID = tutoring-f5d07
FIREBASE_PRIVATE_KEY = (paste from downloaded JSON - include quotes and \n characters)
FIREBASE_CLIENT_EMAIL = (paste from downloaded JSON)

OPENAI_API_KEY = (optional for now - can add later)

FRONTEND_URL = https://tutoring-platform-8pq9id63d-natalyscst-gmailcoms-projects.vercel.app
```

---

## ⚠️ SECURITY NOTE

The Firebase API key you shared is meant to be public (it's restricted by domain in Firebase console), but to keep your app secure:

1. Enable Firebase Security Rules
2. Only allow your Vercel domain
3. Keep the Admin SDK private key SECRET (never commit to git!)

---

## 🚀 DEPLOYMENT CHECKLIST

### Step 1: Add Environment Variables to Vercel ✅
1. Go to Vercel dashboard
2. tutoring-platform → Settings → Environment Variables
3. Add all the REACT_APP_* variables above (except the API URLs for now)
4. Apply to: Production, Preview, Development

### Step 2: Download Firebase Admin SDK Key ⏳
1. Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Download JSON
4. Keep it safe!

### Step 3: Deploy Backend to Railway ⏳
1. Go to https://railway.app/
2. New Project → Deploy from GitHub
3. Select repo → Settings → Root Directory = `backend`
4. Add environment variables from above
5. Wait for deployment

### Step 4: Update Vercel with Backend URL ⏳
1. Copy your Railway URL (e.g., backend-production-xxxx.up.railway.app)
2. Go back to Vercel Environment Variables
3. Update:
   - REACT_APP_API_URL = https://your-railway-url/api
   - REACT_APP_SOCKET_URL = https://your-railway-url
4. Redeploy frontend

### Step 5: Test! ⏳
1. Visit your Vercel URL
2. Sign up
3. Login
4. Success! 🎉

---

## Need Help?

Tell me which step you're on and I'll guide you through it!


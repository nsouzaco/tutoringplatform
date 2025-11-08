# 🚂 Deploy Backend to Railway

## ✅ What We Have So Far

- ✅ Frontend deployed to Vercel
- ✅ Database set up (Prisma Postgres)
- ✅ Migrations run successfully
- ⏳ Backend needs deployment

---

## Option 1: Deploy to Railway (Recommended - FREE)

### Step 1: Sign Up for Railway

1. Go to https://railway.app/
2. Click **Login** → Sign in with **GitHub**
3. Authorize Railway to access your GitHub

### Step 2: Deploy Backend

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your `tutoringapp` repository
4. Railway will detect it automatically

### Step 3: Configure Root Directory

Since backend is in a subdirectory:

1. Click on the service that was created
2. Go to **Settings** tab
3. Find **Root Directory** 
4. Set it to: `backend`
5. Click **Save**

### Step 4: Add Environment Variables

Go to **Variables** tab and add:

```
PORT=5000
NODE_ENV=production

DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19OZjNPaGNRS3R0R1J2UGNmRUhWRHAiLCJhcGlfa2V5IjoiMDFLOUc4NVNWS1JWODc0RjFRM0I0NE1FOVQiLCJ0ZW5hbnRfaWQiOiI2NzZiMDcwMzhlNGJlNmE4NDA1ZTJhNmE3YmIxZmFjMDhjZWJmYzI4ZmM0NTg4ODBhMjY0YjYwYjAxOTc0MWU3IiwiaW50ZXJuYWxfc2VjcmV0IjoiYzM0ZGQyNmUtZjc1Ni00NzEwLTg3YWItZjAxYWFkMTliZGViIn0.tARYHRt0fxVWBvkBE_8Lw7Kw4A157lSVMEbmKuqCVVg

DIRECT_URL=postgres://676b07038e4be6a8405e2a6a7bb1fac08cebfc28fc458880a264b60b019741e7:sk_Nf3OhcQKttGRvPcfEHVDp@db.prisma.io:5432/postgres?sslmode=require

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

OPENAI_API_KEY=sk-your-openai-key

FRONTEND_URL=https://tutoring-platform-8pq9id63d-natalyscst-gmailcoms-projects.vercel.app
```

**IMPORTANT**: Replace Firebase credentials with your actual values from Firebase Console!

### Step 5: Deploy!

1. Railway will auto-deploy once you save the variables
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://backend-production-xxxx.up.railway.app`
4. Test it: `https://your-url.railway.app/health` should return `{"status":"ok"}`

### Step 6: Generate Public Domain (Optional)

1. Go to **Settings** tab
2. Under **Networking**
3. Click **Generate Domain**
4. You'll get a public URL

---

## Option 2: Deploy to Render (Alternative - FREE)

### Step 1: Sign Up

1. Go to https://render.com/
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: tutoring-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

Same as Railway (see above)

### Step 4: Deploy

Click **Create Web Service** - it will deploy automatically!

---

## After Backend is Deployed

### Update Frontend Environment Variables

1. Go to https://vercel.com/dashboard
2. Select **tutoring-platform** project
3. **Settings** → **Environment Variables**
4. Add/Update:

```
REACT_APP_API_URL = https://your-backend-url.railway.app/api
REACT_APP_SOCKET_URL = https://your-backend-url.railway.app
```

5. **Redeploy frontend**:

```bash
cd tutoring-platform
vercel --prod --yes
```

---

## 🧪 Test Your Full Stack!

Once everything is deployed:

1. Go to your frontend URL
2. Click **Sign Up**
3. Register as a student or tutor
4. Login
5. View dashboard

If it works - **YOU'RE LIVE!** 🎉

---

## 🐛 Troubleshooting

### Backend won't start
- Check Railway/Render logs
- Verify all environment variables are set
- Ensure Firebase credentials are correct

### Can't register/login
- Check browser console (F12)
- Verify Firebase Auth is enabled
- Check backend logs for errors

### Database errors
- Ensure migrations ran successfully
- Check DATABASE_URL is correct
- Verify Prisma Client was generated

---

## 📊 What's Running

```
Frontend (Vercel)
    ↓
Backend (Railway/Render)
    ↓
Prisma Database
    ↓
Firebase Auth
```

---

## Need Help?

Let me know what step you're on and any errors you see!


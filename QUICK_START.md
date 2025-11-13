# 🚀 Quick Start Guide

## What's Been Built So Far

### ✅ Completed
1. **Backend API** (Node.js + Express + Prisma)
   - Firebase Auth integration
   - User registration & login
   - Database schema for all features
   - Socket.io setup for real-time features

2. **Frontend App** (React + Tailwind + Firebase)
   - Authentication UI (Login/Register)
   - Role-based access (Student/Tutor)
   - Protected routing
   - User dashboard
   - Responsive design

### 🎯 Next Steps to Get Running

## Step 1: Set Up Firebase (5 minutes)

1. Go to https://console.firebase.google.com/
2. Create a new project (e.g., "tutoring-platform-mvp")
3. Enable **Authentication** > **Sign-in method** > **Email/Password** (enable it)
4. Get your **web config**:
   - Project Settings > General > Your apps > Web app
   - Copy the `firebaseConfig` object
5. Get your **Admin SDK key**:
   - Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

## Step 2: Set Up Vercel Postgres (2 minutes)

### Option A: Use Vercel Cloud (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create a project (or use existing)
3. **Storage** tab > **Create Database** > **Postgres**
4. Copy the `POSTGRES_PRISMA_URL` connection string
5. Use that as your `DATABASE_URL` in backend `.env`

### Option B: Local PostgreSQL (For offline development)
```bash
# Install PostgreSQL (if not installed)
brew install postgresql@14
brew services start postgresql@14
createdb tutoring_db
# Use: postgresql://YOUR_USERNAME@localhost:5432/tutoring_db
```

## Step 3: Configure Environment Variables

### Backend `.env` file
Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Your Vercel Postgres connection (from Vercel dashboard)
# Or local: postgresql://YOUR_USERNAME@localhost:5432/tutoring_db
DATABASE_URL=postgres://user:pass@region.postgres.vercel-storage.com/verceldb?sslmode=require

# From Firebase Admin SDK JSON file
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Get from OpenAI (will need later for AI reports)
OPENAI_API_KEY=sk-your-key-here

FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` file
Create `tutoring-platform/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_JITSI_DOMAIN=meet.jit.si

# From Firebase web config
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 4: Initialize Database (1 minute)

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

## Step 5: Run the App! 🎉

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ Firebase Admin SDK initialized
```

**Terminal 2 - Frontend:**
```bash
cd tutoring-platform
npm start
```

Browser will open at http://localhost:3000

## Step 6: Test It Out

1. **Sign up** as a Tutor
   - Name: "John Teacher"
   - Email: john@test.com
   - Role: Tutor
   - Subjects: "Math, Physics"

2. **Sign up** as a Student (use incognito window)
   - Name: "Jane Student"
   - Email: jane@test.com
   - Role: Student

3. Both users should see their dashboards!

## 📝 What You Can Do Now

- ✅ Register as Student or Tutor
- ✅ Login/Logout
- ✅ View dashboard
- ✅ Update profile

## 🔜 What's Coming Next

1. **Tutor Availability** - Set time slots when tutors are available
2. **Booking System** - Students book sessions with tutors
3. **Video Sessions** - Jitsi integration for live sessions
4. **Real-time Chat** - Chat during sessions
5. **Collaborative Notes** - Shared notes during sessions
6. **AI Reports** - Post-session analysis for tutors

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check Firebase credentials are correct

### Frontend won't start  
- Check all REACT_APP_FIREBASE_* vars are set
- Try `rm -rf node_modules package-lock.json && npm install`

### Can't register/login
- Check backend is running (http://localhost:5000/health)
- Check browser console for errors
- Verify Firebase Email/Password auth is enabled

## 💡 Development Tips

- Backend logs show all API requests
- Use Prisma Studio to view database: `npm run prisma:studio`
- Check Firebase Console > Authentication to see registered users
- Frontend has hot reload - changes appear instantly

## Need Help?

Check the main README.md for full documentation and project structure.


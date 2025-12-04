# SmartTutor

![SmartTutor Landing Page](./smarttutor-landing.png)

A web-based tutoring platform connecting students with expert tutors for one-on-one video sessions, powered by AI insights and comprehensive quality tracking.

## 🚀 Features

### ✅ Core Features

- **Authentication System** 
  - Firebase Auth (email/password)
  - User registration with role selection (Student/Tutor/Admin)
  - Protected routes with role-based access control
  - Session persistence and token management

- **Tutor Availability Management**
  - Set recurring or one-time availability slots
  - Day-of-week scheduling with time ranges
  - Enable/disable slots dynamically
  - Visual calendar interface

- **Session Booking System**
  - Browse available tutors with subject filtering
  - View tutor profiles and availability
  - Book sessions with flexible durations (15, 30, 45, or 60 minutes)
  - Conflict detection and validation
  - Real-time booking confirmations

- **Live Video Sessions**
  - Daily.co video conferencing integration
  - One-click session joining
  - Screen sharing capabilities
  - Device selection and audio/video controls
  - Automatic session status tracking (SCHEDULED → LIVE → COMPLETED)

- **Real-time Collaboration**
  - In-session text chat with timestamps
  - Collaborative note-taking (both users can edit)
  - Real-time synchronization via Socket.io
  - Chat and notes persistence

- **AI-Powered Session Reports**
  - Automatic report generation after sessions
  - GPT-4o analysis of chat conversations and notes
  - Structured insights: summary, topics covered, student progress, strengths, areas for improvement, recommendations
  - Asynchronous processing via Bull queue with Redis
  - Progress tracking and status updates

- **Session Ratings & Feedback**
  - Post-session rating system (punctuality, friendliness, helpfulness)
  - Optional written feedback
  - Rating display in session history
  - First-session tracking for quality metrics

- **Admin Dashboard**
  - Platform statistics (users, sessions, ratings)
  - Tutor performance monitoring
  - High churn risk detection
  - AI-powered tutor analysis
  - Detailed tutor profiles with metrics
  - Student feedback aggregation

- **User Dashboards**
  - Role-specific views (Student/Tutor/Admin)
  - Upcoming sessions with live indicators
  - Session history and past reports
  - Quick action buttons
  - Profile management

- **Modern UI/UX**
  - Dark theme with gradient backgrounds
  - Glass-morphism design elements
  - Responsive layout (desktop and tablet optimized)
  - Smooth animations with Framer Motion
  - Tailwind CSS styling

## 📋 Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Firebase Auth (Client SDK)
- Axios
- Socket.io-client
- Framer Motion
- Lucide React (icons)
- Daily.co JavaScript SDK

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL (via Neon/Vercel Postgres)
- Firebase Admin SDK
- Socket.io (with Redis adapter for scaling)
- Bull (job queue for async processing)
- Redis (Upstash for queue and Socket.io scaling)
- OpenAI API (GPT-4o)

### Third-Party Services
- Firebase Authentication
- Daily.co (video conferencing)
- OpenAI GPT-4o (AI reports and analysis)
- Upstash Redis (queue and real-time scaling)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL database (Vercel Postgres, Neon, or local)
- Firebase project
- OpenAI API key (for AI reports)
- Daily.co API key (for video sessions)
- Redis instance (Upstash recommended)

### 1. Clone and Install

```bash
git clone <repository-url>
cd tutoringapp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../tutoring-platform
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable **Email/Password authentication**
4. Get your web app config (Project Settings > General)
5. Generate Admin SDK private key (Project Settings > Service Accounts)

### 3. Set Up Database

**Option A: Vercel Postgres (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create project > Storage > Create Database > Postgres
3. Copy the connection string
4. Use as `DATABASE_URL` in backend `.env`

**Option B: Neon (Alternative)**
1. Go to [Neon Console](https://neon.tech/)
2. Create a new project
3. Copy the connection string

**Option C: Local PostgreSQL**
```bash
createdb tutoring_db
# Use: postgresql://user@localhost:5432/tutoring_db
```

### 4. Set Up Redis (for Queue and Scaling)

1. Go to [Upstash](https://upstash.com/) (free tier available)
2. Create a Redis database
3. Copy the connection URL (starts with `rediss://`)

### 5. Configure Environment Variables

**Backend:** Create `backend/.env`

```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Daily.co
DAILY_API_KEY=your-daily-api-key
DAILY_DOMAIN=go-tutor.daily.co

# Redis (for queue and Socket.io scaling)
REDIS_URL=rediss://default:token@region.upstash.io:6379

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend:** Create `tutoring-platform/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Firebase Client SDK
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 6. Initialize Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate dev
```

### 7. Run the Application

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

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 📁 Project Structure

```
tutoringapp/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Firebase, Prisma setup
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # External services (Daily.co, AI)
│   │   ├── queues/         # Bull queue processors
│   │   └── app.js          # Express app
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── tutoring-platform/       # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React Context (Auth)
│   │   ├── services/       # API calls
│   │   └── config/         # Firebase config
│   └── package.json
│
├── memory-bank/             # Project documentation
└── README.md
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)

The frontend is deployed on Netlify:
- **Production URL**: https://soft-rugelach-38ffa4.netlify.app

**Deployment Steps:**
1. Push code to GitHub
2. Connect repository to Netlify
3. Set base directory: `tutoring-platform`
4. Configure environment variables in Netlify dashboard
5. Deploy automatically on push

### Backend (Railway)

The backend is deployed on Railway:
- **Production URL**: https://tutoringplatform-production-ccdc.up.railway.app

**Deployment Steps:**
1. Connect GitHub repository to Railway
2. Set root directory: `backend`
3. Configure environment variables
4. Railway auto-deploys on push

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Sessions
- `GET /api/sessions` - Get user's sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Create new session (book)
- `PATCH /api/sessions/:id/status` - Update session status
- `DELETE /api/sessions/:id` - Cancel session
- `GET /api/sessions/:id/token` - Get Daily.co meeting token

### Availability
- `GET /api/availability` - Get tutor's availability
- `POST /api/availability` - Create availability slot
- `PUT /api/availability/:id` - Update availability slot
- `DELETE /api/availability/:id` - Delete availability slot

### Reports
- `POST /api/reports/session/:id` - Generate AI report (async)
- `GET /api/reports/session/:id` - Get session report
- `GET /api/reports/session/:id/status` - Check report generation status

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/tutors` - List all tutors with metrics
- `GET /api/admin/tutors/:id` - Get detailed tutor profile
- `POST /api/admin/tutors/:id/ai-summary` - Generate AI tutor analysis

### Health Check
- `GET /health` - Server health status

## 🎯 Current Status

### ✅ Completed Features
- [x] Full authentication system
- [x] Tutor availability management
- [x] Session booking system
- [x] Video conferencing (Daily.co)
- [x] Real-time chat and notes
- [x] AI-powered session reports
- [x] Session ratings and feedback
- [x] Admin dashboard with quality tracking
- [x] High churn risk detection
- [x] Tutor performance analytics

## 🤝 Contributing

For major changes or features, update the memory bank documentation first. See `memory-bank/` for project context and patterns.

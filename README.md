# Tutoring Platform - MVP

A web-based tutoring platform connecting students with tutors for one-on-one video sessions, powered by AI insights.

## 🚀 Features

### ✅ Currently Implemented
- **Authentication System** 
  - Firebase Auth (email/password)
  - User registration with role selection (Student/Tutor)
  - Protected routes
- **User Dashboard**
  - Profile display
  - Role-specific views
- **Responsive UI** with Tailwind CSS

### 🔄 In Progress
- Tutor availability management
- Session booking system
- Video conferencing (Jitsi integration)
- Real-time chat and notes
- AI-powered session reports

## 📋 Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Firebase Auth
- Axios
- Socket.io-client

### Backend
- Node.js + Express
- Prisma ORM
- Vercel Postgres (PostgreSQL)
- Firebase Admin SDK
- Socket.io
- Bull (job queue)
- OpenAI API

### Third-Party Services
- Firebase Authentication
- Jitsi Meet (video conferencing)
- OpenAI GPT-4 (AI reports)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- Vercel account (free)
- Firebase project (free)
- OpenAI API key

### 1. Clone and Install

```bash
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
2. Create a new project
3. Enable **Email/Password authentication**
4. Get your web app config (Project Settings > General)
5. Generate Admin SDK private key (Project Settings > Service Accounts)

### 3. Set Up Vercel Postgres

**Option A: Vercel Cloud (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create project > Storage > Create Database > Postgres
3. Copy the connection string
4. Use as `DATABASE_URL` in backend `.env`

**Option B: Local PostgreSQL**
```bash
createdb tutoring_db
# Use: postgresql://user@localhost:5432/tutoring_db
```

See **VERCEL_SETUP.md** for detailed instructions.

### 4. Configure Environment Variables

**Backend:** Create `backend/.env`

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://user:password@localhost:5432/tutoring_db

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

OPENAI_API_KEY=sk-your-openai-api-key

FRONTEND_URL=http://localhost:3000
```

**Frontend:** Create `tutoring-platform/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_JITSI_DOMAIN=meet.jit.si

REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 5. Initialize Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 6. Run the Application

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
│   │   ├── services/       # External services
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

## 🎯 Current Development Status

### Completed ✅
- [x] Project setup and structure
- [x] Backend authentication with Firebase
- [x] Frontend auth UI (Login/Register)
- [x] User dashboard
- [x] Database schema design

### Next Up 🔄
- [ ] Tutor availability management
- [ ] Student booking system
- [ ] Session dashboards
- [ ] Jitsi video integration
- [ ] Real-time chat
- [ ] Collaborative notes
- [ ] AI report generation

## 🐛 Known Issues
- Frontend security vulnerabilities (run `npm audit fix`)
- Need to add loading states and error boundaries

## 📝 Development Notes

### API Endpoints
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Database Schema
See `backend/prisma/schema.prisma` for complete schema.

Key models:
- User
- TutorProfile  
- Availability
- Session
- ChatMessage
- SessionNote
- SessionReport

## 🤝 Contributing

This is an MVP project. For major changes or features, update the memory bank documentation first.

## 📄 License

Private project - All rights reserved


<div align="center">

# SmartTutor

**A full-stack tutoring platform connecting students with expert tutors for one-on-one video sessions, powered by AI-generated insights and real-time collaboration.**

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-DD2C00?style=flat-square&logo=firebase&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)

</div>

<br />

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Live Video Sessions** | Daily.co-powered HD video conferencing with screen sharing and device controls |
| **Real-time Collaboration** | In-session chat and collaborative note-taking synced via Socket.io |
| **AI Session Reports** | GPT-4o analyzes conversations to generate summaries, progress insights, and recommendations |
| **Smart Scheduling** | Tutors set availability; students browse, filter by subject, and book sessions |
| **Rating & Feedback** | Post-session ratings on punctuality, friendliness, and helpfulness |
| **Admin Dashboard** | Platform analytics, tutor performance monitoring, and high churn risk detection |
| **Role-Based Access** | Distinct experiences for Students, Tutors, and Admins with protected routes |

<br />

## 🛠 Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
<br />React 19
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=nodejs" width="48" height="48" alt="Node.js" />
<br />Node.js
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=express" width="48" height="48" alt="Express" />
<br />Express
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
<br />PostgreSQL
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=prisma" width="48" height="48" alt="Prisma" />
<br />Prisma
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=firebase" width="48" height="48" alt="Firebase" />
<br />Firebase
</td>
</tr>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br />Tailwind
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=redis" width="48" height="48" alt="Redis" />
<br />Redis
</td>
<td align="center" width="96">
<img src="https://cdn.simpleicons.org/openai/412991" width="48" height="48" alt="OpenAI" />
<br />GPT-4o
</td>
<td align="center" width="96">
<img src="https://cdn.simpleicons.org/socketdotio/010101" width="48" height="48" alt="Socket.io" />
<br />Socket.io
</td>
<td align="center" width="96">
<img src="https://cdn.simpleicons.org/webrtc/333333" width="48" height="48" alt="Daily" />
<br />Daily.co
</td>
<td align="center" width="96">
<img src="https://cdn.simpleicons.org/framer/0055FF" width="48" height="48" alt="Framer" />
<br />Motion
</td>
</tr>
</table>

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, React Router v7, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, Prisma ORM, Socket.io, Bull Queue |
| **Database** | PostgreSQL (Neon/Vercel Postgres), Redis (Upstash) |
| **Auth** | Firebase Authentication (Email/Password) |
| **Video** | Daily.co JavaScript SDK |
| **AI** | OpenAI GPT-4o |

<br />

## 🚀 Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database ([Vercel Postgres](https://vercel.com/storage/postgres) or [Neon](https://neon.tech))
- Firebase project ([create one](https://console.firebase.google.com))
- OpenAI API key ([get one](https://platform.openai.com/api-keys))
- Daily.co API key ([get one](https://dashboard.daily.co))
- Redis instance ([Upstash](https://upstash.com) recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tutoringplatform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration

**Backend** — create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Daily.co
DAILY_API_KEY=your-daily-api-key
DAILY_DOMAIN=your-domain.daily.co

# Redis
REDIS_URL=rediss://default:token@region.upstash.io:6379

# CORS
FRONTEND_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Database Setup

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:3000](http://localhost:3000)

<br />

## 📖 Usage

### For Students

1. **Register** as a Student and complete your profile
2. **Browse tutors** — filter by subject, view profiles, and check availability
3. **Book a session** — select a time slot and session duration (15–60 min)
4. **Join the video call** — click "Join Session" when it's time
5. **Collaborate** — use in-session chat and shared notes
6. **Rate your tutor** — provide feedback after each session
7. **Review AI reports** — get personalized insights and progress tracking

### For Tutors

1. **Register** as a Tutor with your subjects and bio
2. **Set availability** — create recurring or one-time slots
3. **Accept bookings** — students book directly from your calendar
4. **Conduct sessions** — join video calls and take collaborative notes
5. **Track performance** — view your ratings and session history

### For Admins

1. **Monitor platform stats** — users, sessions, ratings at a glance
2. **Review tutor performance** — identify high performers and at-risk tutors
3. **Generate AI analysis** — get GPT-4o insights on tutor quality
4. **Manage quality** — track churn risk and student feedback

<br />

## 📁 Project Structure

```
tutoringplatform/
├── backend/                    # Node.js/Express API (Railway)
│   ├── src/
│   │   ├── config/            # Firebase, Prisma setup
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── queues/            # Bull job processors
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # External services (Daily.co)
│   │   └── app.js             # Express entry point
│   └── prisma/
│       └── schema.prisma      # Database schema
│
├── frontend/                   # React frontend (Netlify)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth context provider
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API service layer
│   │   └── config/            # Firebase config
│   └── tailwind.config.js
│
└── README.md
```

<br />

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/profile` | Update profile |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | List user's sessions |
| `GET` | `/api/sessions/:id` | Get session details |
| `POST` | `/api/sessions` | Book a session |
| `PATCH` | `/api/sessions/:id/status` | Update session status |
| `DELETE` | `/api/sessions/:id` | Cancel session |
| `GET` | `/api/sessions/:id/token` | Get video meeting token |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/availability` | Get tutor availability |
| `POST` | `/api/availability` | Create availability slot |
| `PUT` | `/api/availability/:id` | Update slot |
| `DELETE` | `/api/availability/:id` | Delete slot |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reports/session/:id` | Generate AI report |
| `GET` | `/api/reports/session/:id` | Get session report |
| `GET` | `/api/reports/session/:id/status` | Check generation status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Platform statistics |
| `GET` | `/api/admin/tutors` | List tutors with metrics |
| `GET` | `/api/admin/tutors/:id` | Detailed tutor profile |
| `POST` | `/api/admin/tutors/:id/ai-summary` | Generate AI tutor analysis |

<br />

## 🔐 Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `FIREBASE_PROJECT_ID` | Firebase project identifier |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o |
| `DAILY_API_KEY` | Daily.co API key |
| `DAILY_DOMAIN` | Daily.co domain |
| `REDIS_URL` | Redis connection URL |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_SOCKET_URL` | Socket.io server URL |
| `REACT_APP_FIREBASE_*` | Firebase client SDK configuration |


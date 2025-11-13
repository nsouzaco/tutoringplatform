# Tutoring Platform Backend

Backend API server for the tutoring platform, built with Node.js, Express, Prisma, and Firebase Auth.

## Prerequisites

- Node.js v18+
- Vercel Postgres (or local PostgreSQL for dev)
- Firebase project with Admin SDK credentials
- OpenAI API key

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tutoring_db

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up Database

**Using Vercel Postgres:**
1. Create database in Vercel dashboard
2. Copy connection string to `.env`

**Or local PostgreSQL:**
```bash
createdb tutoring_db
```

Run Prisma migrations:

```bash
npm run prisma:migrate
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

### 4. Run the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Health Check
- `GET /health` - Server health status

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (Firebase, Prisma)
│   ├── middleware/      # Auth, error handling
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── services/        # External services (AI, jobs)
│   ├── utils/           # Helper functions
│   └── app.js           # Express app entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## Tech Stack

- **Express.js** - Web framework
- **Prisma** - Database ORM
- **Firebase Admin** - Authentication
- **Socket.io** - Real-time communication
- **Bull** - Job queue for async processing
- **OpenAI** - AI report generation
- **PostgreSQL** - Database


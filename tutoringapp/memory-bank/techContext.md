# Technical Context

## Technology Stack

### Frontend
- **Framework**: React (Create React App)
- **State Management**: React Context API ✅
- **Routing**: React Router
- **Styling**: Tailwind CSS ✅
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Calendar UI**: react-calendar or similar
- **Video Integration**: Jitsi Meet iframe (public instance)

### Backend
- **Runtime**: Node.js (v18+ recommended)
- **Framework**: Express.js
- **Authentication**: Firebase Auth ✅
- **WebSocket**: Socket.io
- **Database Client**: pg (node-postgres)
- **ORM**: Prisma ✅
- **Job Queue**: Bull ✅
- **API Client**: OpenAI SDK (official)

### Database
- **Primary Database**: PostgreSQL (v14+)
- **Hosting**: Vercel Postgres (Neon-powered)
  - Local dev: PostgreSQL or Vercel Postgres
  - Production: Vercel Postgres

### Third-Party Services
- **Authentication**: Firebase Auth
  - Email/password authentication
  - Session management
  - User role management (custom claims)
- **Video Conferencing**: Jitsi Meet (public instance - meet.jit.si) ✅
  - Zero setup required
  - Free tier unlimited
  - Simple iframe integration
- **AI Services**: OpenAI API
  - Whisper API (audio transcription) - DEFERRED for MVP
  - GPT-4 or GPT-3.5-turbo (report generation from chat + notes only)

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Environment Variables**: dotenv
- **API Testing**: Postman / Thunder Client
- **Database GUI**: pgAdmin / TablePlus (optional)

## Project Structure (Proposed)

```
tutoringapp/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, JWT, API keys
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── services/        # AI, external APIs
│   │   ├── utils/           # Helpers
│   │   └── app.js           # Express app
│   ├── package.json
│   └── .env
│
├── frontend/ (tutoring-platform/)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level components
│   │   ├── context/         # React context for state
│   │   ├── services/        # API calls
│   │   ├── utils/           # Helper functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── database/
│   ├── migrations/          # Schema migrations
│   └── seeds/               # Sample data
│
├── memory-bank/             # Project documentation
└── tutoring_platform_prd.md # PRD
```

## Development Setup Requirements

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn
- OpenAI API key (paid account for Whisper + GPT-4)
- Modern browser (Chrome, Firefox, Safari)

### Environment Variables Needed

**Backend (.env)**
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/tutoring_db
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
OPENAI_API_KEY=your_openai_key
NODE_ENV=development
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_JITSI_DOMAIN=meet.jit.si
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

## Technical Constraints

### Browser Requirements
- Latest versions of Chrome, Firefox, Safari
- WebRTC support required for Jitsi
- WebSocket support required for real-time features

### API Limitations
- **OpenAI API**: Rate limits, usage costs
  - Whisper: ~$0.006 per minute of audio
  - GPT-4: Token-based pricing
- **Jitsi Meet**: No rate limits on public instance, but quality/reliability not guaranteed

### Performance Considerations
- Video sessions: Bandwidth-dependent
- AI report generation: 2-5 minutes async processing
- Database: Index on frequently queried fields (user_id, session_id, dates)
- WebSocket connections: Consider scaling for concurrent sessions

## Dependencies (Initial)

### Backend Core
```json
{
  "express": "^4.18.x",
  "@prisma/client": "^5.x.x",
  "prisma": "^5.x.x",
  "firebase-admin": "^12.x.x",
  "socket.io": "^4.6.x",
  "dotenv": "^16.0.x",
  "cors": "^2.8.x",
  "bull": "^4.x.x",
  "openai": "^4.x.x"
}
```

### Frontend Core
```json
{
  "react": "^18.2.x",
  "react-dom": "^18.2.x",
  "react-router-dom": "^6.x.x",
  "axios": "^1.x.x",
  "socket.io-client": "^4.6.x",
  "firebase": "^10.x.x",
  "tailwindcss": "^3.x.x"
}
```

## Deployment Considerations (Post-MVP)

### Hosting Options
- **Frontend**: Vercel ✅
- **Backend**: Vercel (serverless functions) or separate hosting (Railway, Render)
- **Database**: Vercel Postgres ✅
- **Jitsi**: Public instance (meet.jit.si) for MVP

### CI/CD
- GitHub Actions or similar
- Automated testing
- Environment-based deployments (dev, staging, production)


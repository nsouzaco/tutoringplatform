# System Patterns

## Architecture Overview
Full-stack web application with real-time communication and AI processing capabilities.

### High-Level Architecture
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ◄─────► │   Backend    │ ◄─────► │  Database   │
│   (React)   │         │  (Node.js)   │         │ (PostgreSQL)│
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ├────► Jitsi Meet (Video)
                               │
                               └────► OpenAI API (AI Reports)
```

## Component Architecture

### Frontend (React)
- **Authentication Module**
  - Login/Register components
  - Role selection
  - Session persistence
  
- **Dashboard Module**
  - Student dashboard (upcoming sessions, join buttons)
  - Tutor dashboard (sessions, reports access)
  
- **Availability Module** (Tutor)
  - Calendar UI for setting availability
  - Time slot management
  - Recurring vs one-time options
  
- **Booking Module** (Student)
  - Tutor browser/list
  - Availability calendar viewer
  - Booking flow
  
- **Session Module**
  - Video conferencing (Jitsi iframe integration)
  - Real-time chat panel
  - Collaborative notes panel
  - Session controls (end, timer)
  
- **Reports Module** (Tutor)
  - Report viewer
  - Session history

### Backend (Node.js/Express)
- **Authentication Service**
  - Firebase Auth integration
  - Token verification middleware
  - Role-based access control (custom claims)
  
- **Availability Service**
  - CRUD operations for availability slots
  - Timezone handling
  - Conflict checking
  
- **Booking Service**
  - Session creation
  - Availability validation
  - Calendar conflict detection
  
- **Session Service**
  - Session state management
  - Real-time data collection (chat, notes)
  - Session lifecycle (scheduled → live → completed)
  
- **AI Processing Service**
  - Async job queue (Bull) for report generation
  - OpenAI GPT-4 integration (report generation from chat + notes)
  - Structured prompt engineering
  - Note: Audio transcription deferred to post-MVP
  
- **WebSocket Service**
  - Real-time chat
  - Notes synchronization
  - Session status updates

### Database Schema (PostgreSQL)

**Core Tables:**
- `users` - id, email, password_hash, role, name, timezone, profile_photo
- `tutors` - user_id, bio, subjects, hourly_rate (optional for MVP)
- `availability` - tutor_id, day_of_week, start_time, end_time, is_recurring, is_enabled
- `sessions` - id, student_id, tutor_id, start_time, end_time, duration, status
- `chat_messages` - session_id, sender_id, message, timestamp
- `session_notes` - session_id, tutor_id, notes, created_at, updated_at
- `session_reports` - session_id, tutor_id, report_content (JSON), generated_at

**Relationships:**
- Users 1:1 Tutors (for tutor role)
- Tutors 1:N Availability
- Sessions N:1 Students (Users)
- Sessions N:1 Tutors (Users)
- Sessions 1:N ChatMessages
- Sessions 1:1 SessionNotes
- Sessions 1:1 SessionReports

## Key Design Patterns

### Authentication Flow
- Firebase Auth handles user sessions
- Firebase ID tokens sent with requests
- Backend verifies tokens via Firebase Admin SDK
- Role stored in Firestore custom claims
- Middleware for auth and role checking

### Real-Time Communication
- WebSocket connections for chat/notes during sessions
- REST API for CRUD operations
- Event-driven updates

### AI Processing Pipeline (MVP)
1. Session ends → Trigger event
2. Collect session data (chat messages, notes)
3. Queue async job (Bull)
4. Call OpenAI GPT-4 with structured prompt (chat + notes as context)
5. Store report in database
6. Notify tutor via WebSocket
Note: Audio transcription deferred - will add Whisper integration post-MVP

### Session State Machine
```
SCHEDULED → LIVE → COMPLETED
    ↓
CANCELLED (if needed post-MVP)
```

## Third-Party Integrations

### Jitsi Meet
- Iframe embedding for video calls
- Custom room names per session (session_id based)
- Configuration for UI customization
- Public instance or self-hosted option

### OpenAI API
- **Whisper**: Audio → Text transcription
- **GPT-4**: Text analysis → Structured report
- Rate limiting and error handling
- Cost optimization (model selection)

## Security Considerations
- Firebase Auth handles password security
- Token verification on all protected routes
- HTTPS for all communications
- Input validation and sanitization
- SQL injection prevention (Prisma parameterized queries)
- XSS protection
- CORS configuration (whitelist frontend origin)
- Firebase security rules for role management


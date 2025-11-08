# Active Context

## Current State
**Project Phase**: Initial Setup & Planning

The project has been initialized with:
- React app created (tutoring-platform/)
- PRD documented
- Memory bank structure created

**What Exists:**
- Basic React boilerplate from Create React App
- PRD document with complete requirements

**What Doesn't Exist:**
- Backend infrastructure
- Database setup
- Authentication system
- Core features (booking, sessions, AI reports)

## Current Focus
Setting up the project foundation and creating a development roadmap.

## Recent Changes
- Memory bank initialized with all core documents
- Project structure analysis complete

## Next Immediate Steps

### 1. Technical Decision Points
Need to decide on:
- State management approach (Context API vs Redux)
- Styling framework (CSS Modules, Styled Components, or Tailwind)
- Database ORM (Prisma vs raw SQL)
- Job queue system for AI processing

### 2. Backend Setup
- Initialize Node.js/Express backend
- Set up PostgreSQL database
- Create database schema and migrations
- Implement authentication system

### 3. Frontend Foundation
- Design component architecture
- Set up routing structure
- Create authentication UI
- Build core layout components

## Active Decisions & Considerations

### ✅ Architecture Decisions FINALIZED
1. **State Management**: React Context API
2. **Authentication**: Firebase Auth (email/password)
3. **Styling**: Tailwind CSS
4. **Database**: Vercel Postgres + Prisma ORM ✅
5. **Job Queue**: Bull
6. **Monorepo**: Yes, keep frontend/backend together
7. **Hosting**: Vercel (frontend + backend) ✅
8. **Jitsi Hosting**: Public instance (meet.jit.si) for MVP
9. **Audio Transcription**: DEFERRED - MVP will use chat + notes only for AI reports
10. **Collaborative Notes**: Both users can edit ✅

### UX Decisions Still Needed
1. **Session Join Window**: 5 minutes before - is this sufficient?
2. **Profile Photos**: Required or optional?
3. **Tutor Subjects**: How to structure (free text, predefined list, tags)?

### Technical Challenges to Address
1. **Audio Transcription**: Jitsi doesn't natively provide audio recordings
   - May need separate recording mechanism
   - Consider WebRTC recording or alternative approach
2. **Timezone Handling**: Ensure consistent timezone management across users
3. **Session Timing**: Accurate session start/end enforcement
4. **Concurrent Session Limit**: Do we limit tutors to one session at a time?

## Blockers & Questions
None currently - awaiting user feedback and decisions on technical approach.

## Notes
- Project will be developed iteratively following the PRD phases
- MVP focus: Core functionality without payment or advanced features
- AI report quality will depend on effective prompt engineering


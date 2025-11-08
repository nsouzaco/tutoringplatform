# Tutoring Platform - Product Requirements Document

## 1. Overview

**Product Name:** [Tutoring Platform Name]

**Description:** A web-based tutoring platform that connects students with tutors for one-on-one video sessions. The platform includes real-time video conferencing, collaborative note-taking, and AI-powered session analysis to provide tutors with insights on student engagement and learning outcomes.

**Target Users:** Students seeking tutoring help and tutors offering tutoring services

**Platform:** Web-based MVP (desktop and tablet optimized)

---

## 2. Goals & Objectives

- Enable students to easily discover and book tutoring sessions with available tutors
- Provide tutors with a platform to set availability and manage sessions
- Facilitate real-time video learning with collaborative features (chat, notes)
- Generate AI-powered reports for tutors to evaluate session effectiveness and student progress
- Create a frictionless user experience for both students and tutors

---

## 3. User Types

### 3.1 Student
- Browses available tutors and their time slots
- Books tutoring sessions within tutor availability windows
- Joins scheduled sessions via video call
- Participates in real-time chat and note-taking during sessions

### 3.2 Tutor
- Registers as a tutor (no qualification verification required for MVP)
- Sets recurring or specific availability time slots (e.g., "Monday 2-5 PM")
- Manages scheduled sessions
- Joins sessions and facilitates learning
- Takes notes during sessions
- Accesses AI-generated post-session reports

---

## 4. Core Features

### 4.1 User Authentication & Onboarding

**Registration:**
- Users select their role (Student or Tutor) during signup
- Email and password authentication
- Basic profile creation (name, email, profile photo optional)

**Login:**
- Email and password login
- Session persistence

---

### 4.2 Tutor Availability Management

**Availability Setup:**
- Tutors specify time slots in advance (e.g., "Monday 2-5 PM", "Wednesday 3-6 PM")
- Time slots can be recurring (weekly) or one-time
- Tutors can set timezone
- Flexible session durations: 15 min, 30 min, 45 min, 1 hour

**Availability Calendar:**
- Visual calendar view showing available time slots
- Tutors can enable/disable availability slots
- Display of booked vs. available slots

---

### 4.3 Session Booking (Student Perspective)

**Browse Tutors:**
- Students see a list of available tutors (name, profile, subject/expertise)
- Click on a tutor to view their availability calendar
- Select an available time slot within tutor's specified windows
- Flexible session duration selection (15, 30, 45, or 60 minutes)

**Booking Confirmation:**
- Confirmation of session details (tutor, date, time, duration)
- Calendar notification or email reminder
- Session added to student's dashboard

---

### 4.4 Session Management Dashboard

**For Students:**
- List of upcoming sessions with tutor details
- Session status (Scheduled, Live, Completed)
- "Join Session" button (enabled 5 minutes before session start)
- View completed session summaries

**For Tutors:**
- List of scheduled sessions with student details
- Session status indicators
- "Start Session" button (enabled at session start time)
- Access to generated reports

---

### 4.5 Video Session

**During Session:**
- Real-time peer-to-peer video call between student and tutor
- Video call persists for the entire session duration
- Session automatically ends at the scheduled end time (with warning notification)
- Manual session end option for both participants

**Session Components:**

**Video Call:**
- HD video streaming
- Audio with noise cancellation (optional)
- Participant video feeds (student and tutor)

**Real-Time Chat:**
- Text-based messaging visible to both student and tutor
- Timestamp for each message
- Messages are logged for AI analysis

**Collaborative Notes:**
- Shared notepad/text editor during session
- Both student and tutor can view notes
- Tutor can take notes; student can view (or both can edit - specify based on UX preference)
- Notes are automatically saved and fed into AI analysis
- Word count or character limit (optional)

---

### 4.6 Post-Session AI Report

**Report Generation:**
- Automatically triggered after video call ends
- Generated within 2-5 minutes (asynchronous processing)
- Report generated from:
  - Session transcript (from video/audio)
  - Real-time chat history
  - Tutor's collaborative notes

**Report Access:**
- Only tutors can view session reports
- Reports stored in tutor's session history

**Report Format & Content:**

The AI report should include the following sections in bullet-point format:

- **Session Summary:** Overview of the session, topics discussed, and key learning points
- **Topics Covered:** List of specific subjects or topics addressed during the session
- **Questions Asked:** Key questions the student asked or areas of confusion
- **Student Engagement Level:** Assessment of student participation and engagement (e.g., high, medium, low) with supporting observations
- **Strengths:** Areas where the student demonstrated understanding or progress
- **Areas for Improvement:** Specific topics, concepts, or skills the student needs to focus on
- **Recommendations:** Actionable suggestions for the tutor to address student needs in future sessions
- **Next Steps:** Proposed topics or focus areas for the next session (if applicable)

---

## 5. Technical Specifications

### 5.1 Video Conferencing SDK Recommendation

**Recommended SDK: Jitsi Meet**

**Rationale:**
- Free and open-source
- No API key or subscription required for basic usage
- Supports web-based video conferencing out of the box
- Can be self-hosted or used via public instance
- Easy iframe integration
- Good documentation and community support
- Supports screen sharing, chat, and custom UI

**Alternative:** Daily.co (free tier available, more feature-rich but may outgrow MVP)

---

### 5.2 AI Analysis

**Approach:**
- Use OpenAI API (GPT-4 or GPT-3.5-turbo) to analyze:
  - Speech-to-text transcripts from video call
  - Real-time chat history
  - Tutor notes
- Process data asynchronously after session ends
- Store reports in database for future reference

**Data Processing:**
- Audio transcription: Use OpenAI Whisper API
- Report generation: Use GPT-4 with structured prompt engineering to generate report in defined bullet-point format

---

### 5.3 Database Schema (High-Level)

**Core Entities:**
- Users (id, email, password, role, profile_data, timezone)
- Tutors (user_id, bio, subjects, hourly_rate optional)
- Availability (tutor_id, day_of_week, start_time, end_time, is_recurring)
- Sessions (id, student_id, tutor_id, start_time, end_time, status, duration)
- ChatMessages (session_id, sender_id, message, timestamp)
- SessionNotes (session_id, tutor_id, notes, created_at, updated_at)
- SessionReports (session_id, tutor_id, report_content, generated_at)

---

## 6. User Flows

### 6.1 Tutor Setup Flow
1. Sign up as tutor
2. Complete profile
3. Set availability time slots (recurring or one-time)
4. Availability is now visible to students

### 6.2 Student Booking Flow
1. Browse available tutors
2. Click tutor to view availability calendar
3. Select available time slot
4. Confirm booking
5. Session appears on student dashboard

### 6.3 Session Flow
1. Student/Tutor joins 5 minutes before session start
2. Video call initiates automatically
3. Chat and notes panels are visible
4. Participants use features throughout session
5. Session ends at scheduled time or manually
6. Chat and notes data sent to AI for analysis
7. AI report generated and stored (tutor notified)

### 6.4 Report Access Flow
1. Session ends
2. AI processes data (2-5 minute delay)
3. Tutor receives notification that report is ready
4. Tutor views report from session dashboard
5. Tutor can reference report for future sessions with student

---

## 7. Key User Workflows

### For Tutors:
- Set availability → Accept bookings → Conduct sessions → Review AI reports → Plan next sessions

### For Students:
- Browse tutors → Book session → Join session → Learn → Session ends

---

## 8. MVP Scope - In Scope

- User authentication (email/password)
- Tutor availability management
- Student session booking
- Session dashboard for both roles
- Real-time video conferencing (Jitsi integration)
- Real-time chat during sessions
- Collaborative note-taking
- AI-powered post-session reports (using OpenAI API)
- Session history

---

## 9. MVP Scope - Out of Scope

- Payment processing and billing
- Tutor verification/qualifications
- User ratings and reviews
- Messaging between sessions
- Progress tracking across multiple sessions
- Cancellation and rescheduling policies
- Mobile app (iOS/Android)
- Screen sharing (can be added post-MVP)
- Advanced calendar features (calendar sync, recurring sessions with exceptions)
- Tutor profiles with detailed bios and expertise areas

---

## 10. Success Metrics

- Session booking completion rate
- Session join rate (% of booked sessions where both participants join)
- AI report generation success rate
- User retention (% of returning users)
- Average session duration match (actual vs. booked)
- User satisfaction (NPS post-MVP)

---

## 11. Timeline & Milestones (Suggested)

**Phase 1 (Weeks 1-2):** Backend setup, authentication, database
**Phase 2 (Weeks 3-4):** Tutor availability management, booking system
**Phase 3 (Weeks 5-6):** Video conferencing integration, chat, notes
**Phase 4 (Weeks 7-8):** AI report generation pipeline
**Phase 5 (Weeks 9+):** Testing, bug fixes, deployment

---

## 12. Assumptions & Dependencies

- Users have stable internet connection for video calls
- OpenAI API availability and rate limits are managed
- Jitsi Meet service is stable and available
- Browser compatibility: Chrome, Firefox, Safari (latest versions)
- Users are comfortable with basic tech (video calls, text chat)

---

## 13. Future Enhancements (Post-MVP)

- Payment integration
- Tutor profile verification
- Ratings and reviews system
- Messaging/email between sessions
- Screen sharing during sessions
- Advanced progress tracking and student portfolios
- Mobile app
- Integration with calendar applications (Google Calendar, Outlook)
- Group tutoring sessions
- Resource library (documents, videos, materials)
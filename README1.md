# EHub: The Unified Hackathon Platform

EHub is a high-performance, microservices-based hackathon management system designed for high cohesion, low coupling, and scalable AI-driven project evaluation.

## 🏗️ Architecture Overview

The system consists of several specialized microservices communicating via an API Gateway:

- **Auth Service**: Manages user profiles, secure registration, and role-based permissions (JWT).
- **Event Service**: Core logic for hackathons, mission management, problem statements, and registrations.
- **Team Service (part of Event)**: Handles team formation, membership logic, and submissions.
- **AI Service**: Automated bulk project evaluation using the Gemini-3-Pro model.
- **Notification Service**: Centralized gateway for OTPs and status alerts via Redis and Email.
- **Common Services**: Internal utilities like standardized UUID generation.
- **Web Client**: Modern React dashboard styled with Tailwind CSS and Material Design principles.

---

## 🚀 API Documentation

The following endpoints are accessible via the **API Gateway (Port 8000)**.

### 🔑 Authentication (Auth Service)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register/otp` | Request a registration OTP (10 min expiry). |
| `POST` | `/auth/register` | Complete registration with user details and OTP. |
| `POST` | `/auth/login` | Authenticate user and receive JWT token. |
| `GET` | `/auth/profile` | Retrieve the current user's profile. |
| `POST` | `/auth/reset-password` | Reset password using an OTP. |
| `POST` | `/auth/upgrade-role` | Upgrade from Participant to Organizer via OTP. |

### 📅 Missions & Events (Event Service)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/events` | List all available hackathons. |
| `GET` | `/events/{id}` | Get full details of a specific event. |
| `POST` | `/events` | Create a new hackathon mission (Organizers only). |
| `PUT` | `/events/{id}` | Update event logistics (Dates, Prizes, etc). |
| `POST` | `/events/{id}/register` | Register a participant for an event. |
| `PATCH` | `/events/{id}/finalize` | Announce results and lock submissions. |

### 👥 Teams & Submissions (Event Service)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/events/teams/{eventId}` | Form a new team for a specific hackathon. |
| `POST` | `/events/teams/{teamId}/invite` | Invite a registered user to your team. |
| `PATCH` | `/events/teams/{teamId}/respond` | Accept or decline a team invitation. |
| `POST` | `/events/teams/{teamId}/submit` | Submit repo/demo URLs (Leaders only). |
| `PATCH` | `/events/teams/{teamId}/transfer` | Transfer leadership to another member. |

### 🤖 AI Evaluation (AI Service)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ai/evaluate/{teamId}` | Manually trigger AI evaluation for one team. |
| `POST` | `/ai/evaluate-event/{eventId}` | Bulk evaluate all teams in an event (Locked). |

---

## 📝 Usage Examples

### 1. Registering for an Event
```bash
curl -X POST http://localhost:8000/events/EVENT_UUID/register \
-H "Content-Type: application/json" \
-d '{
  "userId": "USER_UUID",
  "username": "manjunath",
  "userEmail": "manju@example.com"
}'
```

### 2. Submitting a Project (Team Leader)
```bash
curl -X POST http://localhost:8000/events/teams/TEAM_UUID/submit?userId=LEADER_UUID \
-H "Content-Type: application/json" \
-d '{
  "repoUrl": "https://github.com/manju/ehub-project",
  "demoUrl": "https://ehub-demo.vercel.app"
}'
```

### 3. Bulk AI Evaluation (Organizer)
```bash
# This triggers Gemini-3-Pro to analyze all repos in the event
curl -X POST http://localhost:8000/ai/evaluate-event/EVENT_UUID
```

---

## 🛠️ Security & Constraints
- **OTP Lifespan**: All verification codes expire strictly after 10 minutes.
- **Role Guard**: Endpoints marked with `requesterId` or `leaderId` perform server-side ownership checks.
- **Team Lock**: Users are restricted to exactly **one accepted team per mission**.
- **Submission Window**: Submissions are strictly blocked before the start date or after the end date.

# 🚀 EHub — Automated Hackathon Management & AI Evaluation Platform

EHub is an end-to-end hackathon lifecycle management system featuring role-based access control, an automated event state machine, team formation & skill matchmaking, GitHub repository verification, and asynchronous AI-driven project evaluation powered by the Google Gemini API.

---

## 🏛️ System Architecture

```text
ehub/
├── docker-compose.yml
├── .gitignore
├── README.md
│
├── ehub-backend/                     # Spring Boot 3.x REST API
│   ├── pom.xml
│   └── src/main/java/com/example/ehub/
│       ├── EhubApplication.java
│       ├── config/                   # Security, JWT, WebFlux, Async
│       ├── controllers/              # Auth, Events, Teams, Submissions, OTP
│       ├── dto/                      # Immutable Request/Response records
│       ├── exceptions/               # GlobalExceptionHandler & Custom domain errors
│       ├── models/                   # JPA Entities (User, Event, Team, Submission)
│       ├── repositories/             # Spring Data JPA Repositories
│       └── services/                 # AI Engine, JWT, OTP Store, Event SM, Team Service
│
└── ehub-ui/                          # React + Vite + Tailwind CSS SPA
    ├── index.html
    └── src/
        ├── api/                      # Axios client with JWT interceptor
        ├── components/               # Glassmorphic UI, PhaseBanner, ScoreCard, Navbar
        ├── context/                  # AuthContext & EventContext
        └── pages/                    # Login, Register, Dashboard, OrganizerPanel, Leaderboard
```

---

## ⚡ Core Features

1. **Authentication & Access Control (IAM)**
   - Role-based security (`ROLE_PARTICIPANT`, `ROLE_ORGANIZER`).
   - Academic email verification with 6-digit OTPs and 10-minute TTL store.
   - Stateless cryptographic JWT authentication (`HMAC-SHA256`).

2. **Event Lifecycle State Machine**
   - Managed phase progression: `REGISTRATION` $\to$ `CODING` $\to$ `JUDGING` $\to$ `FINISHED`.
   - Strict phase-constraint enforcement prevents out-of-order submissions or registrations.

3. **Team Formation & Matchmaking**
   - Dynamic team creation with auto-generated join codes.
   - Skill-tagging directory allowing solo participants to discover teams needing their skillset.
   - Team capacity limits enforcement.

4. **AI Evaluation Engine (Google Gemini API)**
   - Asynchronous evaluation pipeline using Spring `@Async` and `WebClient`.
   - Fetches GitHub repository metadata/README and executes prompt evaluation against standardized rubrics:
     - **Code Quality & Architecture** (0–25)
     - **Feature Completeness** (0–25)
     - **Documentation & Clarity** (0–25)
     - **Innovation & Technical Complexity** (0–25)
   - Generates granular scores, strengths, weaknesses, and comprehensive feedback summaries.

5. **Real-Time Leaderboard & Live Standings**
   - Ranked scoreboard sorted by aggregate AI scores.
   - Interactive scorecard inspection modal with rubric breakdowns.

6. **Ultra-Modern Glassmorphic SPA Frontend**
   - React + Vite + Tailwind CSS with dark palette, glowing neon accents, and smooth micro-animations.
   - Interactive phase progress bar, countdown timers, and organizer controls.

---

## 🛠️ Getting Started

### Prerequisites
- **Java 21**
- **Node.js 18+** & **npm**

---

### Option A: 1-Click Launch (Recommended for Windows)
Simply double-click **`start-all.bat`** in the project root folder. It will launch both the Spring Boot Backend and the Vite React Frontend in dedicated windows.

---

### Option B: Manual Terminal Execution

#### 1. Run Backend (Terminal 1)
```powershell
cd "ehub-backend"
.\mvnw.cmd spring-boot:run
```
The REST API will start on **`http://localhost:8080`**.

#### 2. Run Frontend (Terminal 2)
```powershell
cd "ehub-ui"
npm.cmd run dev
```
*(Note: Use `npm.cmd` in Windows PowerShell to bypass script execution policy restrictions)*

The web UI will start on **`http://localhost:5173`**.

---

### 🔑 Demo Accounts (Pre-Seeded)
- **Organizer**: `organizer@vitap.ac.in` / `Organizer123!`
- **Participant (In Team)**: `alice@vitapstudent.ac.in` / `Password123!`
- **Participant (Solo / Open)**: `ethan@vitapstudent.ac.in` / `Password123!`
*(Or click the 1-click **Instant Demo Access** buttons on the login page!)*

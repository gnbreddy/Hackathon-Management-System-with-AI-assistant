# EHub: Hackathon Management System

EHub is a comprehensive hackathon management platform designed to streamline the process of organizing, participating in, and evaluating hackathons. It features a robust Spring Boot backend and a modern React-based frontend, with advanced AI-powered project evaluation capabilities.

## 🚀 Features

- **Event Management**: Create and manage hackathon events with multiple phases.
- **Team Formation**: Collaborative tools for participants to form and manage teams.
- **Submission Portal**: Structured environment for teams to submit their projects.
- **AI Evaluation**: Automated, intelligent assessment of submissions using Google's Gemini AI.
- **Security**: Robust authentication and authorization system using JWT.
- **Deployment Ready**: Configured for seamless deployment on Railway (Backend) and Vercel (Frontend).

## 🏗️ Architecture

The project is structured as a monorepo:

- `ehub/`: Backend application built with **Spring Boot 3.4.3** and **Java 17**.
- `ehub-ui/`: Frontend application built with **React**, **Vite**, and **Tailwind CSS**.

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot
- **Database**: PostgreSQL (JPA/Hibernate)
- **Security**: Spring Security + JWT
- **AI Integration**: Google Gemini API
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Router
- **HTTP Client**: Axios

## 🚦 Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js** (v18+) and **npm**
- **PostgreSQL** database

### 1. Backend Setup (`ehub/`)

1. **Configure Database**:
   Ensure PostgreSQL is running on port `5433` (or update `application.properties`) with a database named `ehub_db`.

2. **Configure Environment**:
   - Navigate to `ehub/src/main/resources/`.
   - Copy `application.properties.example` to `application-local.properties`.
   - Add your **Gemini API Key** in `application-local.properties`:
     ```properties
     gemini.api.key=YOUR_API_KEY
     ```

3. **Run the application**:
   ```bash
   cd ehub
   ./mvnw spring-boot:run
   ```

### 2. Frontend Setup (`ehub-ui/`)

1. **Install Dependencies**:
   ```bash
   cd ehub-ui
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🚢 Deployment

- **Backend**: The root-level `Dockerfile` and `railway.json` are pre-configured for deployment on **Railway**.
- **Frontend**: `ehub-ui/vercel.json` is optimized for deployment on **Vercel**.

## 📄 License
This project is for demonstration and development purposes.

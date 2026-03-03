# Hackathon Management System

A Spring Boot application for managing hackathon events, teams, and submissions with AI-powered evaluation.

## Setup

### 1. Database Configuration
Make sure PostgreSQL is running on port 5433 with the database `ehub_db`.

### 2. API Keys Configuration
The application requires a Gemini API key for AI evaluation features.

1. Copy the example configuration file:
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application-local.properties
   ```

2. Edit `application-local.properties` and add your actual Gemini API key:
   ```properties
   gemini.api.key=YOUR_ACTUAL_API_KEY
   ```

**Note:** The `application-local.properties` file is gitignored and will not be committed to version control.

### 3. Run the Application
```bash
./mvnw spring-boot:run
```

## Security Notes
- Never commit API keys or sensitive credentials to version control
- The `application-local.properties` file is excluded from Git
- Use environment variables for production deployments

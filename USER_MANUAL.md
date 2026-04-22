# EHub Instruction Manual

Welcome to **EHub**! EHub is a comprehensive hackathon management system designed specifically for the VIT-AP community. It features automated AI evaluations, real-time leaderboards, phase-based progression, and seamless team management.

This guide will walk you through the distinct workflows for **Organizers** and **Participants**.

---

## 🛠️ For Organizers

### 1. Registration & Authentication
* **Account Creation**: EHub enforces role-based registration. To register as an Organizer, you *must* use a valid `@vitap.ac.in` e-mail address.
* **OTP Verification**: Upon registering, an OTP (One-Time Password) will be dispatched to your email. You have 60 minutes to enter this code to verify your account and unlock system access.

### 2. Creating a Hackathon
From the Organizer Dashboard, navigate to the **Create Hackathon** section:
* **Hackathon Name & Venue**: Enter the structural details of your event.
* **Date & Time**: Specify the precise starting date and time.
* **Max Team Size**: Set the maximum number of participants allowed in a single team.
* **Problem Statement & Banner**: Input the overall theme/problem and upload a localized image (or use a URL) as the Hackathon banner!

### 3. Managing the Hackathon Lifecycle
An EHub hackathon flows strictly through a state-machine of phases. Use the **Advance Phase** button continuously to control the event timeline:
1. `REGISTRATION`: Participants can browse the event, form teams, and join. 
2. `REVIEW_1`: Teams submit their initial ideas/presentations. Organizers evaluate and score.
3. `CODING`: The primary implementation window. Teams build their solutions based on round 1 feedback.
4. `REVIEW_2`: Final code submissions are collected. Organizers grade the developed outputs.
5. `FINISHED`: The hackathon concludes and is locked from further actions.

### 4. Evaluating Projects
When a phase enters a `REVIEW` state:
* Navigate to the **Hackathons & Team Reviews** section and expand an event to see all participating teams.
* **Scores & Feedback**: Enter out-of-100 scores and leave robust feedback.
* **Assigned Components (Round 1)**: Assign specific tech-stack features for a team to build during the `CODING` phase based on their idea.
* **🤖 AI Scoring**: Use the **"AI Score"** button! EHub uses Google Gemini to read the team's submission and intelligently predict an impartial score.
* **Disqualification**: If a team fails a round, use the **Disqualify** button so they are restricted from progressing.

### 5. Publishing the Leaderboard
Click the **Leaderboard** tab:
* Select a hackathon from the dropdown menu.
* Use **Publish Round 1** or **Publish Round 2** to make the current aggregate scores mathematically rank and appear on participant screens globally.

---

## 💻 For Participants

### 1. Registration & Authentication
* **Account Creation**: To register as a Participant, you *must* use a valid `@vitapstudent.ac.in` e-mail address.
* **OTP Verification**: Check your inbox for the 6-digit verification code. If you close the page, you can re-register with the same details to resend the OTP.

### 2. Joining Hackathons & Team Management
When you login, you will immediately see all **Active Hackathons** on your dashboard.
* **Forming a Team**: Navigate to **My Team → Create Team**. Give your team a name and select the desired Hackathon!
* **Team Leadership**: The person who creates the team is the **Leader**. 
  * Only the Leader can **Add Members** based on their Registration Numbers. 
  * The leader can remove members seamlessly before the hackathon officially starts.

### 3. Project Submission System
In both **Review 1** and **Review 2** phases, you will be required to submit your work:
* Once the organizer shifts the event phase from `REGISTRATION` to a `REVIEW` state, the **Submit Project** section unlocks.
* **Submission Details**: Enter your Project Title, the core Problem Statement, and your Project Description.
* **GitHub Link**: Link your source code securely.

### 4. Navigating Feedback and Progression
You will see live organizer interactions on your team card:
* **Feedback Tracking**: See any written comments and your Round Grades once published.
* **Assigned Components**: After Round 1, pay close attention to the **"Assigned for Round 2"** section! The Organizer will tell you specifically what to implement.
* **Leaderboard View**: The leaderboard updates periodically. Keep an eye on your team's live ranking post-reviews! 

---
*Happy Hacking! Let the best code win.*

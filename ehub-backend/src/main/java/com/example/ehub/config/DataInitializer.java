package com.example.ehub.config;

import com.example.ehub.models.*;
import com.example.ehub.repositories.EventRepository;
import com.example.ehub.repositories.SubmissionRepository;
import com.example.ehub.repositories.TeamRepository;
import com.example.ehub.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            EventRepository eventRepository,
            TeamRepository teamRepository,
            SubmissionRepository submissionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.teamRepository = teamRepository;
        this.submissionRepository = submissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data load.");
            return;
        }

        logger.info("🌱 Seeding EHub initial demo users, events, teams, and submissions...");

        // 1. Create Organizer
        User organizer = new User();
        organizer.setFullName("Prof. Vikram Sharma");
        organizer.setEmail("organizer@vitap.ac.in");
        organizer.setRegistrationNumber("FAC-2024-001");
        organizer.setPassword(passwordEncoder.encode("Organizer123!"));
        organizer.setRole(Role.ROLE_ORGANIZER);
        organizer.setVerified(true);
        userRepository.save(organizer);

        // 2. Create Sample Participants
        User alice = new User();
        alice.setFullName("Alice Chen");
        alice.setEmail("alice@vitapstudent.ac.in");
        alice.setRegistrationNumber("22BCE1001");
        alice.setPassword(passwordEncoder.encode("Password123!"));
        alice.setRole(Role.ROLE_PARTICIPANT);
        alice.setVerified(true);
        userRepository.save(alice);

        User bob = new User();
        bob.setFullName("Bob Smith");
        bob.setEmail("bob@vitapstudent.ac.in");
        bob.setRegistrationNumber("22BCE1002");
        bob.setPassword(passwordEncoder.encode("Password123!"));
        bob.setRole(Role.ROLE_PARTICIPANT);
        bob.setVerified(true);
        userRepository.save(bob);

        User charlie = new User();
        charlie.setFullName("Charlie Patel");
        charlie.setEmail("charlie@vitapstudent.ac.in");
        charlie.setRegistrationNumber("22BCE1003");
        charlie.setPassword(passwordEncoder.encode("Password123!"));
        charlie.setRole(Role.ROLE_PARTICIPANT);
        charlie.setVerified(true);
        userRepository.save(charlie);

        User diana = new User();
        diana.setFullName("Diana Rodriguez");
        diana.setEmail("diana@vitapstudent.ac.in");
        diana.setRegistrationNumber("22BCE1004");
        diana.setPassword(passwordEncoder.encode("Password123!"));
        diana.setRole(Role.ROLE_PARTICIPANT);
        diana.setVerified(true);
        userRepository.save(diana);

        User ethan = new User();
        ethan.setFullName("Ethan Walker");
        ethan.setEmail("ethan@vitapstudent.ac.in");
        ethan.setRegistrationNumber("22BCE1005");
        ethan.setPassword(passwordEncoder.encode("Password123!"));
        ethan.setRole(Role.ROLE_PARTICIPANT);
        ethan.setVerified(true);
        userRepository.save(ethan);

        User fiona = new User();
        fiona.setFullName("Fiona Gallagher");
        fiona.setEmail("fiona@vitapstudent.ac.in");
        fiona.setRegistrationNumber("22BCE1006");
        fiona.setPassword(passwordEncoder.encode("Password123!"));
        fiona.setRole(Role.ROLE_PARTICIPANT);
        fiona.setVerified(true);
        userRepository.save(fiona);

        // 3. Create Flagship Hackathon Event
        Event hackathon = new Event();
        hackathon.setTitle("EHub Smart AI Hackathon 2026");
        hackathon.setDescription("Build next-generation autonomous AI agents, developer productivity tools, and full-stack cloud applications.");
        hackathon.setBannerUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80");
        hackathon.setMinTeamSize(1);
        hackathon.setMaxTeamSize(4);
        hackathon.setCurrentPhase(EventPhase.CODING);
        hackathon.setRegistrationDeadline(LocalDateTime.now().plusDays(2));
        hackathon.setCodingDeadline(LocalDateTime.now().plusDays(5));
        hackathon.setJudgingDeadline(LocalDateTime.now().plusDays(7));
        hackathon.setCreatedBy(organizer);
        eventRepository.save(hackathon);

        // 4. Create Second Hackathon Event (Registration Phase)
        Event web3Hack = new Event();
        web3Hack.setTitle("FinTech & Web3 Innovation Cup");
        web3Hack.setDescription("Create decentralized finance workflows, smart contract security checkers, and real-time payment rails.");
        web3Hack.setBannerUrl("https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80");
        web3Hack.setMinTeamSize(2);
        web3Hack.setMaxTeamSize(4);
        web3Hack.setCurrentPhase(EventPhase.REGISTRATION);
        web3Hack.setRegistrationDeadline(LocalDateTime.now().plusDays(10));
        web3Hack.setCodingDeadline(LocalDateTime.now().plusDays(15));
        web3Hack.setJudgingDeadline(LocalDateTime.now().plusDays(18));
        web3Hack.setCreatedBy(organizer);
        eventRepository.save(web3Hack);

        // 5. Create Sample Teams for Hackathon 1
        Team teamAlpha = new Team();
        teamAlpha.setName("NeuralNinjas");
        teamAlpha.setJoinCode("E-NN900");
        teamAlpha.setEvent(hackathon);
        teamAlpha.setLeader(alice);
        teamAlpha.setSkillsRequired("React, Spring Boot, PyTorch");
        teamAlpha.addMember(alice);
        teamAlpha.addMember(bob);
        teamRepository.save(teamAlpha);

        Team teamBeta = new Team();
        teamBeta.setName("QuantumDevs");
        teamBeta.setJoinCode("E-QD440");
        teamBeta.setEvent(hackathon);
        teamBeta.setLeader(charlie);
        teamBeta.setSkillsRequired("Next.js, Python, OpenCV");
        teamBeta.addMember(charlie);
        teamBeta.addMember(diana);
        teamRepository.save(teamBeta);

        // 6. Create Submissions
        Submission subAlpha = new Submission();
        subAlpha.setTeam(teamAlpha);
        subAlpha.setEvent(hackathon);
        subAlpha.setGithubUrl("https://github.com/google-deepmind/materials");
        subAlpha.setDemoUrl("https://neural-ninjas-demo.web.app");
        subAlpha.setDescription("An intelligent agentic platform for analyzing and optimizing material structures with automated deep neural networks.");
        subAlpha.setStatus(SubmissionStatus.EVALUATED);
        subAlpha.setCodeQualityScore(23.5);
        subAlpha.setCompletenessScore(24.0);
        subAlpha.setDocumentationScore(22.5);
        subAlpha.setInnovationScore(24.5);
        subAlpha.setTotalScore(94.5);
        subAlpha.setAiFeedbackSummary("Exceptional engineering design with thorough modularity and outstanding problem alignment. Strong use of automated workflows and modern architecture.");
        subAlpha.setAiStrengths("• Robust end-to-end architecture\n• High performance data pipelines\n• Clean documentation");
        subAlpha.setAiWeaknesses("• Add more interactive dashboard visualizations\n• Include edge test suites");
        subAlpha.setEvaluatedAt(LocalDateTime.now().minusHours(2));
        submissionRepository.save(subAlpha);

        Submission subBeta = new Submission();
        subBeta.setTeam(teamBeta);
        subBeta.setEvent(hackathon);
        subBeta.setGithubUrl("https://github.com/facebook/react");
        subBeta.setDemoUrl("https://quantum-devs.vercel.app");
        subBeta.setDescription("A real-time collaborative code review environment with automated diff linting and context-aware suggestions.");
        subBeta.setStatus(SubmissionStatus.EVALUATED);
        subBeta.setCodeQualityScore(22.0);
        subBeta.setCompletenessScore(23.0);
        subBeta.setDocumentationScore(21.5);
        subBeta.setInnovationScore(23.0);
        subBeta.setTotalScore(89.5);
        subBeta.setAiFeedbackSummary("Solid developer tool with great UI response times and fluid collaboration mechanisms. Very high utility.");
        subBeta.setAiStrengths("• Slick interface responsiveness\n• Clean WebSocket integration\n• Great user experience");
        subBeta.setAiWeaknesses("• Expand error recovery for lost connection\n• Enhance mobile viewport handling");
        subBeta.setEvaluatedAt(LocalDateTime.now().minusHours(1));
        submissionRepository.save(subBeta);

        logger.info("✅ Database seeding completed successfully!");
        logger.info("👉 Default Organizer: organizer@vitap.ac.in / Organizer123!");
        logger.info("👉 Default Participant (Leader): alice@vitapstudent.ac.in / Password123!");
        logger.info("👉 Default Participant (Solo): ethan@vitapstudent.ac.in / Password123!");
    }
}

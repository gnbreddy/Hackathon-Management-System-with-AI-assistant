package com.example.ehub;

import com.example.ehub.dto.AuthDtos.RegisterRequest;
import com.example.ehub.dto.EventDtos.CreateEventRequest;
import com.example.ehub.dto.EventDtos.EventResponseDto;
import com.example.ehub.dto.EventDtos.UpdatePhaseRequest;
import com.example.ehub.dto.TeamDtos.CreateTeamRequest;
import com.example.ehub.dto.TeamDtos.TeamResponseDto;
import com.example.ehub.exceptions.PhaseConstraintException;
import com.example.ehub.models.*;
import com.example.ehub.repositories.*;
import com.example.ehub.services.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
class EhubApplicationTests {

    @Autowired
    private EventService eventService;

    @Autowired
    private TeamService teamService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpStore otpStore;

    private User organizer;
    private User participant;

    @BeforeEach
    void setUp() {
        organizer = userRepository.findByEmail("organizer@vitap.ac.in").orElseGet(() -> {
            User u = new User("Organizer User", "organizer@vitap.ac.in", "FAC-999", passwordEncoder.encode("Pass123!"), Role.ROLE_ORGANIZER);
            return userRepository.save(u);
        });

        participant = userRepository.findByEmail("alice@vitapstudent.ac.in").orElseGet(() -> {
            User u = new User("Alice", "alice@vitapstudent.ac.in", "22BCE9999", passwordEncoder.encode("Pass123!"), Role.ROLE_PARTICIPANT);
            return userRepository.save(u);
        });
    }

    @Test
    @DisplayName("Test Context Loads Successfully")
    void contextLoads() {
        assertNotNull(eventService);
        assertNotNull(teamService);
        assertNotNull(jwtService);
    }

    @Test
    @DisplayName("Test JWT Generation and Claim Extraction")
    void testJwtLifecycle() {
        String token = jwtService.generateToken(participant);
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token, participant.getEmail()));
        assertEquals(participant.getEmail(), jwtService.extractUsername(token));
    }

    @Test
    @DisplayName("Test Event Lifecycle State Transitions")
    void testEventStateTransitions() {
        CreateEventRequest req = new CreateEventRequest(
                "Test Hackathon 2026",
                "Description for testing",
                null,
                1,
                4,
                true,
                null, null, null
        );

        EventResponseDto created = eventService.createEvent(req, organizer);
        assertEquals(EventPhase.REGISTRATION, created.currentPhase());
        assertTrue(created.isPublic());
        assertNotNull(created.eventCode());

        // Valid transition: REGISTRATION -> CODING
        EventResponseDto toCoding = eventService.advancePhase(created.id(), new UpdatePhaseRequest(EventPhase.CODING));
        assertEquals(EventPhase.CODING, toCoding.currentPhase());

        // Valid transition: CODING -> JUDGING
        EventResponseDto toJudging = eventService.advancePhase(created.id(), new UpdatePhaseRequest(EventPhase.JUDGING));
        assertEquals(EventPhase.JUDGING, toJudging.currentPhase());

        // Valid transition: JUDGING -> FINISHED
        EventResponseDto toFinished = eventService.advancePhase(created.id(), new UpdatePhaseRequest(EventPhase.FINISHED));
        assertEquals(EventPhase.FINISHED, toFinished.currentPhase());

        // Invalid transition from FINISHED
        assertThrows(PhaseConstraintException.class, () -> {
            eventService.advancePhase(created.id(), new UpdatePhaseRequest(EventPhase.REGISTRATION));
        });
    }

    @Test
    @DisplayName("Test Private Event Unlocking and Access Control")
    void testPrivateEventUnlock() {
        CreateEventRequest req = new CreateEventRequest(
                "Private Club Hack",
                "Members only",
                null,
                1,
                3,
                false, // Private!
                null, null, null
        );

        EventResponseDto created = eventService.createEvent(req, organizer);
        assertFalse(created.isPublic());

        // Unlock by eventCode
        EventResponseDto unlocked = eventService.unlockEventByCode(created.eventCode());
        assertEquals(created.id(), unlocked.id());
    }

    @Test
    @DisplayName("Test Forgot Password & Account Reset With OTP Verification")
    void testForgotPasswordAndAccountReset() {
        String testEmail = "temp.user@vitapstudent.ac.in";
        User tempUser = new User("Temp User", testEmail, "22BCE8888", passwordEncoder.encode("OldPass123!"), Role.ROLE_PARTICIPANT);
        userRepository.save(tempUser);

        assertTrue(userRepository.existsByEmail(testEmail));

        // Attempt verification with invalid OTP
        assertFalse(otpStore.verifyOtp(testEmail, "000000"));
        // User should still exist in DB
        assertTrue(userRepository.existsByEmail(testEmail));

        // Generate valid OTP
        String validOtp = otpStore.generateAndStoreOtp(testEmail);
        assertTrue(otpStore.verifyOtp(testEmail, validOtp));

        // Reset user
        userRepository.delete(tempUser);
        assertFalse(userRepository.existsByEmail(testEmail));
    }
}

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
                null, null, null
        );

        EventResponseDto created = eventService.createEvent(req, organizer);
        assertEquals(EventPhase.REGISTRATION, created.currentPhase());

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
}

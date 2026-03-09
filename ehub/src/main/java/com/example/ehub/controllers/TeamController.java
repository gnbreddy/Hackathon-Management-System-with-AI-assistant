package com.example.ehub.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.ehub.models.Event;
import com.example.ehub.models.Team;
import com.example.ehub.models.User;
import com.example.ehub.repositories.EventRepository;
import com.example.ehub.repositories.TeamRepository;
import com.example.ehub.repositories.UserRepository;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public TeamController(TeamRepository teamRepository, EventRepository eventRepository,
            UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createTeam(@RequestBody TeamCreateDto request, @RequestParam String username) {
        Optional<Event> eventOpt = eventRepository.findById(request.eventId());
        if (eventOpt.isEmpty())
            return ResponseEntity.badRequest().body("Event not found");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body("User not found");

        Team team = new Team();
        team.setName(request.name());
        team.setEvent(eventOpt.get());
        team.setLookingForTags(request.tags());

        // Set the creator as the leader and add them to the team
        User creator = userOpt.get();
        team.setLeader(creator);
        // Initialize the members set if needed (handled by JPA/Hibernate usually, but
        // safe to set a new HashSet)
        team.setMembers(new java.util.HashSet<>());
        team.getMembers().add(creator);

        return ResponseEntity.ok(teamRepository.save(team));
    }

    @PostMapping("/{teamId}/add-member")
    public ResponseEntity<?> addMember(@PathVariable Long teamId, @RequestParam String requesterUsername,
            @RequestParam String registrationNumber) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty())
            return ResponseEntity.badRequest().body("Team not found");

        Optional<User> requesterOpt = userRepository.findByUsername(requesterUsername);
        if (requesterOpt.isEmpty())
            return ResponseEntity.badRequest().body("Requester not found");

        Optional<User> newMemberOpt = userRepository.findByRegistrationNumber(registrationNumber);
        if (newMemberOpt.isEmpty())
            return ResponseEntity.badRequest().body("No user found with that registration number");

        Team team = teamOpt.get();
        User requester = requesterOpt.get();
        User newMember = newMemberOpt.get();
        Event event = team.getEvent();

        // Authorization: Only Leader or Organizer can add members
        boolean isOrganizer = requester.getRole() == com.example.ehub.models.Role.ORGANIZER;
        boolean isLeader = team.getLeader().getId().equals(requester.getId());

        if (!isOrganizer && !isLeader) {
            return ResponseEntity.status(403).body("Only the team leader or an organizer can add members.");
        }

        // Enforce max team size
        if (team.getMembers().size() >= event.getMaxTeamSize()) {
            return ResponseEntity.badRequest().body("Team is already full! Max size is " + event.getMaxTeamSize());
        }

        team.getMembers().add(newMember);
        teamRepository.save(team);

        return ResponseEntity.ok("Successfully added member to the team.");
    }
}

record TeamCreateDto(String name, Long eventId, List<String> tags) {
}
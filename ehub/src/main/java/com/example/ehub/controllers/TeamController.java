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

    public TeamController(TeamRepository teamRepository, EventRepository eventRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createTeam(@RequestBody TeamCreateDto request) {
        Optional<Event> eventOpt = eventRepository.findById(request.eventId());
        if (eventOpt.isEmpty()) return ResponseEntity.badRequest().body("Event not found");

        Team team = new Team();
        team.setName(request.name());
        team.setEvent(eventOpt.get());
        team.setLookingForTags(request.tags());
        
        return ResponseEntity.ok(teamRepository.save(team));
    }

    @PostMapping("/{teamId}/join")
    public ResponseEntity<?> joinTeam(@PathVariable Long teamId, @RequestParam String username) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty()) return ResponseEntity.badRequest().body("Team not found");
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found");

        Team team = teamOpt.get();
        Event event = team.getEvent();
        User user = userOpt.get();
        
        // Enforce max team size
        if (team.getMembers().size() >= event.getMaxTeamSize()) {
            return ResponseEntity.badRequest().body("Team is already full! Max size is " + event.getMaxTeamSize());
        }

        team.getMembers().add(user);
        teamRepository.save(team);

        return ResponseEntity.ok("Successfully joined the team.");
    }
}

record TeamCreateDto(String name, Long eventId, List<String> tags) {}
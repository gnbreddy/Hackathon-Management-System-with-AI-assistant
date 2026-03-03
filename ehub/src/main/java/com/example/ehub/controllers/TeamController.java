package com.example.ehub.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ehub.models.Event;
import com.example.ehub.models.Team;
import com.example.ehub.repositories.EventRepository;
import com.example.ehub.repositories.TeamRepository;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;
    private final EventRepository eventRepository;

    public TeamController(TeamRepository teamRepository, EventRepository eventRepository) {
        this.teamRepository = teamRepository;
        this.eventRepository = eventRepository;
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
}

record TeamCreateDto(String name, Long eventId, List<String> tags) {}
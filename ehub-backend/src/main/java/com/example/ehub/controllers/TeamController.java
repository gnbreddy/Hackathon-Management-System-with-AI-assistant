package com.example.ehub.controllers;

import com.example.ehub.dto.TeamDtos.CreateTeamRequest;
import com.example.ehub.dto.TeamDtos.JoinTeamRequest;
import com.example.ehub.dto.TeamDtos.TeamResponseDto;
import com.example.ehub.models.User;
import com.example.ehub.services.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<TeamResponseDto> createTeam(
            @Valid @RequestBody CreateTeamRequest req,
            @AuthenticationPrincipal User user) {
        TeamResponseDto created = teamService.createTeam(req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/join")
    public ResponseEntity<TeamResponseDto> joinTeam(
            @Valid @RequestBody JoinTeamRequest req,
            @AuthenticationPrincipal User user) {
        TeamResponseDto joined = teamService.joinTeam(req, user);
        return ResponseEntity.ok(joined);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponseDto> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TeamResponseDto>> getTeamsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(teamService.getTeamsByEvent(eventId));
    }

    @GetMapping("/my-team/{eventId}")
    public ResponseEntity<TeamResponseDto> getMyTeam(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User user) {
        return teamService.getMyTeamInEvent(eventId, user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/matchmaking/{eventId}")
    public ResponseEntity<List<TeamResponseDto>> getMatchmakingTeams(
            @PathVariable Long eventId,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false, defaultValue = "false") Boolean onlyOpen) {
        return ResponseEntity.ok(teamService.getMatchmakingTeams(eventId, skill, onlyOpen));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Map<String, String>> leaveTeam(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        teamService.leaveTeam(id, user);
        return ResponseEntity.ok(Map.of("message", "Successfully left the team"));
    }
}

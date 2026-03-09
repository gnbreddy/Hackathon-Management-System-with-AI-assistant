package com.example.ehub.controllers;

import com.example.ehub.models.*;
import com.example.ehub.repositories.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

        User creator = userOpt.get();

        // Enforce: one team per participant per hackathon
        if (teamRepository.existsMemberInEvent(request.eventId(), creator.getId())) {
            return ResponseEntity.badRequest().body(
                    "You are already a member of a team in this hackathon. A participant can only be in one team per hackathon.");
        }

        Team team = new Team();
        team.setName(request.name());
        team.setEvent(eventOpt.get());
        team.setLookingForTags(request.tags());
        team.setLeader(creator);
        team.setMembers(new HashSet<>());
        team.getMembers().add(creator);

        return ResponseEntity.ok(teamRepository.save(team));
    }

    @PostMapping("/{teamId}/join")
    public ResponseEntity<?> joinTeam(@PathVariable Long teamId, @RequestParam String username) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty())
            return ResponseEntity.badRequest().body("Team not found");
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body("User not found");

        Team team = teamOpt.get();
        User user = userOpt.get();
        Event event = team.getEvent();

        if (team.isDisqualified())
            return ResponseEntity.badRequest().body("This team has been disqualified.");
        if (team.getMembers().size() >= event.getMaxTeamSize())
            return ResponseEntity.badRequest().body("Team is full.");

        // Enforce: one team per participant per hackathon
        if (teamRepository.existsMemberInEvent(event.getId(), user.getId())) {
            return ResponseEntity.badRequest().body(
                    "You are already a member of a team in this hackathon.");
        }

        team.getMembers().add(user);
        teamRepository.save(team);
        return ResponseEntity.ok("Joined team successfully.");
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

        boolean isOrganizer = requester.getRole() == Role.ORGANIZER;
        boolean isLeader = team.getLeader().getId().equals(requester.getId());
        if (!isOrganizer && !isLeader)
            return ResponseEntity.status(403).body("Only the team leader or an organizer can add members.");

        if (team.getMembers().size() >= event.getMaxTeamSize())
            return ResponseEntity.badRequest().body("Team is already full! Max size is " + event.getMaxTeamSize());

        // Enforce: one team per participant per hackathon
        if (teamRepository.existsMemberInEvent(event.getId(), newMember.getId())) {
            return ResponseEntity.badRequest().body(
                    newMember.getFullName() + " is already in a team for this hackathon.");
        }

        team.getMembers().add(newMember);
        teamRepository.save(team);
        return ResponseEntity.ok("Successfully added member to the team.");
    }

    @PostMapping("/{teamId}/remove-member")
    public ResponseEntity<?> removeMember(@PathVariable Long teamId, @RequestParam String requesterUsername,
            @RequestParam String registrationNumber) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty())
            return ResponseEntity.badRequest().body("Team not found");
        Optional<User> requesterOpt = userRepository.findByUsername(requesterUsername);
        if (requesterOpt.isEmpty())
            return ResponseEntity.badRequest().body("Requester not found");
        Optional<User> memberOpt = userRepository.findByRegistrationNumber(registrationNumber);
        if (memberOpt.isEmpty())
            return ResponseEntity.badRequest().body("Member not found");

        Team team = teamOpt.get();
        User requester = requesterOpt.get();
        boolean isLeader = team.getLeader().getId().equals(requester.getId());
        if (!isLeader)
            return ResponseEntity.status(403).body("Only the team leader can remove members.");
        if (memberOpt.get().getId().equals(team.getLeader().getId()))
            return ResponseEntity.badRequest().body("Cannot remove the team leader.");

        team.getMembers().remove(memberOpt.get());
        teamRepository.save(team);
        return ResponseEntity.ok("Member removed.");
    }

    @PostMapping("/{teamId}/disqualify")
    public ResponseEntity<?> disqualifyTeam(@PathVariable Long teamId, @RequestParam int round) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Team team = teamOpt.get();
        team.setDisqualified(true);
        team.setQualificationRound(round);
        teamRepository.save(team);
        return ResponseEntity.ok("Team disqualified.");
    }

    @PostMapping("/{teamId}/qualify")
    public ResponseEntity<?> qualifyTeam(@PathVariable Long teamId) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Team team = teamOpt.get();
        team.setDisqualified(false);
        team.setQualificationRound(null);
        teamRepository.save(team);
        return ResponseEntity.ok("Team re-qualified.");
    }
}

record TeamCreateDto(String name, Long eventId, List<String> tags) {
}

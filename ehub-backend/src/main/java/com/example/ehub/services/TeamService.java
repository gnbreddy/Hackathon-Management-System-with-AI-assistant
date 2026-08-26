package com.example.ehub.services;

import com.example.ehub.dto.TeamDtos.*;
import com.example.ehub.exceptions.PhaseConstraintException;
import com.example.ehub.exceptions.ResourceNotFoundException;
import com.example.ehub.models.Event;
import com.example.ehub.models.EventPhase;
import com.example.ehub.models.Team;
import com.example.ehub.models.User;
import com.example.ehub.repositories.EventRepository;
import com.example.ehub.repositories.SubmissionRepository;
import com.example.ehub.repositories.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final EventRepository eventRepository;
    private final SubmissionRepository submissionRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public TeamService(
            TeamRepository teamRepository,
            EventRepository eventRepository,
            SubmissionRepository submissionRepository) {
        this.teamRepository = teamRepository;
        this.eventRepository = eventRepository;
        this.submissionRepository = submissionRepository;
    }

    private String generateJoinCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder("E-");
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return code.toString();
    }

    @Transactional
    public TeamResponseDto createTeam(CreateTeamRequest req, User user) {
        Event event = eventRepository.findById(req.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + req.eventId()));

        if (event.getCurrentPhase() == EventPhase.JUDGING || event.getCurrentPhase() == EventPhase.FINISHED) {
            throw new PhaseConstraintException("Team formation is closed because the event is in " + event.getCurrentPhase() + " phase.");
        }

        // Check if user is already in a team for this event
        Optional<Team> existing = teamRepository.findUserTeamInEvent(user, event.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("You are already part of team '" + existing.get().getName() + "' for this event.");
        }

        String joinCode = generateJoinCode();
        while (teamRepository.findByJoinCode(joinCode).isPresent()) {
            joinCode = generateJoinCode();
        }

        Team team = new Team();
        team.setName(req.name().trim());
        team.setJoinCode(joinCode);
        team.setEvent(event);
        team.setLeader(user);
        team.setSkillsRequired(req.skillsRequired() != null ? req.skillsRequired().trim() : "");
        team.setPublic(req.isPublic() == null || req.isPublic());
        team.addMember(user);

        Team saved = teamRepository.save(team);
        return mapToDto(saved);
    }

    @Transactional
    public TeamResponseDto joinTeam(JoinTeamRequest req, User user) {
        Team team = teamRepository.findByJoinCode(req.joinCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid team join code: " + req.joinCode()));

        Event event = team.getEvent();
        if (event.getCurrentPhase() == EventPhase.JUDGING || event.getCurrentPhase() == EventPhase.FINISHED) {
            throw new PhaseConstraintException("Team modifications are closed because the event is in " + event.getCurrentPhase() + " phase.");
        }

        if (team.hasMember(user)) {
            return mapToDto(team);
        }

        Optional<Team> existing = teamRepository.findUserTeamInEvent(user, event.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("You are already registered in team '" + existing.get().getName() + "' for this event.");
        }

        if (team.getMembers().size() >= event.getMaxTeamSize()) {
            throw new IllegalStateException("Team '" + team.getName() + "' is already at maximum capacity (" + event.getMaxTeamSize() + " members).");
        }

        team.addMember(user);
        Team saved = teamRepository.save(team);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public TeamResponseDto getTeamById(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));
        return mapToDto(team);
    }

    @Transactional(readOnly = true)
    public Optional<TeamResponseDto> getMyTeamInEvent(Long eventId, User user) {
        return teamRepository.findUserTeamInEvent(user, eventId)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<TeamResponseDto> getTeamsByEvent(Long eventId) {
        return teamRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeamResponseDto> getMatchmakingTeams(Long eventId, String skillQuery, Boolean onlyOpenSlots) {
        List<Team> teams = teamRepository.findByEventId(eventId);
        String query = skillQuery != null ? skillQuery.trim().toLowerCase() : "";

        return teams.stream()
                // Only return PUBLIC teams for matchmaking
                .filter(Team::isPublic)
                .filter(t -> {
                    boolean isOpen = t.getMembers().size() < t.getEvent().getMaxTeamSize();
                    if (Boolean.TRUE.equals(onlyOpenSlots) && !isOpen) {
                        return false;
                    }
                    if (!query.isEmpty()) {
                        String skills = t.getSkillsRequired() != null ? t.getSkillsRequired().toLowerCase() : "";
                        String teamName = t.getName().toLowerCase();
                        return skills.contains(query) || teamName.contains(query);
                    }
                    return true;
                })
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public TeamResponseDto updateTeamVisibility(Long teamId, boolean isPublic, User user) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        if (!team.getLeader().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Only the team leader can change team visibility settings.");
        }

        team.setPublic(isPublic);
        Team updated = teamRepository.save(team);
        return mapToDto(updated);
    }

    @Transactional
    public void leaveTeam(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        if (team.getEvent().getCurrentPhase() == EventPhase.JUDGING || team.getEvent().getCurrentPhase() == EventPhase.FINISHED) {
            throw new PhaseConstraintException("Cannot leave team during " + team.getEvent().getCurrentPhase() + " phase.");
        }

        if (!team.hasMember(user)) {
            throw new IllegalArgumentException("You are not a member of this team.");
        }

        // If leader leaves and there are other members, assign next member as leader; if lone member, delete team
        team.removeMember(user);
        if (team.getMembers().isEmpty()) {
            teamRepository.delete(team);
        } else {
            if (team.getLeader().getId().equals(user.getId())) {
                User nextLeader = team.getMembers().iterator().next();
                team.setLeader(nextLeader);
            }
            teamRepository.save(team);
        }
    }

    public TeamResponseDto mapToDto(Team team) {
        int maxSize = team.getEvent().getMaxTeamSize();
        int currentSize = team.getMembers().size();
        boolean isFull = currentSize >= maxSize;
        boolean hasSubmitted = submissionRepository.existsByTeamId(team.getId());

        List<TeamMemberDto> memberDtos = team.getMembers().stream()
                .map(m -> new TeamMemberDto(
                        m.getId(),
                        m.getFullName(),
                        m.getEmail(),
                        m.getRegistrationNumber(),
                        m.getId().equals(team.getLeader().getId())
                ))
                .toList();

        return new TeamResponseDto(
                team.getId(),
                team.getName(),
                team.getJoinCode(),
                team.getEvent().getId(),
                team.getEvent().getTitle(),
                team.getLeader().getId(),
                team.getLeader().getFullName(),
                team.getSkillsRequired(),
                team.isPublic(),
                memberDtos,
                currentSize,
                maxSize,
                isFull,
                hasSubmitted,
                team.getCreatedAt()
        );
    }
}

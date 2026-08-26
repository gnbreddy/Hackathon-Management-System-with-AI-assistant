package com.example.ehub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class TeamDtos {

    public record CreateTeamRequest(
        @NotBlank(message = "Team name is required")
        String name,

        @NotNull(message = "Event ID is required")
        Long eventId,

        String skillsRequired,

        Boolean isPublic
    ) {}

    public record JoinTeamRequest(
        @NotBlank(message = "Join code is required")
        String joinCode
    ) {}

    public record UpdateTeamVisibilityRequest(
        boolean isPublic
    ) {}

    public record TeamMemberDto(
        Long id,
        String fullName,
        String email,
        String registrationNumber,
        boolean isLeader
    ) {}

    public record TeamResponseDto(
        Long id,
        String name,
        String joinCode,
        Long eventId,
        String eventTitle,
        Long leaderId,
        String leaderName,
        String skillsRequired,
        boolean isPublic,
        List<TeamMemberDto> members,
        int currentSize,
        int maxSize,
        boolean isFull,
        boolean hasSubmitted,
        LocalDateTime createdAt
    ) {}

    public record MatchmakingFilterDto(
        Long eventId,
        String skillQuery,
        Boolean onlyOpenSlots
    ) {}
}

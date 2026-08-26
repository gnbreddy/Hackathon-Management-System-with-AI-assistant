package com.example.ehub.dto;

import com.example.ehub.models.EventPhase;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class EventDtos {

    public record CreateEventRequest(
        @NotBlank(message = "Title is required")
        String title,

        String description,
        String bannerUrl,

        @Min(value = 1, message = "Minimum team size must be at least 1")
        int minTeamSize,

        @Min(value = 1, message = "Maximum team size must be at least 1")
        int maxTeamSize,

        LocalDateTime registrationDeadline,
        LocalDateTime codingDeadline,
        LocalDateTime judgingDeadline
    ) {}

    public record UpdatePhaseRequest(
        @NotNull(message = "Target phase is required")
        EventPhase targetPhase
    ) {}

    public record EventResponseDto(
        Long id,
        String title,
        String description,
        String bannerUrl,
        int minTeamSize,
        int maxTeamSize,
        EventPhase currentPhase,
        LocalDateTime registrationDeadline,
        LocalDateTime codingDeadline,
        LocalDateTime judgingDeadline,
        Long createdById,
        String createdByName,
        LocalDateTime createdAt,
        long totalTeams,
        long totalSubmissions
    ) {}
}

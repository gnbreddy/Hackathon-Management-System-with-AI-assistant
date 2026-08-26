package com.example.ehub.dto;

import com.example.ehub.models.SubmissionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SubmissionDtos {

    public record SubmitProjectRequest(
        @NotNull(message = "Team ID is required")
        Long teamId,

        @NotBlank(message = "GitHub URL is required")
        String githubUrl,

        String commitHash,
        String demoUrl,
        String description
    ) {}

    public record SubmissionResponseDto(
        Long id,
        Long teamId,
        String teamName,
        Long eventId,
        String eventTitle,
        String githubUrl,
        String commitHash,
        String demoUrl,
        String description,
        SubmissionStatus status,
        Double codeQualityScore,
        Double completenessScore,
        Double documentationScore,
        Double innovationScore,
        Double totalScore,
        String aiFeedbackSummary,
        String aiStrengths,
        String aiWeaknesses,
        LocalDateTime evaluatedAt,
        LocalDateTime submittedAt
    ) {}

    public record AiRubricResultDto(
        Double codeQualityScore,
        Double completenessScore,
        Double documentationScore,
        Double innovationScore,
        Double totalScore,
        String feedbackSummary,
        String strengths,
        String weaknesses
    ) {}

    public record LeaderboardEntryDto(
        int rank,
        Long submissionId,
        Long teamId,
        String teamName,
        String projectDescription,
        String githubUrl,
        String demoUrl,
        Double codeQualityScore,
        Double completenessScore,
        Double documentationScore,
        Double innovationScore,
        Double totalScore,
        String aiFeedbackSummary,
        LocalDateTime evaluatedAt
    ) {}

    public record BulkEvaluateResponseDto(
        int totalSubmissions,
        int queuedCount,
        String message
    ) {}
}

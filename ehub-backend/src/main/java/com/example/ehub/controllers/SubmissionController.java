package com.example.ehub.controllers;

import com.example.ehub.dto.SubmissionDtos.*;
import com.example.ehub.exceptions.PhaseConstraintException;
import com.example.ehub.exceptions.ResourceNotFoundException;
import com.example.ehub.models.*;
import com.example.ehub.repositories.EventRepository;
import com.example.ehub.repositories.SubmissionRepository;
import com.example.ehub.repositories.TeamRepository;
import com.example.ehub.services.AiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final EventRepository eventRepository;
    private final AiService aiService;

    public SubmissionController(
            SubmissionRepository submissionRepository,
            TeamRepository teamRepository,
            EventRepository eventRepository,
            AiService aiService) {
        this.submissionRepository = submissionRepository;
        this.teamRepository = teamRepository;
        this.eventRepository = eventRepository;
        this.aiService = aiService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<SubmissionResponseDto> submitProject(
            @Valid @RequestBody SubmitProjectRequest req,
            @AuthenticationPrincipal User user) {

        Team team = teamRepository.findById(req.teamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + req.teamId()));

        Event event = team.getEvent();

        if (event.getCurrentPhase() != EventPhase.CODING && event.getCurrentPhase() != EventPhase.JUDGING) {
            throw new PhaseConstraintException(
                    "Submissions are only accepted during CODING (or JUDGING) phase. Current phase is: " + event.getCurrentPhase()
            );
        }

        if (!team.hasMember(user)) {
            throw new IllegalArgumentException("Only registered team members can submit project links for this team.");
        }

        // Check if submission already exists for this team
        Optional<Submission> existing = submissionRepository.findByTeamId(team.getId());
        Submission submission;

        if (existing.isPresent()) {
            submission = existing.get();
            submission.setGithubUrl(req.githubUrl().trim());
            submission.setCommitHash(req.commitHash());
            submission.setDemoUrl(req.demoUrl());
            submission.setDescription(req.description());
            submission.setStatus(SubmissionStatus.PENDING);
        } else {
            submission = new Submission();
            submission.setTeam(team);
            submission.setEvent(event);
            submission.setGithubUrl(req.githubUrl().trim());
            submission.setCommitHash(req.commitHash());
            submission.setDemoUrl(req.demoUrl());
            submission.setDescription(req.description());
            submission.setStatus(SubmissionStatus.PENDING);
        }

        Submission saved = submissionRepository.save(submission);

        // Trigger async AI Evaluation
        aiService.evaluateSubmissionAsync(saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDto(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponseDto> getSubmissionById(@PathVariable Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));
        return ResponseEntity.ok(mapToDto(submission));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<SubmissionResponseDto> getSubmissionByTeam(@PathVariable Long teamId) {
        return submissionRepository.findByTeamId(teamId)
                .map(s -> ResponseEntity.ok(mapToDto(s)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SubmissionResponseDto>> getSubmissionsByEvent(@PathVariable Long eventId) {
        List<Submission> list = submissionRepository.findByEventId(eventId);
        return ResponseEntity.ok(list.stream().map(this::mapToDto).toList());
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<SubmissionResponseDto> triggerEvaluation(@PathVariable Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));

        aiService.evaluateSubmissionAsync(submission.getId());
        return ResponseEntity.accepted().body(mapToDto(submission));
    }

    @PostMapping("/bulk-evaluate/{eventId}")
    @PreAuthorize("hasAuthority('ROLE_ORGANIZER')")
    public ResponseEntity<BulkEvaluateResponseDto> bulkEvaluate(@PathVariable Long eventId) {
        List<Submission> submissions = submissionRepository.findByEventId(eventId);
        int queued = 0;
        for (Submission s : submissions) {
            aiService.evaluateSubmissionAsync(s.getId());
            queued++;
        }
        return ResponseEntity.ok(new BulkEvaluateResponseDto(
                submissions.size(),
                queued,
                "Queued " + queued + " submissions for AI evaluation."
        ));
    }

    @GetMapping("/leaderboard/{eventId}")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(@PathVariable Long eventId) {
        List<Submission> evaluated = submissionRepository.findLeaderboardByEventId(eventId);
        List<LeaderboardEntryDto> leaderboard = new ArrayList<>();

        int rank = 1;
        for (Submission s : evaluated) {
            leaderboard.add(new LeaderboardEntryDto(
                    rank++,
                    s.getId(),
                    s.getTeam().getId(),
                    s.getTeam().getName(),
                    s.getDescription(),
                    s.getGithubUrl(),
                    s.getDemoUrl(),
                    s.getCodeQualityScore(),
                    s.getCompletenessScore(),
                    s.getDocumentationScore(),
                    s.getInnovationScore(),
                    s.getTotalScore(),
                    s.getAiFeedbackSummary(),
                    s.getEvaluatedAt()
            ));
        }

        return ResponseEntity.ok(leaderboard);
    }

    private SubmissionResponseDto mapToDto(Submission s) {
        return new SubmissionResponseDto(
                s.getId(),
                s.getTeam().getId(),
                s.getTeam().getName(),
                s.getEvent().getId(),
                s.getEvent().getTitle(),
                s.getGithubUrl(),
                s.getCommitHash(),
                s.getDemoUrl(),
                s.getDescription(),
                s.getStatus(),
                s.getCodeQualityScore(),
                s.getCompletenessScore(),
                s.getDocumentationScore(),
                s.getInnovationScore(),
                s.getTotalScore(),
                s.getAiFeedbackSummary(),
                s.getAiStrengths(),
                s.getAiWeaknesses(),
                s.getEvaluatedAt(),
                s.getSubmittedAt()
        );
    }
}

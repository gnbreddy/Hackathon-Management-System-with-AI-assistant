package com.example.ehub.controllers;

import com.example.ehub.models.*;
import com.example.ehub.repositories.*;
import com.example.ehub.services.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final AiService aiService;

    public SubmissionController(SubmissionRepository submissionRepository,
            TeamRepository teamRepository, AiService aiService) {
        this.submissionRepository = submissionRepository;
        this.teamRepository = teamRepository;
        this.aiService = aiService;
    }

    @GetMapping
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> submitProject(@RequestBody SubmitDto request) {
        Optional<Team> teamOpt = teamRepository.findById(request.teamId());
        if (teamOpt.isEmpty())
            return ResponseEntity.badRequest().body("Team not found");

        Team team = teamOpt.get();
        if (team.isDisqualified()) {
            return ResponseEntity.badRequest().body("Your team has been disqualified and cannot submit.");
        }

        Submission submission = new Submission();
        submission.setTeam(team);
        submission.setGithubUrl(request.githubUrl());
        submission.setProjectTitle(request.projectTitle());
        submission.setProblemStatement(request.problemStatement());
        submission.setProjectDescription(request.projectDescription());
        submission.setReviewRound(request.reviewRound() != null ? request.reviewRound() : 1);
        submission.setStatus(SubmissionStatus.PENDING);

        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<?> evaluateSubmission(@PathVariable Long id) {
        Optional<Submission> submissionOpt = submissionRepository.findById(id);
        if (submissionOpt.isEmpty())
            return ResponseEntity.badRequest().body("Submission not found");
        aiService.evaluateSubmission(submissionOpt.get());
        return ResponseEntity.ok("AI evaluation started in the background.");
    }

    @GetMapping("/leaderboard")
    public List<Submission> getLeaderboard() {
        return submissionRepository.findByStatusOrderByAiScoreDesc(SubmissionStatus.EVALUATED);
    }

    @GetMapping("/team/{teamId}")
    public List<Submission> getByTeam(@PathVariable Long teamId) {
        return submissionRepository.findByTeamId(teamId);
    }
}

record SubmitDto(Long teamId, String githubUrl, String projectTitle,
        String problemStatement, String projectDescription, Integer reviewRound) {
}
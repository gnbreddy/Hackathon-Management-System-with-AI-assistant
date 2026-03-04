package com.example.ehub.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ehub.models.Submission;
import com.example.ehub.models.SubmissionStatus;
import com.example.ehub.models.Team;
import com.example.ehub.repositories.SubmissionRepository;
import com.example.ehub.repositories.TeamRepository;
import com.example.ehub.services.AiService;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final AiService aiService;

    // Injected AiService here
    public SubmissionController(SubmissionRepository submissionRepository, TeamRepository teamRepository, AiService aiService) {
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
        if (teamOpt.isEmpty()) return ResponseEntity.badRequest().body("Team not found");

        Submission submission = new Submission();
        submission.setTeam(teamOpt.get());
        submission.setGithubUrl(request.githubUrl());
        submission.setStatus(SubmissionStatus.PENDING);

        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    // New Endpoint for Organizers
    @PostMapping("/{id}/evaluate")
    public ResponseEntity<?> evaluateSubmission(@PathVariable Long id) {
        Optional<Submission> submissionOpt = submissionRepository.findById(id);
        if (submissionOpt.isEmpty()) return ResponseEntity.badRequest().body("Submission not found");

        Submission submission = submissionOpt.get();
        
        // Trigger the async worker
        aiService.evaluateSubmission(submission); 

        return ResponseEntity.ok("Evaluation started in the background.");
    }

    @GetMapping("/leaderboard")
public List<Submission> getLeaderboard() {
    return submissionRepository.findByStatusOrderByAiScoreDesc(SubmissionStatus.EVALUATED);
}
}

record SubmitDto(Long teamId, String githubUrl) {}
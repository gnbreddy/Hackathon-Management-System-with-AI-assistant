package com.example.ehub.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ehub.models.Submission;
import com.example.ehub.models.SubmissionStatus;
import com.example.ehub.models.Team;
import com.example.ehub.repositories.SubmissionRepository;
import com.example.ehub.repositories.TeamRepository;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;

    public SubmissionController(SubmissionRepository submissionRepository, TeamRepository teamRepository) {
        this.submissionRepository = submissionRepository;
        this.teamRepository = teamRepository;
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
}

record SubmitDto(Long teamId, String githubUrl) {}
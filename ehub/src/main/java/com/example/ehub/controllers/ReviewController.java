package com.example.ehub.controllers;

import com.example.ehub.models.*;
import com.example.ehub.repositories.*;
import com.example.ehub.services.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final SubmissionRepository submissionRepository;
    private final AiService aiService;

    public ReviewController(ReviewRepository reviewRepository,
            SubmissionRepository submissionRepository,
            AiService aiService) {
        this.reviewRepository = reviewRepository;
        this.submissionRepository = submissionRepository;
        this.aiService = aiService;
    }

    /**
     * Get all reviews for a submission (visible to both organizer and participant)
     */
    @GetMapping("/submission/{submissionId}")
    public List<Review> getReviewsBySubmission(@PathVariable Long submissionId) {
        return reviewRepository.findBySubmissionId(submissionId);
    }

    /** Create or update a review for a submission */
    @PostMapping
    public ResponseEntity<?> createOrUpdateReview(@RequestBody ReviewDto request) {
        Optional<Submission> submissionOpt = submissionRepository.findById(request.submissionId());
        if (submissionOpt.isEmpty())
            return ResponseEntity.badRequest().body("Submission not found");

        // If review for this round already exists, update it instead of creating
        // duplicate
        List<Review> existing = reviewRepository.findBySubmissionIdAndRoundNumber(
                request.submissionId(), request.roundNumber());

        Review review = existing.isEmpty() ? new Review() : existing.get(0);
        review.setSubmission(submissionOpt.get());
        review.setRoundNumber(request.roundNumber());
        review.setAssignedComponents(request.assignedComponents());
        review.setFeedback(request.feedback());
        review.setOrganizerScore(request.organizerScore());
        review.setReviewedAt(LocalDateTime.now());

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    /** Update only the organizer score + feedback (allow edits anytime) */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody ReviewUpdateDto request) {
        Optional<Review> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Review review = reviewOpt.get();
        if (request.feedback() != null)
            review.setFeedback(request.feedback());
        if (request.organizerScore() != null)
            review.setOrganizerScore(request.organizerScore());
        if (request.assignedComponents() != null)
            review.setAssignedComponents(request.assignedComponents());
        review.setReviewedAt(LocalDateTime.now());

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    /** Optionally run AI scoring for a specific review */
    @PostMapping("/{id}/ai-score")
    public ResponseEntity<?> runAiScore(@PathVariable Long id) {
        Optional<Review> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Review review = reviewOpt.get();
        Submission submission = review.getSubmission();

        // Reuse AI service asynchronously (it will update the submission's
        // aiScore/aiSummary)
        aiService.evaluateSubmission(submission);

        return ResponseEntity.ok("AI scoring started. Refresh in a moment to see results.");
    }
}

record ReviewDto(Long submissionId, int roundNumber, String assignedComponents,
        String feedback, Integer organizerScore) {
}

record ReviewUpdateDto(String feedback, Integer organizerScore, String assignedComponents) {
}

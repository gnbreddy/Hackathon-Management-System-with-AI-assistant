package com.example.ehub.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(nullable = false)
    private int roundNumber; // 1 or 2

    @Column(columnDefinition = "TEXT")
    private String assignedComponents; // Round 1: extra components assigned by organizer

    @Column(columnDefinition = "TEXT")
    private String feedback; // Organizer's written comment

    private Integer organizerScore; // Official score, manually set by organizer

    private Integer aiScore; // Optional AI-generated score

    @Column(columnDefinition = "TEXT")
    private String aiSummary; // AI justification

    private LocalDateTime reviewedAt = LocalDateTime.now();

    public Review() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Submission getSubmission() {
        return submission;
    }

    public void setSubmission(Submission submission) {
        this.submission = submission;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public String getAssignedComponents() {
        return assignedComponents;
    }

    public void setAssignedComponents(String assignedComponents) {
        this.assignedComponents = assignedComponents;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public Integer getOrganizerScore() {
        return organizerScore;
    }

    public void setOrganizerScore(Integer organizerScore) {
        this.organizerScore = organizerScore;
    }

    public Integer getAiScore() {
        return aiScore;
    }

    public void setAiScore(Integer aiScore) {
        this.aiScore = aiScore;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}

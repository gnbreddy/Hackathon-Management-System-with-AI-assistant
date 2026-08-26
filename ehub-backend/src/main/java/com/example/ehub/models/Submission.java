package com.example.ehub.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false, unique = true)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "github_url", nullable = false)
    private String githubUrl;

    @Column(name = "commit_hash")
    private String commitHash;

    @Column(name = "demo_url")
    private String demoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(name = "code_quality_score")
    private Double codeQualityScore = 0.0;

    @Column(name = "completeness_score")
    private Double completenessScore = 0.0;

    @Column(name = "documentation_score")
    private Double documentationScore = 0.0;

    @Column(name = "innovation_score")
    private Double innovationScore = 0.0;

    @Column(name = "total_score")
    private Double totalScore = 0.0;

    @Column(name = "ai_feedback_summary", columnDefinition = "TEXT")
    private String aiFeedbackSummary;

    @Column(name = "ai_strengths", columnDefinition = "TEXT")
    private String aiStrengths;

    @Column(name = "ai_weaknesses", columnDefinition = "TEXT")
    private String aiWeaknesses;

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    public Submission() {
    }

    public Submission(Team team, Event event, String githubUrl, String demoUrl, String description) {
        this.team = team;
        this.event = event;
        this.githubUrl = githubUrl;
        this.demoUrl = demoUrl;
        this.description = description;
        this.status = SubmissionStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        if (this.submittedAt == null) {
            this.submittedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getCommitHash() {
        return commitHash;
    }

    public void setCommitHash(String commitHash) {
        this.commitHash = commitHash;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public Double getCodeQualityScore() {
        return codeQualityScore;
    }

    public void setCodeQualityScore(Double codeQualityScore) {
        this.codeQualityScore = codeQualityScore;
    }

    public Double getCompletenessScore() {
        return completenessScore;
    }

    public void setCompletenessScore(Double completenessScore) {
        this.completenessScore = completenessScore;
    }

    public Double getDocumentationScore() {
        return documentationScore;
    }

    public void setDocumentationScore(Double documentationScore) {
        this.documentationScore = documentationScore;
    }

    public Double getInnovationScore() {
        return innovationScore;
    }

    public void setInnovationScore(Double innovationScore) {
        this.innovationScore = innovationScore;
    }

    public Double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }

    public String getAiFeedbackSummary() {
        return aiFeedbackSummary;
    }

    public void setAiFeedbackSummary(String aiFeedbackSummary) {
        this.aiFeedbackSummary = aiFeedbackSummary;
    }

    public String getAiStrengths() {
        return aiStrengths;
    }

    public void setAiStrengths(String aiStrengths) {
        this.aiStrengths = aiStrengths;
    }

    public String getAiWeaknesses() {
        return aiWeaknesses;
    }

    public void setAiWeaknesses(String aiWeaknesses) {
        this.aiWeaknesses = aiWeaknesses;
    }

    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }

    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}

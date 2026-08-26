package com.example.ehub.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "max_team_size", nullable = false)
    private int maxTeamSize = 4;

    @Column(name = "min_team_size", nullable = false)
    private int minTeamSize = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_phase", nullable = false)
    private EventPhase currentPhase = EventPhase.REGISTRATION;

    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;

    @Column(name = "coding_deadline")
    private LocalDateTime codingDeadline;

    @Column(name = "judging_deadline")
    private LocalDateTime judgingDeadline;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;

    @Column(name = "event_code", nullable = false, unique = true)
    private String eventCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Event() {
    }

    public Event(String title, String description, int maxTeamSize, int minTeamSize, User createdBy) {
        this.title = title;
        this.description = description;
        this.maxTeamSize = maxTeamSize;
        this.minTeamSize = minTeamSize;
        this.createdBy = createdBy;
        this.currentPhase = EventPhase.REGISTRATION;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public int getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(int maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }

    public int getMinTeamSize() {
        return minTeamSize;
    }

    public void setMinTeamSize(int minTeamSize) {
        this.minTeamSize = minTeamSize;
    }

    public EventPhase getCurrentPhase() {
        return currentPhase;
    }

    public void setCurrentPhase(EventPhase currentPhase) {
        this.currentPhase = currentPhase;
    }

    public LocalDateTime getRegistrationDeadline() {
        return registrationDeadline;
    }

    public void setRegistrationDeadline(LocalDateTime registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public LocalDateTime getCodingDeadline() {
        return codingDeadline;
    }

    public void setCodingDeadline(LocalDateTime codingDeadline) {
        this.codingDeadline = codingDeadline;
    }

    public LocalDateTime getJudgingDeadline() {
        return judgingDeadline;
    }

    public void setJudgingDeadline(LocalDateTime judgingDeadline) {
        this.judgingDeadline = judgingDeadline;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getEventCode() {
        return eventCode;
    }

    public void setEventCode(String eventCode) {
        this.eventCode = eventCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

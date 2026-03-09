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
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String problemStatement;

    private String imageUrl;

    private String venue;

    private LocalDateTime eventDate;

    @Enumerated(EnumType.STRING)
    private EventPhase currentPhase = EventPhase.REGISTRATION;

    @Column(nullable = false)
    private Integer maxTeamSize = 4;

    /** 0 = not published, 1 = after round 1, 2 = after round 2 */
    @Column(nullable = false)
    private int leaderboardPublishedRound = 0;

    public Event() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProblemStatement() {
        return problemStatement;
    }

    public void setProblemStatement(String problemStatement) {
        this.problemStatement = problemStatement;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public EventPhase getCurrentPhase() {
        return currentPhase;
    }

    public void setCurrentPhase(EventPhase currentPhase) {
        this.currentPhase = currentPhase;
    }

    public Integer getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(Integer maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }

    public int getLeaderboardPublishedRound() {
        return leaderboardPublishedRound;
    }

    public void setLeaderboardPublishedRound(int leaderboardPublishedRound) {
        this.leaderboardPublishedRound = leaderboardPublishedRound;
    }
}

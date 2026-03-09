package com.example.ehub.models;

import java.util.List;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    @ManyToMany
    @JoinTable(name = "team_members", joinColumns = @JoinColumn(name = "team_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> members;

    @ElementCollection
    @CollectionTable(name = "team_tags", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "tag")
    private List<String> lookingForTags;

    @Column(nullable = false)
    private boolean disqualified = false;

    private Integer qualificationRound; // Round in which team was disqualified or qualified

    public Team() {
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

    public User getLeader() {
        return leader;
    }

    public void setLeader(User leader) {
        this.leader = leader;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members;
    }

    public List<String> getLookingForTags() {
        return lookingForTags;
    }

    public void setLookingForTags(List<String> lookingForTags) {
        this.lookingForTags = lookingForTags;
    }

    public boolean isDisqualified() {
        return disqualified;
    }

    public void setDisqualified(boolean disqualified) {
        this.disqualified = disqualified;
    }

    public Integer getQualificationRound() {
        return qualificationRound;
    }

    public void setQualificationRound(Integer qualificationRound) {
        this.qualificationRound = qualificationRound;
    }
}
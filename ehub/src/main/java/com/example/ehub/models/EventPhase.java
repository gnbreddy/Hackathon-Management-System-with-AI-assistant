package com.example.ehub.models;

public enum EventPhase {
    REGISTRATION, // Teams can register
    REVIEW_1, // First review - organizer assigns extra components
    CODING, // Teams implement assigned components
    REVIEW_2, // Second review - evaluate implementation
    FINISHED // Hackathon concluded, winners announced
}
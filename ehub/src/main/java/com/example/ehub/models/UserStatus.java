package com.example.ehub.models;

public enum UserStatus {
    PENDING, // Registered but OTP not yet verified
    ACTIVE // OTP verified, can log in
}

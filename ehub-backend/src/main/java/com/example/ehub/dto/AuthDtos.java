package com.example.ehub.dto;

import com.example.ehub.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Registration number is required")
        String registrationNumber,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        Role role
    ) {}

    public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        String password
    ) {}

    public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        String registrationNumber,
        Role role,
        boolean requiresOtpVerification,
        String message,
        String otpPreview
    ) {
        public AuthResponse(String token, String tokenType, Long userId, String fullName, String email, String registrationNumber, Role role, boolean requiresOtpVerification, String message) {
            this(token, tokenType, userId, fullName, email, registrationNumber, role, requiresOtpVerification, message, null);
        }

        public AuthResponse(String token, Long userId, String fullName, String email, String registrationNumber, Role role) {
            this(token, "Bearer", userId, fullName, email, registrationNumber, role, false, "Authentication successful", null);
        }
    }

    public record VerifyOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "OTP code is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        String otpCode
    ) {}

    public record ResendOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email
    ) {}

    public record UserProfileDto(
        Long id,
        String fullName,
        String email,
        String registrationNumber,
        Role role,
        boolean verified
    ) {}
}

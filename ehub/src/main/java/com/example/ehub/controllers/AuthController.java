package com.example.ehub.controllers;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ehub.models.Role;
import com.example.ehub.models.User;
import com.example.ehub.repositories.UserRepository;
import com.example.ehub.services.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDto request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().body("Username already taken.");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        // Role assignment based on email domain
        if (request.email() != null && request.email().toLowerCase().endsWith("@vitap.ac.in")) {
            user.setRole(Role.ORGANIZER);
        } else {
            user.setRole(Role.PARTICIPANT);
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setRegistrationNumber(request.registrationNumber());
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDto request) {
        Optional<User> userOpt = userRepository.findByUsername(request.username());

        if (userOpt.isPresent() && passwordEncoder.matches(request.password(), userOpt.get().getPasswordHash())) {
            String token = jwtService.generateToken(userOpt.get());
            return ResponseEntity.ok(token);
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }
}

// DTOs using Java 14+ Records for brevity
record RegisterDto(String username, String password, String fullName, String email, String registrationNumber) {
}

record LoginDto(String username, String password) {
}
package com.example.ehub.controllers;

import com.example.ehub.models.Role;
import com.example.ehub.models.User;
import com.example.ehub.models.UserStatus;
import com.example.ehub.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        User user = userOpt.get();
        return ResponseEntity.ok(new UserProfileResponse(
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getRegistrationNumber(),
            user.getRole(),
            user.getStatus()
        ));
    }
}

record UserProfileResponse(
    String username,
    String fullName,
    String email,
    String registrationNumber,
    Role role,
    UserStatus status
) {}

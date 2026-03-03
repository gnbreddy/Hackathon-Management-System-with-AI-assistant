package com.example.ehub.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ehub.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Spring Data JPA will automatically generate the SQL for this!
    Optional<User> findByUsername(String username);
    
    // Useful for validation during registration
    Boolean existsByUsername(String username);
}
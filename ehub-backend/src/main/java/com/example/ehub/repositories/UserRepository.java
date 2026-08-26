package com.example.ehub.repositories;

import com.example.ehub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRegistrationNumber(String registrationNumber);
    boolean existsByEmail(String email);
    boolean existsByRegistrationNumber(String registrationNumber);
}

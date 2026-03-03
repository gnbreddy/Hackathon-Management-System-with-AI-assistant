package com.example.ehub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ehub.models.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
}
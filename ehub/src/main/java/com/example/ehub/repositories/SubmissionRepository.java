package com.example.ehub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ehub.models.Submission;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
}
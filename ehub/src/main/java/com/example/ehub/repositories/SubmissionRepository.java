package com.example.ehub.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ehub.models.Submission;
import com.example.ehub.models.SubmissionStatus;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStatusOrderByAiScoreDesc(SubmissionStatus status);
}
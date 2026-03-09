package com.example.ehub.repositories;

import com.example.ehub.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findBySubmissionId(Long submissionId);

    List<Review> findBySubmissionIdAndRoundNumber(Long submissionId, int roundNumber);
}

package com.example.ehub.repositories;

import com.example.ehub.models.Submission;
import com.example.ehub.models.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByTeamId(Long teamId);
    List<Submission> findByEventId(Long eventId);
    List<Submission> findByEventIdAndStatus(Long eventId, SubmissionStatus status);
    long countByEventId(Long eventId);
    boolean existsByTeamId(Long teamId);

    @Query("SELECT s FROM Submission s WHERE s.event.id = :eventId AND s.status = 'EVALUATED' ORDER BY s.totalScore DESC, s.codeQualityScore DESC, s.submittedAt ASC")
    List<Submission> findLeaderboardByEventId(@Param("eventId") Long eventId);
}

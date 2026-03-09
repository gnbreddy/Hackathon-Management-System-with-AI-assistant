package com.example.ehub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.ehub.models.Team;
import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByEventId(Long eventId);

    /**
     * Returns true if any team in the given event already has this user as a member
     */
    @Query("SELECT COUNT(t) > 0 FROM Team t JOIN t.members m WHERE t.event.id = :eventId AND m.id = :userId")
    boolean existsMemberInEvent(@Param("eventId") Long eventId, @Param("userId") Long userId);
}

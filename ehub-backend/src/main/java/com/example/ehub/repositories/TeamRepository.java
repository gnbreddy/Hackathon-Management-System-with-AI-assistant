package com.example.ehub.repositories;

import com.example.ehub.models.Event;
import com.example.ehub.models.Team;
import com.example.ehub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByJoinCode(String joinCode);
    List<Team> findByEventId(Long eventId);
    List<Team> findByEvent(Event event);
    long countByEventId(Long eventId);

    @Query("SELECT t FROM Team t JOIN t.members m WHERE m = :user")
    List<Team> findTeamsByUser(@Param("user") User user);

    @Query("SELECT t FROM Team t JOIN t.members m WHERE m = :user AND t.event.id = :eventId")
    Optional<Team> findUserTeamInEvent(@Param("user") User user, @Param("eventId") Long eventId);
}

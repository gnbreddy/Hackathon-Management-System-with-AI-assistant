package com.example.ehub.repositories;

import com.example.ehub.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByCreatedAtDesc();
    List<Event> findByIsPublicTrueOrderByCreatedAtDesc();
    Optional<Event> findByEventCode(String eventCode);
}

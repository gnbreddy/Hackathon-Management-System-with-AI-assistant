package com.example.ehub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ehub.models.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
}
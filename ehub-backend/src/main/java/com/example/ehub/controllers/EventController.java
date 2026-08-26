package com.example.ehub.controllers;

import com.example.ehub.dto.EventDtos.CreateEventRequest;
import com.example.ehub.dto.EventDtos.EventResponseDto;
import com.example.ehub.dto.EventDtos.UnlockEventRequest;
import com.example.ehub.dto.EventDtos.UpdatePhaseRequest;
import com.example.ehub.models.User;
import com.example.ehub.services.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDto>> getAllEvents(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventService.getAllEvents(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDto> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventDtoById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ORGANIZER')")
    public ResponseEntity<EventResponseDto> createEvent(
            @Valid @RequestBody CreateEventRequest req,
            @AuthenticationPrincipal User user) {
        EventResponseDto created = eventService.createEvent(req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/unlock")
    public ResponseEntity<EventResponseDto> unlockEventByCode(@Valid @RequestBody UnlockEventRequest req) {
        EventResponseDto event = eventService.unlockEventByCode(req.eventCode());
        return ResponseEntity.ok(event);
    }

    @PatchMapping("/{id}/phase")
    @PreAuthorize("hasAuthority('ROLE_ORGANIZER')")
    public ResponseEntity<EventResponseDto> updatePhase(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePhaseRequest req) {
        EventResponseDto updated = eventService.advancePhase(id, req);
        return ResponseEntity.ok(updated);
    }
}

package com.example.ehub.services;

import com.example.ehub.dto.EventDtos.CreateEventRequest;
import com.example.ehub.dto.EventDtos.EventResponseDto;
import com.example.ehub.dto.EventDtos.UpdatePhaseRequest;
import com.example.ehub.exceptions.PhaseConstraintException;
import com.example.ehub.exceptions.ResourceNotFoundException;
import com.example.ehub.models.Event;
import com.example.ehub.models.EventPhase;
import com.example.ehub.models.User;
import com.example.ehub.repositories.EventRepository;
import com.example.ehub.repositories.SubmissionRepository;
import com.example.ehub.repositories.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;

    public EventService(
            EventRepository eventRepository,
            TeamRepository teamRepository,
            SubmissionRepository submissionRepository) {
        this.eventRepository = eventRepository;
        this.teamRepository = teamRepository;
        this.submissionRepository = submissionRepository;
    }

    public List<EventResponseDto> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public EventResponseDto getEventDtoById(Long eventId) {
        Event event = getEventEntity(eventId);
        return mapToDto(event);
    }

    public Event getEventEntity(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
    }

    @Transactional
    public EventResponseDto createEvent(CreateEventRequest req, User organizer) {
        Event event = new Event();
        event.setTitle(req.title().trim());
        event.setDescription(req.description() != null ? req.description().trim() : "");
        event.setBannerUrl(req.bannerUrl());
        event.setMinTeamSize(req.minTeamSize() > 0 ? req.minTeamSize() : 1);
        event.setMaxTeamSize(req.maxTeamSize() >= event.getMinTeamSize() ? req.maxTeamSize() : 4);
        event.setCurrentPhase(EventPhase.REGISTRATION);
        event.setRegistrationDeadline(req.registrationDeadline());
        event.setCodingDeadline(req.codingDeadline());
        event.setJudgingDeadline(req.judgingDeadline());
        event.setCreatedBy(organizer);

        Event saved = eventRepository.save(event);
        return mapToDto(saved);
    }

    @Transactional
    public EventResponseDto advancePhase(Long eventId, UpdatePhaseRequest req) {
        Event event = getEventEntity(eventId);
        EventPhase current = event.getCurrentPhase();
        EventPhase target = req.targetPhase();

        if (current == target) {
            return mapToDto(event);
        }

        // Validate state transitions: REGISTRATION -> CODING -> JUDGING -> FINISHED
        boolean isValidTransition = switch (current) {
            case REGISTRATION -> target == EventPhase.CODING;
            case CODING -> target == EventPhase.JUDGING || target == EventPhase.REGISTRATION;
            case JUDGING -> target == EventPhase.FINISHED || target == EventPhase.CODING;
            case FINISHED -> false;
        };

        if (!isValidTransition) {
            throw new PhaseConstraintException(
                "Invalid phase transition from " + current + " to " + target +
                ". Lifecycle must progress: REGISTRATION -> CODING -> JUDGING -> FINISHED"
            );
        }

        event.setCurrentPhase(target);
        Event updated = eventRepository.save(event);
        return mapToDto(updated);
    }

    public EventResponseDto mapToDto(Event event) {
        long totalTeams = teamRepository.countByEventId(event.getId());
        long totalSubmissions = submissionRepository.countByEventId(event.getId());

        Long createdById = event.getCreatedBy() != null ? event.getCreatedBy().getId() : null;
        String createdByName = event.getCreatedBy() != null ? event.getCreatedBy().getFullName() : "Admin";

        return new EventResponseDto(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getBannerUrl(),
                event.getMinTeamSize(),
                event.getMaxTeamSize(),
                event.getCurrentPhase(),
                event.getRegistrationDeadline(),
                event.getCodingDeadline(),
                event.getJudgingDeadline(),
                createdById,
                createdByName,
                event.getCreatedAt(),
                totalTeams,
                totalSubmissions
        );
    }
}

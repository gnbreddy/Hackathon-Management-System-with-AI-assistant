package com.example.ehub.controllers;

import com.example.ehub.models.*;
import com.example.ehub.repositories.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;
    private final ReviewRepository reviewRepository;

    public EventController(EventRepository eventRepository, TeamRepository teamRepository,
            SubmissionRepository submissionRepository, ReviewRepository reviewRepository) {
        this.eventRepository = eventRepository;
        this.teamRepository = teamRepository;
        this.submissionRepository = submissionRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Event createEvent(@RequestBody EventCreateDto dto) {
        Event event = new Event();
        event.setName(dto.name());
        event.setDescription(dto.description());
        event.setProblemStatement(dto.problemStatement());
        event.setImageUrl(dto.imageUrl());
        event.setVenue(dto.venue());
        if (dto.eventDate() != null && !dto.eventDate().isBlank()) {
            try {
                event.setEventDate(LocalDateTime.parse(dto.eventDate(),
                        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")));
            } catch (DateTimeParseException e) {
                try {
                    event.setEventDate(LocalDateTime.parse(dto.eventDate()));
                } catch (DateTimeParseException ignored) {
                }
            }
        }
        event.setMaxTeamSize(dto.maxTeamSize() != null ? dto.maxTeamSize() : 4);
        event.setCurrentPhase(EventPhase.REGISTRATION);
        return eventRepository.save(event);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload."));
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path uploadPath = Paths.get("uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(newFilename);
            file.transferTo(filePath.toFile());

            String fileUrl = "/uploads/" + newFilename;
            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not upload the file: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/phase")
    public ResponseEntity<?> advancePhase(@PathVariable Long id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Event event = eventOpt.get();
        EventPhase[] phases = EventPhase.values();
        int currentIndex = event.getCurrentPhase().ordinal();
        if (currentIndex < phases.length - 1) {
            event.setCurrentPhase(phases[currentIndex + 1]);
            eventRepository.save(event);
            return ResponseEntity.ok("Phase advanced to: " + event.getCurrentPhase());
        }
        return ResponseEntity.badRequest().body("Event is already in the final phase.");
    }

    /**
     * Publish the leaderboard for a specific round.
     * After publishing, the leaderboard becomes visible to participants.
     */
    @PostMapping("/{id}/publish-leaderboard")
    public ResponseEntity<?> publishLeaderboard(@PathVariable Long id, @RequestParam int round) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Event event = eventOpt.get();
        event.setLeaderboardPublishedRound(round);
        eventRepository.save(event);
        return ResponseEntity.ok("Leaderboard published for round " + round);
    }

    /**
     * Returns the leaderboard for an event:
     * - Only non-disqualified teams
     * - Total score = sum of organizerScore across all reviews for all their
     * submissions
     * - Sorted descending by total score
     * - Only available when leaderboardPublishedRound > 0 (or organizer can always
     * see it)
     */
    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<?> getLeaderboard(@PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean organizerView) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Event event = eventOpt.get();

        // Participants can only see the leaderboard after it's been published
        if (!organizerView && event.getLeaderboardPublishedRound() == 0) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Team> teams = teamRepository.findByEventId(id).stream()
                .filter(t -> !t.isDisqualified())
                .collect(Collectors.toList());

        List<Map<String, Object>> entries = new ArrayList<>();
        for (Team team : teams) {
            List<Submission> submissions = submissionRepository.findByTeamId(team.getId());
            int totalScore = 0;
            List<Map<String, Object>> reviewDetails = new ArrayList<>();

            for (Submission sub : submissions) {
                List<Review> reviews = reviewRepository.findBySubmissionId(sub.getId());
                for (Review r : reviews) {
                    if (r.getOrganizerScore() != null)
                        totalScore += r.getOrganizerScore();
                    Map<String, Object> rd = new HashMap<>();
                    rd.put("roundNumber", r.getRoundNumber());
                    rd.put("organizerScore", r.getOrganizerScore());
                    rd.put("aiScore", r.getAiScore());
                    rd.put("feedback", r.getFeedback());
                    rd.put("assignedComponents", r.getAssignedComponents());
                    rd.put("submissionTitle", sub.getProjectTitle());
                    rd.put("submissionGithub", sub.getGithubUrl());
                    rd.put("submissionProblem", sub.getProblemStatement());
                    rd.put("submissionDescription", sub.getProjectDescription());
                    reviewDetails.add(rd);
                }
            }

            Map<String, Object> entry = new HashMap<>();
            entry.put("teamId", team.getId());
            entry.put("teamName", team.getName());
            entry.put("leaderUsername", team.getLeader() != null ? team.getLeader().getUsername() : "");
            entry.put("memberCount", team.getMembers() != null ? team.getMembers().size() : 0);
            entry.put("members",
                    team.getMembers() != null
                            ? team.getMembers().stream().map(m -> Map.of("id", m.getId(), "username", m.getUsername()))
                                    .collect(Collectors.toList())
                            : List.of());
            entry.put("totalScore", totalScore);
            entry.put("reviews", reviewDetails);
            entries.add(entry);
        }

        entries.sort((a, b) -> ((Integer) b.get("totalScore")).compareTo((Integer) a.get("totalScore")));
        return ResponseEntity.ok(entries);
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<?> finalizeEvent(@PathVariable Long id, @RequestBody FinalizeDto dto) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty())
            return ResponseEntity.notFound().build();

        List<Team> allTeams = teamRepository.findByEventId(id);
        Set<Long> winnerIds = new HashSet<>(dto.winnerTeamIds());

        for (Team team : allTeams) {
            if (!winnerIds.contains(team.getId())) {
                team.setDisqualified(true);
                team.setQualificationRound(dto.finalRound());
            }
        }
        teamRepository.saveAll(allTeams);

        Event event = eventOpt.get();
        event.setCurrentPhase(EventPhase.FINISHED);
        eventRepository.save(event);

        return ResponseEntity.ok("Event finalized. Winners announced.");
    }
}

record EventCreateDto(String name, String description, String problemStatement,
        String imageUrl, String venue, String eventDate, Integer maxTeamSize) {
}

record FinalizeDto(List<Long> winnerTeamIds, int finalRound) {
}
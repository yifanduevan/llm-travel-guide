package com.ece651.backend.api.controller;

import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.llm.LlmService;
import com.ece651.backend.llm.dto.ItineraryResponseLlmDto;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips")
public class LlmController {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final LlmService llmService;

    private UUID getCurrentUserId() {
        return userRepository.findAll().stream()
                .findFirst()
                .map(User::getId)
                .orElse(null);
    }

    public LlmController(
            TripRepository tripRepository,
            UserRepository userRepository,
            LlmService llmService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.llmService = llmService;
    }

    @PostMapping("/{id}/generate-itinerary")
    public ResponseEntity<ItineraryResponseLlmDto> generateItinerary(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        Trip trip = tripRepository
                .findByIdAndUserId(id, userId)
                .orElse(null);

        if (trip == null) {
            return ResponseEntity.notFound().build();
        }

        ItineraryResponseLlmDto response = llmService.generateItinerary(trip);
        if (response == null) {
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok(response);
    }
}

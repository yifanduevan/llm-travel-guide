package com.ece651.backend.api.controller;

import com.ece651.backend.api.dto.LlmItineraryRequest;
import com.ece651.backend.api.dto.LlmItineraryResponse;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.llm.dto.ItineraryDayLlmDto;
import com.ece651.backend.llm.dto.ItineraryItemLlmDto;
import com.ece651.backend.llm.dto.ItineraryResponseLlmDto;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import com.ece651.backend.service.LlmItineraryPersistenceService;
import com.ece651.backend.service.LlmService;
import java.util.List;
import java.util.UUID;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
    private final LlmItineraryPersistenceService itineraryPersistenceService;

    private UUID getCurrentUserId() {
        return userRepository.findAll().stream()
                .findFirst()
                .map(User::getId)
                .orElse(null);
    }

    public LlmController(
            TripRepository tripRepository,
            UserRepository userRepository,
            LlmService llmService,
            LlmItineraryPersistenceService itineraryPersistenceService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.llmService = llmService;
        this.itineraryPersistenceService = itineraryPersistenceService;
    }

    @PostMapping("/{id}/generate-itinerary")
    @Transactional
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

        LlmItineraryRequest request = toRequest(id, trip);
        LlmItineraryResponse generated = llmService.generateItinerary(request);
        ItineraryResponseLlmDto response = toLegacyResponse(generated);
        if (response == null) {
            return ResponseEntity.internalServerError().build();
        }
        itineraryPersistenceService.persistGeneratedItinerary(trip, generated);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/itinerary")
    public ResponseEntity<ItineraryResponseLlmDto> getItinerary(@PathVariable UUID id) {
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

        return ResponseEntity.ok(itineraryPersistenceService.getPersistedItinerary(id));
    }

    private LlmItineraryRequest toRequest(UUID tripId, Trip trip) {
        String destination = nonBlank(trip.getTitleOrDestination(), "Unknown destination");
        String startDate = trip.getStartDate() == null ? "Unknown start date" : trip.getStartDate().toString();
        String endDate = trip.getEndDate() == null ? "Unknown end date" : trip.getEndDate().toString();
        String travelers = trip.getTravelers() == null ? "unknown" : trip.getTravelers().name().toLowerCase();
        String budget = trip.getBudget() == null ? "unknown" : trip.getBudget().name().toLowerCase();
        String notes = trip.getNotes() == null ? "" : trip.getNotes();

        return new LlmItineraryRequest(
                tripId.toString(),
                new LlmItineraryRequest.TripPayload(destination, startDate, endDate, travelers, budget, notes));
    }

    private ItineraryResponseLlmDto toLegacyResponse(LlmItineraryResponse response) {
        if (response == null) {
            return null;
        }

        List<ItineraryDayLlmDto> days = response.days().stream()
                .map(day -> new ItineraryDayLlmDto(
                        day.date(),
                        day.items().stream()
                                .map(item -> new ItineraryItemLlmDto(
                                        item.title(),
                                        item.description(),
                                        item.time(),
                                        "unspecified",
                                        item.locationText()))
                                .toList()))
                .toList();
        return new ItineraryResponseLlmDto(days);
    }

    private String nonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

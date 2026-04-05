package com.ece651.backend.api.controller;

import com.ece651.backend.api.dto.AccommodationDto;
import com.ece651.backend.api.dto.AccommodationRequest;
import com.ece651.backend.api.mapper.AccommodationMapper;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.repository.AccommodationRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips/{tripId}/accommodations")
public class AccommodationController {
    private final AccommodationRepository accommodationRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    private static final String DEMO_USER_EMAIL = "demo@example.com";

    public AccommodationController(
            AccommodationRepository accommodationRepository,
            TripRepository tripRepository,
            UserRepository userRepository) {
        this.accommodationRepository = accommodationRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    // TODO replace with real auth.
    // Interim workaround: pin all access to a deterministic demo user.
    private UUID getCurrentUserId() {
        return userRepository.findByEmail(DEMO_USER_EMAIL).map(User::getId).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<AccommodationDto>> list(@PathVariable UUID tripId) {
        return tripForCurrentUser(tripId)
                .map(trip -> accommodationRepository.findByTripId(tripId).stream()
                        .map(AccommodationMapper::toDto)
                        .toList())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<AccommodationDto> create(
            @PathVariable UUID tripId, @Valid @RequestBody AccommodationRequest request) {
        return tripForCurrentUser(tripId)
                .map(trip -> {
                    var accommodation = AccommodationMapper.fromRequest(request, trip);
                    accommodationRepository.save(accommodation);
                    return AccommodationMapper.toDto(accommodation);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{accommodationId}")
    @Transactional
    public ResponseEntity<AccommodationDto> update(
            @PathVariable UUID tripId,
            @PathVariable UUID accommodationId,
            @Valid @RequestBody AccommodationRequest request) {
        return tripForCurrentUser(tripId)
                .flatMap(trip -> accommodationRepository.findByIdAndTripId(accommodationId, tripId))
                .map(accommodation -> {
                    AccommodationMapper.update(accommodation, request);
                    accommodationRepository.save(accommodation);
                    return AccommodationMapper.toDto(accommodation);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{accommodationId}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable UUID tripId, @PathVariable UUID accommodationId) {
        return tripForCurrentUser(tripId)
                .flatMap(trip -> accommodationRepository.findByIdAndTripId(accommodationId, tripId))
                .map(accommodation -> {
                    accommodationRepository.delete(accommodation);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private java.util.Optional<Trip> tripForCurrentUser(UUID tripId) {
        UUID currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return java.util.Optional.empty();
        }
        return tripRepository.findByIdAndUserId(tripId, currentUserId);
    }
}

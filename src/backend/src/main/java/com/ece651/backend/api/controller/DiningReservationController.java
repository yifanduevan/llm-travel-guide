package com.ece651.backend.api.controller;

import com.ece651.backend.api.dto.DiningReservationDto;
import com.ece651.backend.api.dto.DiningReservationRequest;
import com.ece651.backend.api.mapper.DiningReservationMapper;
import com.ece651.backend.domain.entity.DiningReservation;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.repository.DiningReservationRepository;
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
@RequestMapping("/api/trips/{tripId}/dining-reservations")
public class DiningReservationController {
    private final DiningReservationRepository diningReservationRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // TODO replace with real auth
    private UUID getCurrentUserId() {
        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(null);
    }

    public DiningReservationController(
            DiningReservationRepository diningReservationRepository,
            TripRepository tripRepository,
            UserRepository userRepository) {
        this.diningReservationRepository = diningReservationRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }
    @GetMapping
    public ResponseEntity<List<DiningReservationDto>> list(@PathVariable UUID tripId) {
        return tripForCurrentUser(tripId)
                .map(trip -> diningReservationRepository.findByTripId(tripId).stream()
                        .map(DiningReservationMapper::toDto)
                        .toList())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    @Transactional
    public ResponseEntity<DiningReservationDto> create(
            @PathVariable UUID tripId,
            @Valid @RequestBody DiningReservationRequest request) {
        return tripForCurrentUser(tripId)
                .map(trip -> {
                    DiningReservation reservation =
                            DiningReservationMapper.fromRequest(request, trip);
                    diningReservationRepository.save(reservation);
                    return DiningReservationMapper.toDto(reservation);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{reservationId}")
    @Transactional
    public ResponseEntity<DiningReservationDto> update(
            @PathVariable UUID tripId,
            @PathVariable UUID reservationId,
            @Valid @RequestBody DiningReservationRequest request) {
        return tripForCurrentUser(tripId)
                .flatMap(trip -> diningReservationRepository.findByIdAndTripId(reservationId, tripId))
                .map(reservation -> {
                    DiningReservationMapper.update(reservation, request);
                    diningReservationRepository.save(reservation);
                    return DiningReservationMapper.toDto(reservation);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{reservationId}")
    @Transactional
    public ResponseEntity<Void> delete(
            @PathVariable UUID tripId, @PathVariable UUID reservationId) {
        return tripForCurrentUser(tripId)
                .flatMap(trip -> diningReservationRepository.findByIdAndTripId(reservationId, tripId))
                .map(reservation -> {
                    diningReservationRepository.delete(reservation);
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
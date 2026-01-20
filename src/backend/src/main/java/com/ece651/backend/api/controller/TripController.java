package com.ece651.backend.api.controller;

import com.ece651.backend.api.dto.TripDto;
import com.ece651.backend.api.dto.TripRequest;
import com.ece651.backend.api.mapper.TripMapper;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
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
@RequestMapping("/api/trips")
public class TripController {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // TODO replace with real auth. For now, use the first user.
    private UUID getCurrentUserId() {
        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(null);
    }

    public TripController(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<TripDto> listTrips() {
        UUID userId = getCurrentUserId();
        return tripRepository.findByUserId(userId).stream().map(TripMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getTrip(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        return tripRepository
                .findByIdAndUserId(id, userId)
                .map(TripMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TripDto> createTrip(@Valid @RequestBody TripRequest request) {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        User user = userRepository.findById(userId).orElseThrow();
        Trip trip = TripMapper.fromRequest(request, user);
        tripRepository.save(trip);
        return ResponseEntity.ok(TripMapper.toDto(trip));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<TripDto> updateTrip(@PathVariable UUID id, @Valid @RequestBody TripRequest request) {
        UUID userId = getCurrentUserId();
        return tripRepository
                .findByIdAndUserId(id, userId)
                .map(trip -> {
                    TripMapper.update(trip, request);
                    return ResponseEntity.ok(TripMapper.toDto(trip));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTrip(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        return tripRepository
                .findByIdAndUserId(id, userId)
                .map(trip -> {
                    tripRepository.delete(trip);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

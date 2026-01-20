package com.ece651.backend.api.controller;

import com.ece651.backend.api.dto.TransportSegmentDto;
import com.ece651.backend.api.dto.TransportSegmentRequest;
import com.ece651.backend.api.mapper.TransportSegmentMapper;
import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.repository.TransportSegmentRepository;
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
@RequestMapping("/api/trips/{tripId}/transport-segments")
public class TransportSegmentController {

    private final TransportSegmentRepository transportSegmentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // TODO replace with real auth
    private UUID getCurrentUserId() {
        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(null);
    }

    public TransportSegmentController(
            TransportSegmentRepository transportSegmentRepository,
            TripRepository tripRepository,
            UserRepository userRepository) {
        this.transportSegmentRepository = transportSegmentRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<TransportSegmentDto>> list(@PathVariable UUID tripId) {
        return tripForCurrentUser(tripId)
                .map(trip -> transportSegmentRepository.findByTripId(tripId).stream()
                        .map(TransportSegmentMapper::toDto)
                        .toList())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TransportSegmentDto> create(
            @PathVariable UUID tripId, @Valid @RequestBody TransportSegmentRequest request) {
        return tripForCurrentUser(tripId)
                .map(trip -> {
                    TransportSegment segment = TransportSegmentMapper.fromRequest(request, trip);
                    transportSegmentRepository.save(segment);
                    return ResponseEntity.ok(TransportSegmentMapper.toDto(segment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{segmentId}")
    @Transactional
    public ResponseEntity<TransportSegmentDto> update(
            @PathVariable UUID tripId,
            @PathVariable UUID segmentId,
            @Valid @RequestBody TransportSegmentRequest request) {
        return tripForCurrentUser(tripId)
                .flatMap(trip -> transportSegmentRepository.findByIdAndTripId(segmentId, tripId))
                .map(segment -> {
                    TransportSegmentMapper.update(segment, request);
                    return ResponseEntity.ok(TransportSegmentMapper.toDto(segment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{segmentId}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable UUID tripId, @PathVariable UUID segmentId) {
        return tripForCurrentUser(tripId)
                .flatMap(trip -> transportSegmentRepository.findByIdAndTripId(segmentId, tripId))
                .map(segment -> {
                    transportSegmentRepository.delete(segment);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private java.util.Optional<Trip> tripForCurrentUser(UUID tripId) {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return java.util.Optional.empty();
        }
        return tripRepository.findByIdAndUserId(tripId, userId);
    }
}

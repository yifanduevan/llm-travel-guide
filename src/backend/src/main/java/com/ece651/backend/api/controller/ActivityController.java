package com.ece651.backend.api.controller;

import com.ece651.backend.api.dto.ActivityDto;
import com.ece651.backend.api.mapper.ActivityMapper;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.repository.ActivityRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips/{tripId}/activities")
public class ActivityController {

    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public ActivityController(
            ActivityRepository activityRepository, TripRepository tripRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    // TODO replace with real auth
    private UUID getCurrentUserId() {
        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<ActivityDto>> list(@PathVariable UUID tripId) {
        return tripForCurrentUser(tripId)
                .map(trip -> activityRepository.findByTripId(tripId).stream()
                        .map(ActivityMapper::toDto)
                        .toList())
                .map(ResponseEntity::ok)
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

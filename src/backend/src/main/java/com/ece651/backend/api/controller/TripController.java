package com.ece651.backend.api.controller;

import com.ece651.backend.api.dto.TripDto;
import com.ece651.backend.api.dto.TripGenerateRequest;
import com.ece651.backend.api.dto.TripRequest;
import com.ece651.backend.api.mapper.TripMapper;
import com.ece651.backend.domain.entity.Accommodation;
import com.ece651.backend.domain.entity.Activity;
import com.ece651.backend.domain.entity.DiningReservation;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.AccommodationStatus;
import com.ece651.backend.domain.enums.ActivityStatus;
import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.TripStatus;
import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.repository.AccommodationRepository;
import com.ece651.backend.repository.ActivityRepository;
import com.ece651.backend.repository.DiningReservationRepository;
import com.ece651.backend.repository.TransportSegmentRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import com.ece651.backend.service.TripGenerationService;
import com.ece651.backend.service.TripGenerationResult;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.ArrayList;
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
    private final TransportSegmentRepository transportSegmentRepository;
    private final DiningReservationRepository diningReservationRepository;
    private final AccommodationRepository accommodationRepository;
    private final ActivityRepository activityRepository;
    private final TripGenerationService tripGenerationService;

    // TODO replace with real auth. For now, use the first user.
    private UUID getCurrentUserId() {
        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(null);
    }

    public TripController(
            TripRepository tripRepository,
            UserRepository userRepository,
            TransportSegmentRepository transportSegmentRepository,
            DiningReservationRepository diningReservationRepository,
            AccommodationRepository accommodationRepository,
            ActivityRepository activityRepository,
            TripGenerationService tripGenerationService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.transportSegmentRepository = transportSegmentRepository;
        this.diningReservationRepository = diningReservationRepository;
        this.accommodationRepository = accommodationRepository;
        this.activityRepository = activityRepository;
        this.tripGenerationService = tripGenerationService;
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

    @PostMapping("/generate")
    @Transactional
    public ResponseEntity<TripDto> generateTrip(@Valid @RequestBody TripGenerateRequest request) {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        User user = userRepository.findById(userId).orElseThrow();
        TripGenerationResult generatedPlan = tripGenerationService.generatePlan(request);
        TripRequest generatedRequest = new TripRequest(
                request.titleOrDestination(),
                request.startDate(),
                request.endDate(),
                request.travelers(),
                request.budget(),
                generatedPlan.notes(),
                TripStatus.DRAFT);

        Trip trip = TripMapper.fromRequest(generatedRequest, user);
        tripRepository.save(trip);
        createSuggestedData(trip, request, generatedPlan);
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

    private void createSuggestedData(Trip trip, TripGenerateRequest request, TripGenerationResult plan) {
        List<TransportSegment> transportSegments = new ArrayList<>();
        for (TripGenerationResult.TransportSuggestion suggestion : plan.transportSegments()) {
            TransportSegment segment = new TransportSegment();
            segment.setId(UUID.randomUUID());
            segment.setTrip(trip);
            segment.setType(suggestion.type());
            segment.setTitle(suggestion.title());
            segment.setStartLocation(suggestion.startLocation());
            segment.setEndLocation(suggestion.endLocation());
            segment.setDurationText(suggestion.durationText());
            segment.setStatus(TransportStatus.PLANNED);
            segment.setCompleted(Boolean.FALSE);
            transportSegments.add(segment);
        }
        if (!transportSegments.isEmpty()) {
            transportSegmentRepository.saveAll(transportSegments);
        }

        List<DiningReservation> diningReservations = new ArrayList<>();
        for (TripGenerationResult.DiningSuggestion suggestion : plan.diningReservations()) {
            DiningReservation dining = new DiningReservation();
            dining.setId(UUID.randomUUID());
            dining.setTrip(trip);
            dining.setName(suggestion.name());
            dining.setCuisine(suggestion.cuisine());
            dining.setPriceTier(suggestion.priceTier());
            dining.setStatus(DiningStatus.PENDING);
            dining.setNotes(suggestion.notes());
            dining.setPartySize(defaultPartySize(request));
            diningReservations.add(dining);
        }
        if (!diningReservations.isEmpty()) {
            diningReservationRepository.saveAll(diningReservations);
        }

        List<Accommodation> accommodations = new ArrayList<>();
        for (TripGenerationResult.AccommodationSuggestion suggestion : plan.accommodations()) {
            Accommodation accommodation = new Accommodation();
            accommodation.setId(UUID.randomUUID());
            accommodation.setTrip(trip);
            accommodation.setName(suggestion.name());
            accommodation.setAddress(suggestion.address());
            accommodation.setRoomType(suggestion.roomType());
            accommodation.setCheckIn(request.startDate());
            accommodation.setCheckOut(request.endDate());
            accommodation.setStatus(AccommodationStatus.PENDING);
            accommodation.setNotes(suggestion.notes());
            accommodations.add(accommodation);
        }
        if (!accommodations.isEmpty()) {
            accommodationRepository.saveAll(accommodations);
        }

        List<Activity> activities = new ArrayList<>();
        for (TripGenerationResult.ActivitySuggestion suggestion : plan.activities()) {
            Activity activity = new Activity();
            activity.setId(UUID.randomUUID());
            activity.setTrip(trip);
            activity.setTitle(suggestion.title());
            activity.setDescription(suggestion.description());
            activity.setDurationText(suggestion.durationText());
            activity.setTicketType(suggestion.ticketType());
            activity.setLanguage(suggestion.language());
            activity.setStatus(ActivityStatus.PLANNED);
            activity.setSaved(Boolean.FALSE);
            activity.setTimeOrDate(OffsetDateTime.now());
            activities.add(activity);
        }
        if (!activities.isEmpty()) {
            activityRepository.saveAll(activities);
        }
    }

    private int defaultPartySize(TripGenerateRequest request) {
        return switch (request.travelers()) {
            case SOLO -> 1;
            case COUPLE -> 2;
            case FAMILY -> 4;
            case GROUP -> 5;
        };
    }
}

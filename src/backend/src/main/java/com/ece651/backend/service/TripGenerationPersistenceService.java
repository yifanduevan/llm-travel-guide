package com.ece651.backend.service;

import com.ece651.backend.api.dto.TripGenerateRequest;
import com.ece651.backend.domain.entity.Accommodation;
import com.ece651.backend.domain.entity.Activity;
import com.ece651.backend.domain.entity.DiningReservation;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.enums.AccommodationStatus;
import com.ece651.backend.domain.enums.ActivityStatus;
import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.repository.AccommodationRepository;
import com.ece651.backend.repository.ActivityRepository;
import com.ece651.backend.repository.DiningReservationRepository;
import com.ece651.backend.repository.TransportSegmentRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TripGenerationPersistenceService {

    private final TransportSegmentRepository transportSegmentRepository;
    private final DiningReservationRepository diningReservationRepository;
    private final AccommodationRepository accommodationRepository;
    private final ActivityRepository activityRepository;
    private final GooglePlacesPhotoService placesPhotoService;

    public TripGenerationPersistenceService(
            TransportSegmentRepository transportSegmentRepository,
            DiningReservationRepository diningReservationRepository,
            AccommodationRepository accommodationRepository,
            ActivityRepository activityRepository,
            GooglePlacesPhotoService placesPhotoService) {
        this.transportSegmentRepository = transportSegmentRepository;
        this.diningReservationRepository = diningReservationRepository;
        this.accommodationRepository = accommodationRepository;
        this.activityRepository = activityRepository;
        this.placesPhotoService = placesPhotoService;
    }

    public void persistSuggestions(Trip trip, TripGenerateRequest request, TripGenerationResult plan) {
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
            dining.setAddress(suggestion.address());
            dining.setStatus(DiningStatus.PENDING);
            dining.setNotes(suggestion.notes());
            dining.setImageUrl(
                    placesPhotoService.fetchRestaurantPhotoUrl(suggestion.name(), request.titleOrDestination()));
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
            accommodation.setRate(suggestion.rate());
            accommodation.setCurrency(suggestion.currency());
            accommodation.setImageUrl(
                    placesPhotoService.fetchHotelPhotoUrl(suggestion.name(), request.titleOrDestination()));
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
            activity.setTimeOrDate(null);
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

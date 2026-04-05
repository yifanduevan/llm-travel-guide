package com.ece651.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.ece651.backend.api.dto.TripGenerateRequest;
import com.ece651.backend.domain.entity.Accommodation;
import com.ece651.backend.domain.entity.Activity;
import com.ece651.backend.domain.entity.DiningReservation;
import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.enums.AccommodationStatus;
import com.ece651.backend.domain.enums.ActivityStatus;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.PriceTier;
import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.repository.AccommodationRepository;
import com.ece651.backend.repository.ActivityRepository;
import com.ece651.backend.repository.DiningReservationRepository;
import com.ece651.backend.repository.TransportSegmentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TripGenerationPersistenceServiceTest {

    @Mock
    private TransportSegmentRepository transportSegmentRepository;

    @Mock
    private DiningReservationRepository diningReservationRepository;

    @Mock
    private AccommodationRepository accommodationRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private GooglePlacesPhotoService placesPhotoService;

    private TripGenerationPersistenceService service;

    @BeforeEach
    void setUp() {
        org.mockito.Mockito.lenient().when(placesPhotoService.fetchHotelPhotoUrl(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("https://example.com/hotel-photo.jpg");
        service = new TripGenerationPersistenceService(
                transportSegmentRepository,
                diningReservationRepository,
                accommodationRepository,
                activityRepository,
                placesPhotoService);
    }

    @Test
    void persistSuggestions_savesMappedEntities() {
        Trip trip = new Trip();
        trip.setId(UUID.randomUUID());

        TripGenerateRequest request = new TripGenerateRequest(
                "Tokyo",
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 5),
                Travelers.FAMILY,
                Budget.MEDIUM,
                List.of("food", "culture"));

        TripGenerationResult plan = new TripGenerationResult(
                "Family trip notes",
                List.of(new TripGenerationResult.TransportSuggestion(
                        TransportType.TRAIN,
                        "Narita Express",
                        "Narita Airport",
                        "Tokyo Station",
                        "53m")),
                List.of(new TripGenerationResult.DiningSuggestion(
                        "Sushi Place",
                        "Japanese",
                        PriceTier.TIER_2,
                        "Chiyoda, Tokyo",
                        "Book in advance")),
                List.of(new TripGenerationResult.AccommodationSuggestion(
                        "Tokyo Central Hotel",
                        "Chiyoda",
                        "Family Suite",
                        "Near station",
                        java.math.BigDecimal.valueOf(150),
                        "USD")),
                List.of(new TripGenerationResult.ActivitySuggestion(
                        "Skytree Visit",
                        "Observation deck",
                        "2h",
                        "Timed entry",
                        "English")));

        service.persistSuggestions(trip, request, plan);

        ArgumentCaptor<List<TransportSegment>> transportCaptor = ArgumentCaptor.forClass(List.class);
        verify(transportSegmentRepository).saveAll(transportCaptor.capture());
        TransportSegment transport = transportCaptor.getValue().get(0);
        assertThat(transport.getTrip()).isSameAs(trip);
        assertThat(transport.getType()).isEqualTo(TransportType.TRAIN);
        assertThat(transport.getStatus()).isEqualTo(TransportStatus.PLANNED);
        assertThat(transport.getCompleted()).isFalse();

        ArgumentCaptor<List<DiningReservation>> diningCaptor = ArgumentCaptor.forClass(List.class);
        verify(diningReservationRepository).saveAll(diningCaptor.capture());
        DiningReservation dining = diningCaptor.getValue().get(0);
        assertThat(dining.getTrip()).isSameAs(trip);
        assertThat(dining.getName()).isEqualTo("Sushi Place");
        assertThat(dining.getPriceTier()).isEqualTo(PriceTier.TIER_2);
        assertThat(dining.getStatus()).isEqualTo(DiningStatus.PENDING);
        assertThat(dining.getPartySize()).isEqualTo(4);

        ArgumentCaptor<List<Accommodation>> accommodationCaptor = ArgumentCaptor.forClass(List.class);
        verify(accommodationRepository).saveAll(accommodationCaptor.capture());
        Accommodation accommodation = accommodationCaptor.getValue().get(0);
        assertThat(accommodation.getTrip()).isSameAs(trip);
        assertThat(accommodation.getName()).isEqualTo("Tokyo Central Hotel");
        assertThat(accommodation.getCheckIn()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(accommodation.getCheckOut()).isEqualTo(LocalDate.of(2026, 6, 5));
        assertThat(accommodation.getStatus()).isEqualTo(AccommodationStatus.PENDING);

        ArgumentCaptor<List<Activity>> activityCaptor = ArgumentCaptor.forClass(List.class);
        verify(activityRepository).saveAll(activityCaptor.capture());
        Activity activity = activityCaptor.getValue().get(0);
        assertThat(activity.getTrip()).isSameAs(trip);
        assertThat(activity.getTitle()).isEqualTo("Skytree Visit");
        assertThat(activity.getStatus()).isEqualTo(ActivityStatus.PLANNED);
        assertThat(activity.getSaved()).isFalse();
        assertThat(activity.getTimeOrDate()).isNull();
    }

    @Test
    void persistSuggestions_skipsRepositoryWritesWhenSuggestionsAreEmpty() {
        Trip trip = new Trip();
        trip.setId(UUID.randomUUID());

        TripGenerateRequest request = new TripGenerateRequest(
                "Paris",
                LocalDate.of(2026, 9, 10),
                LocalDate.of(2026, 9, 12),
                Travelers.SOLO,
                Budget.BUDGET,
                List.of());

        TripGenerationResult plan = new TripGenerationResult(
                "Empty suggestions",
                List.of(),
                List.of(),
                List.of(),
                List.of());

        service.persistSuggestions(trip, request, plan);

        verify(transportSegmentRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
        verify(diningReservationRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
        verify(accommodationRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
        verify(activityRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
    }
}
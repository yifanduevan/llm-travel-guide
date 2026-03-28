package com.ece651.backend.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ece651.backend.api.dto.TripGenerateRequest;
import com.ece651.backend.api.dto.TripRequest;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import com.ece651.backend.service.TripGenerationPersistenceService;
import com.ece651.backend.service.TripGenerationResult;
import com.ece651.backend.service.TripGenerationService;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class TripControllerTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripGenerationService tripGenerationService;

    @Mock
    private TripGenerationPersistenceService tripGenerationPersistenceService;

    private TripController controller;
    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        controller = new TripController(
                tripRepository,
                userRepository,
                tripGenerationService,
                tripGenerationPersistenceService);

        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
    }

    @Test
    void listTrips_returnsMappedTripsForCurrentUser() {
        Trip trip = trip("Kyoto");
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByUserId(userId)).thenReturn(List.of(trip));

        var result = controller.listTrips();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(trip.getId());
        assertThat(result.get(0).titleOrDestination()).isEqualTo("Kyoto");
    }

    @Test
    void getTrip_returnsNotFoundWhenTripDoesNotExist() {
        UUID tripId = UUID.randomUUID();
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, userId)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.getTrip(tripId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void createTrip_returnsBadRequestWhenNoCurrentUser() {
        when(userRepository.findAll()).thenReturn(List.of());

        TripRequest request = new TripRequest(
                "Rome",
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 3),
                Travelers.COUPLE,
                Budget.MEDIUM,
                "notes",
                TripStatus.DRAFT);

        ResponseEntity<?> response = controller.createTrip(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void createTrip_savesTripAndReturnsDto() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        TripRequest request = new TripRequest(
                "Rome",
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 3),
                Travelers.COUPLE,
                Budget.MEDIUM,
                "notes",
                TripStatus.DRAFT);

        ResponseEntity<?> response = controller.createTrip(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(tripRepository).save(any(Trip.class));
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void generateTrip_returnsBadRequestWhenNoCurrentUser() {
        when(userRepository.findAll()).thenReturn(List.of());

        TripGenerateRequest request = new TripGenerateRequest(
                "Seoul",
                LocalDate.of(2026, 9, 10),
                LocalDate.of(2026, 9, 13),
                Travelers.SOLO,
                Budget.BUDGET,
                List.of("food"));

        ResponseEntity<?> response = controller.generateTrip(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void generateTrip_persistsTripAndSuggestions() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(tripGenerationService.generatePlan(any(TripGenerateRequest.class))).thenReturn(
                new TripGenerationResult(
                        "generated notes",
                        List.of(new TripGenerationResult.TransportSuggestion(
                                com.ece651.backend.domain.enums.TransportType.FLIGHT,
                                "Outbound flight",
                                "Home",
                                "Seoul",
                                "11h")),
                        List.of(),
                        List.of(),
                        List.of()));

        TripGenerateRequest request = new TripGenerateRequest(
                "Seoul",
                LocalDate.of(2026, 9, 10),
                LocalDate.of(2026, 9, 13),
                Travelers.SOLO,
                Budget.BUDGET,
                List.of("food"));

        ResponseEntity<?> response = controller.generateTrip(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        ArgumentCaptor<Trip> tripCaptor = ArgumentCaptor.forClass(Trip.class);
        verify(tripRepository).save(tripCaptor.capture());
        Trip savedTrip = tripCaptor.getValue();
        assertThat(savedTrip.getTitleOrDestination()).isEqualTo("Seoul");
        assertThat(savedTrip.getNotes()).isEqualTo("generated notes");

        verify(tripGenerationPersistenceService).persistSuggestions(
                any(Trip.class),
                any(TripGenerateRequest.class),
                any(TripGenerationResult.class));
    }

    @Test
    void updateTrip_returnsNotFoundWhenTripMissing() {
        UUID tripId = UUID.randomUUID();
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, userId)).thenReturn(Optional.empty());

        TripRequest request = new TripRequest(
                "Berlin",
                LocalDate.of(2026, 11, 2),
                LocalDate.of(2026, 11, 4),
                Travelers.GROUP,
                Budget.LUXURY,
                "updated",
                TripStatus.ACTIVE);

        ResponseEntity<?> response = controller.updateTrip(tripId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void updateTrip_updatesExistingTrip() {
        UUID tripId = UUID.randomUUID();
        Trip existing = trip("Old Title");
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, userId)).thenReturn(Optional.of(existing));

        TripRequest request = new TripRequest(
                "Berlin",
                LocalDate.of(2026, 11, 2),
                LocalDate.of(2026, 11, 4),
                Travelers.GROUP,
                Budget.LUXURY,
                "updated",
                TripStatus.ACTIVE);

        ResponseEntity<?> response = controller.updateTrip(tripId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(existing.getTitleOrDestination()).isEqualTo("Berlin");
        assertThat(existing.getStatus()).isEqualTo(TripStatus.ACTIVE);
    }

    @Test
    void deleteTrip_returnsNotFoundWhenTripMissing() {
        UUID tripId = UUID.randomUUID();
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, userId)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = controller.deleteTrip(tripId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteTrip_deletesTripAndReturnsNoContent() {
        UUID tripId = UUID.randomUUID();
        Trip existing = trip("Delete me");
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, userId)).thenReturn(Optional.of(existing));

        ResponseEntity<Void> response = controller.deleteTrip(tripId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(tripRepository).delete(existing);
    }

    private Trip trip(String title) {
        Trip trip = new Trip();
        trip.setId(UUID.randomUUID());
        trip.setUser(user);
        trip.setTitleOrDestination(title);
        trip.setStartDate(LocalDate.of(2026, 7, 1));
        trip.setEndDate(LocalDate.of(2026, 7, 3));
        trip.setTravelers(Travelers.COUPLE);
        trip.setBudget(Budget.MEDIUM);
        trip.setStatus(TripStatus.DRAFT);
        trip.setCreatedAt(OffsetDateTime.now());
        trip.setUpdatedAt(OffsetDateTime.now());
        return trip;
    }
}
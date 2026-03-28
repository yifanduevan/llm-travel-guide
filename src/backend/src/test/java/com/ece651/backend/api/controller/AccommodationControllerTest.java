package com.ece651.backend.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ece651.backend.api.dto.AccommodationRequest;
import com.ece651.backend.domain.entity.Accommodation;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.AccommodationStatus;
import com.ece651.backend.repository.AccommodationRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class AccommodationControllerTest {

    @Mock
    private AccommodationRepository accommodationRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    private AccommodationController controller;
    private User user;
    private Trip trip;
    private UUID tripId;

    @BeforeEach
    void setUp() {
        controller = new AccommodationController(accommodationRepository, tripRepository, userRepository);
        user = new User();
        user.setId(UUID.randomUUID());
        tripId = UUID.randomUUID();
        trip = new Trip();
        trip.setId(tripId);
        trip.setUser(user);
    }

    @Test
    void list_returnsNotFoundWhenCurrentUserMissing() {
        when(userRepository.findAll()).thenReturn(List.of());

        var response = controller.list(tripId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void create_returnsOkWhenTripExists() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));

        AccommodationRequest request = new AccommodationRequest(
                "City Hotel",
                "Center",
                "Suite",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 4),
                null,
                "USD",
                AccommodationStatus.PENDING,
                null,
                List.of("wifi"),
                null,
                "note");

        var response = controller.create(tripId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("City Hotel");
        verify(accommodationRepository).save(any(Accommodation.class));
    }

    @Test
    void update_returnsNotFoundWhenAccommodationMissing() {
        UUID accommodationId = UUID.randomUUID();
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));
        when(accommodationRepository.findByIdAndTripId(accommodationId, tripId)).thenReturn(Optional.empty());

        AccommodationRequest request = new AccommodationRequest(
                "City Hotel",
                null,
                null,
                null,
                null,
                null,
                null,
                AccommodationStatus.PENDING,
                null,
                null,
                null,
                null);

        var response = controller.update(tripId, accommodationId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void delete_returnsNoContentWhenAccommodationExists() {
        UUID accommodationId = UUID.randomUUID();
        Accommodation accommodation = new Accommodation();
        accommodation.setId(accommodationId);
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));
        when(accommodationRepository.findByIdAndTripId(accommodationId, tripId)).thenReturn(Optional.of(accommodation));

        var response = controller.delete(tripId, accommodationId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(accommodationRepository).delete(accommodation);
    }
}
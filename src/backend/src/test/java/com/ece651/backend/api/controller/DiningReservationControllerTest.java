package com.ece651.backend.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ece651.backend.api.dto.DiningReservationRequest;
import com.ece651.backend.domain.entity.DiningReservation;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.PriceTier;
import com.ece651.backend.repository.DiningReservationRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import java.time.OffsetDateTime;
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
class DiningReservationControllerTest {

    @Mock
    private DiningReservationRepository diningReservationRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    private DiningReservationController controller;
    private User user;
    private Trip trip;
    private UUID tripId;

    @BeforeEach
    void setUp() {
        controller = new DiningReservationController(diningReservationRepository, tripRepository, userRepository);
        user = new User();
        user.setId(UUID.randomUUID());
        tripId = UUID.randomUUID();
        trip = new Trip();
        trip.setId(tripId);
        trip.setUser(user);
    }

    @Test
    void list_returnsNotFoundWhenNoUser() {
        when(userRepository.findByEmail("demo@example.com")).thenReturn(Optional.empty());

        var response = controller.list(tripId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void create_returnsOkWhenTripExists() {
        when(userRepository.findByEmail("demo@example.com")).thenReturn(Optional.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));

        DiningReservationRequest request = new DiningReservationRequest(
                "Sushi Bar",
                OffsetDateTime.parse("2026-08-01T18:00:00Z"),
                "Japanese",
                PriceTier.TIER_2,
                DiningStatus.CONFIRMED,
                "Tokyo",
                "window seat",
                "C123",
                2,
                null);

        var response = controller.create(tripId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Sushi Bar");
        verify(diningReservationRepository).save(any(DiningReservation.class));
    }

    @Test
    void delete_returnsNoContentWhenReservationExists() {
        UUID reservationId = UUID.randomUUID();
        DiningReservation reservation = new DiningReservation();
        reservation.setId(reservationId);

        when(userRepository.findByEmail("demo@example.com")).thenReturn(Optional.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));
        when(diningReservationRepository.findByIdAndTripId(reservationId, tripId)).thenReturn(Optional.of(reservation));

        var response = controller.delete(tripId, reservationId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(diningReservationRepository).delete(reservation);
    }
}
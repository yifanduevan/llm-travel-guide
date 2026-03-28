package com.ece651.backend.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ece651.backend.api.dto.TransportSegmentRequest;
import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import com.ece651.backend.repository.TransportSegmentRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
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
class TransportSegmentControllerTest {

    @Mock
    private TransportSegmentRepository transportSegmentRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    private TransportSegmentController controller;
    private User user;
    private Trip trip;
    private UUID tripId;

    @BeforeEach
    void setUp() {
        controller = new TransportSegmentController(transportSegmentRepository, tripRepository, userRepository);
        user = new User();
        user.setId(UUID.randomUUID());
        tripId = UUID.randomUUID();
        trip = new Trip();
        trip.setId(tripId);
        trip.setUser(user);
    }

    @Test
    void create_returnsNotFoundWhenTripMissingForCurrentUser() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.empty());

        TransportSegmentRequest request = new TransportSegmentRequest(
                TransportType.TRAIN,
                "Train",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                TransportStatus.PLANNED,
                null,
                null,
                null,
                null);

        var response = controller.create(tripId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void create_returnsOkWhenTripExists() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));

        TransportSegmentRequest request = new TransportSegmentRequest(
                TransportType.FLIGHT,
                "Outbound",
                null,
                "UTC",
                "A",
                "AAA",
                null,
                "UTC",
                "B",
                "BBB",
                "3h",
                TransportStatus.CONFIRMED,
                "C1",
                null,
                true,
                null);

        var response = controller.create(tripId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().title()).isEqualTo("Outbound");
        verify(transportSegmentRepository).save(any(TransportSegment.class));
    }

    @Test
    void delete_returnsNoContentWhenSegmentExists() {
        UUID segmentId = UUID.randomUUID();
        TransportSegment segment = new TransportSegment();
        segment.setId(segmentId);

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));
        when(transportSegmentRepository.findByIdAndTripId(segmentId, tripId)).thenReturn(Optional.of(segment));

        var response = controller.delete(tripId, segmentId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(transportSegmentRepository).delete(segment);
    }
}
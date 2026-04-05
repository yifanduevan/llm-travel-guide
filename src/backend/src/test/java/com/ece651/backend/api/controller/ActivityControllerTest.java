package com.ece651.backend.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.ece651.backend.domain.entity.Activity;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.repository.ActivityRepository;
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
class ActivityControllerTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    private ActivityController controller;
    private User user;
    private Trip trip;
    private UUID tripId;

    @BeforeEach
    void setUp() {
        controller = new ActivityController(activityRepository, tripRepository, userRepository);
        user = new User();
        user.setId(UUID.randomUUID());
        tripId = UUID.randomUUID();
        trip = new Trip();
        trip.setId(tripId);
        trip.setUser(user);
    }

    @Test
    void list_returnsNotFoundWhenTripNotAccessible() {
        when(userRepository.findByEmail("demo@example.com")).thenReturn(Optional.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.empty());

        var response = controller.list(tripId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void list_returnsActivitiesWhenTripAccessible() {
        Activity activity = new Activity();
        activity.setId(UUID.randomUUID());
        activity.setTitle("Walk tour");

        when(userRepository.findByEmail("demo@example.com")).thenReturn(Optional.of(user));
        when(tripRepository.findByIdAndUserId(tripId, user.getId())).thenReturn(Optional.of(trip));
        when(activityRepository.findByTripId(tripId)).thenReturn(List.of(activity));

        var response = controller.list(tripId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).title()).isEqualTo("Walk tour");
    }
}
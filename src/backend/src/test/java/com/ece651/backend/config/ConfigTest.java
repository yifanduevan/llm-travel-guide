package com.ece651.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.repository.TransportSegmentRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.web.client.RestTemplateBuilder;

@ExtendWith(MockitoExtension.class)
class ConfigTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TransportSegmentRepository transportSegmentRepository;

    @Test
    void llmConfig_createsRestTemplate() {
        LlmConfig config = new LlmConfig();

        var template = config.llmRestTemplate(new RestTemplateBuilder());

        assertThat(template).isNotNull();
    }

    @Test
    void dataSeeder_returnsEarlyWhenTripsAlreadyExist() throws Exception {
        DataSeeder seeder = new DataSeeder();
        User existingUser = new User();
        when(userRepository.findByEmail("demo@example.com")).thenReturn(Optional.of(existingUser));
        when(tripRepository.count()).thenReturn(1L);

        CommandLineRunner runner = seeder.seedData(userRepository, tripRepository, transportSegmentRepository);
        runner.run();

        verify(tripRepository, never()).save(any(Trip.class));
        verify(transportSegmentRepository, never()).save(any());
    }

    @Test
    void dataSeeder_seedsUserTripAndSegmentsWhenEmpty() throws Exception {
        DataSeeder seeder = new DataSeeder();
        when(userRepository.findByEmail("demo@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tripRepository.count()).thenReturn(0L);

        CommandLineRunner runner = seeder.seedData(userRepository, tripRepository, transportSegmentRepository);
        runner.run();

        verify(userRepository, times(1)).save(any(User.class));
        verify(tripRepository, times(1)).save(any(Trip.class));
        verify(transportSegmentRepository, atLeastOnce()).save(any());
    }
}
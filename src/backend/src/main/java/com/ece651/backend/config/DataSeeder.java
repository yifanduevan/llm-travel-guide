package com.ece651.backend.config;

import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import com.ece651.backend.repository.TransportSegmentRepository;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            TripRepository tripRepository,
            TransportSegmentRepository transportSegmentRepository,
            @Value("${app.auth.demo.email:demo@example.com}") String demoUserEmail,
            @Value("${app.auth.demo.backfill-trip-ownership:true}") boolean backfillTripOwnership) {
        return args -> {
            OffsetDateTime now = OffsetDateTime.now();
            User user = userRepository
                    .findByEmail(demoUserEmail)
                    .orElseGet(() -> userRepository.save(
                            new User(UUID.randomUUID(), demoUserEmail, "hashed-password", "Demo User", now)));

            if (backfillTripOwnership) {
                List<Trip> existingTrips = tripRepository.findAll();
                if (existingTrips == null) {
                    existingTrips = List.of();
                }

                List<Trip> needsReassign = new ArrayList<>();
                for (Trip existingTrip : existingTrips) {
                    if (existingTrip.getUser() == null || !user.getId().equals(existingTrip.getUser().getId())) {
                        existingTrip.setUser(user);
                        needsReassign.add(existingTrip);
                    }
                }
                if (!needsReassign.isEmpty()) {
                    tripRepository.saveAll(needsReassign);
                }
            }

            if (tripRepository.count() > 0) {
                return;
            }

            Trip trip = new Trip(
                    UUID.randomUUID(),
                    user,
                    "Paris, France",
                    LocalDate.now().plusDays(30),
                    LocalDate.now().plusDays(36),
                    Travelers.COUPLE,
                    Budget.MEDIUM,
                    "Sample trip seeded for demo",
                    TripStatus.ACTIVE,
                    now,
                    now);
            tripRepository.save(trip);

            TransportSegment flight = new TransportSegment(
                    UUID.randomUUID(),
                    trip,
                    TransportType.FLIGHT,
                    "Flight AF124",
                    now.plusDays(30).withHour(10).withMinute(45),
                    "America/New_York",
                    "JFK, New York",
                    "JFK",
                    now.plusDays(30).withHour(23).withMinute(5),
                    "Europe/Paris",
                    "CDG, Paris",
                    "CDG",
                    "7h 20m",
                    TransportStatus.CONFIRMED,
                    "QX-7729L",
                    null,
                    true,
                    null);

            TransportSegment train = new TransportSegment(
                    UUID.randomUUID(),
                    trip,
                    TransportType.TRAIN,
                    "Eurostar to London",
                    now.plusDays(33).withHour(8).withMinute(15),
                    "Europe/Paris",
                    "Paris Nord",
                    null,
                    now.plusDays(33).withHour(10).withMinute(30),
                    "Europe/London",
                    "St Pancras",
                    null,
                    "2h 15m",
                    TransportStatus.PLANNED,
                    "EUR-90033",
                    null,
                    false,
                    null);

            transportSegmentRepository.save(flight);
            transportSegmentRepository.save(train);
        };
    }
}

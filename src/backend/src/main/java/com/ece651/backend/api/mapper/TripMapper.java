package com.ece651.backend.api.mapper;

import com.ece651.backend.api.dto.TripDto;
import com.ece651.backend.api.dto.TripRequest;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import java.time.OffsetDateTime;
import java.util.UUID;

public class TripMapper {
    private TripMapper() {}

    public static TripDto toDto(Trip trip) {
        return new TripDto(
                trip.getId(),
                trip.getTitleOrDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getTravelers(),
                trip.getBudget(),
                trip.getNotes(),
                trip.getStatus(),
                trip.getCreatedAt(),
                trip.getUpdatedAt());
    }

    public static Trip fromRequest(TripRequest request, User user) {
        OffsetDateTime now = OffsetDateTime.now();
        Trip trip = new Trip();
        trip.setId(UUID.randomUUID());
        trip.setUser(user);
        trip.setTitleOrDestination(request.titleOrDestination());
        trip.setStartDate(request.startDate());
        trip.setEndDate(request.endDate());
        trip.setTravelers(request.travelers());
        trip.setBudget(request.budget());
        trip.setNotes(request.notes());
        trip.setStatus(request.status());
        trip.setCreatedAt(now);
        trip.setUpdatedAt(now);
        return trip;
    }

    public static void update(Trip trip, TripRequest request) {
        trip.setTitleOrDestination(request.titleOrDestination());
        trip.setStartDate(request.startDate());
        trip.setEndDate(request.endDate());
        trip.setTravelers(request.travelers());
        trip.setBudget(request.budget());
        trip.setNotes(request.notes());
        trip.setStatus(request.status());
        trip.setUpdatedAt(OffsetDateTime.now());
    }
}

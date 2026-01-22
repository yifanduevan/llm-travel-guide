package com.ece651.backend.api.mapper;

import com.ece651.backend.api.dto.AccommodationDto;
import com.ece651.backend.api.dto.AccommodationRequest;
import com.ece651.backend.domain.entity.Accommodation;
import com.ece651.backend.domain.entity.Trip;
import java.util.UUID;

public class AccommodationMapper {
    private AccommodationMapper() {}

    public static AccommodationDto toDto(Accommodation accommodation) {
        return new AccommodationDto(
                accommodation.getId(),
                accommodation.getName(),
                accommodation.getAddress(),
                accommodation.getRoomType(),
                accommodation.getCheckIn(),
                accommodation.getCheckOut(),
                accommodation.getRate(),
                accommodation.getCurrency(),
                accommodation.getStatus(),
                accommodation.getConfirmationCode(),
                accommodation.getTags(),
                accommodation.getImageUrl(),
                accommodation.getNotes());
    }

    public static Accommodation fromRequest(AccommodationRequest request, Trip trip) {
        Accommodation accommodation = new Accommodation();
        accommodation.setId(UUID.randomUUID());
        accommodation.setTrip(trip);
        applyRequest(accommodation, request);
        return accommodation;
    }

    public static void update(Accommodation accommodation, AccommodationRequest request) {
        applyRequest(accommodation, request);
    }

    private static void applyRequest(Accommodation accommodation, AccommodationRequest request) {
        accommodation.setName(request.name());
        accommodation.setAddress(request.address());
        accommodation.setRoomType(request.roomType());
        accommodation.setCheckIn(request.checkIn());
        accommodation.setCheckOut(request.checkOut());
        accommodation.setRate(request.rate());
        accommodation.setCurrency(request.currency());
        accommodation.setStatus(request.status());
        accommodation.setConfirmationCode(request.confirmationCode());
        accommodation.setTags(request.tags());
        accommodation.setImageUrl(request.imageUrl());
        accommodation.setNotes(request.notes());
    }
}

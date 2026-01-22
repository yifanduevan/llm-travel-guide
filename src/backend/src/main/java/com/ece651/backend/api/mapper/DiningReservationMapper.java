package com.ece651.backend.api.mapper;

import com.ece651.backend.api.dto.DiningReservationDto;
import com.ece651.backend.api.dto.DiningReservationRequest;
import com.ece651.backend.domain.entity.DiningReservation;
import com.ece651.backend.domain.entity.Trip;
import java.util.UUID;

public class DiningReservationMapper {
    private DiningReservationMapper() {}

    public static DiningReservationDto toDto(DiningReservation reservation) {
        return new DiningReservationDto(
                reservation.getId(),
                reservation.getName(),
                reservation.getTime(),
                reservation.getCuisine(),
                reservation.getPriceTier(),
                reservation.getStatus(),
                reservation.getAddress(),
                reservation.getNotes(),
                reservation.getConfirmationCode(),
                reservation.getPartySize(),
                reservation.getImageUrl());
    }
    public static DiningReservation fromRequest(DiningReservationRequest request, Trip trip) {
        DiningReservation reservation = new DiningReservation();
        reservation.setId(UUID.randomUUID());
        reservation.setTrip(trip);
        reservation.setName(request.name());
        reservation.setTime(request.time());
        reservation.setCuisine(request.cuisine());
        reservation.setPriceTier(request.priceTier());
        reservation.setStatus(request.status());
        reservation.setAddress(request.address());
        reservation.setNotes(request.notes());
        reservation.setConfirmationCode(request.confirmationCode());
        reservation.setPartySize(request.partySize());
        reservation.setImageUrl(request.imageUrl());
        return reservation;
    }

    public static void update(DiningReservation reservation, DiningReservationRequest request) {
        reservation.setName(request.name());
        reservation.setTime(request.time());
        reservation.setCuisine(request.cuisine());
        reservation.setPriceTier(request.priceTier());
        reservation.setStatus(request.status());
        reservation.setAddress(request.address());
        reservation.setNotes(request.notes());
        reservation.setConfirmationCode(request.confirmationCode());
        reservation.setPartySize(request.partySize());
        reservation.setImageUrl(request.imageUrl());
    }
}

package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.AccommodationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AccommodationDto(
        UUID id,
        String name,
        String address,
        String roomType,
        LocalDate checkIn,
        LocalDate checkOut,
        BigDecimal rate,
        String currency,
        AccommodationStatus status,
        String confirmationCode,
        List<String> tags,
        String imageUrl,
        String notes) {}

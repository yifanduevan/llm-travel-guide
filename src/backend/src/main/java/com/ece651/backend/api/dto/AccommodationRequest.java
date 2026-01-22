package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.AccommodationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AccommodationRequest(
        @NotBlank String name,
        String address,
        String roomType,
        LocalDate checkIn,
        LocalDate checkOut,
        BigDecimal rate,
        String currency,
        @NotNull AccommodationStatus status,
        String confirmationCode,
        List<String> tags,
        String imageUrl,
        String notes) {}

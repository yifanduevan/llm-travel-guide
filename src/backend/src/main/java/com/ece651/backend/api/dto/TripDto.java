package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TripDto(
        UUID id,
        String titleOrDestination,
        LocalDate startDate,
        LocalDate endDate,
        Travelers travelers,
        Budget budget,
        String notes,
        TripStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}

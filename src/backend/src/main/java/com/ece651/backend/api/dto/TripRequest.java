package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TripRequest(
        @NotBlank String titleOrDestination,
        LocalDate startDate,
        LocalDate endDate,
        @NotNull Travelers travelers,
        @NotNull Budget budget,
        String notes,
        @NotNull TripStatus status) {}

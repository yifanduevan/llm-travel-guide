package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record TripGenerateRequest(
        @NotBlank String titleOrDestination,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull Travelers travelers,
        @NotNull Budget budget,
        List<String> interests) {}

package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import jakarta.validation.constraints.AssertTrue;
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
        List<String> interests) {
    @AssertTrue(message = "endDate must be on or after startDate")
    public boolean isDateRangeValid() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
    }
}

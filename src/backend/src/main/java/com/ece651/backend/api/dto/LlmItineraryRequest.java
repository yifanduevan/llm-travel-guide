package com.ece651.backend.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LlmItineraryRequest(@NotBlank String tripId, @NotNull @Valid TripPayload trip) {

    public record TripPayload(
            @NotBlank String titleOrDestination,
            @NotBlank String startDate,
            @NotBlank String endDate,
            @NotBlank String travelers,
            @NotBlank String budget,
            String notes) {}
}

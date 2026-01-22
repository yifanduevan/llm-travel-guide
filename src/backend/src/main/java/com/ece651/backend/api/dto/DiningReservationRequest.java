package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.PriceTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record DiningReservationRequest(
        @NotBlank String name,
        OffsetDateTime time,
        String cuisine,
        PriceTier priceTier,
        @NotNull DiningStatus status,
        String address,
        String notes,
        String confirmationCode,
        Integer partySize,
        String imageUrl) {}

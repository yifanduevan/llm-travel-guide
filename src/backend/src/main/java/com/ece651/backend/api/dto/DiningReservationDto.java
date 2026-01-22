package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.DiningStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record DiningReservationDto(
        UUID id,
        String name,
        OffsetDateTime time,
        String cuisine,
        String priceTier,
        DiningStatus status,
        String address,
        String notes,
        String confirmationCode,
        Integer partySize,
        String imageUrl) {}

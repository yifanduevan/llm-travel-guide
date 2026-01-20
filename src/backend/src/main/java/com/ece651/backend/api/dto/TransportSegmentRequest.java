package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record TransportSegmentRequest(
        @NotNull TransportType type,
        @NotBlank String title,
        OffsetDateTime startTime,
        String startTz,
        String startLocation,
        String startCode,
        OffsetDateTime endTime,
        String endTz,
        String endLocation,
        String endCode,
        String durationText,
        @NotNull TransportStatus status,
        String confirmationCode,
        String ticketUrl,
        Boolean completed,
        String imageUrl) {}

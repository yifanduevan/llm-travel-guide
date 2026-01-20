package com.ece651.backend.api.dto;

import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TransportSegmentDto(
        UUID id,
        TransportType type,
        String title,
        OffsetDateTime startTime,
        String startTz,
        String startLocation,
        String startCode,
        OffsetDateTime endTime,
        String endTz,
        String endLocation,
        String endCode,
        String durationText,
        TransportStatus status,
        String confirmationCode,
        String ticketUrl,
        Boolean completed,
        String imageUrl) {}

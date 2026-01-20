package com.ece651.backend.api.mapper;

import com.ece651.backend.api.dto.TransportSegmentDto;
import com.ece651.backend.api.dto.TransportSegmentRequest;
import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.entity.Trip;
import java.util.UUID;

public class TransportSegmentMapper {
    private TransportSegmentMapper() {}

    public static TransportSegmentDto toDto(TransportSegment segment) {
        return new TransportSegmentDto(
                segment.getId(),
                segment.getType(),
                segment.getTitle(),
                segment.getStartTime(),
                segment.getStartTz(),
                segment.getStartLocation(),
                segment.getStartCode(),
                segment.getEndTime(),
                segment.getEndTz(),
                segment.getEndLocation(),
                segment.getEndCode(),
                segment.getDurationText(),
                segment.getStatus(),
                segment.getConfirmationCode(),
                segment.getTicketUrl(),
                segment.getCompleted(),
                segment.getImageUrl());
    }

    public static TransportSegment fromRequest(TransportSegmentRequest request, Trip trip) {
        TransportSegment segment = new TransportSegment();
        segment.setId(UUID.randomUUID());
        segment.setTrip(trip);
        segment.setType(request.type());
        segment.setTitle(request.title());
        segment.setStartTime(request.startTime());
        segment.setStartTz(request.startTz());
        segment.setStartLocation(request.startLocation());
        segment.setStartCode(request.startCode());
        segment.setEndTime(request.endTime());
        segment.setEndTz(request.endTz());
        segment.setEndLocation(request.endLocation());
        segment.setEndCode(request.endCode());
        segment.setDurationText(request.durationText());
        segment.setStatus(request.status());
        segment.setConfirmationCode(request.confirmationCode());
        segment.setTicketUrl(request.ticketUrl());
        segment.setCompleted(request.completed() != null ? request.completed() : Boolean.FALSE);
        segment.setImageUrl(request.imageUrl());
        return segment;
    }

    public static void update(TransportSegment segment, TransportSegmentRequest request) {
        segment.setType(request.type());
        segment.setTitle(request.title());
        segment.setStartTime(request.startTime());
        segment.setStartTz(request.startTz());
        segment.setStartLocation(request.startLocation());
        segment.setStartCode(request.startCode());
        segment.setEndTime(request.endTime());
        segment.setEndTz(request.endTz());
        segment.setEndLocation(request.endLocation());
        segment.setEndCode(request.endCode());
        segment.setDurationText(request.durationText());
        segment.setStatus(request.status());
        segment.setConfirmationCode(request.confirmationCode());
        segment.setTicketUrl(request.ticketUrl());
        segment.setCompleted(request.completed() != null ? request.completed() : Boolean.FALSE);
        segment.setImageUrl(request.imageUrl());
    }
}

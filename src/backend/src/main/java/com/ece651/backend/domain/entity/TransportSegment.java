package com.ece651.backend.domain.entity;

import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transport_segments")
public class TransportSegment {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Convert(converter = com.ece651.backend.domain.converter.TransportTypeConverter.class)
    @Column(nullable = false, columnDefinition = "transport_type_enum")
    private TransportType type;

    @Column(nullable = false)
    private String title;

    @Column(name = "start_time")
    private OffsetDateTime startTime;

    @Column(name = "start_tz")
    private String startTz;

    @Column(name = "start_location")
    private String startLocation;

    @Column(name = "start_code")
    private String startCode;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "end_tz")
    private String endTz;

    @Column(name = "end_location")
    private String endLocation;

    @Column(name = "end_code")
    private String endCode;

    @Column(name = "duration_text")
    private String durationText;

    @Convert(converter = com.ece651.backend.domain.converter.TransportStatusConverter.class)
    @Column(nullable = false, columnDefinition = "transport_status_enum")
    private TransportStatus status;

    @Column(name = "confirmation_code")
    private String confirmationCode;

    @Column(name = "ticket_url")
    private String ticketUrl;

    @Column(nullable = false)
    private Boolean completed;

    @Column(name = "image_url")
    private String imageUrl;

    public TransportSegment() {}

    public TransportSegment(
            UUID id,
            Trip trip,
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
            String imageUrl) {
        this.id = id;
        this.trip = trip;
        this.type = type;
        this.title = title;
        this.startTime = startTime;
        this.startTz = startTz;
        this.startLocation = startLocation;
        this.startCode = startCode;
        this.endTime = endTime;
        this.endTz = endTz;
        this.endLocation = endLocation;
        this.endCode = endCode;
        this.durationText = durationText;
        this.status = status;
        this.confirmationCode = confirmationCode;
        this.ticketUrl = ticketUrl;
        this.completed = completed;
        this.imageUrl = imageUrl;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public TransportType getType() {
        return type;
    }

    public void setType(TransportType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public String getStartTz() {
        return startTz;
    }

    public void setStartTz(String startTz) {
        this.startTz = startTz;
    }

    public String getStartLocation() {
        return startLocation;
    }

    public void setStartLocation(String startLocation) {
        this.startLocation = startLocation;
    }

    public String getStartCode() {
        return startCode;
    }

    public void setStartCode(String startCode) {
        this.startCode = startCode;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }

    public String getEndTz() {
        return endTz;
    }

    public void setEndTz(String endTz) {
        this.endTz = endTz;
    }

    public String getEndLocation() {
        return endLocation;
    }

    public void setEndLocation(String endLocation) {
        this.endLocation = endLocation;
    }

    public String getEndCode() {
        return endCode;
    }

    public void setEndCode(String endCode) {
        this.endCode = endCode;
    }

    public String getDurationText() {
        return durationText;
    }

    public void setDurationText(String durationText) {
        this.durationText = durationText;
    }

    public TransportStatus getStatus() {
        return status;
    }

    public void setStatus(TransportStatus status) {
        this.status = status;
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    public void setConfirmationCode(String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }

    public String getTicketUrl() {
        return ticketUrl;
    }

    public void setTicketUrl(String ticketUrl) {
        this.ticketUrl = ticketUrl;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}

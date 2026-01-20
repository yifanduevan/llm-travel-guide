package com.ece651.backend.domain.entity;

import com.ece651.backend.domain.enums.ActivityStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "time_or_date")
    private OffsetDateTime timeOrDate;

    @Column(name = "duration_text")
    private String durationText;

    private BigDecimal price;

    private String currency;

    private String language;

    @Column(name = "ticket_type")
    private String ticketType;

    private Double rating;

    @Convert(converter = com.ece651.backend.domain.converter.ActivityStatusConverter.class)
    @Column(nullable = false, columnDefinition = "activity_status_enum")
    private ActivityStatus status;

    @Column(nullable = false)
    private Boolean saved;

    @Column(name = "image_url")
    private String imageUrl;

    public Activity() {}

    public Activity(
            UUID id,
            Trip trip,
            String title,
            String description,
            OffsetDateTime timeOrDate,
            String durationText,
            BigDecimal price,
            String currency,
            String language,
            String ticketType,
            Double rating,
            ActivityStatus status,
            Boolean saved,
            String imageUrl) {
        this.id = id;
        this.trip = trip;
        this.title = title;
        this.description = description;
        this.timeOrDate = timeOrDate;
        this.durationText = durationText;
        this.price = price;
        this.currency = currency;
        this.language = language;
        this.ticketType = ticketType;
        this.rating = rating;
        this.status = status;
        this.saved = saved;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public OffsetDateTime getTimeOrDate() {
        return timeOrDate;
    }

    public void setTimeOrDate(OffsetDateTime timeOrDate) {
        this.timeOrDate = timeOrDate;
    }

    public String getDurationText() {
        return durationText;
    }

    public void setDurationText(String durationText) {
        this.durationText = durationText;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTicketType() {
        return ticketType;
    }

    public void setTicketType(String ticketType) {
        this.ticketType = ticketType;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public ActivityStatus getStatus() {
        return status;
    }

    public void setStatus(ActivityStatus status) {
        this.status = status;
    }

    public Boolean getSaved() {
        return saved;
    }

    public void setSaved(Boolean saved) {
        this.saved = saved;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}

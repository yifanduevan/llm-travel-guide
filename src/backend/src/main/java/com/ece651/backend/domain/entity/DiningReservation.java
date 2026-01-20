package com.ece651.backend.domain.entity;

import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.PriceTier;
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
@Table(name = "dining_reservations")
public class DiningReservation {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String name;

    private OffsetDateTime time;

    private String cuisine;

    @Convert(converter = com.ece651.backend.domain.converter.PriceTierConverter.class)
    @Column(name = "price_tier", columnDefinition = "price_tier_enum")
    private PriceTier priceTier;

    @Convert(converter = com.ece651.backend.domain.converter.DiningStatusConverter.class)
    @Column(nullable = false, columnDefinition = "dining_status_enum")
    private DiningStatus status;

    private String address;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "confirmation_code")
    private String confirmationCode;

    @Column(name = "party_size")
    private Integer partySize;

    @Column(name = "image_url")
    private String imageUrl;

    public DiningReservation() {}

    public DiningReservation(
            UUID id,
            Trip trip,
            String name,
            OffsetDateTime time,
            String cuisine,
            PriceTier priceTier,
            DiningStatus status,
            String address,
            String notes,
            String confirmationCode,
            Integer partySize,
            String imageUrl) {
        this.id = id;
        this.trip = trip;
        this.name = name;
        this.time = time;
        this.cuisine = cuisine;
        this.priceTier = priceTier;
        this.status = status;
        this.address = address;
        this.notes = notes;
        this.confirmationCode = confirmationCode;
        this.partySize = partySize;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public OffsetDateTime getTime() {
        return time;
    }

    public void setTime(OffsetDateTime time) {
        this.time = time;
    }

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public PriceTier getPriceTier() {
        return priceTier;
    }

    public void setPriceTier(PriceTier priceTier) {
        this.priceTier = priceTier;
    }

    public DiningStatus getStatus() {
        return status;
    }

    public void setStatus(DiningStatus status) {
        this.status = status;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    public void setConfirmationCode(String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }

    public Integer getPartySize() {
        return partySize;
    }

    public void setPartySize(Integer partySize) {
        this.partySize = partySize;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}

package com.ece651.backend.domain.entity;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "trips")
public class Trip {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title_or_destination", nullable = false)
    private String titleOrDestination;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Convert(converter = com.ece651.backend.domain.converter.TravelersConverter.class)
    @Column(nullable = false, columnDefinition = "travelers_enum")
    private Travelers travelers;

    @Convert(converter = com.ece651.backend.domain.converter.BudgetConverter.class)
    @Column(nullable = false, columnDefinition = "budget_enum")
    private Budget budget;

    @Column(columnDefinition = "text")
    private String notes;

    @Convert(converter = com.ece651.backend.domain.converter.TripStatusConverter.class)
    @Column(nullable = false, columnDefinition = "trip_status_enum")
    private TripStatus status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Trip() {}

    public Trip(
            UUID id,
            User user,
            String titleOrDestination,
            LocalDate startDate,
            LocalDate endDate,
            Travelers travelers,
            Budget budget,
            String notes,
            TripStatus status,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.titleOrDestination = titleOrDestination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.travelers = travelers;
        this.budget = budget;
        this.notes = notes;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitleOrDestination() {
        return titleOrDestination;
    }

    public void setTitleOrDestination(String titleOrDestination) {
        this.titleOrDestination = titleOrDestination;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Travelers getTravelers() {
        return travelers;
    }

    public void setTravelers(Travelers travelers) {
        this.travelers = travelers;
    }

    public Budget getBudget() {
        return budget;
    }

    public void setBudget(Budget budget) {
        this.budget = budget;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

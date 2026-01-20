package com.ece651.backend.domain.entity;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "trip_preferences")
public class TripPreference {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String destination;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Convert(converter = com.ece651.backend.domain.converter.BudgetConverter.class)
    @Column(columnDefinition = "budget_enum")
    private Budget budget;

    @Convert(converter = com.ece651.backend.domain.converter.TravelersConverter.class)
    @Column(columnDefinition = "travelers_enum")
    private Travelers travelers;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> interests;

    public TripPreference() {}

    public TripPreference(
            UUID id,
            Trip trip,
            User user,
            String destination,
            Integer durationDays,
            Budget budget,
            Travelers travelers,
            List<String> interests) {
        this.id = id;
        this.trip = trip;
        this.user = user;
        this.destination = destination;
        this.durationDays = durationDays;
        this.budget = budget;
        this.travelers = travelers;
        this.interests = interests;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Budget getBudget() {
        return budget;
    }

    public void setBudget(Budget budget) {
        this.budget = budget;
    }

    public Travelers getTravelers() {
        return travelers;
    }

    public void setTravelers(Travelers travelers) {
        this.travelers = travelers;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }
}

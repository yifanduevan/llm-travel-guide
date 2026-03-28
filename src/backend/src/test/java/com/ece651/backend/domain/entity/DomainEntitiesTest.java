package com.ece651.backend.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.ItineraryItemCategory;
import com.ece651.backend.domain.enums.Travelers;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DomainEntitiesTest {

    @Test
    void itineraryDay_constructorAndAccessorsWork() {
        Trip trip = new Trip();
        UUID id = UUID.randomUUID();
        LocalDate date = LocalDate.of(2026, 6, 1);

        ItineraryDay day = new ItineraryDay(id, trip, date, "Day 1", 1);

        assertThat(day.getId()).isEqualTo(id);
        assertThat(day.getTrip()).isSameAs(trip);
        assertThat(day.getDate()).isEqualTo(date);
        assertThat(day.getLabel()).isEqualTo("Day 1");
        assertThat(day.getSortOrder()).isEqualTo(1);

        day.setLabel("Updated");
        day.setSortOrder(2);
        assertThat(day.getLabel()).isEqualTo("Updated");
        assertThat(day.getSortOrder()).isEqualTo(2);
    }

    @Test
    void itineraryItem_constructorAndAccessorsWork() {
        ItineraryDay day = new ItineraryDay();
        UUID id = UUID.randomUUID();
        OffsetDateTime time = OffsetDateTime.parse("2026-06-01T09:00:00Z");

        ItineraryItem item = new ItineraryItem(
                id,
                day,
                "Louvre",
                "Visit museum",
                time,
                ItineraryItemCategory.UNSPECIFIED,
                "Paris",
                "https://example.com",
                "https://example.com/img.jpg",
                false,
                3);

        assertThat(item.getId()).isEqualTo(id);
        assertThat(item.getDay()).isSameAs(day);
        assertThat(item.getTitle()).isEqualTo("Louvre");
        assertThat(item.getDescription()).isEqualTo("Visit museum");
        assertThat(item.getTime()).isEqualTo(time);
        assertThat(item.getCategory()).isEqualTo(ItineraryItemCategory.UNSPECIFIED);
        assertThat(item.getLocationText()).isEqualTo("Paris");
        assertThat(item.getLinkUrl()).isEqualTo("https://example.com");
        assertThat(item.getImageUrl()).isEqualTo("https://example.com/img.jpg");
        assertThat(item.getCompleted()).isFalse();
        assertThat(item.getSortOrder()).isEqualTo(3);
    }

    @Test
    void packingItem_constructorAndAccessorsWork() {
        Trip trip = new Trip();
        UUID id = UUID.randomUUID();

        PackingItem item = new PackingItem(id, trip, "Passport", false, "Documents");

        assertThat(item.getId()).isEqualTo(id);
        assertThat(item.getTrip()).isSameAs(trip);
        assertThat(item.getLabel()).isEqualTo("Passport");
        assertThat(item.getChecked()).isFalse();
        assertThat(item.getCategory()).isEqualTo("Documents");

        item.setChecked(true);
        assertThat(item.getChecked()).isTrue();
    }

    @Test
    void tripPreference_constructorAndAccessorsWork() {
        UUID id = UUID.randomUUID();
        Trip trip = new Trip();
        User user = new User();

        TripPreference preference = new TripPreference(
                id,
                trip,
                user,
                "Rome",
                5,
                Budget.MEDIUM,
                Travelers.COUPLE,
                List.of("food", "history"));

        assertThat(preference.getId()).isEqualTo(id);
        assertThat(preference.getTrip()).isSameAs(trip);
        assertThat(preference.getUser()).isSameAs(user);
        assertThat(preference.getDestination()).isEqualTo("Rome");
        assertThat(preference.getDurationDays()).isEqualTo(5);
        assertThat(preference.getBudget()).isEqualTo(Budget.MEDIUM);
        assertThat(preference.getTravelers()).isEqualTo(Travelers.COUPLE);
        assertThat(preference.getInterests()).containsExactly("food", "history");
    }
}
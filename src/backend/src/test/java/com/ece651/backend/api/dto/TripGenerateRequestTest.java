package com.ece651.backend.api.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class TripGenerateRequestTest {

    @Test
    void isDateRangeValid_returnsTrueWhenEndDateEqualsOrAfterStartDate() {
        TripGenerateRequest sameDay = new TripGenerateRequest(
                "Montreal",
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 1),
                Travelers.SOLO,
                Budget.BUDGET,
                List.of("food"));
        TripGenerateRequest laterEnd = new TripGenerateRequest(
                "Montreal",
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 2),
                Travelers.SOLO,
                Budget.BUDGET,
                List.of("food"));

        assertThat(sameDay.isDateRangeValid()).isTrue();
        assertThat(laterEnd.isDateRangeValid()).isTrue();
    }

    @Test
    void isDateRangeValid_returnsFalseWhenEndDateBeforeStartDate() {
        TripGenerateRequest request = new TripGenerateRequest(
                "Montreal",
                LocalDate.of(2026, 10, 2),
                LocalDate.of(2026, 10, 1),
                Travelers.SOLO,
                Budget.BUDGET,
                List.of("food"));

        assertThat(request.isDateRangeValid()).isFalse();
    }

    @Test
    void isDateRangeValid_returnsTrueWhenEitherDateIsNull() {
        TripGenerateRequest nullStart = new TripGenerateRequest(
                "Montreal",
                null,
                LocalDate.of(2026, 10, 1),
                Travelers.SOLO,
                Budget.BUDGET,
                List.of());
        TripGenerateRequest nullEnd = new TripGenerateRequest(
                "Montreal",
                LocalDate.of(2026, 10, 1),
                null,
                Travelers.SOLO,
                Budget.BUDGET,
                List.of());

        assertThat(nullStart.isDateRangeValid()).isTrue();
        assertThat(nullEnd.isDateRangeValid()).isTrue();
    }
}
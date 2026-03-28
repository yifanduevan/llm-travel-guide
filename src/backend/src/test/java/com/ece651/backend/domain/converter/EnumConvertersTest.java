package com.ece651.backend.domain.converter;

import static org.assertj.core.api.Assertions.assertThat;

import com.ece651.backend.domain.enums.AccommodationStatus;
import com.ece651.backend.domain.enums.ActivityStatus;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.ItineraryItemCategory;
import com.ece651.backend.domain.enums.PriceTier;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import com.ece651.backend.domain.enums.TripStatus;
import org.junit.jupiter.api.Test;

class EnumConvertersTest {

    @Test
    void budgetConverter_handlesNullAndRoundTrip() {
        BudgetConverter converter = new BudgetConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(Budget.MEDIUM)).isEqualTo("medium");
        assertThat(converter.convertToEntityAttribute("luxury")).isEqualTo(Budget.LUXURY);
    }

    @Test
    void travelersConverter_handlesNullAndRoundTrip() {
        TravelersConverter converter = new TravelersConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(Travelers.COUPLE)).isEqualTo("couple");
        assertThat(converter.convertToEntityAttribute("group")).isEqualTo(Travelers.GROUP);
    }

    @Test
    void transportTypeConverter_handlesNullAndRoundTrip() {
        TransportTypeConverter converter = new TransportTypeConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(TransportType.FLIGHT)).isEqualTo("flight");
        assertThat(converter.convertToEntityAttribute("train")).isEqualTo(TransportType.TRAIN);
    }

    @Test
    void transportStatusConverter_handlesNullAndRoundTrip() {
        TransportStatusConverter converter = new TransportStatusConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(TransportStatus.CONFIRMED)).isEqualTo("confirmed");
        assertThat(converter.convertToEntityAttribute("completed")).isEqualTo(TransportStatus.COMPLETED);
    }

    @Test
    void priceTierConverter_handlesNullAndRoundTrip() {
        PriceTierConverter converter = new PriceTierConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(PriceTier.TIER_2)).isEqualTo("$$");
        assertThat(converter.convertToEntityAttribute("$")).isEqualTo(PriceTier.TIER_1);
    }

    @Test
    void tripStatusConverter_handlesNullAndRoundTrip() {
        TripStatusConverter converter = new TripStatusConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(TripStatus.ACTIVE)).isEqualTo("active");
        assertThat(converter.convertToEntityAttribute("archived")).isEqualTo(TripStatus.ARCHIVED);
    }

    @Test
    void activityStatusConverter_handlesNullAndRoundTrip() {
        ActivityStatusConverter converter = new ActivityStatusConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(ActivityStatus.BOOKED)).isEqualTo("booked");
        assertThat(converter.convertToEntityAttribute("planned")).isEqualTo(ActivityStatus.PLANNED);
    }

    @Test
    void accommodationStatusConverter_handlesNullAndRoundTrip() {
        AccommodationStatusConverter converter = new AccommodationStatusConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(AccommodationStatus.PENDING)).isEqualTo("pending");
        assertThat(converter.convertToEntityAttribute("confirmed")).isEqualTo(AccommodationStatus.CONFIRMED);
    }

    @Test
    void diningStatusConverter_handlesNullAndRoundTrip() {
        DiningStatusConverter converter = new DiningStatusConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(DiningStatus.WAITLISTED)).isEqualTo("waitlisted");
        assertThat(converter.convertToEntityAttribute("pending")).isEqualTo(DiningStatus.PENDING);
    }

    @Test
    void itineraryItemCategoryConverter_handlesNullAndRoundTrip() {
        ItineraryItemCategoryConverter converter = new ItineraryItemCategoryConverter();
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThat(converter.convertToDatabaseColumn(ItineraryItemCategory.UNSPECIFIED)).isEqualTo("unspecified");
        assertThat(converter.convertToEntityAttribute("unspecified")).isEqualTo(ItineraryItemCategory.UNSPECIFIED);
    }
}
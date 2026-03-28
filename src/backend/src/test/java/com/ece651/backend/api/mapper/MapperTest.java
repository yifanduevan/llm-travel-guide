package com.ece651.backend.api.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.ece651.backend.api.dto.AccommodationRequest;
import com.ece651.backend.api.dto.DiningReservationRequest;
import com.ece651.backend.api.dto.TransportSegmentRequest;
import com.ece651.backend.api.dto.TripRequest;
import com.ece651.backend.domain.entity.Accommodation;
import com.ece651.backend.domain.entity.Activity;
import com.ece651.backend.domain.entity.DiningReservation;
import com.ece651.backend.domain.entity.TransportSegment;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.AccommodationStatus;
import com.ece651.backend.domain.enums.ActivityStatus;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.DiningStatus;
import com.ece651.backend.domain.enums.PriceTier;
import com.ece651.backend.domain.enums.TransportStatus;
import com.ece651.backend.domain.enums.TransportType;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MapperTest {

    @Test
    void tripMapper_mapsDtoFromRequestAndUpdate() {
        User user = new User();
        user.setId(UUID.randomUUID());

        TripRequest request = new TripRequest(
                "Lisbon",
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 4),
                Travelers.COUPLE,
                Budget.MEDIUM,
                "original notes",
                TripStatus.DRAFT);

        Trip trip = TripMapper.fromRequest(request, user);
        assertThat(trip.getId()).isNotNull();
        assertThat(trip.getUser()).isSameAs(user);
        assertThat(trip.getTitleOrDestination()).isEqualTo("Lisbon");
        assertThat(trip.getCreatedAt()).isEqualTo(trip.getUpdatedAt());

        var dto = TripMapper.toDto(trip);
        assertThat(dto.id()).isEqualTo(trip.getId());
        assertThat(dto.titleOrDestination()).isEqualTo("Lisbon");

        OffsetDateTime before = trip.getUpdatedAt();
        TripRequest updated = new TripRequest(
                "Porto",
                LocalDate.of(2026, 6, 10),
                LocalDate.of(2026, 6, 12),
                Travelers.GROUP,
                Budget.LUXURY,
                "updated notes",
                TripStatus.ACTIVE);
        TripMapper.update(trip, updated);
        assertThat(trip.getTitleOrDestination()).isEqualTo("Porto");
        assertThat(trip.getStatus()).isEqualTo(TripStatus.ACTIVE);
        assertThat(trip.getUpdatedAt()).isAfterOrEqualTo(before);
    }

    @Test
    void transportSegmentMapper_handlesCompletedDefaultAndUpdate() {
        Trip trip = new Trip();
        trip.setId(UUID.randomUUID());
        OffsetDateTime start = OffsetDateTime.parse("2026-07-01T10:00:00Z");
        OffsetDateTime end = OffsetDateTime.parse("2026-07-01T12:30:00Z");

        TransportSegmentRequest request = new TransportSegmentRequest(
                TransportType.TRAIN,
                "Express Train",
                start,
                "UTC",
                "A",
                "AAA",
                end,
                "UTC",
                "B",
                "BBB",
                "2h 30m",
                TransportStatus.PLANNED,
                "CONF-1",
                "https://example.com/ticket",
                null,
                "https://example.com/img.jpg");

        TransportSegment segment = TransportSegmentMapper.fromRequest(request, trip);
        assertThat(segment.getTrip()).isSameAs(trip);
        assertThat(segment.getCompleted()).isFalse();

        var dto = TransportSegmentMapper.toDto(segment);
        assertThat(dto.title()).isEqualTo("Express Train");
        assertThat(dto.completed()).isFalse();

        TransportSegmentRequest update = new TransportSegmentRequest(
                TransportType.FLIGHT,
                "Outbound",
                start,
                "UTC",
                "A",
                "AAA",
                end,
                "UTC",
                "C",
                "CCC",
                "2h",
                TransportStatus.CONFIRMED,
                "CONF-2",
                null,
                true,
                null);
        TransportSegmentMapper.update(segment, update);

        assertThat(segment.getType()).isEqualTo(TransportType.FLIGHT);
        assertThat(segment.getStatus()).isEqualTo(TransportStatus.CONFIRMED);
        assertThat(segment.getCompleted()).isTrue();
    }

    @Test
    void activityMapper_formatsOptionalFieldsAndBadges() {
        Activity activity = new Activity();
        activity.setId(UUID.randomUUID());
        activity.setTitle("Museum Tour");
        activity.setPrice(new BigDecimal("99.6"));
        activity.setCurrency("USD");
        activity.setRating(4.26);
        activity.setStatus(ActivityStatus.BOOKED);
        activity.setImageUrl("https://example.com/pic.jpg");
        activity.setDescription("Guided tour");
        activity.setDurationText("2h");
        activity.setLanguage("English");
        activity.setTicketType("Mobile Ticket");

        var dto = ActivityMapper.toDto(activity);
        assertThat(dto.price()).isEqualTo("USD 100");
        assertThat(dto.rating()).isEqualTo("4.3");
        assertThat(dto.badge()).isEqualTo("Booked");
        assertThat(dto.badgeTone()).isEqualTo("primary");
        assertThat(dto.pills()).containsExactly("2h", "English", "Mobile Ticket");

        Activity empty = new Activity();
        empty.setId(UUID.randomUUID());
        empty.setTitle("Open Park");
        var emptyDto = ActivityMapper.toDto(empty);
        assertThat(emptyDto.price()).isEmpty();
        assertThat(emptyDto.rating()).isEmpty();
        assertThat(emptyDto.badge()).isNull();
        assertThat(emptyDto.badgeTone()).isNull();
        assertThat(emptyDto.pills()).isEmpty();
    }

    @Test
    void accommodationMapper_mapsFromRequestToDtoAndUpdate() {
        Trip trip = new Trip();
        trip.setId(UUID.randomUUID());

        AccommodationRequest request = new AccommodationRequest(
                "City Hotel",
                "Center St",
                "Suite",
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2026, 5, 4),
                new BigDecimal("220.00"),
                "USD",
                AccommodationStatus.PENDING,
                "A-1",
                List.of("wifi", "breakfast"),
                "https://example.com/hotel.jpg",
                "near metro");

        Accommodation accommodation = AccommodationMapper.fromRequest(request, trip);
        assertThat(accommodation.getTrip()).isSameAs(trip);
        assertThat(accommodation.getName()).isEqualTo("City Hotel");

        var dto = AccommodationMapper.toDto(accommodation);
        assertThat(dto.name()).isEqualTo("City Hotel");
        assertThat(dto.tags()).containsExactly("wifi", "breakfast");

        AccommodationRequest update = new AccommodationRequest(
                "Resort",
                "Beach Rd",
                "Deluxe",
                LocalDate.of(2026, 5, 2),
                LocalDate.of(2026, 5, 5),
                new BigDecimal("350.00"),
                "USD",
                AccommodationStatus.CONFIRMED,
                "A-2",
                List.of("pool"),
                null,
                "updated");

        AccommodationMapper.update(accommodation, update);
        assertThat(accommodation.getName()).isEqualTo("Resort");
        assertThat(accommodation.getStatus()).isEqualTo(AccommodationStatus.CONFIRMED);
        assertThat(accommodation.getTags()).containsExactly("pool");
    }

    @Test
    void diningReservationMapper_mapsPriceTierDbValueAndUpdate() {
        Trip trip = new Trip();
        trip.setId(UUID.randomUUID());
        OffsetDateTime time = OffsetDateTime.parse("2026-04-01T18:30:00Z");

        DiningReservationRequest request = new DiningReservationRequest(
                "Sushi Bar",
                time,
                "Japanese",
                PriceTier.TIER_3,
                DiningStatus.CONFIRMED,
                "Tokyo",
                "window seat",
                "R-1",
                2,
                "https://example.com/food.jpg");

        DiningReservation reservation = DiningReservationMapper.fromRequest(request, trip);
        assertThat(reservation.getTrip()).isSameAs(trip);
        assertThat(reservation.getPriceTier()).isEqualTo(PriceTier.TIER_3);

        var dto = DiningReservationMapper.toDto(reservation);
        assertThat(dto.priceTier()).isEqualTo("$$$");
        assertThat(dto.status()).isEqualTo(DiningStatus.CONFIRMED);

        DiningReservationRequest update = new DiningReservationRequest(
                "Bistro",
                time,
                "French",
                null,
                DiningStatus.PENDING,
                "Paris",
                "none",
                "R-2",
                4,
                null);
        DiningReservationMapper.update(reservation, update);

        assertThat(reservation.getName()).isEqualTo("Bistro");
        assertThat(reservation.getPriceTier()).isNull();
        assertThat(DiningReservationMapper.toDto(reservation).priceTier()).isNull();
    }
}
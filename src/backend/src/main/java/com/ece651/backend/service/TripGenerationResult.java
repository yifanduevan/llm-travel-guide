package com.ece651.backend.service;

import com.ece651.backend.domain.enums.PriceTier;
import com.ece651.backend.domain.enums.TransportType;
import java.util.List;

public record TripGenerationResult(
        String notes,
        List<TransportSuggestion> transportSegments,
        List<DiningSuggestion> diningReservations,
        List<AccommodationSuggestion> accommodations,
        List<ActivitySuggestion> activities) {

    public record TransportSuggestion(
            TransportType type, String title, String startLocation, String endLocation, String durationText) {}

    public record DiningSuggestion(String name, String cuisine, PriceTier priceTier, String address, String notes) {}

    public record AccommodationSuggestion(String name, String address, String roomType, String notes,
            java.math.BigDecimal rate, String currency) {}

    public record ActivitySuggestion(
            String title, String description, String durationText, String ticketType, String language) {}
}

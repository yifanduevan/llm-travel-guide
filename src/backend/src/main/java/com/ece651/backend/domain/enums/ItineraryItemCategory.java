package com.ece651.backend.domain.enums;

public enum ItineraryItemCategory {
    UNSPECIFIED("unspecified");

    private final String dbValue;

    ItineraryItemCategory(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static ItineraryItemCategory fromDbValue(String value) {
        for (ItineraryItemCategory c : values()) {
            if (c.dbValue.equals(value)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown itinerary item category: " + value);
    }
}

package com.ece651.backend.domain.enums;

public enum TripStatus {
    DRAFT("draft"),
    ACTIVE("active"),
    ARCHIVED("archived");

    private final String dbValue;

    TripStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static TripStatus fromDbValue(String value) {
        for (TripStatus s : values()) {
            if (s.dbValue.equals(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown trip status: " + value);
    }
}

package com.ece651.backend.domain.enums;

public enum AccommodationStatus {
    CONFIRMED("confirmed"),
    PENDING("pending"),
    CANCELLED("cancelled");

    private final String dbValue;

    AccommodationStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static AccommodationStatus fromDbValue(String value) {
        for (AccommodationStatus s : values()) {
            if (s.dbValue.equals(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown accommodation status: " + value);
    }
}

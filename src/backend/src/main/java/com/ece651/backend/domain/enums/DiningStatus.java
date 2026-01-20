package com.ece651.backend.domain.enums;

public enum DiningStatus {
    CONFIRMED("confirmed"),
    WAITLISTED("waitlisted"),
    PENDING("pending"),
    CANCELLED("cancelled");

    private final String dbValue;

    DiningStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static DiningStatus fromDbValue(String value) {
        for (DiningStatus s : values()) {
            if (s.dbValue.equals(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown dining status: " + value);
    }
}

package com.ece651.backend.domain.enums;

public enum ActivityStatus {
    BOOKED("booked"),
    WAITLIST("waitlist"),
    PLANNED("planned"),
    CANCELLED("cancelled");

    private final String dbValue;

    ActivityStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static ActivityStatus fromDbValue(String value) {
        for (ActivityStatus s : values()) {
            if (s.dbValue.equals(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown activity status: " + value);
    }
}

package com.ece651.backend.domain.enums;

public enum TransportStatus {
    PLANNED("planned"),
    CONFIRMED("confirmed"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String dbValue;

    TransportStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static TransportStatus fromDbValue(String value) {
        for (TransportStatus s : values()) {
            if (s.dbValue.equals(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown transport status: " + value);
    }
}

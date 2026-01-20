package com.ece651.backend.domain.enums;

public enum Budget {
    BUDGET("budget"),
    MEDIUM("medium"),
    LUXURY("luxury");

    private final String dbValue;

    Budget(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static Budget fromDbValue(String value) {
        for (Budget b : values()) {
            if (b.dbValue.equals(value)) {
                return b;
            }
        }
        throw new IllegalArgumentException("Unknown budget: " + value);
    }
}

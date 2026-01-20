package com.ece651.backend.domain.enums;

public enum Travelers {
    SOLO("solo"),
    COUPLE("couple"),
    FAMILY("family"),
    GROUP("group");

    private final String dbValue;

    Travelers(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static Travelers fromDbValue(String value) {
        for (Travelers t : values()) {
            if (t.dbValue.equals(value)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Unknown travelers: " + value);
    }
}

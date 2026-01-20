package com.ece651.backend.domain.enums;

public enum TransportType {
    FLIGHT("flight"),
    TRAIN("train"),
    CAR("car"),
    BUS("bus"),
    OTHER("other");

    private final String dbValue;

    TransportType(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static TransportType fromDbValue(String value) {
        for (TransportType t : values()) {
            if (t.dbValue.equals(value)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Unknown transport type: " + value);
    }
}

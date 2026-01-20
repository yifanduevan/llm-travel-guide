package com.ece651.backend.domain.enums;

public enum PriceTier {
    TIER_1("$"),
    TIER_2("$$"),
    TIER_3("$$$");

    private final String dbValue;

    PriceTier(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static PriceTier fromDbValue(String value) {
        for (PriceTier tier : values()) {
            if (tier.dbValue.equals(value)) {
                return tier;
            }
        }
        throw new IllegalArgumentException("Unknown price tier: " + value);
    }
}

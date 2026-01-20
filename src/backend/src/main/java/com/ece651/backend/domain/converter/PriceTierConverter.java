package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.PriceTier;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PriceTierConverter implements AttributeConverter<PriceTier, String> {
    @Override
    public String convertToDatabaseColumn(PriceTier attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public PriceTier convertToEntityAttribute(String dbData) {
        return dbData != null ? PriceTier.fromDbValue(dbData) : null;
    }
}

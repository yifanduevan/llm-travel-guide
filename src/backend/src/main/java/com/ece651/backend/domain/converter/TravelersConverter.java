package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.Travelers;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class TravelersConverter implements AttributeConverter<Travelers, String> {
    @Override
    public String convertToDatabaseColumn(Travelers attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public Travelers convertToEntityAttribute(String dbData) {
        return dbData != null ? Travelers.fromDbValue(dbData) : null;
    }
}

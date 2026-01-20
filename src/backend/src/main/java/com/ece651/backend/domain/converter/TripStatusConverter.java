package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.TripStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class TripStatusConverter implements AttributeConverter<TripStatus, String> {
    @Override
    public String convertToDatabaseColumn(TripStatus attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public TripStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? TripStatus.fromDbValue(dbData) : null;
    }
}

package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.AccommodationStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class AccommodationStatusConverter implements AttributeConverter<AccommodationStatus, String> {
    @Override
    public String convertToDatabaseColumn(AccommodationStatus attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public AccommodationStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? AccommodationStatus.fromDbValue(dbData) : null;
    }
}

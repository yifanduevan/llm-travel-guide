package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.DiningStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class DiningStatusConverter implements AttributeConverter<DiningStatus, String> {
    @Override
    public String convertToDatabaseColumn(DiningStatus attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public DiningStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? DiningStatus.fromDbValue(dbData) : null;
    }
}

package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.TransportType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class TransportTypeConverter implements AttributeConverter<TransportType, String> {
    @Override
    public String convertToDatabaseColumn(TransportType attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public TransportType convertToEntityAttribute(String dbData) {
        return dbData != null ? TransportType.fromDbValue(dbData) : null;
    }
}

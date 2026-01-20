package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.TransportStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class TransportStatusConverter implements AttributeConverter<TransportStatus, String> {
    @Override
    public String convertToDatabaseColumn(TransportStatus attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public TransportStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? TransportStatus.fromDbValue(dbData) : null;
    }
}

package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.ActivityStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ActivityStatusConverter implements AttributeConverter<ActivityStatus, String> {
    @Override
    public String convertToDatabaseColumn(ActivityStatus attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public ActivityStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? ActivityStatus.fromDbValue(dbData) : null;
    }
}

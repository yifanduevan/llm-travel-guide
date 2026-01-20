package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.ItineraryItemCategory;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ItineraryItemCategoryConverter implements AttributeConverter<ItineraryItemCategory, String> {
    @Override
    public String convertToDatabaseColumn(ItineraryItemCategory attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public ItineraryItemCategory convertToEntityAttribute(String dbData) {
        return dbData != null ? ItineraryItemCategory.fromDbValue(dbData) : null;
    }
}

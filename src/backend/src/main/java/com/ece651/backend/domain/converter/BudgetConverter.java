package com.ece651.backend.domain.converter;

import com.ece651.backend.domain.enums.Budget;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BudgetConverter implements AttributeConverter<Budget, String> {
    @Override
    public String convertToDatabaseColumn(Budget attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public Budget convertToEntityAttribute(String dbData) {
        return dbData != null ? Budget.fromDbValue(dbData) : null;
    }
}

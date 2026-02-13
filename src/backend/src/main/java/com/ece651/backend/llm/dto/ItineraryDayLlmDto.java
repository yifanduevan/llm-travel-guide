package com.ece651.backend.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ItineraryDayLlmDto(
        String date,
        List<ItineraryItemLlmDto> items) {}

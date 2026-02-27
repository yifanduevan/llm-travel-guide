package com.ece651.backend.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ItineraryItemLlmDto(
        String title,
        String description,
        String time,
        String category,
        @JsonProperty("locationText") String locationText) {}

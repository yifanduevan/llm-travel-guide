package com.ece651.backend.api.dto;

import java.util.List;

public record LlmItineraryResponse(List<Day> days) {

    public LlmItineraryResponse {
        days = days == null ? List.of() : List.copyOf(days);
    }

    public record Day(String date, List<Item> items) {
        public Day {
            date = (date == null || date.isBlank()) ? "TBD" : date;
            items = items == null ? List.of() : List.copyOf(items);
        }
    }

    public record Item(String title, String time, String description, String locationText) {
        public Item {
            title = (title == null || title.isBlank()) ? "Activity" : title;
            time = (time == null || time.isBlank()) ? "TBD" : time;
            description = description == null ? "" : description;
            locationText = locationText == null ? "" : locationText;
        }
    }
}

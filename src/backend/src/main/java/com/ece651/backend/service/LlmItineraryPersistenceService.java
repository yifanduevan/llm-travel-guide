package com.ece651.backend.service;

import com.ece651.backend.api.dto.LlmItineraryResponse;
import com.ece651.backend.domain.entity.ItineraryDay;
import com.ece651.backend.domain.entity.ItineraryItem;
import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.enums.ItineraryItemCategory;
import com.ece651.backend.llm.dto.ItineraryDayLlmDto;
import com.ece651.backend.llm.dto.ItineraryItemLlmDto;
import com.ece651.backend.llm.dto.ItineraryResponseLlmDto;
import com.ece651.backend.repository.ItineraryDayRepository;
import com.ece651.backend.repository.ItineraryItemRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class LlmItineraryPersistenceService {

    private static final DateTimeFormatter TIME_24H_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<DateTimeFormatter> TIME_INPUT_FORMATTERS = List.of(
            DateTimeFormatter.ofPattern("H:mm"),
            DateTimeFormatter.ofPattern("HH:mm"),
            DateTimeFormatter.ofPattern("h:mm a"),
            DateTimeFormatter.ofPattern("h a"),
            DateTimeFormatter.ofPattern("h:mma"),
            DateTimeFormatter.ofPattern("ha"),
            DateTimeFormatter.ofPattern("H:mm:ss"),
            DateTimeFormatter.ofPattern("HH:mm:ss"),
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("h:mm a")
                    .toFormatter(),
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("h a")
                    .toFormatter());
    private static final Pattern TIME_TOKEN_PATTERN = Pattern.compile(
            "(\\b\\d{1,2}:\\d{2}\\s*[AaPp][Mm]\\b|\\b\\d{1,2}\\s*[AaPp][Mm]\\b|\\b\\d{1,2}:\\d{2}\\b)");

    private final ItineraryDayRepository itineraryDayRepository;
    private final ItineraryItemRepository itineraryItemRepository;

    public LlmItineraryPersistenceService(
            ItineraryDayRepository itineraryDayRepository,
            ItineraryItemRepository itineraryItemRepository) {
        this.itineraryDayRepository = itineraryDayRepository;
        this.itineraryItemRepository = itineraryItemRepository;
    }

    @Transactional
    public void persistGeneratedItinerary(Trip trip, LlmItineraryResponse response) {
        itineraryDayRepository.deleteByTripId(trip.getId());

        LocalDate fallbackStartDate = trip.getStartDate() != null ? trip.getStartDate() : LocalDate.now();
        List<LlmItineraryResponse.Day> days = response == null ? List.of() : response.days();

        for (int dayIndex = 0; dayIndex < days.size(); dayIndex++) {
            LlmItineraryResponse.Day generatedDay = days.get(dayIndex);
            LocalDate dayDate = parseDate(generatedDay.date(), fallbackStartDate.plusDays(dayIndex));

            ItineraryDay persistedDay = new ItineraryDay();
            persistedDay.setId(UUID.randomUUID());
            persistedDay.setTrip(trip);
            persistedDay.setDate(dayDate);
            persistedDay.setLabel("Day " + (dayIndex + 1));
            persistedDay.setSortOrder(dayIndex);
            itineraryDayRepository.save(persistedDay);

            List<LlmItineraryResponse.Item> items = generatedDay.items() == null ? List.of() : generatedDay.items();
            List<ItineraryItem> toPersistItems = new ArrayList<>();
            for (int itemIndex = 0; itemIndex < items.size(); itemIndex++) {
                LlmItineraryResponse.Item generatedItem = items.get(itemIndex);
                String normalizedTimeText = normalizeTimeText(generatedItem.time());
                ItineraryItem persistedItem = new ItineraryItem();
                persistedItem.setId(UUID.randomUUID());
                persistedItem.setDay(persistedDay);
                persistedItem.setTitle(generatedItem.title());
                persistedItem.setDescription(generatedItem.description());
                persistedItem.setTime(parseTime(dayDate, normalizedTimeText, itemIndex));
                persistedItem.setTimeText(normalizedTimeText);
                persistedItem.setCategory(ItineraryItemCategory.UNSPECIFIED);
                persistedItem.setLocationText(generatedItem.locationText());
                persistedItem.setLinkUrl(null);
                persistedItem.setImageUrl(null);
                persistedItem.setCompleted(Boolean.FALSE);
                persistedItem.setSortOrder(itemIndex);
                toPersistItems.add(persistedItem);
            }
            if (!toPersistItems.isEmpty()) {
                itineraryItemRepository.saveAll(toPersistItems);
            }
        }
    }

    public ItineraryResponseLlmDto getPersistedItinerary(UUID tripId) {
        List<ItineraryDay> days = itineraryDayRepository.findByTripIdOrderBySortOrderAsc(tripId);
        List<ItineraryDayLlmDto> mappedDays = new ArrayList<>();

        for (ItineraryDay day : days) {
            List<ItineraryItemLlmDto> items = itineraryItemRepository.findByDayIdOrderBySortOrderAsc(day.getId()).stream()
                    .map(item -> new ItineraryItemLlmDto(
                            item.getTitle(),
                            item.getDescription(),
                            resolveDisplayTime(item),
                            item.getCategory() == null
                                    ? ItineraryItemCategory.UNSPECIFIED.getDbValue()
                                    : item.getCategory().getDbValue(),
                            item.getLocationText()))
                    .toList();

            mappedDays.add(new ItineraryDayLlmDto(day.getDate().toString(), items));
        }

        return new ItineraryResponseLlmDto(mappedDays);
    }

    private LocalDate parseDate(String value, LocalDate fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ignored) {
            return fallback;
        }
    }

    private OffsetDateTime parseTime(LocalDate dayDate, String value, int itemIndex) {
        if (value == null || value.isBlank() || "TBD".equalsIgnoreCase(value)) {
            return defaultOffsetTime(dayDate, itemIndex);
        }
        String normalized = value.trim();
        String candidate = extractPrimaryTimeCandidate(normalized);

        try {
            return OffsetDateTime.parse(candidate);
        } catch (DateTimeParseException ignored) {
            // Candidate is not an ISO offset datetime string.
        }

        for (DateTimeFormatter formatter : TIME_INPUT_FORMATTERS) {
            try {
                LocalTime parsed = LocalTime.parse(candidate.toUpperCase(), formatter);
                return OffsetDateTime.of(dayDate, parsed, ZoneOffset.UTC);
            } catch (DateTimeParseException ignored) {
                // Continue trying with the next formatter.
            }
        }
        LocalTime fuzzy = parseFuzzyTimeToken(candidate);
        if (fuzzy != null) {
            return OffsetDateTime.of(dayDate, fuzzy, ZoneOffset.UTC);
        }
        return defaultOffsetTime(dayDate, itemIndex);
    }

    private String extractPrimaryTimeCandidate(String raw) {
        String token = raw;
        String lower = token.toLowerCase();

        int toIndex = lower.indexOf(" to ");
        if (toIndex > 0) {
            token = token.substring(0, toIndex).trim();
        }
        int dashIndex = token.indexOf(" - ");
        if (dashIndex > 0) {
            token = token.substring(0, dashIndex).trim();
        }
        int enDashIndex = token.indexOf("–");
        if (enDashIndex > 0) {
            token = token.substring(0, enDashIndex).trim();
        }

        Matcher matcher = TIME_TOKEN_PATTERN.matcher(token);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return token;
    }

    private LocalTime parseFuzzyTimeToken(String value) {
        String normalized = value.trim().toLowerCase();
        if (normalized.contains("morning")) {
            return LocalTime.of(9, 0);
        }
        if (normalized.contains("afternoon")) {
            return LocalTime.of(14, 0);
        }
        if (normalized.contains("evening")) {
            return LocalTime.of(18, 0);
        }
        if (normalized.contains("night")) {
            return LocalTime.of(20, 0);
        }
        if (normalized.contains("noon")) {
            return LocalTime.NOON;
        }
        if (normalized.contains("midnight")) {
            return LocalTime.MIDNIGHT;
        }
        return null;
    }

    private String formatTime(OffsetDateTime value) {
        if (value == null) {
            return "TBD";
        }
        return value.toLocalTime().format(TIME_24H_FORMATTER);
    }

    private String resolveDisplayTime(ItineraryItem item) {
        if (item.getTimeText() != null
                && !item.getTimeText().isBlank()
                && !"TBD".equalsIgnoreCase(item.getTimeText().trim())) {
            return item.getTimeText().trim();
        }
        return formatTime(item.getTime());
    }

    private String normalizeTimeText(String value) {
        if (value == null || value.isBlank()) {
            return "TBD";
        }
        return value.trim();
    }

    private OffsetDateTime defaultOffsetTime(LocalDate dayDate, int itemIndex) {
        int hour = Math.min(9 + (itemIndex * 2), 21);
        return OffsetDateTime.of(dayDate, LocalTime.of(hour, 0), ZoneOffset.UTC);
    }
}

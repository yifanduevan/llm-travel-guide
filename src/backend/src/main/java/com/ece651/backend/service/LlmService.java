package com.ece651.backend.service;

import com.ece651.backend.api.dto.LlmItineraryRequest;
import com.ece651.backend.api.dto.LlmItineraryResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class LlmService {
    private static final URI OPENAI_CHAT_COMPLETIONS_URI = URI.create("https://api.openai.com/v1/chat/completions");

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;

    public LlmService(
            ObjectMapper objectMapper,
            @Value("${app.llm.openai.api-key:}") String apiKey,
            @Value("${app.llm.openai.model:gpt-4o}") String model) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean hasApiKey() {
        return StringUtils.hasText(apiKey);
    }

    public LlmItineraryResponse generateItinerary(LlmItineraryRequest request) {
        if (!hasApiKey()) {
            throw new IllegalStateException("OpenAI API key is not configured.");
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder(OPENAI_CHAT_COMPLETIONS_URI)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(buildOpenAiPayload(request)))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("OpenAI request failed with status " + response.statusCode() + ".");
            }

            return parseItinerary(response.body());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("OpenAI request was interrupted.", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to call OpenAI.", ex);
        }
    }

    private String buildOpenAiPayload(LlmItineraryRequest request) throws JsonProcessingException {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.put("temperature", 0.3);

        ObjectNode responseFormat = payload.putObject("response_format");
        responseFormat.put("type", "json_object");

        ArrayNode messages = payload.putArray("messages");
        messages.addObject()
                .put("role", "system")
                .put(
                        "content",
                        """
Return a JSON object with this shape:
{"days":[{"date":"YYYY-MM-DD","items":[{"title":"...","time":"...","description":"...","locationText":"..."}]}]}
Do not include markdown or extra keys.
""");
        messages.addObject().put("role", "user").put("content", buildPrompt(request));

        return objectMapper.writeValueAsString(payload);
    }

    private String buildPrompt(LlmItineraryRequest request) {
        LlmItineraryRequest.TripPayload trip = request.trip();
        return """
Create a practical itinerary for this trip:
tripId: %s
destination: %s
startDate: %s
endDate: %s
travelers: %s
budget: %s
notes: %s
"""
                .formatted(
                        request.tripId(),
                        safe(trip.titleOrDestination()),
                        safe(trip.startDate()),
                        safe(trip.endDate()),
                        safe(trip.travelers()),
                        safe(trip.budget()),
                        safe(trip.notes()));
    }

    private LlmItineraryResponse parseItinerary(String responseBody) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(responseBody);
        String content = root.path("choices").path(0).path("message").path("content").asText("");
        if (!StringUtils.hasText(content)) {
            throw new IllegalStateException("OpenAI returned an empty response.");
        }

        JsonNode itineraryNode = objectMapper.readTree(stripCodeFence(content));
        JsonNode rawDays = itineraryNode.path("days");

        List<LlmItineraryResponse.Day> days = new ArrayList<>();
        if (rawDays.isArray()) {
            for (JsonNode rawDay : rawDays) {
                String date = textOrDefault(rawDay.path("date"), "TBD");
                List<LlmItineraryResponse.Item> items = new ArrayList<>();

                JsonNode rawItems = rawDay.path("items");
                if (rawItems.isArray()) {
                    for (JsonNode rawItem : rawItems) {
                        items.add(new LlmItineraryResponse.Item(
                                textOrDefault(rawItem.path("title"), "Activity"),
                                textOrDefault(rawItem.path("time"), "TBD"),
                                textOrDefault(rawItem.path("description"), ""),
                                textOrDefault(rawItem.path("locationText"), "")));
                    }
                }

                days.add(new LlmItineraryResponse.Day(date, items));
            }
        }

        return new LlmItineraryResponse(days);
    }

    private String stripCodeFence(String value) {
        String trimmed = value.trim();
        if (trimmed.startsWith("```")) {
            int firstLineBreak = trimmed.indexOf('\n');
            if (firstLineBreak > -1) {
                trimmed = trimmed.substring(firstLineBreak + 1);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
        }
        return trimmed.trim();
    }

    private String textOrDefault(JsonNode node, String fallback) {
        if (node == null || node.isNull()) {
            return fallback;
        }
        String value = node.asText();
        return StringUtils.hasText(value) ? value : fallback;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}

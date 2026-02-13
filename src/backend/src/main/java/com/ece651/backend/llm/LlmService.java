package com.ece651.backend.llm;

import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.llm.dto.ItineraryResponseLlmDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * LLM Service for trip planning features.
 * Supports OpenAI chat completions API.
 */
@Service
public class LlmService {

    private static final Logger log = LoggerFactory.getLogger(LlmService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.model:gpt-4o-mini}")
    private String model;

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    private static final String SYSTEM_PROMPT = """
        You are a travel planning assistant for the Trip Planner app. Generate day-by-day itineraries based on user preferences.

        RULES:
        - Output only valid JSON matching the schema. No markdown, no code blocks, no commentary.
        - Use dates in ISO format (YYYY-MM-DD). Use times in 24h format (HH:mm).
        - Categories: unspecified (use "unspecified" for itinerary item category).
        - Budget levels: budget, medium, luxury.
        - Travelers: solo, couple, family, group.
        - Be practical: leave buffer between activities, consider opening hours.
        - Items per day: 3-6 activities.
        """;

    private static final String USER_PROMPT_TEMPLATE = """
        Generate a %s trip itinerary for %s from %s to %s.
        Budget: %s. Preferences: %s

        Return JSON with this exact structure:
        {
          "days": [
            {
              "date": "YYYY-MM-DD",
              "items": [
                {
                  "title": "string",
                  "description": "string",
                  "time": "HH:mm",
                  "category": "unspecified",
                  "locationText": "string"
                }
              ]
            }
          ]
        }
        """;

    public LlmService(
            @Qualifier("llmRestTemplate") RestTemplate llmRestTemplate,
            ObjectMapper objectMapper) {
        this.restTemplate = llmRestTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate itinerary for a trip using the LLM.
     *
     * @param trip the trip entity
     * @return parsed itinerary response, or null if LLM is not configured or fails
     */
    public ItineraryResponseLlmDto generateItinerary(Trip trip) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("LLM_API_KEY not set - skipping itinerary generation");
            return null;
        }

        String userPrompt = buildUserPrompt(trip);
        String rawResponse = callOpenAi(SYSTEM_PROMPT, userPrompt);
        if (rawResponse == null) {
            return null;
        }

        return parseItineraryResponse(rawResponse);
    }

    private String buildUserPrompt(Trip trip) {
        String destination = trip.getTitleOrDestination();
        String travelers = trip.getTravelers().getDbValue();
        String budget = trip.getBudget().getDbValue();
        String startDate = trip.getStartDate() != null ? trip.getStartDate().toString() : "unknown";
        String endDate = trip.getEndDate() != null ? trip.getEndDate().toString() : "unknown";
        String notes = trip.getNotes() != null ? trip.getNotes() : "none";

        return String.format(
                USER_PROMPT_TEMPLATE,
                travelers,
                destination,
                startDate,
                endDate,
                budget,
                notes);
    }

    @SuppressWarnings("unchecked")
    private String callOpenAi(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)),
                    "temperature", 0.5,
                    "max_tokens", 2000);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            String url = baseUrl + "/chat/completions";

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getBody() == null) {
                log.error("OpenAI returned empty body");
                return null;
            }

            List<Map> choices = (List<Map>) response.getBody().get("choices");
            if (choices == null || choices.isEmpty()) {
                log.error("OpenAI returned no choices");
                return null;
            }

            Map choice = choices.get(0);
            Map message = (Map) choice.get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            log.error("Failed to call OpenAI: {}", e.getMessage());
            return null;
        }
    }

    private ItineraryResponseLlmDto parseItineraryResponse(String raw) {
        try {
            String trimmed = raw.trim();
            if (trimmed.startsWith("```")) {
                int start = trimmed.indexOf("{");
                int end = trimmed.lastIndexOf("}") + 1;
                if (start >= 0 && end > start) {
                    trimmed = trimmed.substring(start, end);
                }
            }
            return objectMapper.readValue(trimmed, ItineraryResponseLlmDto.class);
        } catch (Exception e) {
            log.error("Failed to parse LLM response: {}", e.getMessage());
            return null;
        }
    }
}

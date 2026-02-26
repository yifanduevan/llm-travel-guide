package com.ece651.backend.service;

import com.ece651.backend.api.dto.TripGenerateRequest;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.PriceTier;
import com.ece651.backend.domain.enums.TransportType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OpenAiTripGenerationService implements TripGenerationService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final Logger log = LoggerFactory.getLogger(OpenAiTripGenerationService.class);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final String endpoint;

    public OpenAiTripGenerationService(
            ObjectMapper objectMapper,
            @Value("${app.llm.openai.api-key:}") String apiKey,
            @Value("${app.llm.openai.model:gpt-4.1-mini}") String model,
            @Value("${app.llm.openai.endpoint:https://api.openai.com/v1/responses}") String endpoint) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = endpoint;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    @Override
    public TripGenerationResult generatePlan(TripGenerateRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Trip generation fallback: OPENAI_API_KEY is missing or blank");
            return fallbackPlan(request);
        }

        try {
            String prompt = buildPrompt(request);
            String responseBody = callOpenAi(prompt);
            TripGenerationResult parsed = parsePlan(responseBody);
            if (parsed != null) {
                return parsed;
            }
            log.warn("Trip generation fallback: OpenAI response parsed but missing required fields");
        } catch (Exception ignored) {
            log.warn("Trip generation fallback: OpenAI call or parsing failed: {}", ignored.getMessage(), ignored);
        }
        return fallbackPlan(request);
    }

    private String callOpenAi(String prompt) throws IOException, InterruptedException {
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "model", model,
                "input", List.of(
                        java.util.Map.of("role", "system", "content", "You are a concise travel planning assistant that returns only valid JSON."),
                        java.util.Map.of("role", "user", "content", prompt)),
                "temperature", 0.7));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String bodyPreview = response.body() == null
                    ? ""
                    : response.body().substring(0, Math.min(response.body().length(), 400));
            throw new IOException("OpenAI returned status " + response.statusCode() + " body=" + bodyPreview);
        }
        return response.body();
    }

    private TripGenerationResult parsePlan(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        String outputText = root.path("output_text").asText("").trim();
        if (outputText.isBlank()) {
            outputText = collectOutputText(root.path("output"));
        }
        if (outputText.isBlank()) {
            return null;
        }

        String jsonText = extractJsonBlock(outputText);
        JsonNode plan = objectMapper.readTree(jsonText);

        String notes = textOr(plan, "notes", "");
        List<TripGenerationResult.TransportSuggestion> transport = parseTransport(plan.path("transportSegments"));
        List<TripGenerationResult.DiningSuggestion> dining = parseDining(plan.path("diningReservations"));
        List<TripGenerationResult.AccommodationSuggestion> stays = parseAccommodations(plan.path("accommodations"));
        List<TripGenerationResult.ActivitySuggestion> activities = parseActivities(plan.path("activities"));

        if (notes.isBlank()) {
            return null;
        }

        return new TripGenerationResult(notes, transport, dining, stays, activities);
    }

    private List<TripGenerationResult.TransportSuggestion> parseTransport(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }
        return stream(node)
                .limit(3)
                .map(item -> new TripGenerationResult.TransportSuggestion(
                        parseTransportType(textOr(item, "type", "FLIGHT")),
                        textOr(item, "title", "Suggested route"),
                        blankToNull(textOr(item, "startLocation", "")),
                        blankToNull(textOr(item, "endLocation", "")),
                        blankToNull(textOr(item, "durationText", ""))))
                .toList();
    }

    private List<TripGenerationResult.DiningSuggestion> parseDining(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }
        return stream(node)
                .limit(4)
                .map(item -> new TripGenerationResult.DiningSuggestion(
                        textOr(item, "name", "Recommended dining spot"),
                        blankToNull(textOr(item, "cuisine", "")),
                        parsePriceTier(textOr(item, "priceTier", "TIER_2")),
                        blankToNull(textOr(item, "notes", ""))))
                .toList();
    }

    private List<TripGenerationResult.AccommodationSuggestion> parseAccommodations(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }
        return stream(node)
                .limit(3)
                .map(item -> new TripGenerationResult.AccommodationSuggestion(
                        textOr(item, "name", "Suggested stay"),
                        blankToNull(textOr(item, "address", "")),
                        blankToNull(textOr(item, "roomType", "")),
                        blankToNull(textOr(item, "notes", ""))))
                .toList();
    }

    private List<TripGenerationResult.ActivitySuggestion> parseActivities(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }
        return stream(node)
                .limit(6)
                .map(item -> new TripGenerationResult.ActivitySuggestion(
                        textOr(item, "title", "Suggested activity"),
                        blankToNull(textOr(item, "description", "")),
                        blankToNull(textOr(item, "durationText", "")),
                        blankToNull(textOr(item, "ticketType", "")),
                        blankToNull(textOr(item, "language", ""))))
                .toList();
    }

    private String buildPrompt(TripGenerateRequest request) {
        String interests = String.join(", ", sanitizeInterests(request.interests()));
        return "Create a JSON object for a trip plan with these details:\n"
                + "Destination: "
                + request.titleOrDestination()
                + "\n"
                + "Dates: "
                + DATE_FORMATTER.format(request.startDate())
                + " to "
                + DATE_FORMATTER.format(request.endDate())
                + "\n"
                + "Travelers: "
                + request.travelers().name()
                + "\n"
                + "Budget: "
                + request.budget().name()
                + "\n"
                + "Interests: "
                + (interests.isBlank() ? "none specified" : interests)
                + "\n\n"
                + "Return only JSON with schema:\n"
                + "{\n"
                + "  \"notes\": string,\n"
                + "  \"transportSegments\": [{\"type\": \"FLIGHT|TRAIN|CAR|BUS|OTHER\", \"title\": string, \"startLocation\": string, \"endLocation\": string, \"durationText\": string}],\n"
                + "  \"diningReservations\": [{\"name\": string, \"cuisine\": string, \"priceTier\": \"TIER_1|TIER_2|TIER_3\", \"notes\": string}],\n"
                + "  \"accommodations\": [{\"name\": string, \"address\": string, \"roomType\": string, \"notes\": string}],\n"
                + "  \"activities\": [{\"title\": string, \"description\": string, \"durationText\": string, \"ticketType\": string, \"language\": string}]\n"
                + "}\n"
                + "Use 1-2 transport segments, 2-4 dining suggestions, 1-2 accommodations, and 3-6 activities.";
    }

    private TripGenerationResult fallbackPlan(TripGenerateRequest request) {
        String destination = request.titleOrDestination().trim();
        String interests = String.join(", ", sanitizeInterests(request.interests()));
        String notes = "Overview: "
                + destination
                + " is planned as a "
                + request.budget().name().toLowerCase()
                + " trip for "
                + request.travelers().name().toLowerCase()
                + ".\n"
                + "Transport: Book the primary route early and keep local transit flexible.\n"
                + "Dining: Prioritize spots aligned with "
                + (interests.isBlank() ? "your interests" : interests)
                + ".\n"
                + "Stay: Choose a central base to minimize daily travel.\n"
                + "Activities: Mix one highlight each day with open exploration time.";

        PriceTier tier = switch (request.budget()) {
            case BUDGET -> PriceTier.TIER_1;
            case MEDIUM -> PriceTier.TIER_2;
            case LUXURY -> PriceTier.TIER_3;
        };

        List<TripGenerationResult.TransportSuggestion> transport = List.of(
                new TripGenerationResult.TransportSuggestion(
                        TransportType.FLIGHT,
                        "Flight to " + destination,
                        "Home Airport",
                        destination,
                        "~8-12 hours"),
                new TripGenerationResult.TransportSuggestion(
                        TransportType.TRAIN,
                        "Local transit pass",
                        destination,
                        destination,
                        "Daily urban travel"));

        List<TripGenerationResult.DiningSuggestion> dining = List.of(
                new TripGenerationResult.DiningSuggestion("Chef's Table", "Local", tier, "Reserve for first evening"),
                new TripGenerationResult.DiningSuggestion("Neighborhood Bistro", "Regional", tier, "Good mid-trip option"));

        List<TripGenerationResult.AccommodationSuggestion> stays = List.of(
                new TripGenerationResult.AccommodationSuggestion(
                        destination + " Central Hotel",
                        "City Center",
                        "Standard Room",
                        "Walkable to key attractions"));

        List<TripGenerationResult.ActivitySuggestion> activities = List.of(
                new TripGenerationResult.ActivitySuggestion(
                        "City highlights walking tour",
                        "Introductory guided tour of major neighborhoods.",
                        "3 hours",
                        "Mobile Ticket",
                        "English"),
                new TripGenerationResult.ActivitySuggestion(
                        "Food market exploration",
                        "Sample signature local dishes and seasonal snacks.",
                        "2 hours",
                        "Open entry",
                        "Local / English"),
                new TripGenerationResult.ActivitySuggestion(
                        "Landmark sunset viewpoint",
                        "End the day with skyline or waterfront views.",
                        "1.5 hours",
                        "Timed entry",
                        "Any"));

        return new TripGenerationResult(notes, transport, dining, stays, activities);
    }

    private TransportType parseTransportType(String value) {
        try {
            return TransportType.valueOf(value.toUpperCase());
        } catch (Exception ignored) {
            return TransportType.OTHER;
        }
    }

    private PriceTier parsePriceTier(String value) {
        try {
            return PriceTier.valueOf(value.toUpperCase());
        } catch (Exception ignored) {
            return PriceTier.TIER_2;
        }
    }

    private String collectOutputText(JsonNode output) {
        if (!output.isArray()) {
            return "";
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode item : output) {
            JsonNode content = item.path("content");
            if (!content.isArray()) {
                continue;
            }
            for (JsonNode part : content) {
                String value = part.path("text").asText("");
                if (!value.isBlank()) {
                    if (!text.isEmpty()) {
                        text.append("\n");
                    }
                    text.append(value.trim());
                }
            }
        }
        return text.toString();
    }

    private String extractJsonBlock(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstNewline > -1 && lastFence > firstNewline) {
                return trimmed.substring(firstNewline + 1, lastFence).trim();
            }
        }
        return trimmed;
    }

    private java.util.stream.Stream<JsonNode> stream(JsonNode array) {
        return java.util.stream.StreamSupport.stream(array.spliterator(), false);
    }

    private String textOr(JsonNode node, String field, String fallback) {
        String value = node.path(field).asText("").trim();
        return value.isBlank() ? fallback : value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private List<String> sanitizeInterests(List<String> interests) {
        if (interests == null) {
            return List.of();
        }
        return interests.stream().filter(Objects::nonNull).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}

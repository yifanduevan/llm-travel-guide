package com.ece651.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GooglePlacesPhotoService {

    private static final Logger log = LoggerFactory.getLogger(GooglePlacesPhotoService.class);
    private static final String FALLBACK_HOTEL =
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
    private static final String FALLBACK_RESTAURANT =
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GooglePlacesPhotoService(
            ObjectMapper objectMapper,
            @Value("${app.google.places.api-key:}") String apiKey) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    public String fetchHotelPhotoUrl(String name, String destination) {
        return fetchPhotoUrl(name, destination, "lodging", "hotel", FALLBACK_HOTEL);
    }

    public String fetchRestaurantPhotoUrl(String name, String destination) {
        return fetchPhotoUrl(name, destination, "restaurant", "restaurant", FALLBACK_RESTAURANT);
    }

    private String fetchPhotoUrl(String name, String destination, String type, String suffix, String fallback) {
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("Google Places API key not configured; using fallback image");
            return fallback;
        }
        try {
            String query = URLEncoder.encode(name + " " + suffix + " " + destination, StandardCharsets.UTF_8);
            String searchUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                    + "?query=" + query + "&type=" + type + "&key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(searchUrl))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Places Text Search returned HTTP {}", response.statusCode());
                return fallback;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode results = root.path("results");
            if (!results.isArray() || results.isEmpty()) {
                log.info("No Places results for '{}'", name);
                return fallback;
            }

            JsonNode photos = results.get(0).path("photos");
            if (!photos.isArray() || photos.isEmpty()) {
                log.info("No photos for '{}'", name);
                return fallback;
            }

            String photoReference = photos.get(0).path("photo_reference").asText("");
            if (photoReference.isBlank()) {
                return fallback;
            }

            return "https://maps.googleapis.com/maps/api/place/photo"
                    + "?maxwidth=600&photo_reference=" + photoReference + "&key=" + apiKey;
        } catch (Exception e) {
            log.warn("Failed to fetch Places photo for '{}': {}", name, e.getMessage());
            return fallback;
        }
    }
}

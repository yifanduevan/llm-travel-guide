package com.ece651.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.ece651.backend.api.dto.TripGenerateRequest;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.PriceTier;
import com.ece651.backend.domain.enums.TransportType;
import com.ece651.backend.domain.enums.Travelers;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class OpenAiTripGenerationServiceTest {

    @Test
    void generatePlan_returnsFallbackWhenApiKeyIsBlank() {
        OpenAiTripGenerationService service = new OpenAiTripGenerationService(
                new ObjectMapper(),
                new LlmApiKeyResolver("env", "   ", ""),
                "gpt-test",
                "managed-api",
                "http://localhost/unused",
                "");

        TripGenerateRequest request = request(
            Budget.LUXURY,
            java.util.Arrays.asList(" art ", "", null, "food"));

        TripGenerationResult result = service.generatePlan(request);

        assertThat(result.notes()).contains("luxury trip");
        assertThat(result.notes()).contains("art, food");
        assertThat(result.transportSegments()).hasSize(2);
        assertThat(result.diningReservations()).hasSize(2);
        assertThat(result.diningReservations().get(0).priceTier()).isEqualTo(PriceTier.TIER_3);
        assertThat(result.activities()).hasSize(3);
    }

    @Test
    void generatePlan_parsesOutputTextAndAppliesLimitsAndDefaults() throws Exception {
        AtomicReference<String> capturedRequest = new AtomicReference<>("");

        String responseJson = """
                {
                  "output_text": "```json\\n{\\"notes\\":\\"Plan summary\\",\\"transportSegments\\":[{\\"type\\":\\"TRAIN\\",\\"title\\":\\"A\\"},{\\"type\\":\\"PLANE\\",\\"title\\":\\"B\\"},{\\"type\\":\\"CAR\\",\\"title\\":\\"C\\"},{\\"type\\":\\"BUS\\",\\"title\\":\\"D\\"}],\\"diningReservations\\":[{\\"name\\":\\"D1\\",\\"priceTier\\":\\"TIER_1\\"},{\\"name\\":\\"D2\\",\\"priceTier\\":\\"INVALID\\"},{\\"name\\":\\"D3\\",\\"priceTier\\":\\"TIER_3\\"},{\\"name\\":\\"D4\\",\\"priceTier\\":\\"TIER_2\\"},{\\"name\\":\\"D5\\",\\"priceTier\\":\\"TIER_1\\"}],\\"accommodations\\":[{\\"name\\":\\"S1\\"},{\\"name\\":\\"S2\\"},{\\"name\\":\\"S3\\"},{\\"name\\":\\"S4\\"}],\\"activities\\":[{\\"title\\":\\"A1\\"},{\\"title\\":\\"A2\\"},{\\"title\\":\\"A3\\"},{\\"title\\":\\"A4\\"},{\\"title\\":\\"A5\\"},{\\"title\\":\\"A6\\"},{\\"title\\":\\"A7\\"}]}\\n```"
                }
                """;

        try (LocalServer server = new LocalServer(200, responseJson, capturedRequest)) {
            OpenAiTripGenerationService service = new OpenAiTripGenerationService(
                    new ObjectMapper(),
                    new LlmApiKeyResolver("env", "test-key", ""),
                    "gpt-test",
                    "managed-api",
                    server.url(),
                    "");

            TripGenerationResult result = service.generatePlan(request(Budget.MEDIUM, List.of("museum", " food ")));

            assertThat(result.notes()).isEqualTo("Plan summary");
            assertThat(result.transportSegments()).hasSize(3);
            assertThat(result.transportSegments().get(0).type()).isEqualTo(TransportType.TRAIN);
            assertThat(result.transportSegments().get(1).type()).isEqualTo(TransportType.OTHER);
            assertThat(result.diningReservations()).hasSize(4);
            assertThat(result.diningReservations().get(1).priceTier()).isEqualTo(PriceTier.TIER_2);
            assertThat(result.accommodations()).hasSize(3);
            assertThat(result.activities()).hasSize(6);

            String payload = capturedRequest.get();
            assertThat(payload).contains("gpt-test");
            assertThat(payload).contains("Destination: Paris");
            assertThat(payload).contains("Interests: museum, food");
        }
    }

    @Test
    void generatePlan_usesOutputArrayWhenOutputTextMissing() throws Exception {
        String responseJson = """
                {
                  "output": [
                    {
                      "content": [
                        {
                          "text": "{\\"notes\\":\\"From content array\\",\\"transportSegments\\":[],\\"diningReservations\\":[],\\"accommodations\\":[],\\"activities\\":[]}"
                        }
                      ]
                    }
                  ]
                }
                """;

        try (LocalServer server = new LocalServer(200, responseJson, new AtomicReference<>(""))) {
            OpenAiTripGenerationService service = new OpenAiTripGenerationService(
                    new ObjectMapper(),
                    new LlmApiKeyResolver("env", "test-key", ""),
                    "gpt-test",
                    "managed-api",
                    server.url(),
                    "");

            TripGenerationResult result = service.generatePlan(request(Budget.BUDGET, List.of()));

            assertThat(result.notes()).isEqualTo("From content array");
            assertThat(result.transportSegments()).isEmpty();
            assertThat(result.diningReservations()).isEmpty();
            assertThat(result.accommodations()).isEmpty();
            assertThat(result.activities()).isEmpty();
        }
    }

    @Test
    void generatePlan_fallsBackWhenServerReturnsError() throws Exception {
        try (LocalServer server = new LocalServer(500, "{\"error\":\"boom\"}", new AtomicReference<>(""))) {
            OpenAiTripGenerationService service = new OpenAiTripGenerationService(
                    new ObjectMapper(),
                    new LlmApiKeyResolver("env", "test-key", ""),
                    "gpt-test",
                    "managed-api",
                    server.url(),
                    "");

            TripGenerationResult result = service.generatePlan(request(Budget.BUDGET, List.of("hiking")));

            assertThat(result.notes()).contains("budget trip");
            assertThat(result.diningReservations().get(0).priceTier()).isEqualTo(PriceTier.TIER_1);
        }
    }

    private TripGenerateRequest request(Budget budget, List<String> interests) {
        return new TripGenerateRequest(
                "Paris",
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 7, 5),
                Travelers.COUPLE,
                budget,
                interests);
    }

    private static final class LocalServer implements AutoCloseable {
        private final HttpServer server;

        private LocalServer(int statusCode, String body, AtomicReference<String> requestBodySink) throws IOException {
            server = HttpServer.create(new InetSocketAddress(0), 0);
            server.createContext("/", exchange -> handle(exchange, statusCode, body, requestBodySink));
            server.start();
        }

        private void handle(HttpExchange exchange, int statusCode, String body, AtomicReference<String> requestBodySink)
                throws IOException {
            try (InputStream in = exchange.getRequestBody()) {
                requestBodySink.set(new String(in.readAllBytes(), StandardCharsets.UTF_8));
            }
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(statusCode, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        }

        private String url() {
            return "http://127.0.0.1:" + server.getAddress().getPort() + "/";
        }

        @Override
        public void close() {
            server.stop(0);
        }
    }
}
package com.ece651.backend.llm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import com.ece651.backend.llm.dto.ItineraryResponseLlmDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
class LlmServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private LlmService llmService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        llmService = new LlmService(restTemplate, objectMapper);
    }

    private Trip createTestTrip() {
        User user = new User();
        user.setId(UUID.randomUUID());
        return new Trip(
                UUID.randomUUID(), user, "Paris",
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 3),
                Travelers.COUPLE, Budget.MEDIUM, "Visit museums",
                TripStatus.DRAFT, OffsetDateTime.now(), OffsetDateTime.now());
    }

    @Test
    void generateItinerary_returnsNull_whenApiKeyIsBlank() {
        ReflectionTestUtils.setField(llmService, "apiKey", "");
        ItineraryResponseLlmDto result = llmService.generateItinerary(createTestTrip());
        assertThat(result).isNull();
    }

    @Test
    void generateItinerary_returnsNull_whenApiKeyIsNull() {
        ReflectionTestUtils.setField(llmService, "apiKey", null);
        ItineraryResponseLlmDto result = llmService.generateItinerary(createTestTrip());
        assertThat(result).isNull();
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateItinerary_parsesDaysFromValidResponse() {
        ReflectionTestUtils.setField(llmService, "apiKey", "test-key");
        ReflectionTestUtils.setField(llmService, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(llmService, "chatCompletionsUrl", "https://api.openai.com/v1/chat/completions");

        String jsonContent = """
                {"days":[{"date":"2026-06-01","items":[{"title":"Louvre Museum","description":"Visit the famous museum","time":"09:00","category":"unspecified","locationText":"Paris"}]}]}""";

        Map<String, Object> responseBody = Map.of(
                "choices", java.util.List.of(
                        Map.of("message", Map.of("content", jsonContent))));

        when(restTemplate.postForEntity(any(String.class), any(HttpEntity.class), any(Class.class)))
                .thenReturn(new ResponseEntity<>(responseBody, HttpStatus.OK));

        ItineraryResponseLlmDto result = llmService.generateItinerary(createTestTrip());

        assertThat(result).isNotNull();
        assertThat(result.days()).hasSize(1);
        assertThat(result.days().get(0).date()).isEqualTo("2026-06-01");
        assertThat(result.days().get(0).items()).hasSize(1);
        assertThat(result.days().get(0).items().get(0).title()).isEqualTo("Louvre Museum");
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateItinerary_handlesMarkdownFencedJson() {
        ReflectionTestUtils.setField(llmService, "apiKey", "test-key");
        ReflectionTestUtils.setField(llmService, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(llmService, "chatCompletionsUrl", "https://api.openai.com/v1/chat/completions");

        String fencedContent = "```json\n{\"days\":[{\"date\":\"2026-06-01\",\"items\":[{\"title\":\"Eiffel Tower\",\"description\":\"Visit\",\"time\":\"10:00\",\"category\":\"unspecified\",\"locationText\":\"Paris\"}]}]}\n```";

        Map<String, Object> responseBody = Map.of(
                "choices", java.util.List.of(
                        Map.of("message", Map.of("content", fencedContent))));

        when(restTemplate.postForEntity(any(String.class), any(HttpEntity.class), any(Class.class)))
                .thenReturn(new ResponseEntity<>(responseBody, HttpStatus.OK));

        ItineraryResponseLlmDto result = llmService.generateItinerary(createTestTrip());

        assertThat(result).isNotNull();
        assertThat(result.days().get(0).items().get(0).title()).isEqualTo("Eiffel Tower");
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateItinerary_returnsNull_whenOpenAiReturnsEmptyBody() {
        ReflectionTestUtils.setField(llmService, "apiKey", "test-key");
        ReflectionTestUtils.setField(llmService, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(llmService, "chatCompletionsUrl", "https://api.openai.com/v1/chat/completions");

        when(restTemplate.postForEntity(any(String.class), any(HttpEntity.class), any(Class.class)))
                .thenReturn(new ResponseEntity<>(null, HttpStatus.OK));

        ItineraryResponseLlmDto result = llmService.generateItinerary(createTestTrip());
        assertThat(result).isNull();
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateItinerary_returnsNull_whenOpenAiThrows() {
        ReflectionTestUtils.setField(llmService, "apiKey", "test-key");
        ReflectionTestUtils.setField(llmService, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(llmService, "chatCompletionsUrl", "https://api.openai.com/v1/chat/completions");

        when(restTemplate.postForEntity(any(String.class), any(HttpEntity.class), any(Class.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        ItineraryResponseLlmDto result = llmService.generateItinerary(createTestTrip());
        assertThat(result).isNull();
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateItinerary_returnsNull_whenResponseIsInvalidJson() {
        ReflectionTestUtils.setField(llmService, "apiKey", "test-key");
        ReflectionTestUtils.setField(llmService, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(llmService, "chatCompletionsUrl", "https://api.openai.com/v1/chat/completions");

        Map<String, Object> responseBody = Map.of(
                "choices", java.util.List.of(
                        Map.of("message", Map.of("content", "This is not JSON at all"))));

        when(restTemplate.postForEntity(any(String.class), any(HttpEntity.class), any(Class.class)))
                .thenReturn(new ResponseEntity<>(responseBody, HttpStatus.OK));

        ItineraryResponseLlmDto result = llmService.generateItinerary(createTestTrip());
        assertThat(result).isNull();
    }
}

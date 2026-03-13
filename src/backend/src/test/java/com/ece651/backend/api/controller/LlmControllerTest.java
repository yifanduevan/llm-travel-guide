package com.ece651.backend.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.ece651.backend.domain.entity.Trip;
import com.ece651.backend.domain.entity.User;
import com.ece651.backend.domain.enums.Budget;
import com.ece651.backend.domain.enums.Travelers;
import com.ece651.backend.domain.enums.TripStatus;
import com.ece651.backend.llm.LlmService;
import com.ece651.backend.llm.dto.ItineraryDayLlmDto;
import com.ece651.backend.llm.dto.ItineraryItemLlmDto;
import com.ece651.backend.llm.dto.ItineraryResponseLlmDto;
import com.ece651.backend.repository.TripRepository;
import com.ece651.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class LlmControllerTest {

    @Mock private TripRepository tripRepository;
    @Mock private UserRepository userRepository;
    @Mock private LlmService llmService;

    private LlmController controller;
    private User testUser;
    private Trip testTrip;

    @BeforeEach
    void setUp() {
        controller = new LlmController(tripRepository, userRepository, llmService);

        testUser = new User();
        testUser.setId(UUID.randomUUID());

        testTrip = new Trip(
                UUID.randomUUID(), testUser, "Tokyo",
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 5),
                Travelers.SOLO, Budget.MEDIUM, null,
                TripStatus.DRAFT, OffsetDateTime.now(), OffsetDateTime.now());
    }

    @Test
    void generateItinerary_returns401_whenNoUser() {
        when(userRepository.findAll()).thenReturn(List.of());

        ResponseEntity<ItineraryResponseLlmDto> response =
                controller.generateItinerary(UUID.randomUUID());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void generateItinerary_returns404_whenTripNotFound() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        when(tripRepository.findByIdAndUserId(any(UUID.class), any(UUID.class)))
                .thenReturn(Optional.empty());

        ResponseEntity<ItineraryResponseLlmDto> response =
                controller.generateItinerary(UUID.randomUUID());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void generateItinerary_returns500_whenLlmReturnsNull() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        when(tripRepository.findByIdAndUserId(any(UUID.class), any(UUID.class)))
                .thenReturn(Optional.of(testTrip));
        when(llmService.generateItinerary(any(Trip.class))).thenReturn(null);

        ResponseEntity<ItineraryResponseLlmDto> response =
                controller.generateItinerary(testTrip.getId());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void generateItinerary_returns200_withValidItinerary() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        when(tripRepository.findByIdAndUserId(any(UUID.class), any(UUID.class)))
                .thenReturn(Optional.of(testTrip));

        ItineraryResponseLlmDto mockResponse = new ItineraryResponseLlmDto(
                List.of(new ItineraryDayLlmDto("2026-07-01",
                        List.of(new ItineraryItemLlmDto(
                                "Senso-ji Temple", "Historic temple",
                                "09:00", "unspecified", "Asakusa, Tokyo")))));

        when(llmService.generateItinerary(any(Trip.class))).thenReturn(mockResponse);

        ResponseEntity<ItineraryResponseLlmDto> response =
                controller.generateItinerary(testTrip.getId());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().days()).hasSize(1);
        assertThat(response.getBody().days().get(0).items().get(0).title())
                .isEqualTo("Senso-ji Temple");
    }
}

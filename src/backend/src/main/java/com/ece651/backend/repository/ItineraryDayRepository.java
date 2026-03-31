package com.ece651.backend.repository;

import com.ece651.backend.domain.entity.ItineraryDay;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, UUID> {
    List<ItineraryDay> findByTripIdOrderBySortOrderAsc(UUID tripId);
    void deleteByTripId(UUID tripId);
}

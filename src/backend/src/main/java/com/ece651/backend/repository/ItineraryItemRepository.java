package com.ece651.backend.repository;

import com.ece651.backend.domain.entity.ItineraryItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, UUID> {
    List<ItineraryItem> findByDayIdOrderBySortOrderAsc(UUID dayId);
}

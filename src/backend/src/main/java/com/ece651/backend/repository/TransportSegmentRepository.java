package com.ece651.backend.repository;

import com.ece651.backend.domain.entity.TransportSegment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransportSegmentRepository extends JpaRepository<TransportSegment, UUID> {
    List<TransportSegment> findByTripId(UUID tripId);
    Optional<TransportSegment> findByIdAndTripId(UUID id, UUID tripId);
}

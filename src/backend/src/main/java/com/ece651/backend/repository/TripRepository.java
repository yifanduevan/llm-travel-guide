package com.ece651.backend.repository;

import com.ece651.backend.domain.entity.Trip;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findByUserId(UUID userId);
    Optional<Trip> findByIdAndUserId(UUID id, UUID userId);
}

package com.ece651.backend.repository;

import com.ece651.backend.domain.entity.Accommodation;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccommodationRepository extends JpaRepository<Accommodation, UUID> {
    List<Accommodation> findByTripId(UUID tripId);

    Optional<Accommodation> findByIdAndTripId(UUID id, UUID tripId);
}

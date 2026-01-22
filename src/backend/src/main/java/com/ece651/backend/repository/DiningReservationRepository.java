package com.ece651.backend.repository;

import com.ece651.backend.domain.entity.DiningReservation;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiningReservationRepository extends JpaRepository<DiningReservation, UUID> {
    List<DiningReservation> findByTripId(UUID tripId);
    Optional<DiningReservation> findByIdAndTripId(UUID id, UUID tripId);
}
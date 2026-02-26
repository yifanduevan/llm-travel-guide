package com.ece651.backend.service;

import com.ece651.backend.api.dto.TripGenerateRequest;

public interface TripGenerationService {
    TripGenerationResult generatePlan(TripGenerateRequest request);
}

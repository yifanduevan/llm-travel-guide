package com.ece651.backend.api.dto;

import java.util.List;
import java.util.UUID;

public record ActivityDto(
        UUID id,
        String title,
        String price,
        String rating,
        String badge,
        String badgeTone,
        String imageUrl,
        String description,
        List<String> pills) {}

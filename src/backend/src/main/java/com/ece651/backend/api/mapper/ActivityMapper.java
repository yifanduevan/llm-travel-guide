package com.ece651.backend.api.mapper;

import com.ece651.backend.api.dto.ActivityDto;
import com.ece651.backend.domain.entity.Activity;
import com.ece651.backend.domain.enums.ActivityStatus;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class ActivityMapper {
    private ActivityMapper() {}

    public static ActivityDto toDto(Activity activity) {
        return new ActivityDto(
                activity.getId(),
                activity.getTitle(),
                formatPrice(activity),
                formatRating(activity),
                badge(activity.getStatus()),
                badgeTone(activity.getStatus()),
                activity.getImageUrl(),
                activity.getDescription(),
                pills(activity));
    }

    private static String formatPrice(Activity activity) {
        if (activity.getPrice() == null) {
            return "";
        }
        String value = activity.getPrice().setScale(0, RoundingMode.HALF_UP).toPlainString();
        if (activity.getCurrency() == null || activity.getCurrency().isBlank()) {
            return value;
        }
        return activity.getCurrency() + " " + value;
    }

    private static String formatRating(Activity activity) {
        if (activity.getRating() == null) {
            return "";
        }
        return String.format(java.util.Locale.US, "%.1f", activity.getRating());
    }

    private static String badge(ActivityStatus status) {
        if (status == null) {
            return null;
        }
        return switch (status) {
            case BOOKED -> "Booked";
            case WAITLIST -> "Waitlist";
            case PLANNED -> "Planned";
            case CANCELLED -> "Cancelled";
        };
    }

    private static String badgeTone(ActivityStatus status) {
        if (status == null) {
            return null;
        }
        return switch (status) {
            case BOOKED, PLANNED -> "primary";
            case WAITLIST, CANCELLED -> "accent";
        };
    }

    private static List<String> pills(Activity activity) {
        List<String> pills = new ArrayList<>();
        if (activity.getDurationText() != null && !activity.getDurationText().isBlank()) {
            pills.add(activity.getDurationText());
        }
        if (activity.getLanguage() != null && !activity.getLanguage().isBlank()) {
            pills.add(activity.getLanguage());
        }
        if (activity.getTicketType() != null && !activity.getTicketType().isBlank()) {
            pills.add(activity.getTicketType());
        }
        return pills;
    }
}

package com.ece651.backend.domain.entity;

import com.ece651.backend.domain.enums.ItineraryItemCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "itinerary_items")
public class ItineraryItem {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private ItineraryDay day;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "time")
    private OffsetDateTime time;

    @Column(name = "time_text")
    private String timeText;

    @Convert(converter = com.ece651.backend.domain.converter.ItineraryItemCategoryConverter.class)
    @Column(nullable = false, columnDefinition = "itinerary_item_category_enum")
    private ItineraryItemCategory category;

    @Column(name = "location_text")
    private String locationText;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private Boolean completed;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    public ItineraryItem() {}

    public ItineraryItem(
            UUID id,
            ItineraryDay day,
            String title,
            String description,
            OffsetDateTime time,
            String timeText,
            ItineraryItemCategory category,
            String locationText,
            String linkUrl,
            String imageUrl,
            Boolean completed,
            Integer sortOrder) {
        this.id = id;
        this.day = day;
        this.title = title;
        this.description = description;
        this.time = time;
        this.timeText = timeText;
        this.category = category;
        this.locationText = locationText;
        this.linkUrl = linkUrl;
        this.imageUrl = imageUrl;
        this.completed = completed;
        this.sortOrder = sortOrder;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ItineraryDay getDay() {
        return day;
    }

    public void setDay(ItineraryDay day) {
        this.day = day;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public OffsetDateTime getTime() {
        return time;
    }

    public void setTime(OffsetDateTime time) {
        this.time = time;
    }

    public String getTimeText() {
        return timeText;
    }

    public void setTimeText(String timeText) {
        this.timeText = timeText;
    }

    public ItineraryItemCategory getCategory() {
        return category;
    }

    public void setCategory(ItineraryItemCategory category) {
        this.category = category;
    }

    public String getLocationText() {
        return locationText;
    }

    public void setLocationText(String locationText) {
        this.locationText = locationText;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}

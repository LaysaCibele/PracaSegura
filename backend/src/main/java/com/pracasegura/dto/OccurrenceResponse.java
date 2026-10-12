package com.pracasegura.dto;

import java.time.LocalDateTime;

import com.pracasegura.model.Occurrence;

public record OccurrenceResponse(
        Long id,
        String category,
        String description,
        LocalDateTime createdAt,
        String status,
        SquareSummary square
) {
    public static OccurrenceResponse from(Occurrence occurrence) {
        return new OccurrenceResponse(
                occurrence.getId(),
                occurrence.getCategory(),
                occurrence.getDescription(),
                occurrence.getCreatedAt(),
                occurrence.getStatus(),
                new SquareSummary(
                        occurrence.getSquare().getId(),
                        occurrence.getSquare().getName(),
                        occurrence.getSquare().getNeighborhood()));
    }

    public record SquareSummary(Long id, String name, String neighborhood) {}
}

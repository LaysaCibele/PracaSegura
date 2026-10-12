
package com.pracasegura.dto;

import java.util.List;

public record OccurrenceStatsResponse(
        long total,
        List<StatItem> byStatus,
        List<StatItem> byCategory
) {
    public record StatItem(
            String label,
            long total
    ) {}
}
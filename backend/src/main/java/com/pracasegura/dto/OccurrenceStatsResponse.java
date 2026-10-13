
package com.pracasegura.dto;

import java.util.List;

public record OccurrenceStatsResponse(
        long total,
        long securityCategoryTotal,
        long pending,
        long resolved,
        long validStatusDenominator,
        double resolutionRate,
        Double averageResolutionHours,
        List<StatItem> byStatus,
        List<StatItem> byCategory,
        List<MonthItem> byMonth,
        List<Recommendation> recommendations
) {
    public OccurrenceStatsResponse(long total, List<StatItem> byStatus, List<StatItem> byCategory) {
        this(total, 0, 0, 0, 0, 0, null, byStatus, byCategory, List.of(), List.of());
    }

    public record StatItem(
            String label,
            long total
    ) {}

    public record MonthItem(String label, long total) {}

    public record Recommendation(String title, String evidence, String action, String limitation) {}
}

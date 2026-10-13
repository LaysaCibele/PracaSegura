package com.pracasegura.dto;

public record SquareRecommendationResponse(Integer score, String label) {
    public static SquareRecommendationResponse fromCounts(long resolved, long security) {
        long total = resolved + security;
        if (total == 0) return new SquareRecommendationResponse(null, "Sem dados suficientes");

        // Resolutions add positive weight; security reports add a larger negative weight.
        double value = 100.0 * (1.0 + 3.0 * resolved) / (2.0 + 3.0 * resolved + 2.0 * security);
        int score = (int) Math.round(value);
        String label = score >= 75 ? "Muito recomendada"
                : score >= 55 ? "Recomendada"
                : score >= 35 ? "Recomendação moderada"
                : "Pouco recomendada";
        return new SquareRecommendationResponse(score, label);
    }
}

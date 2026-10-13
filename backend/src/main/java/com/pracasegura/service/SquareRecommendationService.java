package com.pracasegura.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pracasegura.dto.SquareRecommendationResponse;
import com.pracasegura.repository.OccurrenceRepository;
import com.pracasegura.repository.SquareRepository;

@Service
public class SquareRecommendationService {
    private final SquareRepository squareRepository;
    private final OccurrenceRepository occurrenceRepository;

    public SquareRecommendationService(SquareRepository squareRepository, OccurrenceRepository occurrenceRepository) {
        this.squareRepository = squareRepository;
        this.occurrenceRepository = occurrenceRepository;
    }

    public SquareRecommendationResponse getForSquare(Long squareId) {
        if (!squareRepository.existsById(squareId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Praça não encontrada: " + squareId);
        }
        long resolved = occurrenceRepository.countBySquareIdAndStatusAndOrigin(squareId, "RESOLVIDA", "REAL");
        long security = occurrenceRepository.countRealSecurityOccurrences(squareId);
        return SquareRecommendationResponse.fromCounts(resolved, security);
    }
}

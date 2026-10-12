package com.pracasegura.service;

import java.util.List;
import java.util.Locale;
import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pracasegura.dto.OccurrenceStatsResponse;
import com.pracasegura.dto.OccurrenceCreateRequest;
import com.pracasegura.model.AppUser;
import com.pracasegura.model.Occurrence;
import com.pracasegura.model.Square;
import com.pracasegura.repository.OccurrenceRepository;
import com.pracasegura.repository.SquareRepository;

@Service
public class OccurrenceService {

private static final Set<String> ALLOWED_STATUSES = Set.of(
        "REGISTRADA",
        "EM_ANALISE",
        "EM_ANDAMENTO",
        "RESOLVIDA"
);

private final OccurrenceRepository occurrenceRepository;
private final SquareRepository squareRepository;

public OccurrenceService(
        OccurrenceRepository occurrenceRepository,
        SquareRepository squareRepository) {
    this.occurrenceRepository = occurrenceRepository;
    this.squareRepository = squareRepository;
}

public List<Occurrence> findAll() {
    return occurrenceRepository.findAll();
}

public List<Occurrence> findByReporterId(Long reporterId) {
    return occurrenceRepository.findByReporterId(reporterId);
}

public List<Occurrence> findByReporterIdAndSquareId(
        Long reporterId, Long squareId) {

    if (!squareRepository.existsById(squareId)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Praça não encontrada: " + squareId
        );
    }

    return occurrenceRepository.findByReporterIdAndSquareId(
            reporterId, squareId
    );
}

public Occurrence findById(Long id) {
    return occurrenceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Ocorrência não encontrada: " + id
            ));
}

public List<Occurrence> findBySquareId(Long squareId) {
    if (!squareRepository.existsById(squareId)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Praça não encontrada: " + squareId
        );
    }

    return occurrenceRepository.findBySquareId(squareId);
}

public Occurrence save(
        Long squareId, OccurrenceCreateRequest request, AppUser reporter) {

    Square square = squareRepository.findById(squareId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Praça não encontrada: " + squareId
            ));

    Occurrence occurrence = new Occurrence();
    occurrence.setCategory(request.category().trim());
    occurrence.setDescription(request.description().trim());
    occurrence.setSquare(square);
    occurrence.setReporter(reporter);
    occurrence.setStatus("REGISTRADA");
    occurrence.setCreatedAt(java.time.LocalDateTime.now());

    return occurrenceRepository.save(occurrence);
}

public Occurrence updateStatus(Long id, String status) {
    Occurrence occurrence = findById(id);

    if (status == null || status.isBlank()) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "O status é obrigatório.");
    }

    String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);

    if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Status inválido. Valores aceitos: " + ALLOWED_STATUSES);
    }

    occurrence.setStatus(normalizedStatus);

    return occurrenceRepository.save(occurrence);
}


public OccurrenceStatsResponse getStats(Long reporterId, Long squareId) {
    if (squareId != null && !squareRepository.existsById(squareId)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Praça não encontrada: " + squareId);
    }

    long total = occurrenceRepository.countOccurrences(reporterId, squareId);

    List<OccurrenceStatsResponse.StatItem> byStatus = occurrenceRepository.countByStatus(reporterId, squareId)
            .stream()
            .map(item -> new OccurrenceStatsResponse.StatItem(
                    item.getLabel(),
                    item.getTotal()))
            .toList();

    Map<String, Long> categoryTotals = new LinkedHashMap<>();
    Map<String, String> categoryLabels = new LinkedHashMap<>();
    occurrenceRepository.countByCategory(reporterId, squareId).forEach(item -> {
        String normalized = normalizeCategory(item.getLabel());
        String categoryKey = "ilumincao".equals(normalized)
                ? "iluminacao"
                : normalized;
        categoryTotals.merge(categoryKey, item.getTotal(), Long::sum);
        categoryLabels.putIfAbsent(categoryKey, categoryDisplayLabel(categoryKey, item.getLabel()));
    });

    List<OccurrenceStatsResponse.StatItem> byCategory = categoryTotals.entrySet()
            .stream()
            .map(entry -> new OccurrenceStatsResponse.StatItem(
                    categoryLabels.get(entry.getKey()),
                    entry.getValue()))
            .toList();

    return new OccurrenceStatsResponse(total, byStatus, byCategory);
}

private String normalizeCategory(String category) {
    return Normalizer.normalize(category.trim(), Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT);
}

private String categoryDisplayLabel(String key, String fallback) {
    return switch (key) {
        case "iluminacao" -> "Iluminação";
        case "infraestrutura" -> "Infraestrutura";
        case "limpeza" -> "Limpeza";
        case "seguranca" -> "Segurança";
        case "acessibilidade" -> "Acessibilidade";
        case "outro" -> "Outro";
        default -> fallback.trim();
    };
}

}

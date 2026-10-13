package com.pracasegura.service;

import java.util.List;
import java.util.Locale;
import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.TreeMap;
import java.util.stream.Collectors;

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
    occurrence.setOrigin("REAL");
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
    occurrence.setResolvedAt("RESOLVIDA".equals(normalizedStatus)
            ? java.time.LocalDateTime.now()
            : null);

    return occurrenceRepository.save(occurrence);
}

public OccurrenceStatsResponse getFilteredStats(
        AppUser viewer,
        boolean manager,
        Long squareId,
        LocalDate from,
        LocalDate to,
        String category,
        String status) {
    List<Occurrence> filtered = getFilteredOccurrences(viewer, manager, squareId, from, to, category, status);

    Map<String, Long> byStatus = new LinkedHashMap<>();
    Map<String, Long> byCategory = new LinkedHashMap<>();
    Map<YearMonth, Long> byMonth = new TreeMap<>();
    long securityTotal = 0;
    long pending = 0;
    long resolved = 0;
    long validStatus = 0;
    long resolutionHoursTotal = 0;
    long resolutionSamples = 0;
    long pendingSecurity = 0;
    long pendingLighting = 0;
    for (Occurrence item : filtered) {
        String itemStatus = safeStatus(item);
        byStatus.merge(itemStatus, 1L, Long::sum);
        String categoryKey = normalizeCategory(item.getCategory());
        byCategory.merge(categoryDisplayLabel(categoryKey, item.getCategory()), 1L, Long::sum);
        byMonth.merge(YearMonth.from(item.getCreatedAt()), 1L, Long::sum);
        boolean isSecurity = "seguranca".equals(categoryKey);
        boolean isLighting = "iluminacao".equals(categoryKey);
        if (isSecurity) securityTotal++;
        if (ALLOWED_STATUSES.contains(itemStatus)) {
            validStatus++;
            if ("RESOLVIDA".equals(itemStatus)) {
                resolved++;
                if (item.getResolvedAt() != null && item.getCreatedAt() != null
                        && !item.getResolvedAt().isBefore(item.getCreatedAt())) {
                    resolutionHoursTotal += ChronoUnit.HOURS.between(item.getCreatedAt(), item.getResolvedAt());
                    resolutionSamples++;
                }
            } else {
                pending++;
                if (isSecurity) pendingSecurity++;
                if (isLighting) pendingLighting++;
            }
        }
    }

    double resolutionRate = validStatus == 0 ? 0 : (double) resolved * 100.0 / validStatus;
    Double averageResolutionHours = resolutionSamples == 0
            ? null
            : (double) resolutionHoursTotal / resolutionSamples;
    List<OccurrenceStatsResponse.Recommendation> recommendations = new ArrayList<>();
    if (pendingSecurity > 0) {
        recommendations.add(new OccurrenceStatsResponse.Recommendation(
                "Revisar relatos de segurança pendentes",
                pendingSecurity + " registros na categoria Segurança ainda sem status Resolvida.",
                "Encaminhar para triagem da equipe responsável e registrar a atualização do atendimento.",
                "São relatos do sistema, não confirmação de crime nem avaliação de risco."));
    }
    if (pendingLighting > 0) {
        recommendations.add(new OccurrenceStatsResponse.Recommendation(
                "Verificar relatos de iluminação pendentes",
                pendingLighting + " registros na categoria Iluminação ainda sem status Resolvida.",
                "Conferir em campo antes de abrir ou priorizar ordem de manutenção.",
                "O inventário de postes não comprova funcionamento dos equipamentos."));
    }
    recommendations.add(new OccurrenceStatsResponse.Recommendation(
            "Completar a coleta de dados antes de calcular um índice de segurança",
            "Não há medida de frequência de visitantes, pesquisa de percepção ou confirmação operacional da iluminação.",
            "Coletar esses dados com período, método e cobertura definidos.",
            "O projeto não produz nota de segurança nem previsão de criminalidade."));

    List<OccurrenceStatsResponse.StatItem> statusItems = byStatus.entrySet().stream()
            .map(entry -> new OccurrenceStatsResponse.StatItem(entry.getKey(), entry.getValue())).toList();
    List<OccurrenceStatsResponse.StatItem> categoryItems = byCategory.entrySet().stream()
            .map(entry -> new OccurrenceStatsResponse.StatItem(entry.getKey(), entry.getValue())).toList();
    List<OccurrenceStatsResponse.MonthItem> monthItems = byMonth.entrySet().stream()
            .map(entry -> new OccurrenceStatsResponse.MonthItem(entry.getKey().toString(), entry.getValue())).toList();

    return new OccurrenceStatsResponse(
            filtered.size(), securityTotal, pending, resolved, validStatus, resolutionRate,
            averageResolutionHours, statusItems, categoryItems, monthItems, recommendations);
}

public List<Occurrence> getFilteredOccurrences(
        AppUser viewer, boolean manager, Long squareId, LocalDate from, LocalDate to,
        String category, String status) {
    if (squareId != null && !squareRepository.existsById(squareId)) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Praça não encontrada: " + squareId);
    }
    List<Occurrence> visible = new ArrayList<>();
    if (manager) {
        visible.addAll(squareId == null ? occurrenceRepository.findAll() : occurrenceRepository.findBySquareId(squareId));
    } else {
        visible.addAll(occurrenceRepository.findByReporterId(viewer.getId()));
    }
    String categoryFilter = category == null || category.isBlank() ? null : normalizeCategory(category);
    String statusFilter = status == null || status.isBlank() ? null : status.trim().toUpperCase(Locale.ROOT);
    return visible.stream()
            .filter(item -> squareId == null || item.getSquare().getId().equals(squareId))
            .filter(item -> item.getCreatedAt() != null)
            .filter(item -> from == null || !item.getCreatedAt().toLocalDate().isBefore(from))
            .filter(item -> to == null || !item.getCreatedAt().toLocalDate().isAfter(to))
            .filter(item -> categoryFilter == null || normalizeCategory(item.getCategory()).equals(categoryFilter))
            .filter(item -> statusFilter == null || safeStatus(item).equals(statusFilter))
            .collect(Collectors.toMap(Occurrence::getId, item -> item, (first, ignored) -> first))
            .values().stream()
            .sorted(Comparator.comparing(Occurrence::getCreatedAt).reversed())
            .toList();
}

private String safeStatus(Occurrence occurrence) {
    return occurrence.getStatus() == null || occurrence.getStatus().isBlank()
            ? "NAO_INFORMADO"
            : occurrence.getStatus().trim().toUpperCase(Locale.ROOT);
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

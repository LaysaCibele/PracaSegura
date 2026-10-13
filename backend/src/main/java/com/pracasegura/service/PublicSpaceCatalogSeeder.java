package com.pracasegura.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.pracasegura.model.Square;
import com.pracasegura.repository.SquareRepository;

/** Idempotentemente enriquece os quatro registros locais e inclui o catálogo curado de 15 espaços. */
@Component
public class PublicSpaceCatalogSeeder implements ApplicationRunner {

    private final SquareRepository squareRepository;
    private final ObjectMapper objectMapper;

    public PublicSpaceCatalogSeeder(SquareRepository squareRepository, ObjectMapper objectMapper) {
        this.squareRepository = squareRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        List<CatalogEntry> catalog;
        try (var stream = new ClassPathResource("public-spaces.json").getInputStream()) {
            catalog = objectMapper.readValue(stream, new TypeReference<List<CatalogEntry>>() {});
        }

        if (catalog.size() != 15) {
            throw new IllegalStateException("O catálogo PraçaSegura deve conter 15 espaços.");
        }

        for (CatalogEntry entry : catalog) {
            Square square = squareRepository.findBySourceKey(entry.sourceKey()).orElseGet(() ->
                    squareRepository.findAll().stream()
                            .filter(candidate -> candidate.getSourceKey() == null)
                            .filter(candidate -> entry.existingAliases() != null && entry.existingAliases().stream()
                                    .anyMatch(alias -> normalize(alias).equals(normalize(candidate.getName()))))
                            .findFirst()
                            .orElseGet(Square::new));

            if (square.getName() == null || square.getName().isBlank()) {
                square.setName(entry.displayName());
            }
            if (square.getType() == null || square.getType().isBlank()) {
                square.setType(entry.type());
            }
            if (square.getArea() == null && entry.area() != null) {
                square.setArea(BigDecimal.valueOf(entry.area()));
            }
            if (blank(square.getNeighborhood())) {
                square.setNeighborhood(entry.neighborhood());
            }
            if (blank(square.getAddress())) {
                square.setAddress(entry.address());
            }
            if (square.getLatitude() == null) {
                square.setLatitude(entry.latitude());
            }
            if (square.getLongitude() == null) {
                square.setLongitude(entry.longitude());
            }
            if (square.getSourceKey() == null) {
                square.setSourceKey(entry.sourceKey());
            }
            squareRepository.save(square);
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    private record CatalogEntry(
            String sourceKey,
            String displayName,
            String type,
            String neighborhood,
            String address,
            Double area,
            Double latitude,
            Double longitude,
            List<Integer> sourceRecordIds,
            CatalogPolygon polygon,
            List<String> existingAliases) {}

    private record CatalogPolygon(String officialName, String sourceName, String neighborhood, String type) {}
}

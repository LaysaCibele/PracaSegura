package com.pracasegura.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.pracasegura.dto.OccurrenceCreateRequest;
import com.pracasegura.model.AppUser;
import com.pracasegura.model.Occurrence;
import com.pracasegura.model.Square;
import com.pracasegura.dto.OccurrenceStatsResponse;
import com.pracasegura.repository.OccurrenceRepository;
import com.pracasegura.repository.SquareRepository;

class OccurrenceServiceTest {
    @Test
    void createUsesServerResolvedSquareReporterAndCreationTime() {
        OccurrenceRepository occurrenceRepository = org.mockito.Mockito.mock(OccurrenceRepository.class);
        SquareRepository squareRepository = org.mockito.Mockito.mock(SquareRepository.class);
        Square square = new Square();
        square.setName("Praça válida");
        AppUser reporter = new AppUser();
        reporter.setEmail("authenticated@example.test");
        LocalDateTime beforeSave = LocalDateTime.now().minusSeconds(1);

        when(squareRepository.findById(4L)).thenReturn(Optional.of(square));
        when(occurrenceRepository.save(any(Occurrence.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Occurrence saved = new OccurrenceService(occurrenceRepository, squareRepository)
                .save(4L, new OccurrenceCreateRequest("  Limpeza ", "  Resíduo  "), reporter);

        assertEquals("Limpeza", saved.getCategory());
        assertEquals("Resíduo", saved.getDescription());
        assertEquals(square, saved.getSquare());
        assertEquals(reporter, saved.getReporter());
        assertEquals("REGISTRADA", saved.getStatus());
        assertEquals("REAL", saved.getOrigin());
        assertNotNull(saved.getCreatedAt());
        org.junit.jupiter.api.Assertions.assertTrue(saved.getCreatedAt().isAfter(beforeSave));
    }

    @Test
    void statsCombinesIluminacaoAndKnownMisspelling() {
        OccurrenceRepository occurrenceRepository = org.mockito.Mockito.mock(OccurrenceRepository.class);
        SquareRepository squareRepository = org.mockito.Mockito.mock(SquareRepository.class);
        OccurrenceRepository.OccurrenceCount correct = org.mockito.Mockito.mock(OccurrenceRepository.OccurrenceCount.class);
        OccurrenceRepository.OccurrenceCount misspelled = org.mockito.Mockito.mock(OccurrenceRepository.OccurrenceCount.class);

        when(occurrenceRepository.countOccurrences(null, null)).thenReturn(3L);
        when(occurrenceRepository.countByStatus(null, null)).thenReturn(List.of());
        when(occurrenceRepository.countByCategory(null, null)).thenReturn(List.of(correct, misspelled));
        when(correct.getLabel()).thenReturn("iluminação");
        when(correct.getTotal()).thenReturn(2L);
        when(misspelled.getLabel()).thenReturn("ilumincao");
        when(misspelled.getTotal()).thenReturn(1L);

        OccurrenceStatsResponse stats = new OccurrenceService(occurrenceRepository, squareRepository)
                .getStats(null, null);

        assertEquals(1, stats.byCategory().size());
        assertEquals("Iluminação", stats.byCategory().get(0).label());
        assertEquals(3L, stats.byCategory().get(0).total());
    }

    @Test
    void filteredCitizenStatsIncludeOnlyOwnOccurrences() {
        OccurrenceRepository occurrenceRepository = org.mockito.Mockito.mock(OccurrenceRepository.class);
        SquareRepository squareRepository = org.mockito.Mockito.mock(SquareRepository.class);
        AppUser citizen = new AppUser();
        org.springframework.test.util.ReflectionTestUtils.setField(citizen, "id", 3L);
        Square square = new Square();
        square.setName("Praça Central");

        Occurrence own = new Occurrence();
        own.setCategory("Segurança");
        own.setStatus("EM_ANALISE");
        own.setCreatedAt(LocalDateTime.of(2026, 10, 1, 10, 0));
        own.setSquare(square);
        org.springframework.test.util.ReflectionTestUtils.setField(own, "id", 1L);

        when(occurrenceRepository.findByReporterId(3L)).thenReturn(List.of(own));

        OccurrenceStatsResponse stats = new OccurrenceService(occurrenceRepository, squareRepository)
                .getFilteredStats(citizen, false, null, null, null, null, null);

        assertEquals(1L, stats.total());
        assertEquals(1L, stats.securityCategoryTotal());
        assertEquals(1L, stats.pending());
        assertEquals(0L, stats.resolved());
        assertEquals(1L, stats.validStatusDenominator());
        assertEquals(0.0, stats.resolutionRate());
        org.junit.jupiter.api.Assertions.assertNull(stats.averageResolutionHours());
        assertEquals(1, stats.byMonth().size());
        org.junit.jupiter.api.Assertions.assertFalse(stats.recommendations().isEmpty());
    }

}

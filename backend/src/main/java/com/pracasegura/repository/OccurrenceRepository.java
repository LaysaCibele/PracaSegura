package com.pracasegura.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pracasegura.model.Occurrence;

@Repository
public interface OccurrenceRepository extends JpaRepository<Occurrence, Long> {

List<Occurrence> findBySquareId(Long squareId);

List<Occurrence> findByReporterId(Long reporterId);

List<Occurrence> findByReporterIdAndSquareId(Long reporterId, Long squareId);

List<Occurrence> findByOrigin(String origin);

boolean existsByExternalKey(String externalKey);

long countBySquareIdAndStatusAndOrigin(Long squareId, String status, String origin);

@Query("""
    SELECT COUNT(o)
    FROM Occurrence o
    WHERE o.square.id = :squareId
      AND o.origin = 'REAL'
      AND LOWER(TRIM(o.category)) IN ('segurança', 'seguranca')
    """)
long countRealSecurityOccurrences(@Param("squareId") Long squareId);

@Query("""
    SELECT o.status AS label, COUNT(o) AS total
    FROM Occurrence o
    WHERE (:reporterId IS NULL OR o.reporter.id = :reporterId)
      AND (:squareId IS NULL OR o.square.id = :squareId)
    GROUP BY o.status
    """)
List<OccurrenceCount> countByStatus(
        @Param("reporterId") Long reporterId,
        @Param("squareId") Long squareId
);

@Query("""
    SELECT LOWER(TRIM(o.category)) AS label, COUNT(o) AS total
    FROM Occurrence o
    WHERE (:reporterId IS NULL OR o.reporter.id = :reporterId)
      AND (:squareId IS NULL OR o.square.id = :squareId)
    GROUP BY LOWER(TRIM(o.category))
    """)
List<OccurrenceCount> countByCategory(
        @Param("reporterId") Long reporterId,
        @Param("squareId") Long squareId
);

@Query("""
    SELECT COUNT(o)
    FROM Occurrence o
    WHERE (:reporterId IS NULL OR o.reporter.id = :reporterId)
      AND (:squareId IS NULL OR o.square.id = :squareId)
    """)
long countOccurrences(
        @Param("reporterId") Long reporterId,
        @Param("squareId") Long squareId
);

interface OccurrenceCount {
    String getLabel();
    Long getTotal();
}
}

package com.pracasegura.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pracasegura.model.Occurrence;

@Repository
public interface OccurrenceRepository extends JpaRepository<Occurrence, Long> {

List<Occurrence> findBySquareId(Long squareId);

List<Occurrence> findByReporterId(Long reporterId);

List<Occurrence> findByReporterIdAndSquareId(Long reporterId, Long squareId);

}

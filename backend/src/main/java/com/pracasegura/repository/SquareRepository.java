package com.pracasegura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pracasegura.model.Square;

import java.util.Optional;

@Repository
public interface SquareRepository extends JpaRepository<Square, Long> {
    Optional<Square> findBySourceKey(String sourceKey);
}

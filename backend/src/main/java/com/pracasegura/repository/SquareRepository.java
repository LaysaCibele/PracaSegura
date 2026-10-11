package com.pracasegura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pracasegura.model.Square;

@Repository
public interface SquareRepository extends JpaRepository<Square, Long> {
}

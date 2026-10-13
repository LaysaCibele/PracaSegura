
package com.pracasegura.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pracasegura.model.Square;
import com.pracasegura.service.SquareService;
import com.pracasegura.service.SquareRecommendationService;
import com.pracasegura.dto.SquareRecommendationResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/squares")
public class SquareController {

    private final SquareService squareService;
    private final SquareRecommendationService recommendationService;

    public SquareController(SquareService squareService, SquareRecommendationService recommendationService) {
        this.squareService = squareService;
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<Square> findAll() {
        return squareService.findAll();
    }

    @GetMapping("/{id}")
    public Square findById(@PathVariable Long id) {
        return squareService.findById(id);
    }

    @GetMapping("/{id}/recommendation")
    public SquareRecommendationResponse getRecommendation(@PathVariable Long id) {
        return recommendationService.getForSquare(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Square create(@Valid @RequestBody Square square) {
        return squareService.save(square);
    }

    @PutMapping("/{id}")
    public Square update(
            @PathVariable Long id,
            @Valid @RequestBody Square square) {
        return squareService.update(id, square);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        squareService.delete(id);
    }
}

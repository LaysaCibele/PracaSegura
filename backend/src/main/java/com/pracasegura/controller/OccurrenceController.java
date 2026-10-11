package com.pracasegura.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pracasegura.dto.OccurrenceStatusRequest;
import com.pracasegura.model.Occurrence;
import com.pracasegura.service.OccurrenceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/occurrences")
public class OccurrenceController {

    private final OccurrenceService occurrenceService;

    public OccurrenceController(OccurrenceService occurrenceService) {
        this.occurrenceService = occurrenceService;
    }

    @GetMapping
    public List<Occurrence> findAll(
            @RequestParam(required = false) Long squareId) {

        if (squareId != null) {
            return occurrenceService.findBySquareId(squareId);
        }

        return occurrenceService.findAll();
    }

    @GetMapping("/{id}")
    public Occurrence findById(@PathVariable Long id) {
        return occurrenceService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Occurrence create(
            @RequestParam Long squareId,
            @Valid @RequestBody Occurrence occurrence) {

        return occurrenceService.save(squareId, occurrence);
    }

    @PatchMapping("/{id}/status")
    public Occurrence updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OccurrenceStatusRequest request) {

        return occurrenceService.updateStatus(
                id,
                request.getStatus()
        );
    }
}


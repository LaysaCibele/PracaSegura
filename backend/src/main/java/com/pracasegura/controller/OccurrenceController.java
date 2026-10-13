package com.pracasegura.controller;

import java.util.List;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.pracasegura.dto.OccurrenceCreateRequest;
import com.pracasegura.dto.OccurrenceResponse;
import com.pracasegura.dto.OccurrenceStatsResponse;
import com.pracasegura.dto.OccurrenceStatusRequest;
import com.pracasegura.model.AppUser;
import com.pracasegura.model.Occurrence;
import com.pracasegura.repository.AppUserRepository;
import com.pracasegura.service.OccurrenceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/occurrences")
public class OccurrenceController {

private final OccurrenceService occurrenceService;
private final AppUserRepository appUserRepository;

public OccurrenceController(
        OccurrenceService occurrenceService,
        AppUserRepository appUserRepository) {
    this.occurrenceService = occurrenceService;
    this.appUserRepository = appUserRepository;
}

private AppUser getAuthenticatedUser(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "É necessário fazer login."
        );
    }

    return appUserRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuário autenticado não encontrado."
            ));
}

private boolean isManager(AppUser user) {
    return "GESTOR".equals(user.getRole());
}

@GetMapping
public List<OccurrenceResponse> findAll(
        @RequestParam(required = false) Long squareId,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String status,
        Authentication authentication) {

    AppUser user = getAuthenticatedUser(authentication);
    List<Occurrence> occurrences = occurrenceService.getFilteredOccurrences(
            user, isManager(user), squareId, from, to, category, status);
    return occurrences.stream().map(OccurrenceResponse::from).toList();
}


@GetMapping("/stats")
public OccurrenceStatsResponse getStats(
        @RequestParam(required = false) Long squareId,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String status,
        Authentication authentication) {

    AppUser user = getAuthenticatedUser(authentication);
    if (!isManager(user)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Indicadores de ocorrências disponíveis apenas para gestores.");
    }
    return occurrenceService.getFilteredStats(user, isManager(user), squareId, from, to, category, status);
}

@GetMapping("/{id}")
public OccurrenceResponse findById(
        @PathVariable Long id,
        Authentication authentication) {

    AppUser user = getAuthenticatedUser(authentication);
    Occurrence occurrence = occurrenceService.findById(id);

    if (!isManager(user)
            && (occurrence.getReporter() == null || !occurrence.getReporter().getId().equals(user.getId()))) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Você não tem permissão para consultar esta ocorrência."
        );
    }

    return OccurrenceResponse.from(occurrence);
}

@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public OccurrenceResponse create(
        @RequestParam Long squareId,
        @Valid @RequestBody OccurrenceCreateRequest request,
        Authentication authentication) {

    AppUser reporter = getAuthenticatedUser(authentication);

    Occurrence saved = occurrenceService.save(squareId, request, reporter);
    return OccurrenceResponse.from(saved);
}

@PatchMapping("/{id}/status")
public OccurrenceResponse updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody OccurrenceStatusRequest request,
        Authentication authentication) {

    AppUser user = getAuthenticatedUser(authentication);

    if (!isManager(user)) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Somente gestores podem alterar o status."
        );
    }

    return OccurrenceResponse.from(occurrenceService.updateStatus(
            id, request.getStatus()));
}

}

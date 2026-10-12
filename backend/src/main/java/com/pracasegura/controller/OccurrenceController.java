package com.pracasegura.controller;

import java.util.List;

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
public List<Occurrence> findAll(
        @RequestParam(required = false) Long squareId,
        Authentication authentication) {

    AppUser user = getAuthenticatedUser(authentication);

    if (isManager(user)) {
        if (squareId != null) {
            return occurrenceService.findBySquareId(squareId);
        }

        return occurrenceService.findAll();
    }

    if (squareId != null) {
        return occurrenceService.findByReporterIdAndSquareId(
                user.getId(), squareId);
    }

    return occurrenceService.findByReporterId(user.getId());
}


@GetMapping("/stats")
public OccurrenceStatsResponse getStats(
        @RequestParam(required = false) Long squareId,
        Authentication authentication) {

    AppUser user = getAuthenticatedUser(authentication);

    Long reporterId = isManager(user) ? null : user.getId();

    return occurrenceService.getStats(reporterId, squareId);
}

@GetMapping("/{id}")
public Occurrence findById(
        @PathVariable Long id,
        Authentication authentication) {

    AppUser user = getAuthenticatedUser(authentication);
    Occurrence occurrence = occurrenceService.findById(id);

    if (!isManager(user)
            && !occurrence.getReporter().getId().equals(user.getId())) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Você não tem permissão para consultar esta ocorrência."
        );
    }

    return occurrence;
}

@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public Occurrence create(
        @RequestParam Long squareId,
        @Valid @RequestBody Occurrence occurrence,
        Authentication authentication) {

    AppUser reporter = getAuthenticatedUser(authentication);

    return occurrenceService.save(squareId, occurrence, reporter);
}

@PatchMapping("/{id}/status")
public Occurrence updateStatus(
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

    return occurrenceService.updateStatus(
            id,
            request.getStatus()
    );
}

}

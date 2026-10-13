package com.pracasegura.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.pracasegura.repository.AppUserRepository;

@RestController
@RequestMapping("/api/urban-indicators")
public class UrbanIndicatorsController {
    private final Resource report;
    private final AppUserRepository users;

    public UrbanIndicatorsController(
            @Value("classpath:data/urban-indicators.json") Resource report,
            AppUserRepository users) {
        this.report = report;
        this.users = users;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> getReport(Authentication authentication) {
        boolean manager = users.findByEmail(authentication.getName())
                .map(user -> "GESTOR".equals(user.getRole()))
                .orElse(false);
        if (!manager) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Inventário de iluminação disponível apenas para gestores.");
        }
        try {
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(report.getInputStream().readAllBytes());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Inventário de iluminação indisponível.", exception);
        }
    }
}

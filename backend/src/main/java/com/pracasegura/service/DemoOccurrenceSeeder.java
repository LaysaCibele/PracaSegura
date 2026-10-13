package com.pracasegura.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.pracasegura.model.AppUser;
import com.pracasegura.model.Occurrence;
import com.pracasegura.model.Square;
import com.pracasegura.repository.AppUserRepository;
import com.pracasegura.repository.OccurrenceRepository;
import com.pracasegura.repository.SquareRepository;

/** Insere exemplos sintéticos quando explicitamente habilitado; nunca remove ou sobrescreve relatos. */
@Component
@ConditionalOnProperty(prefix = "app.demo-data", name = "enabled", havingValue = "true")
public class DemoOccurrenceSeeder implements ApplicationRunner {

    private final AppUserRepository userRepository;
    private final SquareRepository squareRepository;
    private final OccurrenceRepository occurrenceRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoOccurrenceSeeder(AppUserRepository userRepository, SquareRepository squareRepository,
            OccurrenceRepository occurrenceRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.squareRepository = squareRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AppUser demoReporter = userRepository.findByEmail("demo-data@invalid.local").orElseGet(() -> {
            AppUser user = new AppUser();
            user.setName("Registros demonstrativos");
            user.setEmail("demo-data@invalid.local");
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole("CIDADAO");
            return userRepository.save(user);
        });

        List<Square> squares = squareRepository.findAll().stream()
                .filter(square -> square.getSourceKey() != null && square.getSourceKey().startsWith("recife:"))
                .toList();
        if (squares.size() != 15) {
            throw new IllegalStateException("Execute o seed do catálogo oficial antes do seed demonstrativo.");
        }

        String[][] templates = {
                {"Iluminação", "Relato demonstrativo: verificar ponto de iluminação próximo a uma área de circulação.", "EM_ANALISE"},
                {"Segurança", "Relato demonstrativo para testar o fluxo de triagem e acompanhamento de segurança.", "REGISTRADA"},
                {"Infraestrutura", "Relato demonstrativo: avaliar conservação de equipamento ou mobiliário urbano.", "RESOLVIDA"},
                {"Acessibilidade", "Relato demonstrativo: conferir continuidade de rota acessível no espaço público.", "EM_ANDAMENTO"}
        };
        String[][] additionalTemplates = {
                {"Segurança", "Exemplo sintético: relato para exercitar o fluxo de triagem de segurança.", "EM_ANALISE"},
                {"Vandalismo", "Exemplo sintético: avaliar dano fictício a mobiliário urbano.", "REGISTRADA"},
                {"Iluminação", "Exemplo sintético: conferir solicitação fictícia de vistoria de iluminação.", "RESOLVIDA"},
                {"Infraestrutura", "Exemplo sintético: revisar conservação fictícia de equipamento público.", "EM_ANALISE"},
                {"Acessibilidade", "Exemplo sintético: verificar rota acessível em cenário de demonstração.", "EM_ANDAMENTO"},
                {"Segurança", "Exemplo sintético: acompanhar uma segunda solicitação fictícia de segurança.", "EM_ANDAMENTO"},
                {"Limpeza", "Exemplo sintético: acompanhar pedido fictício de conservação do espaço.", "REGISTRADA"},
                {"Iluminação", "Exemplo sintético: simular acompanhamento de ponto de luz reportado.", "EM_ANALISE"}
        };

        int sequence = 0;
        for (Square square : squares) {
            for (int templateIndex = 0; templateIndex < templates.length; templateIndex++) {
                String externalKey = "demo-v1:" + square.getSourceKey() + ":" + templateIndex;
                if (occurrenceRepository.existsByExternalKey(externalKey)) continue;

                LocalDateTime createdAt = LocalDateTime.of(2026, 10, 13, 10, 0)
                        .minusDays(4L + ((sequence * 7L + templateIndex * 3L) % 85L));
                String status = templates[templateIndex][2];
                Occurrence occurrence = new Occurrence();
                occurrence.setSquare(square);
                occurrence.setReporter(demoReporter);
                occurrence.setCategory(templates[templateIndex][0]);
                occurrence.setDescription(templates[templateIndex][1]);
                occurrence.setStatus(status);
                occurrence.setOrigin("SINTETICA");
                occurrence.setExternalKey(externalKey);
                occurrence.setCreatedAt(createdAt);
                if ("RESOLVIDA".equals(status)) occurrence.setResolvedAt(createdAt.plusDays(2));
                occurrenceRepository.save(occurrence);
            }

            int additionalCount = 3 + (sequence % 6);
            for (int templateIndex = 0; templateIndex < additionalCount; templateIndex++) {
                String externalKey = "demo-v2:" + square.getSourceKey() + ":" + templateIndex;
                if (occurrenceRepository.existsByExternalKey(externalKey)) continue;

                String[] template = additionalTemplates[templateIndex];
                LocalDateTime createdAt = LocalDateTime.of(2026, 10, 13, 12, 0)
                        .minusDays(6L + ((sequence * 13L + templateIndex * 9L) % 180L));
                Occurrence occurrence = new Occurrence();
                occurrence.setSquare(square);
                occurrence.setReporter(demoReporter);
                occurrence.setCategory(template[0]);
                occurrence.setDescription(template[1]);
                occurrence.setStatus(template[2]);
                occurrence.setOrigin("SINTETICA");
                occurrence.setExternalKey(externalKey);
                occurrence.setCreatedAt(createdAt);
                if ("RESOLVIDA".equals(template[2])) occurrence.setResolvedAt(createdAt.plusDays(2));
                occurrenceRepository.save(occurrence);
            }
            sequence++;
        }
    }
}

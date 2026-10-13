package com.pracasegura.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pracasegura.model.AppUser;
import com.pracasegura.model.Occurrence;
import com.pracasegura.model.Square;
import com.pracasegura.repository.AppUserRepository;
import com.pracasegura.repository.OccurrenceRepository;
import com.pracasegura.repository.SquareRepository;

class DemoOccurrenceSeederTest {

    @Test
    void seedsFourSyntheticExamplesPerSpaceIdempotently() throws Exception {
        AppUserRepository users = mock(AppUserRepository.class);
        SquareRepository squares = mock(SquareRepository.class);
        OccurrenceRepository occurrences = mock(OccurrenceRepository.class);
        PasswordEncoder passwords = mock(PasswordEncoder.class);
        AppUser reporter = new AppUser();
        reporter.setEmail("demo-data@invalid.local");
        when(users.findByEmail("demo-data@invalid.local")).thenReturn(Optional.of(reporter));

        List<Square> publicSpaces = new ArrayList<>();
        for (int index = 0; index < 15; index++) {
            Square square = new Square();
            square.setSourceKey("recife:space:" + index);
            square.setName("Espaço " + index);
            publicSpaces.add(square);
        }
        when(squares.findAll()).thenReturn(publicSpaces);

        Set<String> insertedKeys = new HashSet<>();
        List<Occurrence> inserted = new ArrayList<>();
        when(occurrences.existsByExternalKey(anyString())).thenAnswer(call -> insertedKeys.contains(call.getArgument(0)));
        when(occurrences.save(any(Occurrence.class))).thenAnswer(call -> {
            Occurrence occurrence = call.getArgument(0);
            insertedKeys.add(occurrence.getExternalKey());
            inserted.add(occurrence);
            return occurrence;
        });

        DemoOccurrenceSeeder seeder = new DemoOccurrenceSeeder(users, squares, occurrences, passwords);
        var args = new DefaultApplicationArguments();
        seeder.run(args);
        seeder.run(args);

        Set<Long> perSpaceCounts = new HashSet<>();
        verify(occurrences, times(138)).save(any(Occurrence.class));
        for (Square square : publicSpaces) {
            long examplesForSpace = inserted.stream().filter(item -> item.getSquare().equals(square)).count();
            long securityExamplesForSpace = inserted.stream()
                    .filter(item -> item.getSquare().equals(square))
                    .filter(item -> "Segurança".equals(item.getCategory()))
                    .count();
            org.junit.jupiter.api.Assertions.assertTrue(examplesForSpace >= 7 && examplesForSpace <= 12);
            org.junit.jupiter.api.Assertions.assertTrue(securityExamplesForSpace >= 1);
            perSpaceCounts.add(examplesForSpace);
        }
        org.junit.jupiter.api.Assertions.assertTrue(perSpaceCounts.size() > 1);
        org.junit.jupiter.api.Assertions.assertTrue(inserted.stream().allMatch(item -> "SINTETICA".equals(item.getOrigin())));
    }
}

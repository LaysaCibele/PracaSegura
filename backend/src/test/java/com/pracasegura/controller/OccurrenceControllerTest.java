package com.pracasegura.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import com.pracasegura.dto.OccurrenceResponse;
import com.pracasegura.dto.OccurrenceStatsResponse;
import com.pracasegura.dto.OccurrenceStatusRequest;
import com.pracasegura.model.AppUser;
import com.pracasegura.model.Occurrence;
import com.pracasegura.model.Square;
import com.pracasegura.repository.AppUserRepository;
import com.pracasegura.service.OccurrenceService;

class OccurrenceControllerTest {
    private OccurrenceService occurrenceService;
    private AppUserRepository userRepository;
    private OccurrenceController controller;
    private AppUser citizen;
    private AppUser manager;
    private Occurrence occurrence;

    @BeforeEach
    void setUp() {
        occurrenceService = org.mockito.Mockito.mock(OccurrenceService.class);
        userRepository = org.mockito.Mockito.mock(AppUserRepository.class);
        controller = new OccurrenceController(occurrenceService, userRepository);

        citizen = new AppUser();
        citizen.setName("Cidadão");
        citizen.setEmail("citizen@example.test");
        citizen.setPassword("hashed-secret");
        citizen.setRole("CIDADAO");
        ReflectionTestUtils.setField(citizen, "id", 3L);

        manager = new AppUser();
        manager.setEmail("manager@example.test");
        manager.setRole("GESTOR");
        ReflectionTestUtils.setField(manager, "id", 4L);

        Square square = new Square();
        square.setName("Praça Central");
        square.setNeighborhood("Centro");

        AppUser otherReporter = new AppUser();
        otherReporter.setEmail("other@example.test");
        ReflectionTestUtils.setField(otherReporter, "id", 8L);

        occurrence = new Occurrence();
        occurrence.setCategory("Iluminação");
        occurrence.setDescription("Luminária apagada");
        occurrence.setStatus("REGISTRADA");
        occurrence.setSquare(square);
        occurrence.setReporter(otherReporter);
        ReflectionTestUtils.setField(occurrence, "id", 11L);
    }

    @Test
    void citizenOnlyReceivesOwnOccurrencesAndCanFilterThemBySquare() {
        when(userRepository.findByEmail(citizen.getEmail())).thenReturn(Optional.of(citizen));
        Occurrence ownOccurrence = new Occurrence();
        ownOccurrence.setCategory("Limpeza");
        ownOccurrence.setDescription("Registro próprio");
        ownOccurrence.setSquare(occurrence.getSquare());
        ownOccurrence.setReporter(citizen);
        ReflectionTestUtils.setField(ownOccurrence, "id", 12L);
        when(occurrenceService.findByReporterId(3L)).thenReturn(List.of(ownOccurrence));
        when(occurrenceService.findByReporterIdAndSquareId(3L, 7L)).thenReturn(List.of(ownOccurrence));

        assertEquals(1, controller.findAll(null, authentication(citizen)).size());
        assertEquals(1, controller.findAll(7L, authentication(citizen)).size());
        verify(occurrenceService).findByReporterId(3L);
        verify(occurrenceService).findByReporterIdAndSquareId(3L, 7L);
        verify(occurrenceService, never()).findAll();
        verify(occurrenceService, never()).findBySquareId(7L);
    }

    @Test
    void managerCanQueryAllOccurrencesOrFilterBySquare() {
        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));
        when(occurrenceService.findAll()).thenReturn(List.of(occurrence));
        when(occurrenceService.findBySquareId(7L)).thenReturn(List.of(occurrence));

        assertEquals(1, controller.findAll(null, authentication(manager)).size());
        assertEquals(1, controller.findAll(7L, authentication(manager)).size());
        verify(occurrenceService).findAll();
        verify(occurrenceService).findBySquareId(7L);
    }

    @Test
    void citizenDashboardKeepsAggregatedStatsForSelectedSquare() {
        when(userRepository.findByEmail(citizen.getEmail())).thenReturn(Optional.of(citizen));
        OccurrenceStatsResponse stats = new OccurrenceStatsResponse(5L, List.of(), List.of());
        when(occurrenceService.getStats(null, 7L)).thenReturn(stats);

        assertEquals(stats, controller.getStats(7L, authentication(citizen)));
        verify(occurrenceService).getStats(null, 7L);
    }

    @Test
    void citizenCannotReadAnotherUsersIndividualOccurrence() {
        when(userRepository.findByEmail(citizen.getEmail())).thenReturn(Optional.of(citizen));
        when(occurrenceService.findById(11L)).thenReturn(occurrence);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.findById(11L, authentication(citizen)));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
    }

    @Test
    void managerCanReadIndividualOccurrence() {
        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));
        when(occurrenceService.findById(11L)).thenReturn(occurrence);
        assertEquals("Praça Central", controller.findById(11L, authentication(manager)).square().name());
    }

    @Test
    void citizenCannotUpdateStatusButManagerCan() {
        OccurrenceStatusRequest request = new OccurrenceStatusRequest();
        request.setStatus("RESOLVIDA");
        when(userRepository.findByEmail(citizen.getEmail())).thenReturn(Optional.of(citizen));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.updateStatus(11L, request, authentication(citizen)));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());

        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));
        when(occurrenceService.updateStatus(11L, "RESOLVIDA")).thenReturn(occurrence);
        controller.updateStatus(11L, request, authentication(manager));
        verify(occurrenceService).updateStatus(11L, "RESOLVIDA");
    }

    @Test
    void responseContractDoesNotExposeReporterOrPassword() {
        assertFalse(java.util.Arrays.stream(OccurrenceResponse.class.getRecordComponents())
                .anyMatch(component -> component.getName().equals("reporter")
                        || component.getName().equals("password")));
    }

    private TestingAuthenticationToken authentication(AppUser user) {
        return new TestingAuthenticationToken(user.getEmail(), "unused", List.of());
    }
}

package com.pracasegura.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OccurrenceCreateRequest(
        @NotBlank(message = "A categoria é obrigatória.")
        @Size(max = 80, message = "A categoria deve ter no máximo 80 caracteres.")
        String category,

        @NotBlank(message = "A descrição é obrigatória.")
        @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
        String description
) {}

package com.pracasegura.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OccurrenceStatusRequest {

    @NotBlank(message = "O status e obrigatorio.")
    @Size(max = 30, message = "O status deve ter no maximo 30 caracteres.")
    private String status;

    public OccurrenceStatusRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

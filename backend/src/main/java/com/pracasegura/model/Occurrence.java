package com.pracasegura.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "occurrences")
public class Occurrence {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@NotBlank(message = "A categoria é obrigatória.")
@Size(max = 80, message = "A categoria deve ter no máximo 80 caracteres.")
@Column(nullable = false, length = 80)
private String category;

@NotBlank(message = "A descrição é obrigatória.")
@Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
@Column(nullable = false, length = 1000)
private String description;

@Column(nullable = false)
private LocalDateTime createdAt;

@Column(nullable = false, length = 30)
private String status = "REGISTRADA";

@ManyToOne(optional = false)
@JoinColumn(name = "square_id", nullable = false)
private Square square;

@ManyToOne(optional = false)
@JoinColumn(name = "reporter_id", nullable = false)
private AppUser reporter;

public Occurrence() {
}

@PrePersist
public void prePersist() {
    if (createdAt == null) {
        createdAt = LocalDateTime.now();
    }

    if (status == null || status.isBlank()) {
        status = "REGISTRADA";
    }
}

public Long getId() {
    return id;
}

public String getCategory() {
    return category;
}

public void setCategory(String category) {
    this.category = category;
}

public String getDescription() {
    return description;
}

public void setDescription(String description) {
    this.description = description;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

public Square getSquare() {
    return square;
}

public void setSquare(Square square) {
    this.square = square;
}

public AppUser getReporter() {
    return reporter;
}

public void setReporter(AppUser reporter) {
    this.reporter = reporter;
}

}

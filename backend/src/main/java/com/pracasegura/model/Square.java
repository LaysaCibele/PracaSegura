
package com.pracasegura.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "squares")
public class Square {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da praça é obrigatório.")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 16)
    private String type = "PRACA";

    @Column(precision = 14, scale = 4)
    private BigDecimal area;

    @Column(unique = true, length = 180)
    private String sourceKey;

    @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres.")
    @Column(length = 100)
    private String neighborhood;

    @Size(max = 255, message = "O endereço deve ter no máximo 255 caracteres.")
    @Column(length = 255)
    private String address;

    @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
    @Column(length = 1000)
    private String description;

    @Size(max = 1000, message = "A URL da foto deve ter no máximo 1000 caracteres.")
    @Column(length = 1000)
    private String photoUrl;

    @DecimalMin(value = "-90.0", message = "Latitude inválida.")
    @DecimalMax(value = "90.0", message = "Latitude inválida.")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude inválida.")
    @DecimalMax(value = "180.0", message = "Longitude inválida.")
    private Double longitude;

    public Square() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public BigDecimal getArea() { return area; }

    public void setArea(BigDecimal area) { this.area = area; }

    public String getSourceKey() { return sourceKey; }

    public void setSourceKey(String sourceKey) { this.sourceKey = sourceKey; }

    public void setName(String name) {
        this.name = name;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}

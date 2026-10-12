
package com.pracasegura.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pracasegura.model.Square;
import com.pracasegura.repository.SquareRepository;

@Service
public class SquareService {

    private final SquareRepository squareRepository;

    public SquareService(SquareRepository squareRepository) {
        this.squareRepository = squareRepository;
    }

    public List<Square> findAll() {
        return squareRepository.findAll();
    }

    public Square findById(Long id) {
        return squareRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Praça não encontrada: " + id));
    }

    public Square save(Square square) {
        return squareRepository.save(square);
    }

    public Square update(Long id, Square updatedSquare) {
        Square square = findById(id);

        square.setName(updatedSquare.getName());
        square.setNeighborhood(updatedSquare.getNeighborhood());
        square.setAddress(updatedSquare.getAddress());
        square.setDescription(updatedSquare.getDescription());
        square.setPhotoUrl(updatedSquare.getPhotoUrl());
        square.setLatitude(updatedSquare.getLatitude());
        square.setLongitude(updatedSquare.getLongitude());

        return squareRepository.save(square);
    }

    
@Transactional
public void delete(Long id) {
    Square square = findById(id);

    try {
        squareRepository.delete(square);
        squareRepository.flush();
    } catch (DataIntegrityViolationException e) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Não é possível excluir esta praça porque existem ocorrências vinculadas. Preserve o histórico e edite os dados da praça."
        );
    }
}
}
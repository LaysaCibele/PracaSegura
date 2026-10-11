
package com.pracasegura.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
                        HttpStatus.NOT_FOUND, "Praça não encontrada: " + id));
    }

    public Square save(Square square) {
        return squareRepository.save(square);
    }

    public Square update(Long id, Square updatedSquare) {
        Square square = findById(id);

        square.setName(updatedSquare.getName());
        square.setNeighborhood(updatedSquare.getNeighborhood());
        square.setAddress(updatedSquare.getAddress());

        return squareRepository.save(square);
    }

    public void delete(Long id) {
        Square square = findById(id);
        squareRepository.delete(square);
    }
}
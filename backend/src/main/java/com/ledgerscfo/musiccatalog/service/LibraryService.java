package com.ledgerscfo.musiccatalog.service;

import com.ledgerscfo.musiccatalog.model.SavedAlbum;
import com.ledgerscfo.musiccatalog.repository.SavedAlbumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LibraryService {

    @Autowired
    private SavedAlbumRepository savedAlbumRepository;

    public List<SavedAlbum> getUserAlbums(Long userId) {
        return savedAlbumRepository.findByUserId(userId);
    }

    public SavedAlbum saveAlbum(SavedAlbum album) {
        return savedAlbumRepository.save(album);
    }

    public Optional<SavedAlbum> getAlbumById(Long id) {
        return savedAlbumRepository.findById(id);
    }

    public void deleteAlbum(Long id) {
        savedAlbumRepository.deleteById(id);
    }
}

package com.ledgerscfo.musiccatalog.repository;

import com.ledgerscfo.musiccatalog.model.SavedAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedAlbumRepository extends JpaRepository<SavedAlbum, Long> {
    List<SavedAlbum> findByUserId(Long userId);
}

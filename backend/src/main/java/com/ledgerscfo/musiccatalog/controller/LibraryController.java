package com.ledgerscfo.musiccatalog.controller;

import com.ledgerscfo.musiccatalog.model.SavedAlbum;
import com.ledgerscfo.musiccatalog.model.User;
import com.ledgerscfo.musiccatalog.repository.UserRepository;
import com.ledgerscfo.musiccatalog.service.LibraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class LibraryController {

    @Autowired
    private LibraryService libraryService;

    @Autowired
    private UserRepository userRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchItunes(
            @RequestParam String query,
            @RequestParam(defaultValue = "album") String type) {
        String entity = switch (type.toLowerCase()) {
            case "song" -> "song";
            case "artist" -> "musicArtist";
            default -> "album";
        };
        String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = "https://itunes.apple.com/search?term=" + encoded + "&entity=" + entity + "&limit=25";
        RestTemplate rt = new RestTemplate();
        String response = rt.getForObject(url, String.class);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/library")
    public ResponseEntity<List<SavedAlbum>> getLibrary() {
        return ResponseEntity.ok(libraryService.getUserAlbums(getCurrentUserId()));
    }

    @PostMapping("/library")
    public ResponseEntity<?> saveAlbum(@RequestBody SavedAlbum album) {
        album.setUserId(getCurrentUserId());
        album.setId(null); // prevent overwriting existing entries
        return ResponseEntity.ok(libraryService.saveAlbum(album));
    }

    @PutMapping("/library/{id}")
    public ResponseEntity<?> updateAlbum(@PathVariable Long id, @RequestBody SavedAlbum details) {
        Optional<SavedAlbum> opt = libraryService.getAlbumById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        SavedAlbum album = opt.get();
        if (!album.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        if (details.getUserRating() != null) album.setUserRating(details.getUserRating());
        if (details.getUserNotes() != null) album.setUserNotes(details.getUserNotes());
        return ResponseEntity.ok(libraryService.saveAlbum(album));
    }

    @DeleteMapping("/library/{id}")
    public ResponseEntity<?> deleteAlbum(@PathVariable Long id) {
        Optional<SavedAlbum> opt = libraryService.getAlbumById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        if (!opt.get().getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        libraryService.deleteAlbum(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @GetMapping("/library/insights")
    public ResponseEntity<?> getInsights() {
        List<SavedAlbum> albums = libraryService.getUserAlbums(getCurrentUserId());
        if (albums.isEmpty()) {
            return ResponseEntity.ok(Map.of("insight", "Your library is empty. Save some albums first!"));
        }

        String genres = albums.stream().map(SavedAlbum::getGenre).filter(g -> g != null).distinct().collect(Collectors.joining(", "));
        String artists = albums.stream().map(SavedAlbum::getArtistName).distinct().collect(Collectors.joining(", "));
        String titles = albums.stream().map(SavedAlbum::getTitle).limit(10).collect(Collectors.joining(", "));

        String prompt = "You are an expert music critic. Based on the user's album collection, write a 3-4 sentence taste profile and recommend one artist they might enjoy. "
                + "Albums: " + titles + ". Genres: " + genres + ". Artists: " + artists + ".";

        if (geminiApiKey.equals("placeholder")) {
            return ResponseEntity.ok(Map.of("insight",
                    "Based on your collection spanning " + genres + ", you have a refined taste that blends mainstream appeal with deeper cuts. "
                    + "Artists like " + artists + " show you appreciate strong songwriting and production quality. "
                    + "You might enjoy exploring Tame Impala or Bon Iver for a fresh perspective on your favorites."));
        }

        try {
            RestTemplate rt = new RestTemplate();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Escape special characters in the prompt for JSON safety
            String safePrompt = prompt.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
            String body = "{\"contents\":[{\"parts\":[{\"text\":\"" + safePrompt + "\"}]}]}";
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            String response = rt.postForObject(url, entity, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "AI service unavailable"));
        }
    }
}

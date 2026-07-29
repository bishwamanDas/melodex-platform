package com.ledgerscfo.musiccatalog.controller;

import com.ledgerscfo.musiccatalog.dto.JwtResponse;
import com.ledgerscfo.musiccatalog.dto.LoginRequest;
import com.ledgerscfo.musiccatalog.dto.RegisterRequest;
import com.ledgerscfo.musiccatalog.model.User;
import com.ledgerscfo.musiccatalog.repository.UserRepository;
import com.ledgerscfo.musiccatalog.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        String jwt = jwtUtils.generateJwtToken(authentication.getName());

        return ResponseEntity.ok(new JwtResponse(jwt, authentication.getName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken"));
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPasswordHash(encoder.encode(req.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }
}

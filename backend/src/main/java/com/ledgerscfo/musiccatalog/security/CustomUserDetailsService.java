package com.ledgerscfo.musiccatalog.security;

import com.ledgerscfo.musiccatalog.model.User;
import com.ledgerscfo.musiccatalog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPasswordHash(), new ArrayList<>());
    }
}

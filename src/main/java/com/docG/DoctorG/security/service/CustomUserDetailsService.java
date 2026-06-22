package com.docG.DoctorG.security.service;

import com.docG.DoctorG.entity.user;
import com.docG.DoctorG.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) 
            throws UsernameNotFoundException {

        user user = userRepository.findByEmail(email)
                .orElseThrow(() -> 
                    new UsernameNotFoundException("User not found"));
        
        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("USER")
                .build();
    }
    
}
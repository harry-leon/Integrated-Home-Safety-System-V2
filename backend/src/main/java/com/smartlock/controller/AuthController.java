package com.smartlock.controller;

import com.smartlock.dto.LoginRequestDTO;
import com.smartlock.dto.LoginResponseDTO;
import com.smartlock.dto.ReAuthRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/re-auth")
    public ResponseEntity<Void> reAuthenticate(@RequestBody ReAuthRequestDTO request) {
        return ResponseEntity.ok().build();
    }
}

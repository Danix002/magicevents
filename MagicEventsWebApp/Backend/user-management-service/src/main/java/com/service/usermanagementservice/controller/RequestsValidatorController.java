package com.service.usermanagementservice.controller;

import com.service.usermanagementservice.dto.LoginWithTokenDTO;
import com.service.usermanagementservice.model.OauthToken;
import com.service.usermanagementservice.model.User;
import com.service.usermanagementservice.repository.OauthTokenRepository;
import com.service.usermanagementservice.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/validator")
public class RequestsValidatorController {
    private final AuthService authService;
    private final OauthTokenRepository oauthTokenRepository;

    public RequestsValidatorController(OauthTokenRepository oauthTokenRepository, AuthService authService) {
        this.oauthTokenRepository = oauthTokenRepository;
        this.authService = authService;
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        OauthToken oauthToken = oauthTokenRepository.findById(token).orElse(null);

        if (oauthToken == null || oauthToken.getExpirationTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = oauthToken.getUser();

        response.setHeader("X-User-Email", user.getEmail());
        response.setHeader("X-User-Role", user.getRole());
        response.setHeader("X-User-ID", user.getMagicEventTag().toString());
        response.setHeader("X-Username", user.getUsername());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/refresh")
    public ResponseEntity<LoginWithTokenDTO> refreshToken(@RequestBody String refreshToken) {
        try {
            LoginWithTokenDTO newTokens = refreshAccessToken(refreshToken);
            return ResponseEntity.ok(newTokens);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    public LoginWithTokenDTO refreshAccessToken(String refreshToken) {
        OauthToken oauthToken = oauthTokenRepository.findByRefreshToken(refreshToken);
        if(oauthToken == null) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        LoginWithTokenDTO res = authService.saveTokenForUser(oauthToken.getUser());
        oauthTokenRepository.delete(oauthToken);
        return res;
    }
}

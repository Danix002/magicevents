package com.service.galleryservice.controller;

import com.service.galleryservice.dto.GalleryDTO;
import com.service.galleryservice.dto.CreateGalleryRequestDTO;
import com.service.galleryservice.service.GalleryService;
import com.service.galleryservice.exception.UnauthorizedException;
import com.service.galleryservice.service.TokenValidatorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gallery")
public class GalleryController {
    private final GalleryService galleryService;
    private final TokenValidatorService tokenValidatorService;

    public GalleryController(GalleryService galleryService, TokenValidatorService tokenValidatorService) {
        this.galleryService = galleryService;
        this.tokenValidatorService = tokenValidatorService;
    }

    @PostMapping("/createGallery")
    public ResponseEntity<Boolean> createGallery(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody CreateGalleryRequestDTO request
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
            }
            galleryService.createGallery(request, token);
            return ResponseEntity.ok(true);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    @GetMapping("/getGallery/{eventID}/{pageNumber}")
    public ResponseEntity<GalleryDTO> getGallery(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventID,
            @PathVariable int pageNumber,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
            GalleryDTO galleryDTO = galleryService.getGallery(eventID, userMagicEventsTag, pageNumber, 20, token);
            if (galleryDTO == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(galleryDTO);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getGalleryPopular/{eventID}/{pageNumber}")
    public ResponseEntity<GalleryDTO> getGalleryPopular(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventID,
            @PathVariable int pageNumber,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
            GalleryDTO galleryDTO = galleryService.getMostPopularImages(eventID, userMagicEventsTag, pageNumber, 20, token);
            if (galleryDTO == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(galleryDTO);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/isGalleryExists/{eventID}")
    public ResponseEntity<Boolean> isGalleryExists(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventID
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }
        boolean exists = galleryService.isGalleryExists(eventID);
        return ResponseEntity.ok(exists);
    }

    @DeleteMapping("/deleteGallery/{eventID}")
    public ResponseEntity<Boolean> deleteGallery(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventID,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
            }
            galleryService.deleteGallery(eventID, userMagicEventsTag, token);
            return ResponseEntity.ok(true);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

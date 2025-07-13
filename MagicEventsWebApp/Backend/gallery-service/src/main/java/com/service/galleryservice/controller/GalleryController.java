package com.service.galleryservice.controller;

import com.service.galleryservice.dto.GalleryDTO;
import com.service.galleryservice.dto.CreateGalleryRequestDTO;
import com.service.galleryservice.service.GalleryService;
import com.service.galleryservice.exception.UnauthorizedException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gallery")
public class GalleryController {
    private final GalleryService galleryService;

    public GalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @PostMapping("/createGallery")
    public ResponseEntity<Boolean> createGallery(@Valid @RequestBody CreateGalleryRequestDTO request) {
        try {
            galleryService.createGallery(request);
            return ResponseEntity.ok(true);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    @GetMapping("/getGallery/{eventID}/{pageNumber}")
    public ResponseEntity<GalleryDTO> getGallery(
            @PathVariable Long eventID,
            @PathVariable int pageNumber,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            GalleryDTO galleryDTO = galleryService.getGallery(eventID, userMagicEventsTag, pageNumber, 20);
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
            @PathVariable Long eventID,
            @PathVariable int pageNumber,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            GalleryDTO galleryDTO = galleryService.getMostPopularImages(eventID, userMagicEventsTag, pageNumber, 20);
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
    public ResponseEntity<Boolean> isGalleryExists(@PathVariable Long eventID) {
        boolean exists = galleryService.isGalleryExists(eventID);
        return ResponseEntity.ok(exists);
    }

    @DeleteMapping("/deleteGallery/{eventID}")
    public ResponseEntity<Boolean> deleteGallery(@PathVariable Long eventID,
                                                 @RequestParam Long userMagicEventsTag) {
        try {
            galleryService.deleteGallery(eventID, userMagicEventsTag);
            return ResponseEntity.ok(true);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }
}

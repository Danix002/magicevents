package com.service.eventsetupservice.controller;

import com.service.eventsetupservice.dto.EventSetupRequestDTO;
import com.service.eventsetupservice.dto.EventServicesStatusDTO;
import com.service.eventsetupservice.dto.ServiceActivationRequestDTO;
import com.service.eventsetupservice.service.EventSetupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/eventSetup")
public class EventSetupController {
    private final EventSetupService eventSetupService;

    public EventSetupController(EventSetupService eventSetupService) {
        this.eventSetupService = eventSetupService;
    }

    @PostMapping
    public ResponseEntity<EventServicesStatusDTO> setupEvent(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody EventSetupRequestDTO request
    ) {
        try {
            String token = extractToken(authorizationHeader);
            EventServicesStatusDTO status = eventSetupService.setupEvent(request, token);
            if (status.isSetupSuccessful()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(status);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(status);
            }
        } catch (Exception e) {
            EventServicesStatusDTO errorStatus = new EventServicesStatusDTO();
            errorStatus.setErrorMessage("Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorStatus);
        }
    }

    @PutMapping("/services")
    public ResponseEntity<String> activateServices(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody ServiceActivationRequestDTO request
    ) {
        try {
            String token = extractToken(authorizationHeader);
            boolean success = eventSetupService.activateEventServices(request, token);
            if (success) {
                return ResponseEntity.ok("Services activated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to activate services");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal server error: " + e.getMessage());
        }
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

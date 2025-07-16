package com.service.guestgameservice.controller;

import com.service.guestgameservice.dto.GameRequestDTO;
import com.service.guestgameservice.dto.GuestInfoRequestDTO;
import com.service.guestgameservice.dto.DecisionTreeDTO;
import com.service.guestgameservice.service.GameService;

import com.service.guestgameservice.service.TokenValidatorService;
import jakarta.validation.Valid;

import com.service.guestgameservice.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/guest-game")
@Validated
public class GameController {
    private final GameService gameService;
    private final TokenValidatorService tokenValidatorService;

    public GameController(GameService gameService, TokenValidatorService tokenValidatorService) {
        this.gameService = gameService;
        this.tokenValidatorService = tokenValidatorService;
    }

    @DeleteMapping("/deleteGame/{eventId}")
    public ResponseEntity<Boolean> deleteGame(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventId,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
            }
            gameService.deleteGame(eventId, userMagicEventsTag, token);
            return new ResponseEntity<>(true, HttpStatus.OK);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(false, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/hasUserInsertedInfo/{eventId}")
    public ResponseEntity<Boolean> hasUserInsertedGuestInfo(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventId,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
            }
            boolean hasInserted = gameService.hasUserInsertedGuestInfo(eventId, userMagicEventsTag);
            return new ResponseEntity<>(hasInserted, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/gameExists/{eventId}")
    public ResponseEntity<Boolean> gameExists(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventId
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
            }
            boolean exists = gameService.gameExists(eventId);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/insertGuestInfo")
    public ResponseEntity<Void> insertGuestInfo(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody GuestInfoRequestDTO guestInfoRequestDTO
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            gameService.insertGuestInfo(guestInfoRequestDTO, token);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/createGame")
    public ResponseEntity<Boolean> createGame(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody GameRequestDTO gameRequestDTO
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
            }
            gameService.createGame(gameRequestDTO, token);
            return ResponseEntity.ok(true);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    @GetMapping("/createDecisionTree/{eventId}")
    public ResponseEntity<DecisionTreeDTO> createDecisionTree(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventId,
            @RequestParam Long userMagicEventsTag
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
            DecisionTreeDTO decisionTree = gameService.createDecisionTree(eventId, userMagicEventsTag, token);
            return new ResponseEntity<>(decisionTree, HttpStatus.OK);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

package com.service.boardservice.controller;

import com.service.boardservice.dto.BoardDTO;
import com.service.boardservice.dto.CreateBoardRequestDTO;
import com.service.boardservice.exception.UnauthorizedException;
import com.service.boardservice.service.BoardService;
import com.service.boardservice.service.TokenValidatorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/board")
@Validated
public class BoardController {
    private final BoardService boardService;
    private final TokenValidatorService tokenValidatorService;

    public BoardController(BoardService boardService, TokenValidatorService tokenValidatorService) {
        this.boardService = boardService;
        this.tokenValidatorService = tokenValidatorService;
    }

    @PostMapping("/createBoard")
    public ResponseEntity<Boolean> createBoard(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody CreateBoardRequestDTO request
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }

        try {
            boardService.createBoard(request, token);
            return ResponseEntity.ok(true);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    @GetMapping("/getBoard/{eventID}/{pageNumber}")
    public ResponseEntity<BoardDTO> getBoard(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventID,
            @PathVariable int pageNumber,
            @RequestParam Long userMagicEventsTag
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            BoardDTO boardDTO = boardService.getBoard(eventID, userMagicEventsTag, pageNumber, 20, token);
            if (boardDTO == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(boardDTO);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/isBoardExists/{eventID}")
    public ResponseEntity<Boolean> isBoardExists(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventID
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }

        boolean exists = boardService.isBoardExists(eventID);
        return ResponseEntity.ok(exists);
    }

    @DeleteMapping("/deleteBoard/{eventID}")
    public ResponseEntity<Boolean> deleteBoard(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long eventID,
            @RequestParam Long userMagicEventsTag
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }

        try {
            boardService.deleteBoard(eventID, userMagicEventsTag, token);
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

package com.service.boardservice.controller;

import com.service.boardservice.dto.AddNewMessageRequestDTO;
import com.service.boardservice.dto.DeleteMessageRequestDTO;
import com.service.boardservice.exception.UnauthorizedException;
import com.service.boardservice.service.ChatService;
import com.service.boardservice.service.TokenValidatorService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@Controller
@Validated
public class ChatController {
    private final ChatService chatService;
    private final TokenValidatorService tokenValidatorService;

    public ChatController(ChatService chatService, TokenValidatorService tokenValidatorService) {
        this.chatService = chatService;
        this.tokenValidatorService = tokenValidatorService;
    }

    @MessageMapping("chat/sendMessage/{eventID}")
    @SendTo("/topic/chat/{eventID}")
    public AddNewMessageRequestDTO receiveMessage(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @Payload AddNewMessageRequestDTO message
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return null;
        }

        try {
            chatService.addNewMessage(message, token);
            return message;
        } catch (Exception e) {
            return null;
        }
    }

    @MessageMapping("chat/deleteMessage/{eventID}")
    @SendTo("/topic/chat/deleteMessage/{eventID}")
    public DeleteMessageRequestDTO deleteMessage(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @Payload DeleteMessageRequestDTO request
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return null;
        }

        try {
            return chatService.deleteMessage(request, token);
        } catch (Exception e) {
            return null;
        }
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

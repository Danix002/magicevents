package com.service.galleryservice.controller;

import com.service.galleryservice.dto.AddNewImageRequestDTO;
import com.service.galleryservice.dto.DeleteImageRequestDTO;
import com.service.galleryservice.dto.ImageLikeRequestDTO;
import com.service.galleryservice.exception.UnauthorizedException;
import com.service.galleryservice.service.ImageChatService;
import com.service.galleryservice.service.TokenValidatorService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping
public class ChatController {
    private final ImageChatService imageChatService;
    private final TokenValidatorService tokenValidatorService;

    public ChatController(ImageChatService imageChatService, TokenValidatorService tokenValidatorService) {
        this.imageChatService = imageChatService;
        this.tokenValidatorService = tokenValidatorService;
    }

    @MessageMapping("gallery/sendImage/{eventID}")
    @SendTo("/topic/gallery/{eventID}")
    public AddNewImageRequestDTO receiveImage(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @Payload AddNewImageRequestDTO message
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return null;
            }
            AddNewImageRequestDTO response = imageChatService.addNewImage(message, token);
            return response;
        } catch (UnauthorizedException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    @MessageMapping("gallery/deleteImage/{eventID}")
    @SendTo("/topic/gallery/deleteImage/{eventID}")
    public DeleteImageRequestDTO deleteImage(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @Payload DeleteImageRequestDTO msg
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return null;
            }
            return imageChatService.deleteImage(msg, token);
        } catch (UnauthorizedException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    @MessageMapping("gallery/imageLike/{eventID}")
    @SendTo("/topic/gallery/imageLike/{eventID}")
    public ImageLikeRequestDTO handleImageLike(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @Payload ImageLikeRequestDTO request
    ) {
        try {
            String token = extractToken(authorizationHeader);
            if (!tokenValidatorService.isTokenValid(token)) {
                return null;
            }
            return imageChatService.handleImageLike(request, token);
        } catch (UnauthorizedException e) {
            return null;
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

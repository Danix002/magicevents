package com.service.galleryservice.controller;

import com.service.galleryservice.dto.AddNewImageRequestDTO;
import com.service.galleryservice.dto.DeleteImageRequestDTO;
import com.service.galleryservice.dto.ImageLikeRequestDTO;
import com.service.galleryservice.service.ImageChatService;
import com.service.galleryservice.service.TokenValidatorService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
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
            StompHeaderAccessor accessor,
            @Valid @Payload AddNewImageRequestDTO message
    ) {
        return extractAndValidateToken(accessor)
                .map(token -> imageChatService.addNewImage(message, token))
                .orElse(null);
    }

    @MessageMapping("gallery/deleteImage/{eventID}")
    @SendTo("/topic/gallery/deleteImage/{eventID}")
    public DeleteImageRequestDTO deleteImage(
            StompHeaderAccessor accessor,
            @Valid @Payload DeleteImageRequestDTO request
    ) {
        return extractAndValidateToken(accessor)
                .map(token -> imageChatService.deleteImage(request, token))
                .orElse(null);
    }

    @MessageMapping("gallery/imageLike/{eventID}")
    @SendTo("/topic/gallery/imageLike/{eventID}")
    public ImageLikeRequestDTO handleImageLike(
            StompHeaderAccessor accessor,
            @Valid @Payload ImageLikeRequestDTO request
    ) {
        return extractAndValidateToken(accessor)
                .map(token -> imageChatService.handleImageLike(request, token))
                .orElse(null);
    }

    private Optional<String> extractAndValidateToken(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (tokenValidatorService.isTokenValid(token)) {
                return Optional.of(token);
            }
        }
        return Optional.empty();
    }
}

package com.service.boardservice.service;

import com.service.boardservice.dto.AddNewMessageRequestDTO;
import com.service.boardservice.dto.DeleteMessageRequestDTO;
import com.service.boardservice.exception.UnauthorizedException;
import com.service.boardservice.model.Board;
import com.service.boardservice.model.Message;
import com.service.boardservice.repository.BoardRepository;
import com.service.boardservice.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ChatService {
    private final BoardRepository boardRepository;
    private final MessageRepository messageRepository;
    private final WebClient eventManagementWebClient;

    public ChatService(BoardRepository boardRepository, MessageRepository messageRepository, WebClient eventManagementWebClient) {
        this.boardRepository = boardRepository;
        this.messageRepository = messageRepository;
        this.eventManagementWebClient = eventManagementWebClient;
    }

    public void addNewMessage(AddNewMessageRequestDTO request, String token) throws UnauthorizedException {
        if (!authorizeSendMessage(request.getEventID(), request.getUserMagicEventsTag(), token)) {
            throw new UnauthorizedException("Not authorized to send message for event ID: " + request.getEventID());
        }
        System.out.println("-------------------->Adding new message: " + request.getContent());
        
        Board board = boardRepository.findByEventID(request.getEventID());
        if (board == null) {
            throw new IllegalArgumentException("Board not found for event ID: " + request.getEventID());
        }

        Message message = new Message(
                request.getContent(),
                request.getUsername(),
                request.getDateTime(),
                board
        );
        
        Message savedMessage = messageRepository.save(message);
        request.setMessageID(savedMessage.getId());
    }

    public DeleteMessageRequestDTO deleteMessage(DeleteMessageRequestDTO request, String token) {
        if (!authorizeAdmin(request.getEventID(), request.getUserMagicEventsTag(), token)) {
            throw new UnauthorizedException("Not authorized to delete message for event ID: " + request.getEventID());
        }

        Message message = messageRepository.findById(request.getMessageID())
                .orElseThrow(() -> new IllegalArgumentException("Message not found with ID: " + request.getMessageID()));
        Board board = message.getBoard();
        if (board == null) {
            return null;
        }
        messageRepository.delete(message);

        return request;
    }

    private boolean authorizeSendMessage(Long eventID, Long userMagicEventsTag, String token) {
        try {
            Boolean isParticipant = eventManagementWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/gestion/ispartecipant")
                    .queryParam("partecipantId", userMagicEventsTag)
                    .queryParam("eventId", eventID)
                    .build())
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(isParticipant);
        } catch (Exception e) {
            System.err.println("-------------------->Error during authorization check: " + e.getMessage());
            System.out.println(e);
            return false;
        }
    }

    private boolean authorizeAdmin(Long eventID, Long userMagicEventsTag, String token) {
        try {
            Boolean isAdmin = eventManagementWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/gestion/isadmin")
                    .queryParam("partecipantId", userMagicEventsTag)
                    .queryParam("eventId", eventID)
                    .build())
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(isAdmin);
        } catch (Exception e) {
            return false;
        }
    }
}

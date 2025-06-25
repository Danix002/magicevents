package com.service.eventsetupservice.service;

import com.service.eventsetupservice.dto.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class EventSetupService {
    private final WebClient eventManagementWebClient;
    private final WebClient galleryServiceWebClient;
    private final WebClient boardServiceWebClient;
    private final WebClient guestGameServiceWebClient;

    public EventSetupService(
            @Qualifier("eventManagementWebClient") WebClient eventManagementWebClient,
            @Qualifier("galleryServiceWebClient") WebClient galleryServiceWebClient,
            @Qualifier("boardServiceWebClient") WebClient boardServiceWebClient,
            @Qualifier("guestGameServiceWebClient") WebClient guestGameServiceWebClient) {
        this.eventManagementWebClient = eventManagementWebClient;
        this.galleryServiceWebClient = galleryServiceWebClient;
        this.boardServiceWebClient = boardServiceWebClient;
        this.guestGameServiceWebClient = guestGameServiceWebClient;
    }

    public EventServicesStatusDTO setupEvent(EventSetupRequestDTO request) {
        EventServicesStatusDTO status = new EventServicesStatusDTO();
        StringBuilder errorMessages = new StringBuilder();
        
        try {
            // Step 1: Create the event (mandatory)
            Long eventId = createEvent(request);
            if (eventId == null || eventId <= 0) {
                status.setEventCreated(false);
                status.setErrorMessage("Failed to create event");
                return status;
            }
            
            status.setEventId(eventId);
            status.setEventCreated(true);

            // Create board (mandatory)
            boolean boardCreated = createBoard(eventId, request);
            status.setBoardCreated(boardCreated);
            
            if (!boardCreated) {
                // delete the event if board creation fails
                deleteEvent(eventId, request.getCreatorMagicEventsTag());
                status.setErrorMessage("Event created but board creation failed");
                return status;
            }

            // Step 2: Create optional services based on flags
            if (request.getGalleryEnabled()) {
                boolean galleryCreated = createGallery(eventId, request);
                status.setGalleryCreated(galleryCreated);
                if (!galleryCreated) {
                    errorMessages.append("Gallery creation failed. ");
                }
            }

            if (request.getGameEnabled()) {
                boolean gameCreated = createGuestGame(eventId, request);
                status.setGameCreated(gameCreated);
                if (!gameCreated) {
                    errorMessages.append("Guest game creation failed. ");
                }
            }

            // Set error message only if there are optional service failures
            if (errorMessages.length() > 0) {
                status.setErrorMessage(errorMessages.toString().trim());
            }

            // Activate services in event management only if optional services are enabled
            if (request.getGalleryEnabled() || request.getGameEnabled()) {
                activateServices(eventId, request.getCreatorMagicEventsTag(), status);
            }

            return status;

        } catch (Exception e) {
            status.setErrorMessage("Unexpected error during event setup: " + e.getMessage());
            return status;
        }
    }

    public boolean activateEventServices(ServiceActivationRequestDTO request) {
        try {
            // Get current enabled services
            ServicesDTO currentServices = getCurrentEnabledServices(request.getEventId(), request.getUserMagicEventsTag());
            if (currentServices == null) {
                return false;
            }

            StringBuilder errorMessages = new StringBuilder();
            EventServicesStatusDTO status = new EventServicesStatusDTO();
            
            // Handle Gallery service (stato desiderato: enabled, tuttavia attualmente è disabilitato)
            if (request.isGalleryEnabled() && !currentServices.getGallery()) {
                // Create gallery
                boolean galleryCreated = createGalleryForEvent(request.getEventId(), request.getUserMagicEventsTag());
                status.setGalleryCreated(galleryCreated);
                if (!galleryCreated) {
                    errorMessages.append("Failed to create gallery. ");
                }
            } else if (!request.isGalleryEnabled() && currentServices.getGallery()) {
                // Delete gallery
                boolean galleryDeleted = deleteGallery(request.getEventId(), request.getUserMagicEventsTag());
                status.setGalleryCreated(false);
                if (!galleryDeleted) {
                    errorMessages.append("Failed to delete gallery. ");
                }
            } else {
                status.setGalleryCreated(currentServices.getGallery());
            }

            // Handle Guest Game service
            if (request.isGuestGameEnabled() && !currentServices.getGuestGame()) {
                // Create guest game
                boolean gameCreated = createGuestGameForEvent(request.getEventId(), request.getUserMagicEventsTag());
                status.setGameCreated(gameCreated);
                if (!gameCreated) {
                    errorMessages.append("Failed to create guest game. ");
                }
            } else if (!request.isGuestGameEnabled() && currentServices.getGuestGame()) {
                // Delete guest game
                boolean gameDeleted = deleteGuestGame(request.getEventId(), request.getUserMagicEventsTag());
                status.setGameCreated(false);
                if (!gameDeleted) {
                    errorMessages.append("Failed to delete guest game. ");
                }
            } else {
                status.setGameCreated(currentServices.getGuestGame());
            }

            // Board is always enabled (no changes)
            status.setBoardCreated(request.isBoardEnabled());
            
            // Update services status in event management
            activateServices(request.getEventId(), request.getUserMagicEventsTag(), status);
            
            return errorMessages.length() == 0;
        } catch (Exception e) {
            System.err.println("Failed to activate event services: " + e.getMessage());
            return false;
        }
    }

    private ServicesDTO getCurrentEnabledServices(Long eventId, Long userMagicEventsTag) {
        try {
            return eventManagementWebClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/gestion/getEventEnabledServices")
                            .queryParam("eventId", eventId)
                            .queryParam("magicEventsTag", userMagicEventsTag)
                            .build())
                    .retrieve()
                    .bodyToMono(ServicesDTO.class)
                    .block();
        } catch (Exception e) {
            System.err.println("Failed to get current enabled services: " + e.getMessage());
            return null;
        }
    }

    private boolean createGalleryForEvent(Long eventId, Long userMagicEventsTag) {
        try {
            CreateGalleryRequestDTO galleryRequest = new CreateGalleryRequestDTO();
            galleryRequest.setEventID(eventId);
            galleryRequest.setTitle("Event Gallery");
            galleryRequest.setUserMagicEventsTag(userMagicEventsTag);

            Boolean result = galleryServiceWebClient
                    .post()
                    .uri("/gallery/createGallery")
                    .body(Mono.just(galleryRequest), CreateGalleryRequestDTO.class)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean deleteGallery(Long eventId, Long userMagicEventsTag) {
        try {
            Boolean result = galleryServiceWebClient
                    .delete()
                    .uri(uriBuilder -> uriBuilder
                            .path("/gallery/deleteGallery/{eventID}")
                            .queryParam("userMagicEventsTag", userMagicEventsTag)
                            .build(eventId))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean createGuestGameForEvent(Long eventId, Long userMagicEventsTag) {
        try {
            GameRequestDTO guestGameRequest = new GameRequestDTO();
            guestGameRequest.setEventId(eventId);
            guestGameRequest.setDescription("Guest game for event");
            guestGameRequest.setUserMagicEventsTag(userMagicEventsTag);

            Boolean result = guestGameServiceWebClient
                    .post()
                    .uri("/guest-game/createGame")
                    .body(Mono.just(guestGameRequest), GameRequestDTO.class)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean deleteEvent(Long eventId, Long userMagicEventsTag) {
        try {
            Boolean result = eventManagementWebClient
                    .delete()
                    .uri(uriBuilder -> uriBuilder
                            .path("/gestion/delete")
                            .queryParam("eventId", eventId)
                            .queryParam("magicEventsTag", userMagicEventsTag)
                            .build())
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean deleteGuestGame(Long eventId, Long userMagicEventsTag) {
        try {
            Boolean result = guestGameServiceWebClient
                    .delete()
                    .uri(uriBuilder -> uriBuilder
                            .path("/guest-game/deleteGame/{eventId}")
                            .queryParam("userMagicEventsTag", userMagicEventsTag)
                            .build(eventId))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            return false;
        }
    }

    private Long createEvent(EventSetupRequestDTO request) {
        try {
            EventDTO eventDTO = new EventDTO();
            eventDTO.setTitle(request.getTitle());
            eventDTO.setDescription(request.getDescription());
            eventDTO.setStarting(request.getStarting());
            eventDTO.setEnding(request.getEnding());
            eventDTO.setLocation(request.getLocation());
            eventDTO.setCreator(request.getCreatorMagicEventsTag());
            eventDTO.setPartecipants(request.getParticipants());
            eventDTO.setAdmins(request.getAdmins());
            eventDTO.setImage(request.getImage());

            Long eventId = eventManagementWebClient
                    .post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/gestion/create")
                            .queryParam("creatorEmail", request.getCreatorEmail())
                            .build())
                    .body(Mono.just(eventDTO), EventDTO.class)
                    .retrieve()
                    .bodyToMono(Long.class)
                    .block();

            return eventId;

        } catch (Exception e) {
            return null;
        }
    }

    private boolean createGallery(Long eventId, EventSetupRequestDTO request) {
        try {
            CreateGalleryRequestDTO galleryRequest = new CreateGalleryRequestDTO();
            galleryRequest.setEventID(eventId);
            galleryRequest.setTitle(request.getGalleryTitle() != null ? 
                    request.getGalleryTitle() : request.getTitle() + " Gallery");
            galleryRequest.setUserMagicEventsTag(request.getCreatorMagicEventsTag());

            Boolean result = galleryServiceWebClient
                    .post()
                    .uri("/gallery/createGallery")
                    .body(Mono.just(galleryRequest), CreateGalleryRequestDTO.class)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);

        } catch (Exception e) {
            return false;
        }
    }

    private boolean createBoard(Long eventId, EventSetupRequestDTO request) {
        try {
            CreateBoardRequestDTO boardRequest = new CreateBoardRequestDTO();
            boardRequest.setEventID(eventId);
            boardRequest.setTitle(request.getBoardTitle() != null ? 
                    request.getBoardTitle() : request.getTitle() + " Board");
            boardRequest.setDescription(request.getBoardDescription() != null ? 
                    request.getBoardDescription() : "Board for " + request.getTitle());
            boardRequest.setUserMagicEventsTag(request.getCreatorMagicEventsTag());

            Boolean result = boardServiceWebClient
                    .post()
                    .uri("/board/createBoard")
                    .body(Mono.just(boardRequest), CreateBoardRequestDTO.class)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);

        } catch (Exception e) {
            return false;
        }
    }

    private boolean createGuestGame(Long eventId, EventSetupRequestDTO request) {
        try {
            GameRequestDTO guestGameRequest = new GameRequestDTO();
            guestGameRequest.setEventId(eventId);
            guestGameRequest.setDescription(request.getGameDescription());
            guestGameRequest.setUserMagicEventsTag(request.getCreatorMagicEventsTag());

            Boolean result = guestGameServiceWebClient
                    .post()
                    .uri("/guestgame/createGuestGame")
                    .body(Mono.just(guestGameRequest), GameRequestDTO.class)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return Boolean.TRUE.equals(result);

        } catch (Exception e) {
            return false;
        }
    }

    private void activateServices(Long eventId, Long creatorMagicEventsTag, EventServicesStatusDTO status) {
        try {
            ServicesDTO servicesDTO = new ServicesDTO();
            servicesDTO.setBoard(status.isBoardCreated());
            servicesDTO.setGallery(status.isGalleryCreated());
            servicesDTO.setGuestGame(status.isGameCreated());
            String result = eventManagementWebClient
                    .post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/gestion/activeservices")
                            .queryParam("eventId", eventId)
                            .queryParam("magicEventsTag", creatorMagicEventsTag)
                            .build())
                    .body(Mono.just(servicesDTO), ServicesDTO.class)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

        } catch (Exception e) {
            System.err.println("Failed to activate services: " + e.getMessage());
        }
    }
}

package com.service.galleryservice.service;

import com.service.galleryservice.dto.CreateGalleryRequestDTO;
import com.service.galleryservice.dto.GalleryDTO;
import com.service.galleryservice.dto.ImageDTO;
import com.service.galleryservice.dto.ImageUserLikeDTO;
import com.service.galleryservice.exception.UnauthorizedException;
import com.service.galleryservice.model.Gallery;
import com.service.galleryservice.repository.GalleryRepository;
import com.service.galleryservice.repository.ImageRepository;
import com.service.galleryservice.repository.ImageUserLikeRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class GalleryService {
    private final GalleryRepository galleryRepository;
    private final ImageRepository imageRepository;
    private final ImageUserLikeRepository imageUserLikeRepository;
    private final WebClient eventManagementWebClient;

    public GalleryService(
            GalleryRepository galleryRepository,
            ImageRepository imageRepository,
            ImageUserLikeRepository imageUserLikeRepository,
            WebClient eventManagementWebClient
    ) {
        this.galleryRepository = galleryRepository;
        this.imageRepository = imageRepository;
        this.imageUserLikeRepository = imageUserLikeRepository;
        this.eventManagementWebClient = eventManagementWebClient;
    }

    public void createGallery(CreateGalleryRequestDTO request, String token) {
        if (!authorizeCreateDeleteGallery(request.getEventID(), request.getUserMagicEventsTag(), token)) {
            throw new UnauthorizedException("Not authorized to create gallery for event ID: " + request.getEventID());
        }
        Gallery gallery = new Gallery();
        gallery.setEventID(request.getEventID());
        gallery.setTitle(request.getTitle());
        galleryRepository.save(gallery);
    }

    public GalleryDTO getGallery(Long eventID, Long userMagicEventsTag, int pageNumber, int pageSize, String token) {
        if (!authorizeViewGallery(eventID, userMagicEventsTag, token)) {
            throw new UnauthorizedException("Not authorized to view gallery for event ID: " + eventID);
        }
        
        Gallery gallery = galleryRepository.findByEventID(eventID);
        if (gallery == null) {
            return null;
        }

        List<ImageDTO> images = imageRepository.findByGallery(gallery)
                .stream()
                .sorted((i1, i2) -> i2.getDateTime().compareTo(i1.getDateTime()))
                .skip((long) pageNumber * pageSize)
                .limit(pageSize)
                .map(img -> {
                    int likesCount = imageUserLikeRepository.countByImage(img);
                    boolean userLike = !imageUserLikeRepository.findByImageAndUserMagicEventsTag(
                            img,
                            userMagicEventsTag.toString()
                    ).isEmpty();
                    return new ImageDTO(
                        img.getId(),
                        img.getTitle(),
                        img.getBase64Image(),
                        img.getUploadedBy(),
                        img.getDateTime(),
                        likesCount,
                        userLike
                    );
                })
                .toList();

        return GalleryDTO.builder()
                .eventID(gallery.getEventID())
                .title(gallery.getTitle())
                .images(images)
                .build();
    }

    public GalleryDTO getMostPopularImages(Long eventID, Long userMagicEventsTag, int pageNumber, int pageSize, String token) {
        if (!authorizeViewGallery(eventID, userMagicEventsTag, token)) {
            throw new UnauthorizedException("Not authorized to view gallery for event ID: " + eventID);
        }
        
        Gallery gallery = galleryRepository.findByEventID(eventID);
        if (gallery == null) {
            return null;
        }

        List<ImageDTO> images = imageRepository.findByGallery(gallery)
                .stream()
                .sorted((i1, i2) -> Integer.compare(
                        imageUserLikeRepository.countByImage(i2),
                        imageUserLikeRepository.countByImage(i1)))
                .skip((long) pageNumber * pageSize)
                .limit(pageSize)
                .map(img -> {
                    int likesCount = imageUserLikeRepository.countByImage(img);
                    boolean userLike = !imageUserLikeRepository.findByImageAndUserMagicEventsTag(
                            img, userMagicEventsTag.toString()
                    ).isEmpty();
                    return new ImageDTO(
                        img.getId(),
                        img.getTitle(),
                        img.getBase64Image(),
                        img.getUploadedBy(),
                        img.getDateTime(),
                        likesCount,
                        userLike
                    );
                })
                .toList();

        return GalleryDTO.builder()
                .eventID(gallery.getEventID())
                .title(gallery.getTitle())
                .images(images)
                .build();
    }

    private boolean authorizeCreateDeleteGallery(Long eventID, Long userMagicEventsTag, String token) {
        try {
            Boolean isCreator = eventManagementWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/gestion/iscreator")
                    .queryParam("creatorId", userMagicEventsTag)
                    .queryParam("eventId", eventID)
                    .build())
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(isCreator);
        } catch (Exception e) {
            System.err.println("-----> Error during creator authorization check: " + e.getMessage());
            return false;
        }
    }

    private boolean authorizeViewGallery(Long eventID, Long userMagicEventsTag, String token) {
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
            System.err.println("-----> Error during participant authorization check: " + e.getMessage());
            return false;
        }
    }

    public Boolean isGalleryExists(Long eventID) {
        return galleryRepository.findByEventID(eventID) != null;
    }

    @Transactional
    public void deleteGallery(Long eventID, Long userMagicEventsTag, String token) {
        if (!authorizeCreateDeleteGallery(eventID, userMagicEventsTag, token)) {
            throw new UnauthorizedException("Not authorized to delete gallery for event ID: " + eventID);
        }
        Gallery gallery = galleryRepository.findByEventID(eventID);
        if (gallery != null) {
            galleryRepository.delete(gallery);
        }
    }
}

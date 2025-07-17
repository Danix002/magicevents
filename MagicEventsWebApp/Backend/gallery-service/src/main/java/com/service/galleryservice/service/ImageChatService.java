package com.service.galleryservice.service;

import com.service.galleryservice.dto.AddNewImageRequestDTO;
import com.service.galleryservice.dto.DeleteImageRequestDTO;
import com.service.galleryservice.dto.ImageLikeRequestDTO;
import com.service.galleryservice.exception.UnauthorizedException;
import com.service.galleryservice.model.Gallery;
import com.service.galleryservice.model.Image;
import com.service.galleryservice.model.ImageUserLike;
import com.service.galleryservice.repository.GalleryRepository;
import com.service.galleryservice.repository.ImageRepository;
import com.service.galleryservice.repository.ImageUserLikeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;

@Service
public class ImageChatService {
    private final GalleryRepository galleryRepository;
    private final ImageRepository imageRepository;
    private final ImageUserLikeRepository imageUserLikeRepository;
    private final WebClient eventManagementWebClient;

    public ImageChatService(
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

    public AddNewImageRequestDTO addNewImage(AddNewImageRequestDTO request, String token) {
        if (!authorizePartecipant(request.getEventID(), Long.parseLong(request.getMagicEventsTag()), token)) {
            throw new UnauthorizedException("Not authorized to add image for event ID: " + request.getEventID());
        }

        Gallery gallery = galleryRepository.findByEventID(request.getEventID());

        if (gallery == null) {
            return null;
        }

        Image image = new Image();
        image.setTitle(request.getTitle());
        image.setBase64Image(request.getBase64Image());
        image.setDateTime(request.getDateTime() != null ? request.getDateTime() : LocalDateTime.now());
        image.setUploadedBy(request.getUploadedBy());
        image.setGallery(gallery);
        Image savedImage = imageRepository.save(image);
        request.setDateTime(savedImage.getDateTime());
        request.setImageID(savedImage.getId());
        return request;
    }

    public DeleteImageRequestDTO deleteImage(DeleteImageRequestDTO request, String token) {
        if (!authorizeAdmin(request.getEventID(), Long.parseLong(request.getMagicEventsTag()), token)) {
            throw new UnauthorizedException("Not authorized to delete image for event ID: " + request.getEventID());
        }

        Image image = imageRepository.findById(request.getImageID())
                .orElseThrow(() -> new IllegalArgumentException("Image not found with ID: " + request.getImageID()));
        Gallery gallery = image.getGallery();
        if (gallery == null) {
            return null;
        }
        imageRepository.delete(image);

        return request;
    }

    public ImageLikeRequestDTO handleImageLike(ImageLikeRequestDTO request, String token) {
        if (!authorizePartecipant(request.getEventID(), Long.parseLong(request.getUserMagicEventsTag()), token)) {
            throw new UnauthorizedException("Not authorized to like image for event ID: " + request.getEventID());
        }

        Image image = imageRepository.findById(request.getImageID())
                .orElseThrow(() -> new IllegalArgumentException("Image not found with ID: " + request.getImageID()));
        if (request.isLike()) {
            boolean exists = !imageUserLikeRepository.findByImageAndUserMagicEventsTag(image, request.getUserMagicEventsTag()).isEmpty();
            if (!exists) {
                ImageUserLike newLike = new ImageUserLike();
                newLike.setImage(image);
                newLike.setUserMagicEventsTag(request.getUserMagicEventsTag());
                imageUserLikeRepository.save(newLike);
            }
        } else {
            var likes = imageUserLikeRepository.findByImageAndUserMagicEventsTag(image, request.getUserMagicEventsTag());
            if (!likes.isEmpty()) {
                imageUserLikeRepository.deleteAll(likes);
            }
        }

        request.setLikedCount(imageUserLikeRepository.countByImage(image));
        return request;
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
            System.err.println("-----> Error during admin authorization check: " + e.getMessage());
            return false;
        }
    }

    private boolean authorizePartecipant(Long eventID, Long userMagicEventsTag, String token) {
        try {
            Boolean isPartecipant = eventManagementWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/gestion/ispartecipant")
                    .queryParam("partecipantId", userMagicEventsTag)
                    .queryParam("eventId", eventID)
                    .build())
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(isPartecipant);
        } catch (Exception e) {
            System.err.println("-----> Error during participant authorization check: " + e.getMessage());
            return false;
        }
    }
}
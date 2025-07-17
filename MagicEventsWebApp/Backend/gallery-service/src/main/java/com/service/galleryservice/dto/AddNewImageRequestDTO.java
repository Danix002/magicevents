package com.service.galleryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Objects;

public class AddNewImageRequestDTO {
    @NotNull(message = "Event ID cannot be null")
    private Long eventID;
    
    @NotBlank(message = "Title cannot be blank")
    private String title;
    
    @NotBlank(message = "Base64 image cannot be blank")
    private String base64Image;
    
    @NotBlank(message = "Uploaded by cannot be blank")
    private String uploadedBy;

    private Long imageID;
    
    private LocalDateTime dateTime;
    private String magicEventsTag;

    public AddNewImageRequestDTO() { }

    public AddNewImageRequestDTO(
            Long eventID,
            String title,
            String base64Image,
            String uploadedBy,
            Long imageID,
            LocalDateTime dateTime,
            String magicEventsTag
    ) {
        if (eventID == null) {
            throw new IllegalArgumentException("eventID cannot be null");
        }
        if (title == null) {
            throw new IllegalArgumentException("title cannot be null");
        }
        if (base64Image == null) {
            throw new IllegalArgumentException("base64Image cannot be null");
        }
        if (uploadedBy == null) {
            throw new IllegalArgumentException("uploadedBy cannot be null");
        }
        this.eventID = eventID;
        this.title = title;
        this.base64Image = base64Image;
        this.uploadedBy = uploadedBy;
        this.imageID = imageID;
        this.dateTime = dateTime;
        this.magicEventsTag = magicEventsTag;
    }

    public Long getEventID() {
        return eventID;
    }

    public void setEventID(Long eventID) {
        if (eventID == null) {
            throw new IllegalArgumentException("eventID cannot be null");
        }
        this.eventID = eventID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        if (title == null) {
            throw new IllegalArgumentException("title cannot be null");
        }
        this.title = title;
    }

    public String getBase64Image() {
        return base64Image;
    }

    public void setBase64Image(String base64Image) {
        if (base64Image == null) {
            throw new IllegalArgumentException("base64Image cannot be null");
        }
        this.base64Image = base64Image;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        if (uploadedBy == null) {
            throw new IllegalArgumentException("uploadedBy cannot be null");
        }
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getMagicEventsTag() {
        return magicEventsTag;
    }

    public void setMagicEventsTag(String magicEventsTag) {
        this.magicEventsTag = magicEventsTag;
    }

    public Long getImageID() {
        return imageID;
    }

    public void setImageID(Long imageID) {
        this.imageID = imageID;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AddNewImageRequestDTO that = (AddNewImageRequestDTO) o;
        return Objects.equals(eventID, that.eventID) &&
               Objects.equals(title, that.title) &&
               Objects.equals(base64Image, that.base64Image) &&
               Objects.equals(uploadedBy, that.uploadedBy) &&
               Objects.equals(imageID, that.imageID) &&
               Objects.equals(dateTime, that.dateTime) &&
               Objects.equals(magicEventsTag, that.magicEventsTag);
    }

    @Override
    public int hashCode() {
        return Objects.hash(eventID, title, base64Image, uploadedBy, imageID, dateTime, magicEventsTag);
    }

    @Override
    public String toString() {
        return "AddNewImageRequestDTO{" +
               "eventID=" + eventID +
               ", title='" + title + '\'' +
               ", base64Image='" + base64Image + '\'' +
               ", uploadedBy='" + uploadedBy + '\'' +
               ", imageID=" + imageID +
               ", dateTime=" + dateTime +
               ", magiceventstag='" + magicEventsTag + '\'' +
               '}';
    }
}

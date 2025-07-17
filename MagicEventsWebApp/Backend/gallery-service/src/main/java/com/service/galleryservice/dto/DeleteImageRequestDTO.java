package com.service.galleryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

public class DeleteImageRequestDTO {
    @NotNull(message = "Event ID cannot be null")
    private Long eventID;
    
    @NotNull(message = "Image ID cannot be null")
    private Long imageID;
    
    @NotBlank(message = "Deleted by cannot be blank")
    private String deletedBy;
    
    @NotBlank(message = "Magic Events tag cannot be blank")
    private String magicEventsTag;

    public DeleteImageRequestDTO() { }

    public DeleteImageRequestDTO(Long eventID, Long imageID, String deletedBy, String magicEventsTag) {
        if (eventID == null) {
            throw new IllegalArgumentException("eventID cannot be null");
        }
        if (imageID == null) {
            throw new IllegalArgumentException("imageID cannot be null");
        }
        if (deletedBy == null) {
            throw new IllegalArgumentException("deletedBy cannot be null");
        }
        this.eventID = eventID;
        this.imageID = imageID;
        this.deletedBy = deletedBy;
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

    public Long getImageID() {
        return imageID;
    }

    public void setImageID(Long imageID) {
        if (imageID == null) {
            throw new IllegalArgumentException("imageID cannot be null");
        }
        this.imageID = imageID;
    }

    public String getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(String deletedBy) {
        if (deletedBy == null) {
            throw new IllegalArgumentException("deletedBy cannot be null");
        }
        this.deletedBy = deletedBy;
    }

    public String getMagicEventsTag() {
        return magicEventsTag;
    }

    public void setMagicEventsTag(String magicEventsTag) {
        this.magicEventsTag = magicEventsTag;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeleteImageRequestDTO that = (DeleteImageRequestDTO) o;
        return Objects.equals(eventID, that.eventID) &&
               Objects.equals(imageID, that.imageID) &&
               Objects.equals(deletedBy, that.deletedBy) &&
               Objects.equals(magicEventsTag, that.magicEventsTag);
    }

    @Override
    public int hashCode() {
        return Objects.hash(eventID, imageID, deletedBy, magicEventsTag);
    }

    @Override
    public String toString() {
        return "DeleteImageRequestDTO{" +
               "eventID=" + eventID +
               ", imageID=" + imageID +
               ", deletedBy='" + deletedBy + '\'' +
               ", magiceventstag='" + magicEventsTag + '\'' +
               '}';
    }
}

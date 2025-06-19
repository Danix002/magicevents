package com.service.eventsmanagementservice.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EventDTO {
    private String title;

    private String description;

    private LocalDateTime starting;

    private LocalDateTime ending;

    private String location;

    /** User magic_events_tag */
    private Long creator;

    private ArrayList<String> partecipants;

    private ArrayList<String> admins;

    public EventDTO() {}

    public EventDTO(
            String title,
            String description,
            LocalDateTime start,
            LocalDateTime end,
            String location,
            Long creator,
            ArrayList<String> partecipants,
            ArrayList<String> admins
    ) {
        this.title = title;
        this.description = description;
        this.starting = start;
        this.ending = end;
        this.location = location;
        this.creator = creator;
        this.partecipants = partecipants;
        this.admins = admins;
    }

    public String getDescription() {
        return this.description;
    }

    public LocalDateTime getEnding() {
        return this.ending;
    }

    public LocalDateTime getStarting() {
        return this.starting;
    }

    public String getTitle() {
        return this.title;
    }

    public String getLocation() {
        return this.location;
    }

    public Long getCreator() {
        return this.creator;
    }

    public List<String> getPartecipants() {
        return this.partecipants;
    }

    public List<String> getAdmins() {
        return this.admins;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setEnding(LocalDateTime end) {
        this.ending = end;
    }

    public void setStarting(LocalDateTime start) {
        this.starting = start;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCreator(Long creator) {
        this.creator = creator;
    }

    public void setAdmins(ArrayList<String> admins) {
        this.admins = admins;
    }

    public void setPartecipants(ArrayList<String> partecipants) {
        this.partecipants = partecipants;
    }
}


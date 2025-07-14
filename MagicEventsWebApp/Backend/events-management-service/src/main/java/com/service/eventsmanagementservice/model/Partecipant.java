package com.service.eventsmanagementservice.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "partecipants")
public class Partecipant {
    @Id
    @Column(name = "magic_events_tag")
    private Long magicEventTag;

    @Column(nullable = false, unique = true)
    private String email;

    @ManyToMany(mappedBy = "partecipants")
    private List<Event> events = new ArrayList<>();

    public Partecipant() {}

    public Partecipant(
            Long magicEventTag,
            ArrayList<Event> events
    ) {
        this.magicEventTag = magicEventTag;
        this.events = events;
    }

    public Long getMagicEventTag() {
        return magicEventTag;
    }

    public void setMagicEventTag(Long magicEventTag) {
        this.magicEventTag = magicEventTag;
    }

    public List<Event> getEvents() {
        return this.events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

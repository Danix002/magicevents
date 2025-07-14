package com.service.eventsmanagementservice.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admins")
public class Admin {
    @Id
    private Long admin_id;

    @ManyToOne
    @JoinColumn(name = "magic_events_tag")
    private Partecipant user;

    @ManyToMany(mappedBy = "admins")
    private List<Event> events = new ArrayList<>(); ;

    public Admin() {}

    public Admin(Long adminId, Partecipant user, List<Event> events) {
        this.admin_id = adminId;
        this.user = user;
        this.events = events;
    }

    public Long getAdminId() {
        return admin_id;
    }

    public void setAdminId(Long id) {
        this.admin_id = id;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }

    public Partecipant getUser() {
        return user;
    }

    public void setUser(Partecipant user) {
        this.user = user;
    }
}
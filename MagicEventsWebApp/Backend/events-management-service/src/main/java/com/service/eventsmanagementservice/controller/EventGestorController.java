package com.service.eventsmanagementservice.controller;

import com.service.eventsmanagementservice.dto.EventDTO;
import com.service.eventsmanagementservice.dto.ServicesDTO;
import com.service.eventsmanagementservice.service.EventGestorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import com.service.eventsmanagementservice.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/gestion")
public class EventGestorController {
    private final EventGestorService eventGestorService;

    public EventGestorController(
            EventGestorService eventGestorService
    ) {
        this.eventGestorService = eventGestorService;
    }

    @PostMapping("/create")
    public ResponseEntity<Long> createEvent(
            @Valid @RequestBody EventDTO eventDTO,
            @RequestParam("creatorEmail") String creatorEmail
    ) {
        for(String partecipantEmail : eventDTO.getPartecipants()){
            if(eventDTO.getAdmins().contains(partecipantEmail)){
                /// There must be no duplicate emails in partecipants and admins lists
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1L);
            }
        }
        if(
                eventDTO.getEnding().isAfter(eventDTO.getStarting()) &&
                eventDTO.getStarting().isAfter(LocalDateTime.now())
        ) {
            Long eventId = eventGestorService.create(eventDTO, creatorEmail);
            if(eventId != -1L) {
                return ResponseEntity.status(HttpStatus.CREATED).body(eventId);
            }else{
                /// Event with this title in range already exist
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1L);
            }
        }else{
            /// Invalid event ending value
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1L);
        }
    }

    @PutMapping("/annullevent")
    public ResponseEntity<String> annullEvent(
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        String response = eventGestorService.annullEvent(eventId, creatorId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PutMapping("/activeservices")
    public ResponseEntity<String> activeServicesEvent(
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId,
            @Valid @RequestBody ServicesDTO servicesDTO
    ) {
        String response = eventGestorService.activeServicesEvent(eventId, creatorId, servicesDTO);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PutMapping("/activeevent")
    public ResponseEntity<String> activeEvent(
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        String response = eventGestorService.activeEvent(eventId, creatorId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PutMapping("/updateadmins")
    public String addNewAdmins(
            @RequestParam("admins") ArrayList<String> admins,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        return eventGestorService.updateEventAdmins(admins, eventId, creatorId);
    }

    @PutMapping("/addpartecipants")
    public String addNewPartecipants(
            @RequestParam("partecipants") ArrayList<String> partecipants,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        System.out.println("Event: " + eventId + " Partecipant: " + creatorId);
        return eventGestorService.updateEventPartecipants(partecipants, eventId, creatorId);
    }

    @PutMapping("/removepartecipant")
    public String removePartecipant(
            @RequestParam("partecipant") String partecipant,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        return eventGestorService.removePartecipant(partecipant, eventId, creatorId);
    }

    @PutMapping("/removeadmin")
    public String removeAdmin(
            @RequestParam("admin") String admin,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        return eventGestorService.removeAdmin(admin, eventId, creatorId);
    }

    @GetMapping("/geteventinfo")
    public EventDTO getEventInfo(@RequestParam("eventId") Long eventId, @RequestParam("magicEventsTag") Long magicEventsTag) {
        return eventGestorService.getEventInfo(eventId, magicEventsTag);
    }

    @PutMapping("/modify")
    public String modifyEvent(
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId,
            @Valid @RequestBody EventDTO eventDTO
    ) {
        return eventGestorService.modifyEvent(eventDTO, creatorId, eventId);
    }

    @GetMapping("/ispartecipant")
    public boolean isPartecipant(@RequestParam("partecipantId") Long magicEventsTag, @RequestParam("eventId") Long eventId) {
        return eventGestorService.isPartecipant(magicEventsTag, eventId);
    }

    @GetMapping("/isadmin")
    public boolean isAdmin(@RequestParam("partecipantId") Long magicEventsTag, @RequestParam("eventId") Long eventId){
        return eventGestorService.isAdmin(magicEventsTag, eventId) || eventGestorService.isCreator(magicEventsTag, eventId);
    }

    @GetMapping("/iscreator")
    public boolean isCreator(@RequestParam("creatorId") Long creatorId, @RequestParam("eventId") Long eventId){
        return eventGestorService.isCreator(creatorId, eventId);
    }

    @GetMapping("/geteventslistc")
    public List<EventDTO> getEventsCreated(@RequestParam("creatorId") Long creatorId){
        return eventGestorService.getEventsCreated(creatorId);
    }

    @GetMapping("/geteventslistp")
    public List<EventDTO> getEventPartecipated(@RequestParam("partecipantId") Long partecipantId){
        return eventGestorService.getEventPartecipated(partecipantId);
    }

    @GetMapping("/isactive")
    public ResponseEntity<Boolean> isActive(@RequestParam("creatorId") Long creatorId, @RequestParam("eventId") Long eventId) {
        Boolean flag = eventGestorService.isActive(creatorId, eventId);
        if(flag == null){
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(false);
        }else{
            return ResponseEntity.ok(flag);
        }
    }

    @GetMapping("/geteventid")
    public List<Long> getEventId(
            @RequestParam("title") String title,
            @RequestParam("day") LocalDateTime day,
            @RequestParam("magicEventTag") Long magicEventTag
    ){
        return eventGestorService.getEventId(magicEventTag, title, day);
    }

    @GetMapping("/getadminsforevent")
    public List<String> getAdmins(@RequestParam("eventId") Long eventId, @RequestParam("magicEventsTag") Long creatorId){
        return eventGestorService.getAdminsForEvent(eventId, creatorId);
    }

    @GetMapping("/getpartecipantsforevent")
    public List<String> getPartecipants(@RequestParam("eventId") Long eventId){
        return eventGestorService.getPartecipantsForEvent(eventId);
    }

    @DeleteMapping("/delete")
    public boolean deleteEvent(@RequestParam("eventId") Long eventId, @RequestParam("magicEventsTag") Long creatorId){
        return eventGestorService.delete(eventId, creatorId);
    }

    @GetMapping("/geteventenabledservices")
    public ResponseEntity<ServicesDTO> getEventEnabledServices(
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventTag") Long magicEventsTag
    ) {
        try {
            ServicesDTO services = eventGestorService.getEventEnabledServices(eventId, magicEventsTag);
            if (services != null) {
                return ResponseEntity.ok(services);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/deletepartecipant")
    public boolean deleteUser(@RequestParam("magicEventsTag") Long magicEventsTag){
        return eventGestorService.deleteUser(magicEventsTag);
    }
}




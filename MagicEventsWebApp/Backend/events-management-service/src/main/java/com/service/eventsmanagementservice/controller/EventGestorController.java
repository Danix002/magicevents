package com.service.eventsmanagementservice.controller;

import com.service.eventsmanagementservice.dto.EventDTO;
import com.service.eventsmanagementservice.dto.ServicesDTO;
import com.service.eventsmanagementservice.exception.UnauthorizedException;
import com.service.eventsmanagementservice.service.EventGestorService;
import com.service.eventsmanagementservice.service.TokenValidatorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/gestion")
public class EventGestorController {
    private final EventGestorService eventGestorService;
    private final TokenValidatorService tokenValidatorService;

    public EventGestorController(
            EventGestorService eventGestorService,
            TokenValidatorService tokenValidatorService
    ) {
        this.eventGestorService = eventGestorService;
        this.tokenValidatorService = tokenValidatorService;
    }

    @PostMapping("/create")
    public ResponseEntity<Long> createEvent(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody EventDTO eventDTO,
            @RequestParam("creatorEmail") String creatorEmail
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        for(String partecipantEmail : eventDTO.getPartecipants()){
            if(eventDTO.getAdmins().contains(partecipantEmail)){
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1L);
            }
        }
        if(
                eventDTO.getEnding().isAfter(eventDTO.getStarting()) &&
                eventDTO.getStarting().isAfter(LocalDateTime.now())
        ) {
            Long eventId = eventGestorService.create(eventDTO, creatorEmail, token);
            if(eventId != -1L) {
                return ResponseEntity.status(HttpStatus.CREATED).body(eventId);
            }else{
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1L);
            }
        }else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1L);
        }
    }

    @PutMapping("/annullevent")
    public ResponseEntity<String> annullEvent(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String response = eventGestorService.annullEvent(eventId, creatorId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PutMapping("/activeservices")
    public ResponseEntity<String> activeServicesEvent(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId,
            @Valid @RequestBody ServicesDTO servicesDTO
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String response = eventGestorService.activeServicesEvent(eventId, creatorId, servicesDTO);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PutMapping("/activeevent")
    public ResponseEntity<String> activeEvent(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String response = eventGestorService.activeEvent(eventId, creatorId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PutMapping("/updateadmins")
    public String addNewAdmins(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("admins") ArrayList<String> admins,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return "UNAUTHORIZED";
        }
        return eventGestorService.updateEventAdmins(admins, eventId, creatorId, token);
    }

    @PutMapping("/addpartecipants")
    public String addNewPartecipants(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("partecipants") ArrayList<String> partecipants,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return "UNAUTHORIZED";
        }
        return eventGestorService.updateEventPartecipants(partecipants, eventId, creatorId, token);
    }

    @PutMapping("/removepartecipant")
    public String removePartecipant(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("partecipant") String partecipant,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return "UNAUTHORIZED";
        }
        return eventGestorService.removePartecipant(partecipant, eventId, creatorId, token);
    }

    @PutMapping("/removeadmin")
    public String removeAdmin(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("admin") String admin,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ) {
        String token = extractToken(authorizationHeader);
        if (!tokenValidatorService.isTokenValid(token)) {
            return "UNAUTHORIZED";
        }
        return eventGestorService.removeAdmin(admin, eventId, creatorId, token);
    }

    @GetMapping("/geteventinfo")
    public EventDTO getEventInfo(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long magicEventsTag
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return null;
        }
        return eventGestorService.getEventInfo(eventId, magicEventsTag);
    }

    @PutMapping("/modify")
    public String modifyEvent(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId,
            @Valid @RequestBody EventDTO eventDTO
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return "UNAUTHORIZED";
        }
        return eventGestorService.modifyEvent(eventDTO, creatorId, eventId);
    }

    @GetMapping("/ispartecipant")
    public boolean isPartecipant(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("partecipantId") Long magicEventsTag,
            @RequestParam("eventId") Long eventId
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return false;
        }
        return eventGestorService.isPartecipant(magicEventsTag, eventId);
    }

    @GetMapping("/isadmin")
    public boolean isAdmin(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("partecipantId") Long magicEventsTag,
            @RequestParam("eventId") Long eventId
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return false;
        }
        return eventGestorService.isAdmin(magicEventsTag, eventId) || eventGestorService.isCreator(magicEventsTag, eventId);
    }

    @GetMapping("/iscreator")
    public boolean isCreator(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("creatorId") Long creatorId,
            @RequestParam("eventId") Long eventId
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return false;
        }
        return eventGestorService.isCreator(creatorId, eventId);
    }

    @GetMapping("/geteventslistc")
    public List<EventDTO> getEventsCreated(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("creatorId") Long creatorId
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return List.of();
        }
        return eventGestorService.getEventsCreated(creatorId);
    }

    @GetMapping("/geteventslistp")
    public List<EventDTO> getEventPartecipated(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("partecipantId") Long partecipantId
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return List.of();
        }
        return eventGestorService.getEventPartecipated(partecipantId);
    }

    @GetMapping("/isactive")
    public ResponseEntity<Boolean> isActive(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("creatorId") Long creatorId,
            @RequestParam("eventId") Long eventId
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Boolean flag = eventGestorService.isActive(creatorId, eventId);
        if(flag == null){
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(false);
        }else{
            return ResponseEntity.ok(flag);
        }
    }

    @GetMapping("/geteventid")
    public List<Long> getEventId(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("title") String title,
            @RequestParam("day") LocalDateTime day,
            @RequestParam("magicEventTag") Long magicEventTag
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return List.of();
        }
        return eventGestorService.getEventId(magicEventTag, title, day);
    }

    @GetMapping("/getadminsforevent")
    public List<String> getAdmins(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return List.of();
        }
        return eventGestorService.getAdminsForEvent(eventId, creatorId);
    }

    @GetMapping("/getpartecipantsforevent")
    public List<String> getPartecipants(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return List.of();
        }
        return eventGestorService.getPartecipantsForEvent(eventId);
    }

    @DeleteMapping("/delete")
    public boolean deleteEvent(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventsTag") Long creatorId
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return false;
        }
        return eventGestorService.delete(eventId, creatorId);
    }

    @GetMapping("/geteventenabledservices")
    public ResponseEntity<ServicesDTO> getEventEnabledServices(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("eventId") Long eventId,
            @RequestParam("magicEventTag") Long magicEventsTag
    ) {
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
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
    public boolean deleteUser(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("magicEventsTag") Long magicEventsTag
    ){
        if (!tokenValidatorService.isTokenValid(extractToken(authorizationHeader))) {
            return false;
        }
        return eventGestorService.deleteUser(magicEventsTag);
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

package com.service.eventsmanagementservice.service;

import com.service.eventsmanagementservice.dto.EventDTO;
import com.service.eventsmanagementservice.dto.ServicesDTO;
import com.service.eventsmanagementservice.model.Admin;
import com.service.eventsmanagementservice.model.EmailDetails;
import com.service.eventsmanagementservice.model.Event;
import com.service.eventsmanagementservice.model.Partecipant;
import com.service.eventsmanagementservice.repository.AdminsRepository;
import com.service.eventsmanagementservice.repository.EventsRepository;
import com.service.eventsmanagementservice.repository.PartecipantsRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import com.service.eventsmanagementservice.exception.UnauthorizedException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Slf4j
public class EventGestorService {
    @Autowired
    EventsRepository eventsRepository;
    @Autowired
    AdminsRepository adminsRepository;
    @Autowired
    PartecipantsRepository partecipantsRepository;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Value("${spring.rabbitmq.exchange.event}")
    private String exchangeName;
    @Autowired
    private WebClient userManagementWebClient;
    @Autowired
    EmailSender emailSender;

    @Value("${spring.rabbitmq.routing-key.delete-event-board}")
    private String deleteBoardRoutingKey;
    @Value("${spring.rabbitmq.routing-key.delete-event-gallery}")
    private String deleteGalleryRoutingKey;
    @Value("${spring.rabbitmq.routing-key.delete-event-guestgame}")
    private String deleteGuestgameRoutingKey;

    public String updateEventAdmins(ArrayList<String> admins, Long eventId, Long creatorId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if(event.getCreator().equals(creatorId)) {
            addAdmins(admins, eventId);
            return "Success";
        }else{
            return "Error";
        }
    }
    public String updateEventPartecipants(ArrayList<String> partecipants, Long eventId, Long creatorId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if(event.getCreator().equals(creatorId)) {
            addPartecipants(partecipants, eventId);
            return "Success";
        }else {
            return "Error";
        }
    }

    public EventDTO getEventInfo(Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        ArrayList<String> admins = new ArrayList<>();
        for (Admin admin : event.getAdmins()) {
            admins.add(admin.getUser().getEmail());
        }
        ArrayList<String> partecipants = new ArrayList<>();
        for (Partecipant partecipant : event.getPartecipants()) {
            partecipants.add(partecipant.getEmail());
        }
        return new EventDTO(
                event.getTitle(),
                event.getDescription(),
                event.getStarting(),
                event.getEnding(),
                event.getLocation(),
                event.getCreator(),
                partecipants,
                admins,
                event.getImage()
        );
    }

    @Transactional
    public Long create(@Valid EventDTO eventDTO, String creatorEmail) {
        List<EventDTO> eventsForCreator = getEventsCreated(eventDTO.getCreator());
        for(EventDTO eventForCreator : eventsForCreator) {
            if(
                    eventForCreator.getTitle().equals(eventDTO.getTitle()) &&
                    (eventForCreator.getStarting().isBefore(eventDTO.getStarting()) || eventForCreator.getStarting().isEqual(eventDTO.getStarting())) &&
                    (eventForCreator.getEnding().isAfter(eventDTO.getEnding()) || eventForCreator.getEnding().isEqual(eventDTO.getEnding()))
            ) {
                return -1L;
            }
        }
        Event event = new Event(
                eventDTO.getTitle(),
                eventDTO.getDescription(),
                eventDTO.getStarting(),
                eventDTO.getEnding(),
                eventDTO.getLocation(),
                eventDTO.getCreator(),
                eventDTO.getImage()
        );
        event = eventsRepository.save(event);
        addAdmins(eventDTO.getAdmins(), event.getEventId());
        if(!(eventDTO.getPartecipants().contains(creatorEmail))){
            eventDTO.addPartecipant(creatorEmail);
        }
        addPartecipants(eventDTO.getPartecipants(), event.getEventId());
        return event.getEventId();
    }

    public List<Admin> addAdmins(List<String> admins, Long eventId){
        HashMap<Long, String> adminsWithId = getIdForEmails(admins);
        return addAdminsWithId(adminsWithId, eventId);
    }

    @Transactional
    public List<Admin> addAdminsWithId(HashMap<Long, String> admins, Long eventId){
        List<Partecipant> partecipantList = addPartecipantsWithId(admins, eventId);
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        ArrayList<Admin> newAdmins = new ArrayList<>();
        for (Partecipant partecipant : partecipantList) {
            Admin admin = adminsRepository.findById(partecipant.getMagicEventTag())
                    .orElseGet(() -> {
                        Admin newAdmin = new Admin();
                        newAdmin.setAdminId(partecipant.getMagicEventTag());
                        newAdmin.setUser(partecipant);
                        newAdmin.setEvents(new ArrayList<>());
                        return adminsRepository.saveAndFlush(newAdmin);
                    });
            if (!event.getAdmins().contains(admin)) {
                event.getAdmins().add(admin);
            }
            newAdmins.add(admin);
        }
        eventsRepository.save(event);
        return newAdmins;
    }

    public List<Partecipant> addPartecipants(List<String> partecipants, Long eventId) {
        HashMap<Long, String> partecipantsWithId = getIdForEmails(partecipants);
        return addPartecipantsWithId(partecipantsWithId, eventId);
    }

    @Transactional
    public List<Partecipant> addPartecipantsWithId(HashMap<Long, String> partecipantIds, Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        List<Partecipant> added = new ArrayList<>();
        for (Map.Entry<Long, String> partecipantEntry : partecipantIds.entrySet()) {
            Partecipant partecipant = partecipantsRepository.findById(partecipantEntry.getKey())
                    .orElseGet(() -> {
                        Partecipant newP = new Partecipant();
                        newP.setMagicEventTag(partecipantEntry.getKey());
                        newP.setEmail(partecipantEntry.getValue());
                        return partecipantsRepository.saveAndFlush(newP);
                    });
            if (!event.getPartecipants().contains(partecipant)) {
                event.getPartecipants().add(partecipant);
            }
            added.add(partecipant);
        }
        eventsRepository.save(event);
        return added;
    }

    public String modifyEvent(@Valid EventDTO eventDTO, Long creatorId, Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if(event.getCreator().equals(creatorId)) {
            event.setTitle(eventDTO.getTitle());
            event.setDescription(eventDTO.getDescription());
            event.setStarting(eventDTO.getStarting());
            event.setEnding(eventDTO.getEnding());
            event.setLocation(eventDTO.getLocation());
            event.setImage(eventDTO.getImage());
            eventsRepository.save(event);
            for(Partecipant partecipant: event.getPartecipants()) {
                EmailDetails emailDetails = new EmailDetails();
                emailDetails.setRecipient(partecipant.getEmail());
                emailDetails.setSubject(event.getTitle() + " event has been modified!");
                emailDetails.setBody("Go to the" + event.getTitle() + "event page to see details.");
                emailSender.sendMail(emailDetails);
            }
            return "Success";
        }else {
            return "Error";
        }
    }

    @Transactional(readOnly = true)
    public boolean isPartecipant(Long magicEventsTag, Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        System.out.println("Checking partecipant with tag: " + magicEventsTag + " in event: " + eventId);
        return event.getPartecipants().stream()
                .anyMatch(partecipant -> partecipant.getMagicEventTag().equals(magicEventsTag));
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(Long magicEventsTag, Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        System.out.println("Checking admin with tag: " + magicEventsTag + " in event: " + eventId);
        return event.getAdmins().stream()
                .anyMatch(admin -> admin.getUser().getMagicEventTag().equals(magicEventsTag));
    }

    public boolean delete(Long eventId, Long creatorId) {
        try{
            Event event = eventsRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
            if(event.getCreator().equals(creatorId)) {
                event.setStatus("DELETED");
                eventsRepository.save(event);
                rabbitTemplate.convertAndSend(exchangeName, deleteBoardRoutingKey, eventId);
                if(event.getGalleryEnabled() != null && event.getGalleryEnabled()) {
                    rabbitTemplate.convertAndSend(exchangeName, deleteGalleryRoutingKey, eventId);
                }
                if(event.getGuestGameEnabled() != null && event.getGuestGameEnabled()) {
                    rabbitTemplate.convertAndSend(exchangeName, deleteGuestgameRoutingKey, eventId);
                }
                
                return true;
            }else{
                return false;
            }
        }catch (Exception e){
            return false;
        }
    }

    public boolean isCreator(Long creatorId, Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        return event.getCreator().equals(creatorId);
    }

    public List<EventDTO> getEventsCreated(Long creatorId) {
        List<Event> myEvents = eventsRepository.findAll();
        List<EventDTO> eventDTOs = new ArrayList<>();
        for (Event event : myEvents) {
            if(event.getCreator().equals(creatorId) && !(event.getStatus().equals("DELETED"))) {
                EventDTO eventDTO = new EventDTO();
                eventDTO.setTitle(event.getTitle());
                eventDTO.setDescription(event.getDescription());
                eventDTO.setStarting(event.getStarting());
                eventDTO.setEnding(event.getEnding());
                eventDTO.setLocation(event.getLocation());
                eventDTOs.add(eventDTO);
            }
        }
        return eventDTOs;
    }

    public List<String> getAdminsForEvent(Long eventId, Long creatorId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if(event.getCreator().equals(creatorId)) {
            return event.getAdmins().stream().map( admin ->
                admin.getUser().getEmail()
            ).toList();
        }else{
            return null;
        }
    }

    public List<String> getPartecipantsForEvent(Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        return event.getPartecipants().stream().map( partecipant ->
                partecipant.getEmail()
        ).toList();
    }

    public List<Long> getEventId(Long creatorId, String title, LocalDateTime day) {
       List<Event> events = eventsRepository.findAll();
       List<Long> eventIds = new ArrayList<>();
       for (Event event : events) {
           if(
                   event.getCreator().equals(creatorId) &&
                   event.getTitle().equals(title) &&
                   (event.getStarting().isBefore(day) || event.getStarting().isEqual(day)) &&
                   (event.getEnding().isAfter(day) || event.getEnding().isEqual(day))
           ) {
               eventIds.add(event.getEventId());
           }
       }
       return eventIds;
    }

    public List<EventDTO> getEventPartecipated(Long partecipantId) {
        Partecipant partecipant = partecipantsRepository.findById(partecipantId)
                .orElseThrow(() -> new IllegalArgumentException("Partecipant not found: " + partecipantId));
        List<EventDTO> eventDTOs = new ArrayList<>();
        for (Event event : partecipant.getEvents()) {
            if(!(event.getStatus().equals("DELETED"))) {
                EventDTO eventDTO = new EventDTO();
                eventDTO.setTitle(event.getTitle());
                eventDTO.setDescription(event.getDescription());
                eventDTO.setStarting(event.getStarting());
                eventDTO.setEnding(event.getEnding());
                eventDTO.setLocation(event.getLocation());
                eventDTO.setCreator(event.getCreator());
                eventDTOs.add(eventDTO);
            }
        }
        return eventDTOs;
    }

    public HashMap<Long, String> getIdForEmails(List<String> emails) {
        try {
            HashMap<Long, String> result = userManagementWebClient.post()
                    .uri("/info")
                    .bodyValue(emails)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), 
                        response -> response.bodyToMono(String.class)
                            .map(body -> new RuntimeException("Client error: " + body)))
                    .onStatus(status -> status.is5xxServerError(), 
                        response -> response.bodyToMono(String.class)
                            .map(body -> new RuntimeException("Server error: " + body)))
                    .bodyToMono(new ParameterizedTypeReference<HashMap<Long, String>>() {})
                    .block();
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user IDs: " + e.getMessage(), e);
        }
    }

    public String annullEvent(Long eventId, Long creatorId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if(event.getCreator().equals(creatorId)) {
            event.setStatus("ANNULLED");
            eventsRepository.save(event);
            for(Partecipant partecipant: event.getPartecipants()) {
                EmailDetails emailDetails = new EmailDetails();
                emailDetails.setRecipient(partecipant.getEmail());
                emailDetails.setSubject(event.getTitle() + " event has been cancelled :(");
                emailDetails.setBody("We regret to inform you that the creator of the event has decided to no longer do it.");
                emailSender.sendMail(emailDetails);
            }
            return "Success";
        }else{
            return "Error";
        }
    }

    public String activeEvent(Long eventId, Long creatorId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if(event.getCreator().equals(creatorId)) {
            event.setStatus("ACTIVE");
            eventsRepository.save(event);
            for(Partecipant partecipant: event.getPartecipants()) {
                EmailDetails emailDetails = new EmailDetails();
                emailDetails.setRecipient(partecipant.getEmail());
                emailDetails.setSubject(event.getTitle() + " event will be held!");
                emailDetails.setBody("We are happy to inform you that the event you wanted to attend will be held! Go to the" +
                        event.getTitle() + "event page to see details.");
                emailSender.sendMail(emailDetails);
            }
            return "Success";
        }else{
            return "Error";
        }
    }

    public String activeServicesEvent(Long eventId, Long creatorId, @Valid ServicesDTO servicesDTO) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if(event.getCreator().equals(creatorId)) {
            event.setBoardEnabled(servicesDTO.getBoard());
            event.setGalleryEnabled(servicesDTO.getGallery());
            event.setGuestGameEnabled(servicesDTO.getGuestGame());
            eventsRepository.save(event);
            return "Success";
        }else {
            return "Error";
        }
    }

    public ServicesDTO getEventEnabledServices(Long eventId, Long magicEventsTag) {
        if (!isCreator(magicEventsTag, eventId)) {
            throw new UnauthorizedException("User not authorized to access event services");
        }

        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        ServicesDTO services = new ServicesDTO();
        services.setBoard(event.getBoardEnabled() != null ? event.getBoardEnabled() : false);
        services.setGallery(event.getGalleryEnabled() != null ? event.getGalleryEnabled() : false);
        services.setGuestGame(event.getGuestGameEnabled() != null ? event.getGuestGameEnabled() : false);
        
        return services;
    }
}


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
    public String updateEventPartecipants(ArrayList<String> partecipants, Long eventId, Long magicEventsTag) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        boolean creator = event.getCreator().equals(magicEventsTag);
        boolean admin = isAdmin(magicEventsTag, eventId);
        if(creator || admin) {
            addPartecipants(partecipants, eventId);
            return "Success";
        }else {
            return "Error";
        }
    }

    public EventDTO getEventInfo(Long eventId, Long magicEventsTag) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        boolean authorised = isPartecipant(magicEventsTag, eventId);
        if(authorised) {
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
        }else{
            return new EventDTO();
        }
    }

    @Transactional
    public Long create(@Valid EventDTO eventDTO, String creatorEmail) {
        List<EventDTO> eventsForCreator = getEventsCreated(eventDTO.getCreator());
        for(EventDTO eventForCreator : eventsForCreator) {
            if(
                    eventForCreator.getTitle().equals(eventDTO.getTitle()) &&
                    (eventForCreator.getStarting().toLocalDate().isBefore(eventDTO.getStarting().toLocalDate()) || eventForCreator.getStarting().toLocalDate().isEqual(eventDTO.getStarting().toLocalDate())) &&
                    (eventForCreator.getEnding().toLocalDate().isAfter(eventDTO.getEnding().toLocalDate()) || eventForCreator.getEnding().toLocalDate().isEqual(eventDTO.getEnding().toLocalDate()))
            ) {
                return -1L;
            }
        }
        Partecipant partecipant = partecipantsRepository.findById(eventDTO.getCreator())
                .orElseGet(() -> {
                    Partecipant newP = new Partecipant();
                    newP.setMagicEventTag(eventDTO.getCreator());
                    newP.setEmail(creatorEmail);
                    return partecipantsRepository.saveAndFlush(newP);
                });
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
        event.getPartecipants().add(partecipant);
        partecipant.getEvents().add(event);
        partecipantsRepository.save(partecipant);
        addAdmins(eventDTO.getAdmins(), event.getEventId());
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
                emailDetails.setSubject("'" + event.getTitle() + "'" + " è stato modificato!");
                emailDetails.setBody("Vai alla pagina dell'evento " + "'" + event.getTitle() + "'" + " per vedere i dettagli.");
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
                for(Partecipant partecipant: event.getPartecipants()) {
                    EmailDetails emailDetails = new EmailDetails();
                    emailDetails.setRecipient(partecipant.getEmail());
                    emailDetails.setSubject("'" + event.getTitle() + "'" + " è stato eliminato :(");
                    emailDetails.setBody(
                            "Ci dispiace informarti che l'ideatore dell'evento ha deciso di non tenere più l'evento. " +
                            "Tutti i dati dell'evento sono stati rimossi."
                    );
                    emailSender.sendMail(emailDetails);
                }
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

    public List<Long> getEventId(Long magicEventTag, String title, LocalDateTime day) {
       List<Event> events = eventsRepository.findAll();
       List<Long> eventIds = new ArrayList<>();
       for (Event event : events) {
           if(
                   event.getTitle().equals(title) &&
                   (event.getStarting().toLocalDate().isBefore(day.toLocalDate()) || event.getStarting().toLocalDate().isEqual(day.toLocalDate())) &&
                   (event.getEnding().toLocalDate().isAfter(day.toLocalDate()) || event.getEnding().toLocalDate().isEqual(day.toLocalDate()))
           ) {
               if(isPartecipant(magicEventTag, event.getEventId())) {
                   eventIds.add(event.getEventId());
               }
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
            throw new RuntimeException("Failed to fetch user Ids: " + e.getMessage(), e);
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
                emailDetails.setSubject("'" + event.getTitle() + "'" + " è stato cancellato :(");
                emailDetails.setBody(
                        "Ci dispiace informarti che l'ideatore dell'evento ha deciso di non tenere più l'evento. " +
                        "Ti informeremo se l'ideatore dell'evento decidere di annullare la cancellazione dell'evento."
                );
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
                emailDetails.setSubject("'" + event.getTitle() + "'" + " si terrà!");
                emailDetails.setBody("Siamo lieti di informarti che l'evento a cui desideravi partecipare si terrà! Vai alla pagina dell'evento " +
                        "'" + event.getTitle() + "'" + " per vedere i dettagli.");
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
            System.out.println(servicesDTO.getBoard().toString() + " " + servicesDTO.getGallery().toString() + " " + servicesDTO.getGuestGame().toString());
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
        if (!isPartecipant(magicEventsTag, eventId)) {
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

    public String removePartecipant(String partecipantEmail, Long eventId, Long creatorId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        HashMap<Long, String> partecipantId = getIdForEmails(List.of(partecipantEmail));
        for (Map.Entry<Long, String> partecipantEntry : partecipantId.entrySet()) {
            Partecipant partecipant = partecipantsRepository.findById(partecipantEntry.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("Partecipant not found: " + partecipantId));
            if (event.getCreator().equals(creatorId) && partecipant.getEvents().contains(event)) {
                partecipant.getEvents().remove(event);
                partecipantsRepository.save(partecipant);
                event.getPartecipants().remove(partecipant);
                eventsRepository.save(event);
            }else{
                return "Error";
            }
        }
        return "Success";
    }

    public String removeAdmin(String adminEmail, Long eventId, Long creatorId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        HashMap<Long, String> adminId = getIdForEmails(List.of(adminEmail));
        for (Map.Entry<Long, String> adminEntry : adminId.entrySet()) {
            Admin admin = adminsRepository.findById(adminEntry.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminId));
            if (event.getCreator().equals(creatorId) && admin.getEvents().contains(event)) {
                admin.getEvents().remove(event);
                adminsRepository.save(admin);
                event.getAdmins().remove(admin);
                eventsRepository.save(event);
            }else{
                return "Error";
            }
        }
        String res = removePartecipant(adminEmail, eventId, creatorId);
        if(res.equals("Success")){
            return "Success";
        } else{
            return "Error";
        }
    }

    public Boolean isActive(Long creatorId, Long eventId) {
        Event event = eventsRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if (event.getCreator().equals(creatorId)) {
            return event.getStatus().equals("ACTIVE");
        }else {
            return null;
        }
    }

    public boolean deleteUser(Long magicEventsTag) {
        Partecipant partecipant = partecipantsRepository.findById(magicEventsTag)
                .orElseThrow(() -> new IllegalArgumentException("Partecipant not found: " + magicEventsTag));
        boolean isAdmin = false;
        for (Event event : partecipant.getEvents()) {
            if(event.getCreator().equals(partecipant.getMagicEventTag())){
                delete(event.getEventId(), magicEventsTag);
            }else {
                event.getPartecipants().remove(partecipant);
                if (event.getAdmins().contains(partecipant)) {
                    isAdmin = true;
                    event.getAdmins().remove(partecipant);
                }
                eventsRepository.save(event);
            }
        }
        partecipantsRepository.delete(partecipant);
        if(isAdmin){
            Admin admin = adminsRepository.findById(magicEventsTag)
                    .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + magicEventsTag));
            adminsRepository.delete(admin);
        }
        return true;
    }
}


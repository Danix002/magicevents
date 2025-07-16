package com.service.eventsmanagementservice.service;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class TokenValidatorService {
    private final RestTemplate restTemplate;

    public TokenValidatorService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public boolean isTokenValid(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            String userManagementUrl = "https://italiamagicevents.it:8443/validator/verify";
            ResponseEntity<Void> response = restTemplate.exchange(
                    userManagementUrl,
                    HttpMethod.GET,
                    entity,
                    Void.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (HttpClientErrorException.Unauthorized ex) {
            return false;
        } catch (Exception e) {
            throw new RuntimeException("user-management not reachable", e);
        }
    }
}


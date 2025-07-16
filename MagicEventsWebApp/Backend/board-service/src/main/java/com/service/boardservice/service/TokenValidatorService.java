package com.service.boardservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class TokenValidatorService {
    @Value("${services.usermanagement.url}")
    private String userManagementBaseUrl;

    private final RestTemplate restTemplate;

    public TokenValidatorService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean isTokenValid(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    userManagementBaseUrl + "/validator/verify",
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


package com.service.usermanagementservice.service;

import com.nimbusds.jose.shaded.gson.Gson;
import com.nimbusds.jose.shaded.gson.JsonObject;
import com.service.usermanagementservice.dto.LoginWithTokenDTO;
import com.service.usermanagementservice.dto.UserDTO;
import com.service.usermanagementservice.model.EmailDetails;
import com.service.usermanagementservice.model.OauthToken;
import com.service.usermanagementservice.model.ResetPasswordToken;
import com.service.usermanagementservice.model.User;
import com.service.usermanagementservice.repository.OauthTokenRepository;
import com.service.usermanagementservice.repository.ResetPasswordTokenRepository;
import com.service.usermanagementservice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.env.Environment;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Base64;
import java.security.SecureRandom;

@Service
@Slf4j
public class AuthService {
    @Autowired
    UserRepository userRepository;
    @Autowired
    OauthTokenRepository tokenRepository;
    @Autowired
    ResetPasswordTokenRepository resetPasswordTokenRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    EmailSender emailSender;
    @Autowired
    Environment environment;

    private final WebClient eventManagementWebClient;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    String clientId;
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    String clientSecret;
    @Value("${client.url}")
    private String clientUrl;
    @Value("${services.usermanagements.url}")
    private String myUrl;

    public AuthService(WebClient eventManagementWebClient) {
        this.eventManagementWebClient = eventManagementWebClient;
    }

    public String registerUser(String name, String surname, String email, String password, String username) {
        User user = new User();
        user.setName(name);
        user.setSurname(surname);
        user.setUsername(username);
        user.setRole("USER");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        String response;
        User alreadyExists = userRepository.findByEmail(email);
        if (alreadyExists == null) {
            userRepository.save(user);
            response = "User saved";
        }else {
            response = "User already exists";
        }
        return response;
    }

    public UserDTO login(String email, String password) {
        User user = userRepository.findByEmail(email);

        if(user != null && passwordEncoder.matches(password, user.getPassword())){
            OauthToken oauthToken = tokenRepository.findByUser(user);
            LoginWithTokenDTO loginWithTokenDTO = new LoginWithTokenDTO();
            if(oauthToken == null) {
                loginWithTokenDTO = saveTokenForUser(user);
            }
            return new UserDTO(
                    user.getMagicEventTag(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getProfileImageUrl(),
                    user.getName(),
                    user.getSurname(),
                    loginWithTokenDTO.getAccessToken()
            );
        }

        throw new BadCredentialsException("Invalid username or password");
    }

    public LoginWithTokenDTO processGrantCode(String code) {
        String accessToken = getOauthAccessTokenGoogle(code);

        User googleUser = getProfileDetailsGoogle(accessToken);
        User user = userRepository.findByEmail(googleUser.getEmail());

        if (user == null) {
            googleUser.setRole("USER");
            if (googleUser.getUsername() == null || googleUser.getUsername().isEmpty()) {
                String generatedUsername = googleUser.getEmail().split("@")[0];
                googleUser.setUsername(generatedUsername);
            }
            user = userRepository.save(googleUser);
        }

        OauthToken oauthToken = tokenRepository.findByUser(user);
        if (oauthToken != null) {
            tokenRepository.delete(oauthToken);
        }

        return saveTokenForUser(user);
    }

    private LoginWithTokenDTO generateToken() {
        LoginWithTokenDTO res = new LoginWithTokenDTO();
        res.setAccessToken(UUID.randomUUID().toString());
        res.setRefreshToken(UUID.randomUUID().toString());
        res.setExpirationTime(LocalDateTime.now().plusHours(1));
        return res;
    }

    public UserDTO getUserInfo(String accessToken){
        OauthToken oauthToken = tokenRepository.findByAccessToken(accessToken);
        User user = oauthToken.getUser();
        return new UserDTO(
                user.getMagicEventTag(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImageUrl(),
                user.getName(),
                user.getSurname(),
                accessToken
        );
    }

    public LoginWithTokenDTO saveTokenForUser(User user) {
        LoginWithTokenDTO dto = generateToken();
        OauthToken token = new OauthToken();
        token.setAccessToken(dto.getAccessToken());
        token.setRefreshToken(dto.getRefreshToken());
        token.setExpirationTime(dto.getExpirationTime());
        token.setUser(user);
        tokenRepository.save(token);
        return dto;
    }

    private User getProfileDetailsGoogle(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(accessToken);

        HttpEntity<String> requestEntity = new HttpEntity<>(httpHeaders);

        String url = "https://www.googleapis.com/oauth2/v2/userinfo";
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
        JsonObject jsonObject = new Gson().fromJson(response.getBody(), JsonObject.class);

        User user = new User();

        user.setEmail(jsonObject.get("email").getAsString());
        user.setUsername(jsonObject.get("email").getAsString().split("@")[0]);
        user.setName(jsonObject.has("given_name") ? jsonObject.get("given_name").getAsString() : "");
        user.setSurname(jsonObject.has("family_name") ? jsonObject.get("family_name").getAsString() : "");
        user.setProfileImageUrl(jsonObject.has("picture") ? jsonObject.get("picture").getAsString() : "");
        user.setRole("USER");

        return user;
    }
    private String getOauthAccessTokenGoogle(String code) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("redirect_uri", "https://"+ myUrl +"/login/grantcode");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("scope", "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile");
        params.add("scope", "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email");
        params.add("scope", "openid");
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, httpHeaders);

        String url = "https://oauth2.googleapis.com/token";
        String response = restTemplate.postForObject(url, requestEntity, String.class);
        JsonObject jsonObject = new Gson().fromJson(response, JsonObject.class);

        return jsonObject.get("access_token").toString().replace("\"", "");
    }

    public String logout(String email) {
        User user = userRepository.findByEmail(email);
        OauthToken oauthToken = tokenRepository.findByUser(user);
        tokenRepository.delete(oauthToken);
        return "Signed out successfully";
    }

    public String deleteUser(String email) {
        try {
            User user = userRepository.findByEmail(email);
            boolean result = eventManagementWebClient.delete()
                    .uri(uriBuilder -> uriBuilder
                    .path("/gestion/deletepartecipant")
                    .queryParam("magicEventsTag", user.getMagicEventTag())
                    .build())
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            if(result) {
                OauthToken oauthToken = tokenRepository.findByUser(user);
                tokenRepository.delete(oauthToken);
                userRepository.delete(user);
                return "Delete user with email {" + email + "} successfully";
            }else {
                return "Delete user with email {" + email + "} failed";
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete partecipant: " + e.getMessage(), e);
        }
    }

    public String initiateResetPasswordLink(String email) {
        User user = userRepository.findByEmail(email);
        if(user == null) {
            return "Email address not registered";
        }

        ResetPasswordToken resetPasswordToken = new ResetPasswordToken();
        resetPasswordToken.setToken(generateSecureToken());
        resetPasswordToken.setUser(user);
        resetPasswordToken.setExpirationTime(LocalDateTime.now().plusHours(1));

        resetPasswordTokenRepository.save(resetPasswordToken);

        String link = "https://"+ clientUrl +"/changepassword?token=" + resetPasswordToken.getToken();

        EmailDetails emailDetails = new EmailDetails();
        emailDetails.setRecipient(user.getEmail());
        emailDetails.setSubject("Reset Password");
        emailDetails.setBody("Click il link per resettare la password del tuo account: " + link);

        if(emailSender.sendMail(emailDetails)) {
            return "Password reset link sent to registered email address";
        }else{
            return "Error";
        }
    }

    private String generateSecureToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[24];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    public String changePasswordWithToken(String token, String newPassword) {
        ResetPasswordToken resetPasswordToken = resetPasswordTokenRepository.findById(token).orElse(null);
        if(resetPasswordToken == null) {
            return "Invalid Token";
        }

        if(resetPasswordToken.getExpirationTime().isBefore(LocalDateTime.now())) {
            return "Token expired";
        }

        User user = userRepository.findById(resetPasswordToken.getUser().getMagicEventTag()).orElse(null);
        if(user != null) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        }
        return "Password changed successfully";
    }

    @Scheduled(fixedRate = 1200000)
    public void deleteTokenExpired() {
        List<ResetPasswordToken> tokens = resetPasswordTokenRepository.findAll();
        for (ResetPasswordToken token : tokens) {
            if(token.getExpirationTime().isAfter(LocalDateTime.now())) {
                resetPasswordTokenRepository.delete(token);
            }
        }
    }

    public UserDTO modify(UserDTO userDTO) {
        User user = userRepository.findById(userDTO.getMagicEventTag()).orElse(null);
        if(user == null) {
            return null;
        }else{
            user.setEmail(userDTO.getEmail());
            user.setName(userDTO.getName());
            user.setUsername(userDTO.getUsername());
            user.setSurname(userDTO.getSurname());
            user.setProfileImageUrl(userDTO.getProfileImageUrl());
            userRepository.save(user);
            return userDTO;
        }
    }
}

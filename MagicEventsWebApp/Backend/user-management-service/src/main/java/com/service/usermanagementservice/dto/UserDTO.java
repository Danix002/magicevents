package com.service.usermanagementservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class UserDTO {
    @NotNull(message = "Magic Events Tag is required")
    @Positive(message = "Magic Events Tag must be positive")
    private Long magicEventTag;
    @NotNull(message = "Username is required")
    private String username;
    @NotNull(message = "Email is required")
    private String email;
    @NotNull(message = "Profile image is required")
    private String profileImageUrl;
    @NotNull(message = "Name is required")
    private String name;
    @NotNull(message = "Surname is required")
    private String surname;
    @NotNull(message = "Role is required")
    private String token;

    public UserDTO(
            Long magicEventTag,
            String username,
            String email,
            String profileImageUrl,
            String name,
            String surname,
            String token
    ) {
        this.magicEventTag = magicEventTag;
        this.username = username;
        this.email = email;
        this.profileImageUrl = profileImageUrl;
        this.name = name;
        this.surname = surname;
        this.token = token;
    }

    public Long getMagicEventTag() {
        return magicEventTag;
    }

    public void setMagicEventTag(Long magicEventTag) {
        this.magicEventTag = magicEventTag;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String role) {
        this.token = role;
    }
}


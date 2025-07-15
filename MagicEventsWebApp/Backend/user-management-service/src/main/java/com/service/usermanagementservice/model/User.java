package com.service.usermanagementservice.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "user_info")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long magicEventTag;
    @Column(nullable = false)
    private String username;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;
    private String name;
    private String surname;
    private String role;
    private String password;

    public User() {}

    public User(
            Long magicEventTag,
            String username,
            String email,
            String profileImageUrl,
            String name,
            String surname,
            String role,
            String password
    ) {
        this.magicEventTag = magicEventTag;
        this.username = username;
        this.email = email;
        this.profileImageUrl = profileImageUrl;
        this.name = name;
        this.surname = surname;
        this.role = role;
        this.password = password;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
        grantedAuthorities.add(new SimpleGrantedAuthority(getRole()));
        return grantedAuthorities;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

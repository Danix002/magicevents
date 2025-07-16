package com.service.usermanagementservice.config;

import com.service.usermanagementservice.model.OauthToken;
import com.service.usermanagementservice.repository.OauthTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.stereotype.Component;
import com.service.usermanagementservice.model.User;

import java.time.LocalDateTime;

@Component
public class BearerTokenAuthProvider implements AuthenticationProvider {
    @Autowired
    OauthTokenRepository oauthTokenRepository;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        User user = isTokenValid(authentication.getName());
        if(user == null) {
            throw new UsernameNotFoundException("Invalid Token");
        }
        return new UsernamePasswordAuthenticationToken(user.getEmail(), null, user.getAuthorities());
    }

    private User isTokenValid(String token) {
        OauthToken oauthToken = oauthTokenRepository.findById(token).orElse(null);
        if(oauthToken == null || oauthToken.getExpirationTime().isBefore(LocalDateTime.now())) {
            return null;
        }
        return oauthToken.getUser();
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return BearerTokenAuth.class.isAssignableFrom(authentication);
    }

}

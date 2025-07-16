package com.service.usermanagementservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${services.eventmanagement.url}")
    private String eventManagementServiceUrl;
    @Value("${services.boardservice.url}")
    private String boardServiceUrl;
    @Value("${services.galleryservice.url}")
    private String galleryServiceUrl;
    @Value("${services.guestgameservice.url}")
    private String guestGameServiceUrl;
    @Value("${client.url}")
    private String clientUrl;

    private static final String[] WHITELIST_URLS = {
            "/favicon.ico",

            "/login/form",
            "/login/register",
            "/login/grantcode",
            "/login/userprofile",
            "/login/changepassword",
            "/login/generateresetpasswordlink",
            "/login/helloserver",

            //"/info/logoutuser",
            //"/info/deleteuser",
            //"/info/modifyuser",
            //"/info",
            //"/info/profile",

            "/validator/verify",
            "/validator/refresh"
    };

    @Bean
    public AuthenticationManager authenticationManager(BearerTokenAuthProvider tokenAuthProvider) {
        return new ProviderManager(tokenAuthProvider);
    }

    @Bean
    public BearerTokenAuthFilter bearerTokenAuthFilter(AuthenticationManager authenticationManager) {
        return new BearerTokenAuthFilter(authenticationManager);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, BearerTokenAuthFilter bearerTokenAuthFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(
                            List.of(
                                    "https://" + clientUrl,
                                    "http://" + clientUrl,
                                    eventManagementServiceUrl,
                                    boardServiceUrl,
                                    galleryServiceUrl,
                                    guestGameServiceUrl
                            )
                    );
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .authorizeHttpRequests(request -> {
                    request.requestMatchers(WHITELIST_URLS).permitAll();
                    request.anyRequest().authenticated();
                })
                .csrf(AbstractHttpConfigurer::disable)
                .addFilterAfter(bearerTokenAuthFilter, BasicAuthenticationFilter.class);

        return http.build();
    }
}


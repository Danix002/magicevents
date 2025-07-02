package com.service.usermanagementservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
    @Autowired
    BearerTokenAuthFilter bearerTokenAuthFilter;

    @Value("${services.eventmanagement.url}")
    private String eventManagementServiceUrl;

    @Value("${client.url}")
    private String clientUrl;

    private static final String[] WHITELIST_URLS = {
            "/login/form",
            "/login/register",
            "/login/grantcode",
            "/login/logoutuser",
            "/login/refreshaccesstoken",
            "/test",
            "/test/users",
            "/test/tokens",
            "/favicon.ico",
            "/login/userprofile",
            "/login/changepassword",
            "/login/generateresetpasswordlink",
            "/login/deleteuser",
            "/login/modifyuser",
            "/login/helloserver",
            "/info",
            "/info/isauthenticated",
            "/info/profile"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(
                            List.of(
                                    "https://" + clientUrl,
                                    "http://" + clientUrl,
                                    "https://localhost:8443",
                                    eventManagementServiceUrl
                            )
                    );
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
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


package com.service.usermanagementservice.config;

import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import javax.net.ssl.SSLException;

@Configuration
public class WebClientConfig {
    @Value("${services.eventmanagement.url}")
    private String eventManagementServiceUrl;
    @Value("${services.galleryservice.url}")
    private String galleryServiceUrl;
    @Value("${services.boardservice.url}")
    private String boardServiceUrl;
    @Value("${services.guestgameservice.url}")
    private String guestGameServiceUrl;

    private HttpClient createHttpClient() {
        return HttpClient.create()
                .secure(spec -> {
                    try {
                        spec.sslContext(SslContextBuilder
                                .forClient()
                                .trustManager(InsecureTrustManagerFactory.INSTANCE)
                                .build()
                        );
                    } catch (SSLException e) {
                        throw new RuntimeException(e);
                    }
                })
                .responseTimeout(Duration.ofSeconds(30));
    }

    @Bean
    public WebClient eventManagementWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(eventManagementServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(createHttpClient()))
                .build();
    }

    @Bean
    public WebClient galleryServiceWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(galleryServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(createHttpClient()))
                .build();
    }

    @Bean
    public WebClient boardServiceWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(boardServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(createHttpClient()))
                .build();
    }

    @Bean
    public WebClient guestGameServiceWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(guestGameServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(createHttpClient()))
                .build();
    }
}

package com.service.galleryservice.config;

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
}

package com.service.galleryservice.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.MessageChannel;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        // Aumenta i buffer per gestire immagini da 5MB
        container.setMaxTextMessageBufferSize(5 * 1024 * 1024); // 5MB
        container.setMaxBinaryMessageBufferSize(5 * 1024 * 1024); // 5MB
        container.setMaxSessionIdleTimeout(30 * 60000L); // 30 minuti
        return container;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint for clients to connect
        registry.addEndpoint("/gallery")
                .setAllowedOriginPatterns(
                        "https://italiamagicevents.it",
                        "http://italiamagicevents.it"
                )
                .withSockJS(); // Enable SockJS fallback
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix for topics (server-to-client)
        registry.enableSimpleBroker("/topic");
        // Prefix for client-to-server messages
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String dest = accessor.getDestination();
                    // allow /topic/gallery/{id}, /topic/gallery/deleteImage/{id}, or /topic/gallery/imageLike/{id}
                    if (dest == null || !dest.matches("^/topic/gallery(/deleteImage|/imageLike)?/\\d+$")) {
                        throw new IllegalArgumentException("Unauthorized destination: " + dest);
                    }
                }
                return message;
            }
        });
    }
}

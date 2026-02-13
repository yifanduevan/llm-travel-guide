package com.ece651.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class LlmConfig {

    @Bean
    public RestTemplate llmRestTemplate() {
        return new RestTemplate();
    }
}

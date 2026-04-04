package com.ece651.backend.config;

import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final String[] allowedOrigins;

  public WebConfig(@Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
    this.allowedOrigins = allowedOrigins.stream()
        .map(String::trim)
        .filter(origin -> !origin.isEmpty())
        .toArray(String[]::new);
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        // Explicit origins to satisfy credentialed requests in browsers
        .allowedOrigins(allowedOrigins)
        // Allow standard CRUD + preflight
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        // Accept all request headers (e.g., Authorization, Content-Type)
        .allowedHeaders("*")
        // Expose common custom headers if needed later
        .exposedHeaders("Location")
        // Enable cookies/Authorization headers
        .allowCredentials(true)
        // Cache preflight to reduce OPTIONS traffic
        .maxAge(3600);
  }
}

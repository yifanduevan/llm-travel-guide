package com.ece651.backend.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        // Explicit origins to satisfy credentialed requests in browsers
        .allowedOrigins("http://localhost:3000")
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

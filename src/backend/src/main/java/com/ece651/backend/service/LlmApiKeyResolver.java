package com.ece651.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.SecretsManagerException;
import software.amazon.awssdk.services.ssm.SsmClient;
import software.amazon.awssdk.services.ssm.model.GetParameterRequest;
import software.amazon.awssdk.services.ssm.model.SsmException;

@Component
public class LlmApiKeyResolver {

    private static final Logger log = LoggerFactory.getLogger(LlmApiKeyResolver.class);

    private final String provider;
    private final String directApiKey;
    private final String secretRef;

    public LlmApiKeyResolver(
            @Value("${app.llm.secrets.provider:env}") String provider,
            @Value("${app.llm.openai.api-key:}") String directApiKey,
            @Value("${app.llm.openai.api-key-secret-ref:}") String secretRef) {
        this.provider = provider == null ? "env" : provider.trim().toLowerCase();
        this.directApiKey = directApiKey;
        this.secretRef = secretRef;
    }

    public String resolveApiKey() {
        return switch (provider) {
            case "aws-secrets-manager" -> readFromSecretsManager();
            case "aws-ssm" -> readFromSsm();
            case "env" -> directApiKey;
            default -> {
                log.warn("Unknown app.llm.secrets.provider='{}', fallback to env", provider);
                yield directApiKey;
            }
        };
    }

    private String readFromSecretsManager() {
        if (!StringUtils.hasText(secretRef)) {
            log.warn("Secrets provider is aws-secrets-manager but app.llm.openai.api-key-secret-ref is blank");
            return directApiKey;
        }

        try (SecretsManagerClient client = SecretsManagerClient.create()) {
            String value = client.getSecretValue(GetSecretValueRequest.builder().secretId(secretRef).build()).secretString();
            if (!StringUtils.hasText(value)) {
                log.warn("Secret '{}' returned empty value from AWS Secrets Manager", secretRef);
                return directApiKey;
            }
            return value;
        } catch (SecretsManagerException ex) {
            log.error("Failed reading OpenAI key from AWS Secrets Manager secret '{}': {}", secretRef, ex.getMessage());
            return directApiKey;
        }
    }

    private String readFromSsm() {
        if (!StringUtils.hasText(secretRef)) {
            log.warn("Secrets provider is aws-ssm but app.llm.openai.api-key-secret-ref is blank");
            return directApiKey;
        }

        try (SsmClient client = SsmClient.create()) {
            String value = client.getParameter(GetParameterRequest.builder()
                            .name(secretRef)
                            .withDecryption(true)
                            .build())
                    .parameter()
                    .value();
            if (!StringUtils.hasText(value)) {
                log.warn("Parameter '{}' returned empty value from AWS SSM", secretRef);
                return directApiKey;
            }
            return value;
        } catch (SsmException ex) {
            log.error("Failed reading OpenAI key from AWS SSM parameter '{}': {}", secretRef, ex.getMessage());
            return directApiKey;
        }
    }
}

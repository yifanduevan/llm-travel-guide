package com.ece651.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LlmApiKeyResolverTest {

    @Test
    void resolveApiKey_returnsDirectKey_whenProviderIsEnv() {
        LlmApiKeyResolver resolver = new LlmApiKeyResolver("env", "test-api-key", "ignored-ref");

        String apiKey = resolver.resolveApiKey();

        assertThat(apiKey).isEqualTo("test-api-key");
    }

    @Test
    void resolveApiKey_returnsDirectKey_whenProviderIsUnknown() {
        LlmApiKeyResolver resolver = new LlmApiKeyResolver("custom-provider", "fallback-key", "ignored-ref");

        String apiKey = resolver.resolveApiKey();

        assertThat(apiKey).isEqualTo("fallback-key");
    }

    @Test
    void resolveApiKey_returnsDirectKey_whenProviderHasMixedCaseAndSpaces() {
        LlmApiKeyResolver resolver = new LlmApiKeyResolver("  EnV  ", "normalized-key", "ignored-ref");

        String apiKey = resolver.resolveApiKey();

        assertThat(apiKey).isEqualTo("normalized-key");
    }
}

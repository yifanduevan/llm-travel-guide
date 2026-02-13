# LLM Engineer Guide

> **Role:** LLM Engineer (1 person)  
> **Project:** ECE 651 Trip Planner  
> **Last Updated:** January 2026

---

## Responsibilities Overview

| Responsibility | Tasks | Deliverables |
|----------------|-------|--------------|
| **Prompt Engineering** | Design system prompts for each feature | Prompt templates, validation rules |
| **Model Selection** | Choose & test LLM provider (OpenAI/Claude) | Model comparison, API setup |
| **Output Schema** | Define JSON structure for LLM responses | `llm-output-schema.json`, parsing spec |
| **Fine-tuning** | Prepare training data, run fine-tuning if needed | Training dataset, fine-tuned model |

---

## 1. Prompt Engineering

### General Guidelines

- **Structured output:** Always request JSON to enable parsing.
- **Enum constraints:** Use exact enum values from backend (see Output Schema).
- **Length limits:** Set `max_tokens` appropriately per feature.
- **Temperature:** Use `0.3`–`0.7` for deterministic, consistent outputs.

### Feature Prompts

#### 1.1 Itinerary Generation

**System Prompt:**
```
You are a travel planning assistant for the Trip Planner app. Generate day-by-day itineraries based on user preferences.

RULES:
- Output only valid JSON matching the schema. No markdown, no commentary.
- Use dates in ISO format (YYYY-MM-DD). Use times in 24h format (HH:mm).
- Categories: unspecified.
- Budget levels: budget, medium, luxury.
- Travelers: solo, couple, family, group.
```

**User Prompt Template:**
```
Generate a {travelers} trip itinerary for {destination} from {startDate} to {endDate}.
Budget: {budget}. Preferences: {notes}.

Return JSON with structure:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "items": [
        {
          "title": "string",
          "description": "string",
          "time": "HH:mm",
          "category": "unspecified",
          "locationText": "string"
        }
      ]
    }
  ]
}
```

#### 1.2 Dining Recommendations

**System Prompt:**
```
You are a restaurant recommendation assistant for travelers. Suggest restaurants based on location, cuisine, and budget.

RULES:
- Output only valid JSON. No markdown.
- Price tier: budget, medium, luxury.
- Include name, cuisine, price tier, suggested time.
```

**User Prompt Template:**
```
Suggest 3-5 restaurants in {destination} for a {budget} {travelers} trip.
Cuisine preference: {cuisine}.
Date: {date}. Meal: {breakfast|lunch|dinner}.
```

#### 1.3 Activity Suggestions

**System Prompt:**
```
You are an activity and attraction recommendation assistant for travelers. Suggest activities, tours, and experiences.

RULES:
- Output only valid JSON.
- Include title, description, suggested duration, category.
```

**User Prompt Template:**
```
Suggest 5-7 activities in {destination} for a {travelers} trip.
Interests: {interests}. Date: {date}.
Budget: {budget}.
```

#### 1.4 Transportation Suggestions

**System Prompt:**
```
You are a transportation planning assistant. Suggest transport options between locations.

RULES:
- Output only valid JSON.
- Transport types: flight, train, car, bus, other.
- Include type, title, suggested start/end times, duration.
```

**User Prompt Template:**
```
Suggest transport from {origin} to {destination} on {date}.
Trip style: {budget}. Prefer: {preferredTypes}.
```

#### 1.5 Packing List Generation

**System Prompt:**
```
You are a packing list assistant. Generate practical packing lists based on destination, dates, and trip type.

RULES:
- Output only valid JSON with categories (clothing, toiletries, electronics, documents, etc.).
- Be specific (e.g., "sunscreen SPF 50" not just "sunscreen").
```

**User Prompt Template:**
```
Generate a packing list for {destination} from {startDate} to {endDate}.
Travelers: {travelers}. Trip type: {tripType}.
Special needs: {specialNeeds}.
```

---

## 2. Model Selection

### Provider Comparison

| Provider | Model | Cost | Context | Best For |
|----------|-------|------|---------|----------|
| **OpenAI** | gpt-4o | $$ | 128K | Balanced, JSON mode |
| **OpenAI** | gpt-4o-mini | $ | 128K | Budget, fast |
| **Anthropic** | claude-3-sonnet | $$ | 200K | Long context |
| **Anthropic** | claude-3-haiku | $ | 200K | Cheap, fast |
| **Open-source** | Llama 3.1 (Ollama) | Free | 128K | Local, privacy |

### Selection Criteria

1. **JSON reliability:** Test structured output quality.
2. **Latency:** Target < 5s for user-facing features.
3. **Cost:** Estimate tokens/day for your user base.
4. **API stability:** Prefer providers with rate limits that fit your scale.

### Recommended for ECE651

- **MVP:** `gpt-4o-mini` or `claude-3-haiku` (low cost, good JSON).
- **Production:** `gpt-4o` or `claude-3-sonnet` if quality matters more than cost.

---

## 3. Output Schema

### Master Schema

See `docs/llm-output-schema.json` for the full JSON Schema.

### Key Structures

| Feature | Root Key | Description |
|---------|----------|-------------|
| Itinerary | `days` | Array of day objects with `items[]` |
| Dining | `restaurants` | Array of `{ name, cuisine, priceTier, time }` |
| Activities | `activities` | Array of `{ title, description, duration }` |
| Transportation | `segments` | Array of `{ type, title, startTime, endTime }` |
| Packing | `categories` | Object with category → item[] mapping |

### Enum Values (must match backend)

- **Travelers:** `solo`, `couple`, `family`, `group`
- **Budget:** `budget`, `medium`, `luxury`
- **TransportType:** `flight`, `train`, `car`, `bus`, `other`
- **ItineraryItemCategory:** `unspecified`
- **PriceTier:** `budget`, `medium`, `luxury`

---

## 4. Fine-tuning

### When to Fine-tune

- Default prompts produce inconsistent or low-quality output.
- You need domain-specific behavior (e.g., UW student travel style).
- You have 100+ high-quality examples.

### Training Data Format (OpenAI)

```jsonl
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "{...}"}]}
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "{...}"}]}
```

### Training Data Format (Anthropic)

```jsonl
{"input": "Human: ...\n\nAssistant:", "output": "{...}"}
```

### Data Collection

1. **Manual curation:** Team members create ideal input/output pairs.
2. **User feedback:** Log accepted edits as positive examples.
3. **Synthetic:** Generate with a stronger model, then validate.

### Quality Checklist

- [ ] Each example has valid JSON
- [ ] Enums match backend exactly
- [ ] No PII in training data
- [ ] 50+ examples per feature before fine-tuning

---

## 5. Evaluation Metrics

### Quantitative

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **JSON Validity** | 100% | Parse response; count parse errors |
| **Enum Compliance** | 100% | Check all enum fields against allowed values |
| **Latency (p95)** | < 5s | Log response time |
| **Token Cost** | < $0.01/request | Track input + output tokens |

### Qualitative

| Metric | How to Evaluate |
|--------|-----------------|
| **Relevance** | Does output match user request? |
| **Completeness** | Are all expected fields present? |
| **Practicality** | Would a real traveler use this? |

---

## 6. Task Checklist (LLM Engineer)

### Phase 1: Setup

- [ ] Choose provider (OpenAI recommended)
- [ ] Obtain API key, add to `.env`
- [ ] Implement `LLMService` in backend (with Backend SDE)
- [ ] Define output schema (this doc + JSON file)

### Phase 2: Prompts

- [ ] Implement itinerary generation prompt
- [ ] Implement dining recommendation prompt
- [ ] Implement activity suggestion prompt
- [ ] Implement transport suggestion prompt
- [ ] Implement packing list prompt
- [ ] Test each with 5+ sample inputs

### Phase 3: Quality

- [ ] Add output validation (JSON + enums)
- [ ] Add retry logic for parse failures
- [ ] Set up latency/cost logging
- [ ] Document prompt version history

### Phase 4: Fine-tuning (Optional)

- [ ] Collect 50+ examples per feature
- [ ] Format as provider training file
- [ ] Run fine-tuning job
- [ ] A/B test base vs fine-tuned model

---

## File Reference

| File | Purpose |
|------|---------|
| `docs/llm-output-schema.json` | JSON schema for all LLM outputs |
| `docs/prompts/itinerary.txt` | Itinerary generation prompt |
| `docs/prompts/dining.txt` | Dining recommendation prompt |
| `docs/prompts/activities.txt` | Activity suggestion prompt |
| `docs/prompts/transport.txt` | Transport suggestion prompt |
| `docs/prompts/packing.txt` | Packing list prompt |
| `docs/fine-tuning-guide.md` | Fine-tuning data format and steps |

---

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [OpenAI Fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)
- [JSON Schema](https://json-schema.org/)

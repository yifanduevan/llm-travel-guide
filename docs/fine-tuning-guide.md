# Fine-Tuning Guide for LLM Engineer

> **When to use:** After prompt engineering yields inconsistent results, or for domain-specific behavior.

---

## 1. Training Data Format

### OpenAI (JSONL)

Each line is one training example:

```jsonl
{"messages": [{"role": "system", "content": "You are a travel planning assistant..."}, {"role": "user", "content": "Generate a couple trip for Paris, Mar 2-8, budget: medium"}, {"role": "assistant", "content": "{\"days\":[{\"date\":\"2026-03-02\",\"items\":[...]}]}"}]}
```

### Anthropic Claude (JSONL)

```jsonl
{"input": "Human: Generate a couple trip for Paris, Mar 2-8, budget: medium\n\nAssistant:", "output": "{\"days\":[{\"date\":\"2026-03-02\",\"items\":[...]}]}"}
```

---

## 2. Data Collection Checklist

| Step | Action |
|------|--------|
| 1 | Create 10+ ideal examples per feature manually |
| 2 | Validate each output against `docs/llm-output-schema.json` |
| 3 | Ensure enums match backend (budget, travelers, transportType) |
| 4 | Remove PII, anonymize any real user data |
| 5 | Aim for 50+ examples per feature before fine-tuning |

---

## 3. Example Training Data (Itinerary)

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a travel planning assistant. Output only valid JSON. Categories: unspecified. Budget: budget, medium, luxury. Travelers: solo, couple, family, group."
    },
    {
      "role": "user",
      "content": "Generate a couple trip for Paris, France from 2026-03-02 to 2026-03-04. Budget: medium. Love art and cafes."
    },
    {
      "role": "assistant",
      "content": "{\"days\":[{\"date\":\"2026-03-02\",\"items\":[{\"title\":\"Louvre Museum\",\"description\":\"Morning at the Louvre\",\"time\":\"09:00\",\"category\":\"unspecified\",\"locationText\":\"Paris, France\"},{\"title\":\"Lunch at Café de Flore\",\"description\":\"Classic Parisian café\",\"time\":\"12:30\",\"category\":\"unspecified\",\"locationText\":\"Saint-Germain\"}]},{\"date\":\"2026-03-03\",\"items\":[{\"title\":\"Musée d'Orsay\",\"description\":\"Impressionist art\",\"time\":\"10:00\",\"category\":\"unspecified\",\"locationText\":\"Paris\"}]}]}"
    }
  ]
}
```

---

## 4. Fine-Tuning Commands

### OpenAI

```bash
# Prepare file
openai api fine_tunes.create -t training.jsonl -m gpt-4o-mini

# Check status
openai api fine_tunes.list
openai api fine_tunes.retrieve -i ft-xxxxx
```

### Anthropic

See [Anthropic fine-tuning docs](https://docs.anthropic.com/en/docs/build-with-claude/fine-tuning).

---

## 5. Evaluation After Fine-Tuning

| Metric | Before | After |
|--------|--------|-------|
| JSON validity rate | __% | __% |
| Enum compliance | __% | __% |
| Latency (p95) | __ms | __ms |
| User acceptance rate | __% | __% |

---

## 6. File Locations

| File | Purpose |
|------|---------|
| `docs/prompts/*.txt` | Prompt templates |
| `docs/llm-output-schema.json` | Output validation |
| `docs/llm-engineer-guide.md` | Main LLM Engineer guide |
| `docs/fine-tuning-guide.md` | This file |

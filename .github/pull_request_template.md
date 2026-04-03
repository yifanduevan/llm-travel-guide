## Summary

- Briefly describe what this PR changes.
- Mention impacted modules and behavior.

## Why

- Explain the problem or requirement this PR addresses.

## Key Changes

- [ ] Backend logic changes
- [ ] Frontend changes
- [ ] Config or infrastructure changes
- [ ] Documentation updates

## LLM Deployment Notes (if applicable)

If this PR touches backend LLM behavior, include deployment details and security posture:

- Secrets source used (`env`, `aws-secrets-manager`, `aws-ssm`)
- Runtime mode (`managed-api` or `aws-service`)
- Required env vars or `application.yml` knobs
- IAM permissions required for secret reads

Reference: [README.md](../README.md) -> "Backend LLM Deployment Runbook (Production)".

## Validation

- [ ] Unit tests added/updated
- [ ] Existing tests pass locally
- [ ] Manual smoke test completed (if needed)

Paste the exact commands and key outputs:

```bash
# Example
cd src/backend
mvn test
```

## Risk and Rollback

- Risk level: low / medium / high
- Rollback plan if unexpected behavior occurs

## Checklist

- [ ] No secrets committed to git
- [ ] API/config changes documented
- [ ] Backward compatibility considered

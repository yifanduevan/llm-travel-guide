# ECE 651 - Trip Planner

> **Course:** ECE 651 - Software Engineering  
> **Term:** Winter 2026

## Overview

A full-stack trip planning application that helps users organize their travel itineraries. Users can create trips, manage accommodations, dining reservations, transportation, and activities all in one place.

## Features

- **Trip Management** - Create, edit, and track trips with dates, budget, and traveler info
- **Itinerary Planning** - Organize daily activities and schedule
- **Accommodations** - Track hotel bookings and lodging details
- **Dining** - Manage restaurant reservations
- **Transportation** - Plan flights, trains, and other transport segments
- **Activities** - Keep track of tours, attractions, and things to do

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Java 21, Spring Boot 3.3 |
| **Database** | PostgreSQL |
| **ORM** | Hibernate / JPA |
| **Migrations** | Flyway |

## Project Structure

```
ECE651/
├── src/
│   ├── frontend/          # Next.js application
│   │   ├── app/           # App router pages
│   │   ├── features/      # Feature modules (trips, etc.)
│   │   └── public/        # Static assets
│   └── backend/           # Spring Boot application
│       └── src/main/java/com/ece651/backend/
│           ├── api/       # Controllers, DTOs, Mappers
│           ├── domain/    # Entities, Enums, Converters
│           ├── repository/# Data access layer
│           └── config/    # Configuration
├── docs/                  # Documentation
└── tests/                 # Test files
```

## Getting Started

### Prerequisites

- **Java 21** (JDK)
- **Node.js 18+** and npm
- **PostgreSQL 15+**
- **Maven 3.9+**

### Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE USER ece651 WITH PASSWORD 'password';"
psql -U postgres -c "CREATE DATABASE ece651 OWNER ece651;"
```

### Backend Setup

```bash
cd src/backend

# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

```bash
cd src/frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### Run both frontend and backend
```bash
./scripts/run.sh both
```

### Environment Variables

For local development, define frontend environment variables in `src/frontend/.env.local`.

The AI itinerary proxy route is implemented in `src/frontend/app/api/ai/itinerary/route.ts` and is used by the **Generate Itinerary** action in the trip itinerary view.

Required variables for the AI itinerary route:

| Variable | Required | Scope | Used by | Behavior if missing |
|----------|----------|-------|---------|---------------------|
| `NEXT_PUBLIC_USE_MOCK` | Recommended (`false` for real backend) | Client + server (`NEXT_PUBLIC`) | `src/frontend/features/trips/api.ts` | If `true`, frontend uses mock itinerary data and does not call `/api/ai/itinerary` |
| `LLM_SERVICE_URL` | Yes (when mock mode is off) | Server-only | `src/frontend/app/api/ai/itinerary/route.ts` | Route returns `503` with `{ "error": "LLM service is not configured" }` |
| `LLM_SERVICE_TOKEN` | Yes (when mock mode is off) | Server-only | `src/frontend/app/api/ai/itinerary/route.ts` | Route returns `503` with `{ "error": "LLM service is not configured" }` |

Copy-paste example (`src/frontend/.env.local`):

```bash
NEXT_PUBLIC_USE_MOCK=false
LLM_SERVICE_URL=https://your-llm-service.example.com/itinerary
LLM_SERVICE_TOKEN=replace-with-llm-service-token
```

Contract used by the route (`POST /api/ai/itinerary`):

- Proxies the incoming JSON body to an external service URL from `LLM_SERVICE_URL`
- Sends `Authorization: Bearer <LLM_SERVICE_TOKEN>`
- Forwards upstream non-2xx status as `{ "error": "LLM service failed" }`

Backend/database variables (existing setup):

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://127.0.0.1:5432/ece651` | Database connection URL |
| `DB_USER` | `ece651` | Database username |
| `DB_PASSWORD` | `password` | Database password |
| `SPRING_PROFILES_ACTIVE` | _unset_ | Active profile (`staging` or `prod` for deployed environments) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated exact frontend origin URLs allowed by backend CORS |
| `DEMO_USER_EMAIL` | `demo@example.com` | Interim backend identity used until real auth is implemented |
| `DEMO_USER_BACKFILL_TRIPS` | `true` | Reassigns existing trips to demo user at startup (temporary workaround) |

Local backend env file (recommended for testing secrets):

```bash
cp src/backend/.env.local.example src/backend/.env.local
# then set OPENAI_API_KEY in src/backend/.env.local
```

`scripts/run.sh` (backend/both) and `scripts/mvn-run` automatically load `src/backend/.env.local` when present.

Backend LLM production configuration:

1. Decide where the model runs:
	- `LLM_RUNTIME_MODE=managed-api`: call managed provider endpoint (default OpenAI URLs).
	- `LLM_RUNTIME_MODE=aws-service`: call your AWS-hosted LLM proxy/service endpoint.
2. Keep keys out of Git. Use AWS secret stores for production:
	- `LLM_SECRET_PROVIDER=aws-secrets-manager` with `OPENAI_API_KEY_SECRET_REF=<secret-id-or-arn>`
	- or `LLM_SECRET_PROVIDER=aws-ssm` with `OPENAI_API_KEY_SECRET_REF=<secure-parameter-name>`
3. Local-only fallback (not for prod): `OPENAI_API_KEY`.

Additional backend LLM variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_RUNTIME_MODE` | No | `managed-api` (default) or `aws-service` |
| `LLM_SECRET_PROVIDER` | No | `env` (default), `aws-secrets-manager`, or `aws-ssm` |
| `OPENAI_API_KEY_SECRET_REF` | Yes (for AWS secret providers) | Secret id/ARN (Secrets Manager) or secure parameter name (SSM) |
| `OPENAI_CHAT_URL` | No | Managed API chat-completions endpoint |
| `OPENAI_ENDPOINT` | No | Managed API responses endpoint |
| `AWS_LLM_CHAT_URL` | Yes (when `LLM_RUNTIME_MODE=aws-service`) | AWS-hosted chat-completions endpoint |
| `AWS_LLM_RESPONSES_URL` | Yes (when `LLM_RUNTIME_MODE=aws-service`) | AWS-hosted responses endpoint |

### Backend LLM Deployment Runbook (Production)

1. Create secret in AWS (choose one):
	- Secrets Manager: store OpenAI key as plain secret string, record secret ARN/ID.
	- SSM Parameter Store: store as SecureString, record parameter name.
2. Ensure runtime IAM can read secret:
	- Add `secretsmanager:GetSecretValue` for the secret, or
	- Add `ssm:GetParameter` (+ `kms:Decrypt` if customer KMS key is used).
3. Set deployment mode:
	- Managed API path: `LLM_RUNTIME_MODE=managed-api`.
	- AWS-hosted service path: `LLM_RUNTIME_MODE=aws-service` and set `AWS_LLM_CHAT_URL`, `AWS_LLM_RESPONSES_URL`.
4. Set secret source:
	- Secrets Manager: `LLM_SECRET_PROVIDER=aws-secrets-manager` and `OPENAI_API_KEY_SECRET_REF=<secret-arn-or-id>`.
	- SSM: `LLM_SECRET_PROVIDER=aws-ssm` and `OPENAI_API_KEY_SECRET_REF=<secure-parameter-name>`.
5. Keep secret out of Git:
	- Do not commit any real key in `.env*`, YAML, or source code.
	- `OPENAI_API_KEY` is allowed only for local development fallback.
6. Deploy backend with environment variables above.
7. Smoke test after deploy:
	- Run `./scripts/smoke-api.sh https://<deployed-api-host>`.
	- Verify `/actuator/health` and `/actuator/health/readiness` return `UP`.
	- Verify `/api/trips` responds with `200` and a JSON array.
	- Verify no secret leakage in logs.

### Backend Deploy Checklist (Staging/Prod)

1. Set profile:
	- `SPRING_PROFILES_ACTIVE=staging` or `SPRING_PROFILES_ACTIVE=prod`.
2. Set database env vars from your runtime/deployment secret store:
	- `DB_URL` (RDS JDBC URL), `DB_USER`, `DB_PASSWORD`.
3. Set strict CORS origins:
	- `CORS_ALLOWED_ORIGINS=https://your-frontend.example.com` (or multiple exact origins, comma-separated).
4. Validate health endpoints:
	- `/actuator/health`
	- `/actuator/health/readiness` (recommended for load balancer target health checks).
5. Run smoke test:
	- `./scripts/smoke-api.sh https://<deployed-api-host>`.
6. Coordination gate:
	- Align auth and trip API contract changes with Meng before merge/deploy.

## Development

### Running Tests

```bash
# Backend tests
cd src/backend
./mvnw test

# Frontend lint
cd src/frontend
npm run lint
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Messages

Follow conventional commit format:
```
feat: add new trip creation wizard
fix: resolve date picker timezone issue
docs: update API documentation
test: add accommodation service tests
refactor: extract trip validation logic
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create a new trip |
| GET | `/api/trips/{id}` | Get trip details |
| PUT | `/api/trips/{id}` | Update a trip |
| DELETE | `/api/trips/{id}` | Delete a trip |
| POST | `/api/ai/itinerary` | Frontend server route that proxies itinerary generation to external LLM service (`LLM_SERVICE_URL` + `LLM_SERVICE_TOKEN`) |

## Team Members

| Name | Email | Phone |
|------|-------|-------|
| Zonghao Liu | z863liu@uwaterloo.ca | 548-990-7463 |
| Yifan Du | y242du@uwaterloo.ca | 514-581-5112 |
| Meng Dai | m44dai@uwaterloo.ca | 343-363-6930 |
| Joey Lu | j375lu@uwaterloo.ca | 416-988-0019 |
| Chenyu Wu | c374wu@uwaterloo.ca | 587-322-2258 |

## License

This project is for educational purposes as part of ECE 651 coursework at the University of Waterloo.

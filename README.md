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

### Environment Variables

Create a `.env` file or set these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://127.0.0.1:5432/ece651` | Database connection URL |
| `DB_USER` | `ece651` | Database username |
| `DB_PASSWORD` | `password` | Database password |

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

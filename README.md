# MeloDex — Music Catalog Insights Platform

A full-stack web application for searching, saving, and analyzing a personal album library with AI-powered insights. Built as a take-home assignment for LedgersCFO.

## Entity Choice: Albums

I chose **Albums** because they provide the richest data for analytics — each album has a genre, release year, track count, artist, and price. This makes for diverse and meaningful charts compared to songs (which mostly share similar fields) or artists (fewer data points per entry).

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Backend    | Java 17 + Spring Boot 3.2          |
| Frontend   | Next.js 15 (React, TypeScript)     |
| Database   | H2 (file-based, PostgreSQL mode)   |
| Charts     | Recharts                           |
| Auth       | JWT (jjwt library)                 |
| AI         | Google Gemini API (with mock fallback) |

## Database Schema

### `users`
| Column        | Type         | Notes            |
|---------------|--------------|------------------|
| id            | BIGINT (PK)  | Auto-increment   |
| username      | VARCHAR      | Unique, not null |
| password_hash | VARCHAR      | BCrypt encoded   |
| created_at    | TIMESTAMP    | Auto-set         |

### `saved_albums`
| Column           | Type         | Notes                   |
|------------------|--------------|-------------------------|
| id               | BIGINT (PK)  | Auto-increment          |
| user_id          | BIGINT (FK)  | References users.id     |
| apple_catalog_id | BIGINT       | iTunes collectionId     |
| title            | VARCHAR      | collectionName          |
| artist_name      | VARCHAR      |                         |
| genre            | VARCHAR      | primaryGenreName        |
| release_date     | VARCHAR      | ISO date string         |
| track_count      | INTEGER      |                         |
| artwork_url      | VARCHAR(1000)|                         |
| user_rating      | INTEGER      | 1-5 stars, nullable     |
| user_notes       | VARCHAR(2000)| Nullable                |
| created_at       | TIMESTAMP    | Auto-set                |
| updated_at       | TIMESTAMP    | Auto-updated            |

**Why H2 in PostgreSQL mode?** It requires zero setup for reviewers (no Docker, no DB install), while maintaining SQL compatibility. For production, swap the JDBC URL to a real PostgreSQL instance.

## API Endpoints

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | /api/auth/register    | No   | Create new user          |
| POST   | /api/auth/login       | No   | Get JWT token            |
| GET    | /api/search?query=... | Yes  | Proxy to iTunes Search   |
| GET    | /api/library          | Yes  | List saved albums        |
| POST   | /api/library          | Yes  | Save album to library    |
| PUT    | /api/library/{id}     | Yes  | Update rating/notes      |
| DELETE | /api/library/{id}     | Yes  | Remove from library      |
| GET    | /api/library/insights | Yes  | AI taste analysis        |

## AI Feature: Taste Profiler

The `/api/library/insights` endpoint collects the user's saved genres and artists, sends a structured prompt to the Gemini API, and returns a natural-language summary of their music taste with a recommendation.

If no API key is configured (`GEMINI_API_KEY` env var), the backend falls back to a mock response that still demonstrates the feature.

## Setup & Run

### Prerequisites
- Java 17+ (or use the portable JDK in `/tools/jdk/`)
- Node.js 18+
- (Optional) Gemini API key for real AI insights

### Backend
```bash
cd backend
# Set JAVA_HOME if needed
export JAVA_HOME=/path/to/jdk-17
mvn spring-boot:run
```
Backend starts on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on `http://localhost:3000`

### Environment Variables
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

For AI features, set the env var before starting the backend:
```
GEMINI_API_KEY=your_key_here
```

## Analytics Dashboard

4 charts powered by Recharts:
1. **Pie Chart** — Genre distribution across saved albums
2. **Bar Chart** — Top artists by number of saved albums
3. **Line Chart** — Album releases by year (timeline)
4. **Histogram** — Track count distribution (binned)

## Trade-offs

| Decision | Why |
|----------|-----|
| H2 over PostgreSQL | Zero-setup for reviewer; PostgreSQL mode preserves SQL compatibility |
| Gemini mock fallback | Works without API key; demonstrates intent without external dependency |
| No Lombok | Keeps code explicit; avoids "magic" annotation processing issues |
| Next.js App Router | Modern React patterns; built-in routing, SSR-ready for deployment |
| Vanilla CSS over Tailwind | Full design control, smaller footprint, no build-time CSS framework |
| JWT in localStorage | Simple for demo; in production, httpOnly cookies would be more secure |
| Single-user library scoping | Each user sees only their own albums via JWT-authenticated endpoints |

## Project Structure
```
LedgersCFO/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/ledgerscfo/musiccatalog/
│   │   ├── controller/         # REST controllers + error handler
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── model/              # JPA entities
│   │   ├── repository/         # Spring Data repos
│   │   ├── security/           # JWT + Spring Security config
│   │   └── service/            # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/                   # Next.js app
│   └── src/
│       ├── app/                # Pages (login, register, search, library, analytics)
│       ├── components/         # Shared components (Navbar)
│       └── context/            # Auth context
└── README.md
```


# Integrated Home Safety System V2

[![Java 17](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3.2](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-TBD-lightgrey)](#license)

Integrated Home Safety System V2 is a full-stack smart lock and home safety platform for monitoring devices, collecting telemetry from ESP32-based hardware, managing user access, and remotely controlling door locks through a web dashboard.

> Status note:
> This repository currently contains two frontend workspaces:
> - `src/` at the repository root: the active Vite + React dashboard used by the smart lock UI.
> - `frontend/`: a separate Next.js workspace that still contains mostly starter content.
>
> For local dashboard development, use the root Vite app unless your team intentionally works on the `frontend/` workspace.

## Demo / Screenshot

![Project screenshot](./public/dashboard-preview.png)

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Target Users](#target-users)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Run with Docker](#run-with-docker)
- [Testing](#testing)
- [Build for Production](#build-for-production)
- [Project Structure](#project-structure)
- [API Usage Examples](#api-usage-examples)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

This project is designed to support a connected home safety scenario where a smart lock, sensors, and a management dashboard work together in one system.

The platform combines:

- a Spring Boot backend for authentication, authorization, telemetry ingestion, analytics, device control, and audit trails
- a Vite + React dashboard for operators and end users
- an ESP32 firmware patch for pushing environmental telemetry to the backend
- seed data and role-based scenarios for local development and authorization testing

The main problem the project solves is centralizing home access control and safety signals into a single interface, so users can monitor device state, view alerts, review logs, and trigger secure actions with step-up verification.

## Core Features

- JWT-based authentication with role-aware access control
- Step-up verification for sensitive actions such as remote lock toggling and settings updates
- Device monitoring for online status, telemetry, and recent activity
- Alert management with resolution flow and export support
- Access log tracking and weekly analytics snapshots
- User profile management, avatar upload, and login activity history
- Admin endpoints for user/session visibility and role management
- ESP32 telemetry ingestion for gas, light, PIR motion, temperature, and weather data
- WebSocket push updates for live telemetry and device events
- Blynk webhook integration for device wake-up and physical event acknowledgements

## Architecture

```text
ESP32 / Sensors
    -> POST /api/telemetry/report
    -> Blynk webhook callbacks

Spring Boot backend
    -> Auth, RBAC, device control, alerts, analytics, audit logs
    -> Flyway migrations
    -> H2 for local development / PostgreSQL for production
    -> WebSocket topics for live updates

Vite React dashboard (root app)
    -> Login, dashboard, remote control, logs, analytics, settings, admin
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend (active) | React 19, Vite 8, React Router, Tailwind CSS, Three.js |
| Frontend (secondary workspace) | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, Spring WebSocket |
| Authentication | JWT |
| Database | H2 (local default), PostgreSQL (production profile) |
| Database Migration | Flyway |
| API Docs | springdoc-openapi |
| Firmware | ESP32 Arduino sketch patch |
| DevOps | Docker, Docker Compose, GitHub Actions, Vercel config, Render deploy hook |

## Target Users

- developers working on an IoT-enabled home safety platform
- teams building or demoing smart lock access-control workflows
- internal stakeholders validating telemetry, alerts, and role-based permissions

## System Requirements

- Node.js `>= 20`
- npm `>= 10`
- Java `17`
- Maven `>= 3.9`
- Docker and Docker Compose (optional)
- PostgreSQL (optional for production-like runs)
- ESP32 hardware and Blynk setup (optional for live device integration)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/harry-leon/Integrated-Home-Safety-System-V2.git
cd Integrated-Home-Safety-System-V2
```

### 2. Install root frontend dependencies

This installs dependencies for the active Vite dashboard in the repository root.

```bash
npm install
```

### 3. Install backend dependencies

From the `backend/` workspace:

```bash
cd backend
mvn clean package -DskipTests
cd ..
```

### 4. Optional: install dependencies for the secondary Next.js workspace

Only do this if you intentionally need the `frontend/` app.

```bash
cd frontend
npm install
cd ..
```

## Environment Variables

### Root `.env`

The repository root already contains a simple `.env` file. A practical local setup looks like this:

```env
PROJECT_NAME=smart-lock-system
BACKEND_PORT=8080
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080
```

Notes:

- `VITE_API_BASE_URL` is optional for local development because `vite.config.js` already proxies `/api` to `http://localhost:8080`.
- `NEXT_PUBLIC_API_URL` is only relevant if you use the separate `frontend/` Next.js workspace.

### Backend configuration

Local development defaults to H2 through [`backend/src/main/resources/application.yml`](./backend/src/main/resources/application.yml).

Production-style runs use [`backend/src/main/resources/application-prod.yml`](./backend/src/main/resources/application-prod.yml) and expect:

```env
PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/smartlock
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password
JWT_SECRET_KEY=replace_with_a_secure_secret
JWT_EXPIRATION=86400000
```

### Security note

The backend currently ships with a committed `blynk.auth-token` in `application.properties`. That token should be moved to environment-based configuration before any real deployment.

## Run Locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

Expected default URL:

- API: `http://localhost:8080`
- H2 console: `http://localhost:8080/h2-console`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Active frontend dashboard

Run the Vite app from the repository root:

```bash
npm run dev
```

Expected URL:

- Dashboard: `http://localhost:3000`

### Optional secondary Next.js workspace

The `frontend/` workspace is separate from the active root dashboard and still looks like starter scaffolding.

```bash
cd frontend
npm run dev
```

If the root Vite app is already using port `3000`, start the Next.js app on another port.

## Run with Docker

### Backend-only container

The backend has a working Dockerfile:

```bash
docker build -t smart-lock-backend ./backend
docker run --rm -p 8080:8080 smart-lock-backend
```

### Docker Compose

The repository includes a `docker-compose.yml` file:

```bash
docker compose up --build
```

However, the compose setup is not fully turnkey at the moment because it points the `frontend` service to `./frontend`, and that workspace does not currently include a Dockerfile.

Use Docker Compose only after one of these is completed:

- add a Dockerfile for `frontend/`, or
- update `docker-compose.yml` to build the root Vite app instead

## Testing

### Backend tests

```bash
cd backend
mvn test
```

Current known issue:

- `mvn test` currently fails on H2 during Flyway migration `V4__add_user_profile_and_login_sessions.sql`
- the failing SQL uses `gen_random_uuid()`, which is not available in the default H2 setup

### Root frontend build check

```bash
npm run build
```

Current status:

- verified successfully in this repository

### Secondary Next.js workspace build

```bash
cd frontend
npm run build
```

Current status:

- verified successfully in this repository

## Build for Production

### Root Vite dashboard

```bash
npm run build
```

Production output:

- `dist/`

### Backend JAR

```bash
cd backend
mvn clean package -DskipTests
```

Production output:

- `backend/target/*.jar`

### Secondary Next.js workspace

```bash
cd frontend
npm run build
```

## Project Structure

```text
Integrated-Home-Safety-System-V2/
├─ .github/workflows/          # CI/CD workflows
├─ backend/                    # Spring Boot API, security, migrations, tests
│  ├─ src/main/java/com/smartlock/
│  ├─ src/main/resources/
│  └─ src/test/
├─ firmware/                   # ESP32 telemetry patch
├─ frontend/                   # Secondary Next.js workspace (starter state)
├─ public/                     # Static assets for the root Vite app
├─ src/                        # Primary Vite + React dashboard
├─ dashboard.html              # Additional dashboard asset/reference
├─ docker-compose.yml
├─ package.json                # Root Vite app
├─ vercel.json                 # Vercel config targeting the root Vite app
└─ README.md
```

## API Usage Examples

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartlock.com",
    "password": "password"
  }'
```

Successful responses return a payload including `accessToken`, `tokenType`, `userId`, `fullName`, `email`, and `role`.

### Step-up verification

Sensitive operations require a verification token in the `X-Verification-Token` header.

```bash
curl -X POST http://localhost:8080/api/auth/re-auth \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password"
  }'
```

### Toggle a lock remotely

```bash
curl -X POST http://localhost:8080/api/devices/<device-id>/lock/toggle \
  -H "Authorization: Bearer <access-token>" \
  -H "X-Verification-Token: <verification-token>"
```

### Submit telemetry from firmware

```bash
curl -X POST http://localhost:8080/api/telemetry/report \
  -H "Content-Type: application/json" \
  -d '{
    "deviceCode": "SL-FRONT-001",
    "gasValue": 120,
    "ldrValue": 420,
    "pirTriggered": false,
    "temperature": 29.5,
    "weatherDesc": "clear sky"
  }'
```

### Key backend route groups

- `/api/auth` - login, registration, re-authentication, logout
- `/api/devices` - list devices, read device details, toggle lock command
- `/api/telemetry` - telemetry ingestion
- `/api/alerts` - alert listing, resolution, export
- `/api/access-logs` - audit log listing and export
- `/api/analytics` - snapshots and weekly reports
- `/api/settings` - device and notification settings
- `/api/me` - profile, avatar upload, login history
- `/api/admin` - user and session administration
- `/api/integration/blynk` - webhook callbacks from Blynk/device side

## Development Workflow

### Recommended local flow

1. Start the backend first.
2. Start the root Vite dashboard.
3. Log in with a seeded account.
4. Use telemetry or webhook calls to simulate device behavior.
5. Review alerts, logs, analytics, and remote-control flows from the dashboard.

### Seeded test accounts

The migration scripts seed the following accounts, all with password `password`:

| Email | Suggested purpose |
| --- | --- |
| `admin@smartlock.com` | admin access |
| `user@smartlock.com` | regular member |
| `owner@smartlock.com` | owner-level device access scenario |
| `control@smartlock.com` | control permission scenario |
| `viewer@smartlock.com` | view-only permission scenario |
| `nogrant@smartlock.com` | no device grant scenario |

### CI/CD notes

- GitHub Actions CI runs on `main` and `dev`
- backend CI builds and tests the Spring Boot app
- frontend CI currently builds the `frontend/` Next.js workspace
- root `vercel.json` targets the Vite app at the repository root

This means the repository currently mixes two frontend delivery strategies and should be consolidated.

## Contributing

Contributions are possible, but the project would benefit from a clearer contribution policy.

Recommended workflow:

1. Fork the repository or create a feature branch from `dev`
2. Use a descriptive branch name such as `feature/device-alert-export`
3. Keep changes scoped to one concern
4. Run relevant checks before opening a pull request
5. Open a pull request into `dev` or the branch required by your team process
6. Wait for CI and code review before merging

[TODO: Add a formal CONTRIBUTING.md and Code of Conduct if this project will be maintained as open source.]

## Roadmap

- Consolidate the repository around one frontend application strategy
- Fix Flyway/H2 compatibility for local tests and startup
- Externalize secrets such as JWT and Blynk tokens
- Add a frontend Dockerfile or align Docker Compose to the active Vite app
- Add end-to-end tests for auth, telemetry, alerts, and remote commands
- Publish real screenshots, architecture diagrams, and deployment documentation

## FAQ

### Which frontend should I use?

Use the root Vite app for the current smart lock dashboard. The `frontend/` Next.js app is present, but still contains mostly starter content.

### Do I need real hardware to work on this project?

No. You can work on the web app and backend with seeded data and API calls. Hardware becomes necessary only when validating live ESP32 telemetry and Blynk-driven workflows.

### Which database is used locally?

H2 is the default local database. PostgreSQL is configured through the production profile.

### Are there seeded accounts for testing?

Yes. Several accounts are seeded through Flyway migrations, and the shared plaintext password is `password`.

## Troubleshooting

### `mvn test` fails during Flyway migration

Cause:

- `V4__add_user_profile_and_login_sessions.sql` uses `gen_random_uuid()`
- the default H2 setup does not provide that function

Recommended fix direction:

- replace `gen_random_uuid()` with an H2-compatible UUID strategy for local runs, or
- isolate PostgreSQL-specific migration logic behind profile-aware paths

### `docker compose up --build` does not start the frontend

Cause:

- `docker-compose.yml` expects a Docker build context at `./frontend`
- `frontend/` does not currently include a Dockerfile

### API requests from the dashboard fail in local development

Check:

- backend is running on `http://localhost:8080`
- root Vite app is running on `http://localhost:3000`
- if you are not using the Vite proxy, set `VITE_API_BASE_URL`

### Blynk webhook calls return `401 Unauthorized`

The webhook controller validates a token. Ensure the request includes a valid device token or the configured global Blynk token.

## License

This repository does not currently include a `LICENSE` file.

License status: `TBD`

[TODO: Add an explicit license such as MIT, Apache-2.0, GPL-3.0, or Proprietary.]

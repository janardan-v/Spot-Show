# SpotShow

> An editorial digital cinema discovery and ticketing platform featuring a continuous, scroll-driven infinite film reel, real-time seat availability, and concurrency-safe seat reservation.

---

## Visual Preview

| Continuous Infinite Cinema Reel (Desktop) | Interactive 10×10 Seat Selection |
| :---: | :---: |
| ![SpotShow Cinema Reel](docs/screenshots/cinema-reel.png) | ![SpotShow Seat Selection](docs/screenshots/seat-selection.png) |
| *Curved continuous wave ribbon mapped to vertical scrolling with 3D perspective warp and real-time active panel focus.* | *Auditorium seat map with live selection tracking, booked seat restrictions, and dynamic booking summary.* |

---

## Overview

SpotShow is a digital cinema discovery and ticket booking application designed around the visual language of an archival exhibition. Moving away from commodity ticketing platforms, SpotShow combines an immersive, indefinitely looping horizontal cinema reel with an interactive auditorium seat selection workflow.

Behind the front-end presentation, SpotShow implements a concurrency-safe reservation engine built on PostgreSQL row-level pessimistic locking (`FOR UPDATE`) within atomic database transactions, preventing double-booking race conditions during high-demand screenings.

### Core Value & Design Principles

- **Fluid Infinite Reel:** Vertical scroll wheel, touch, and drag gestures translate directly into horizontal track movement across a continuous, curved film ribbon without jumps, sudden reversals, or edge clipping.
- **Archival Monochrome Aesthetic:** High-contrast typography (pure white `#ffffff` on ink black `#000000`) paired with subtle graphite hairlines (`#262626`) lets genuine film artwork provide the focal color in the room.
- **Transactional Integrity:** Double bookings are rejected at the database engine level via row-level locks, ensuring seat state cannot be corrupted by concurrent requests.
- **Zero Heavy Framework Bloat:** The frontend is constructed with vanilla TypeScript and Vite, using reactive pub/sub stores, lightweight component templates, and an in-house client-side router.

---

## Key Features

### 1. Continuous Infinite Cinema Reel
- **Seamless Bidirectional Looping:** Natural vertical scrolling translates into continuous horizontal translation. Cycles indefinitely forward (`1 → 2 → 3 → 4 → 1...`) and backward (`4 → 3 → 2 → 1 → 4...`) using modular coordinate wrapping with zero visual stutter or subpixel jumps.
- **Perspective Warp & Wave Boundaries:** Panels ripple through subtle 3D perspective rotations (`rotateY`), skew transforms (`skewY`), and dynamic SVG clipping paths (`clip-path: url(#gallery-wave-clip)`) with animated hairline borders.
- **Active Panel Proximity Calculation:** Viewport center detection dynamically promotes the nearest panel (`.is-active`), while inactive preview cards maintain click isolation to prevent accidental navigation during scrolling.
- **Future Screening Season (August 2030):** Showcases curated screenings spanning 15–18 August 2030, with dynamic, locale-aware date and weekday formatting.
- **Projection Formats & Badges:** Displays distinct film presentation formats (70mm Film · Dolby Atmos, IMAX Dual Laser · 12-Channel Sound, 35mm Celluloid · Optical Sound).

### 2. Auditorium Seat Map & Selection
- **10×10 Auditorium Grid:** Renders 100 individual seats per screening with standard cinema labeling (`A1` through `J10`).
- **Tri-State Availability Indicators:** Clear visual distinction between Available (interactive), Selected (high-contrast active state), and Occupied (disabled, non-clickable).
- **Dynamic Order Calculations:** Real-time seat tally and price calculations (₹200 per seat) synchronized across the auditorium grid and the sticky booking summary stub.
- **Selection Isolation:** Switching between different screenings automatically clears stale selections to avoid cross-show seat leakage.

### 3. Concurrency-Safe Booking Engine
- **Pessimistic Row-Level Locking:** When a reservation request arrives, the backend executes `SELECT * FROM seats WHERE id = $1 AND is_booked = false FOR UPDATE` inside a database transaction (`BEGIN` ... `COMMIT` / `ROLLBACK`).
- **Race Condition Prevention:** Competing requests for the same seat block until the first transaction commits, causing the second request to safely fail with an HTTP 409 Conflict.
- **Scheduled Demo State Reset:** An integrated background cron job (`node-cron`) automatically resets seat availability every two days (`0 0 */2 * *`) to keep the demo environment usable.

### 4. Authentication & Protected Checkout
- **Dual JWT Authentication:** Short-lived access tokens and persistent refresh tokens stored in PostgreSQL for rotation and revocation.
- **Salted Password Security:** Passwords hashed using Node.js `crypto` HMAC-SHA256 with unique 32-byte cryptographically secure random salts.
- **Contextual Login Modal:** Unauthenticated users attempting to proceed from seat selection are prompted with an accessible login modal, preserving their selected seats and redirecting them back to checkout upon authentication.
- **Automated Client Token Refresh:** The frontend HTTP client (`src/api/client.ts`) intercepts HTTP 401 responses, transparently requests a new access token via `/api/v1/auth/refresh`, and replays the original request without user interruption.

### 5. Accessibility & Responsiveness
- **Accessible Motion Fallback:** Full support for `prefers-reduced-motion: reduce`. Automatically collapses the continuous 3D carousel into a static, stacked editorial programme with direct booking links.
- **Fluid Breakpoints:** Tested across desktop (1440×900), tablet (820×1000), and mobile viewports (390×844).
- **Keyboard Navigation:** Explicit `:focus-visible` outlines, ARIA button states (`aria-pressed`, `aria-live="polite"`), and dialog trapping for modals.

---

## Technology Stack

### Frontend
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | TypeScript (~6.0) | Strict typing across API payloads, routes, and DOM lifecycles |
| **Tooling & Build** | Vite 8.2 | Fast HMR development and optimized production bundling |
| **Architecture** | Vanilla TypeScript Shell | Component string templates with lifecycle cleanup hooks (`registerCleanup`) |
| **Routing** | Custom Client Router | History API router (`src/router.ts`) supporting programmatic navigation and smooth scroll reset |
| **State Management** | Custom Pub/Sub Stores | Lightweight reactive stores for authentication and multi-seat selection |
| **Styling** | Modular Vanilla CSS | Design tokens (`colors.css`, `typography.css`, `spacing.css`) with 3D CSS transforms |

### Backend
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Bun / Node.js | Modern JavaScript/TypeScript execution environment |
| **Framework** | Express 5.2 | Robust, battle-tested HTTP application server |
| **Database ORM** | Drizzle ORM (v1.0-rc.4) | Type-safe schema definition and query generation |
| **Database Driver** | `pg` (node-postgres) | Connection pooling (`Pool`) and transactional raw SQL queries |
| **Security & Auth** | `jsonwebtoken` & Node `crypto` | JWT verification, HMAC-SHA256 password hashing with 32-byte salt |
| **Validation** | Zod (v4.4.3) | Schema and request parameter validation |
| **Task Scheduling** | `node-cron` | Automated demo database refreshment |

### Infrastructure & Database
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Database** | PostgreSQL 17 | Relational persistence with ACID transactions and row locking |
| **Containerization** | Docker Compose | Local containerized PostgreSQL service (`spot-show-postgres`) |

---

## Architecture & Project Structure

SpotShow follows a clean, decoupled architecture where the frontend communicates with the backend exclusively through a versioned REST API (`/api/v1`).

```
SpotShow/
├── backend/
│   ├── drizzle/                     # Auto-generated Drizzle migration files
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/                # Auth controller, model, routes, services
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.model.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.services.ts
│   │   │   └── book/                # Shows & booking controller, routes, services
│   │   │       ├── book.controller.ts
│   │   │       ├── book.model.ts
│   │   │       ├── book.routes.ts
│   │   │       └── book.services.ts
│   │   ├── common/
│   │   │   ├── middlewares/         # Auth (Bearer JWT) & global error handler
│   │   │   └── utils/               # ApiError, ApiResponse, token utilities
│   │   ├── db/
│   │   │   ├── index.ts             # pg Pool & Drizzle client initialization
│   │   │   ├── refreshDB.ts         # Seat reset logic for demo environment
│   │   │   ├── schema.ts            # Drizzle PostgreSQL schema (users, movies, seats)
│   │   │   └── seed.ts              # Seed script (2030 future screening dates & seats)
│   │   ├── jobs/
│   │   │   └── refreshDBJob.ts      # Cron schedule for demo reset
│   │   └── app.ts                   # Express application setup & middleware pipeline
│   ├── docker-compose.yml           # Local PostgreSQL 17 container definition
│   ├── Dockerfile                   # Container packaging for deployment
│   ├── drizzle.config.ts            # Drizzle Kit migration configuration
│   ├── dotEnvSample                 # Sample backend environment file
│   └── server.ts                    # HTTP server entry point (port 3000)
│
├── frontend/
│   ├── public/
│   │   ├── images/                  # High-resolution film poster artwork (WebP)
│   │   └── favicon.svg              # Brand icon mark
│   ├── src/
│   │   ├── api/                     # Typed API clients (auth, booking, movie, seat)
│   │   │   └── client.ts            # HTTP client with automatic 401 token refresh
│   │   ├── components/
│   │   │   ├── booking/             # SeatGrid, SeatButton, BookingSummary
│   │   │   ├── home/                # NowShowing infinite reel & Hero components
│   │   │   └── Navbar.ts            # Responsive masthead with auth-aware actions
│   │   ├── pages/                   # Route views (Home, Show, Booking, Login, Register, Account)
│   │   ├── services/                # Business logic mapping API responses to models
│   │   ├── store/                   # Reactive stores (auth.store, booking.store)
│   │   ├── styles/                  # Modular CSS architecture
│   │   │   ├── abstracts/           # Design tokens (colors, typography, spacing, radius)
│   │   │   ├── base/                # Reset, typography base, utilities
│   │   │   ├── components/          # Scoped component stylesheets
│   │   │   └── layout/              # Container and grid primitives
│   │   ├── types/                   # Movie, seat, and router TypeScript declarations
│   │   ├── utils/                   # Lifecycle registry, seat labels, poster maps
│   │   ├── main.ts                  # Application bootstrap
│   │   └── router.ts                # Client-side router and view mounter
│   ├── index.html                   # HTML entry point with system fonts
│   └── package.json                 # Frontend scripts and dependencies
│
└── docs/
    └── screenshots/                 # Repository visual documentation assets
```

### Data Flow & Request Cycle

```
[ Browser / Client ]
        │
        ├─► [ Custom Router (src/router.ts) ] ──► Mounts Page Views into #page-content
        │
        ├─► [ Reactive Stores (src/store/) ]  ──► Syncs Seat Selection & Auth Tokens
        │
        └─► [ API Client (src/api/client.ts) ]
                │
                │ HTTP Requests (with Bearer JWT)
                ▼
[ Express API (/api/v1) ]
        │
        ├─► [ authorizeMiddleware ] ──► Validates JWT & injects req.user
        │
        ├─► [ Controllers & Services ]
        │       │
        │       ├─► [ Drizzle ORM ]  ──► Movies & User queries
        │       │
        │       └─► [ Raw pg Pool ]  ──► BEGIN -> SELECT FOR UPDATE -> COMMIT
        │                                  (Pessimistic seat booking lock)
        ▼
[ PostgreSQL 17 Database ]
```

---

## API Reference

The backend exposes a versioned RESTful API under the base path `/api/v1`.

### Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Returns service health status (`{"status": "ok"}`) |

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | `{ name, email, age, password }` | Registers a new user account with salted HMAC-SHA256 password |
| `POST` | `/api/v1/auth/login` | Public | `{ email, password }` | Authenticates credentials and returns `{ accessToken, refreshToken }` |
| `GET` | `/api/v1/auth/profile` | Authenticated | *Header: Authorization: Bearer &lt;token&gt;* | Returns the currently authenticated user's ID, name, and email |
| `GET` | `/api/v1/auth/logout` | Authenticated | *Header: Authorization: Bearer &lt;token&gt;* | Invalidates the user's stored refresh token in the database |
| `POST` | `/api/v1/auth/refresh` | Public | `{ refreshToken }` | Issues a new short-lived access token using a valid refresh token |

### Shows & Booking (`/api/v1/shows`)
| Method | Endpoint | Access | Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/shows` | Public | None | Returns list of all scheduled films, dates, and total seat capacities |
| `GET` | `/api/v1/shows/seats/:showId` | Public | `:showId` (UUID) | Returns all 100 seats for a show with current `isBooked` boolean flags |
| `POST` | `/api/v1/shows/book/:seatId` | Authenticated | `:seatId` (UUID) | Acquires row lock and reserves the specified seat for `req.user.id` |

---

## Database Schema

```mermaid
erDiagram
    users {
        uuid id PK
        varchar name
        integer age
        varchar email UK
        text password
        text salt
        text refresh_token
        timestamp created_at
        timestamp updated_at
    }

    movies {
        uuid id PK
        varchar movie_name
        integer total_seats
        timestamp show_date
        timestamp created_at
        timestamp updated_at
    }

    seats {
        uuid id PK
        boolean is_booked
        uuid show_id FK
        uuid booked_by FK
        timestamp created_at
        timestamp updated_at
    }

    movies ||--o{ seats : "has 100"
    users ||--o{ seats : "reserves"
```

---

## Prerequisites & Installation

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) or **Bun** (v1.1+ recommended)
- **Docker** and **Docker Compose** (for PostgreSQL)
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/janardan-v/Spot-Show.git
cd Spot-Show
```

---

### Step 2: Start the PostgreSQL Database

Start the PostgreSQL 17 container using Docker Compose:

```bash
cd backend
docker compose up -d
```

Verify that the container is healthy:
```bash
docker ps --filter "name=spot-show-postgres"
```

*(To stop the database later, run `docker compose down` from the `backend/` directory).*

---

### Step 3: Configure Environment Variables

#### Backend Configuration
Copy the sample environment file in `backend/` or create a `.env` file:

```bash
# In backend/ directory
cp dotEnvSample .env
```

Ensure `backend/.env` contains valid configuration values:
```env
PORT=3000
DATABASE_URL=postgresql://janardan:postgres@localhost:5432/spotShow
ACCESS_TOKEN_SECRET=spotshow_dev_access_token_secret_key_2026
REFRESH_TOKEN_SECRET=spotshow_dev_refresh_token_secret_key_2026
```

#### Frontend Configuration
Create a `.env` file in the `frontend/` directory:

```bash
# In frontend/ directory
```

Ensure `frontend/.env` contains the API base URL:
```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

---

### Step 4: Install Dependencies & Setup Database

#### Backend Setup:
```bash
cd backend

# Install dependencies
bun install
# (or: npm install)

# Generate and apply migrations
bun run generate
bun run migrate

# Seed the database with 2030 future shows and 100 seats per show
bun run seed
```

#### Frontend Setup:
```bash
cd ../frontend

# Install dependencies
bun install
# (or: npm install)
```

---

### Step 5: Start the Development Servers

Open two terminal windows:

#### Terminal 1 — Start Backend Server:
```bash
cd backend
bun run dev
# (or: npm run dev)
```
*The Express API will start on **`http://localhost:3000`**.*

#### Terminal 2 — Start Frontend Server:
```bash
cd frontend
bun run dev
# (or: npm run dev)
```
*The Vite development server will start on **`http://localhost:5173`**.*

---

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

- Discover screenings on the **Continuous Cinema Reel**.
- Click **Book tickets** on any active feature to enter the auditorium.
- Select your seats and proceed through **Review & Confirm**.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Type | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `PORT` | Number | Yes | Port on which Express listens | `3000` |
| `DATABASE_URL` | String | Yes | PostgreSQL connection string | `postgresql://janardan:postgres@localhost:5432/spotShow` |
| `ACCESS_TOKEN_SECRET` | String | Yes | Secret key used to sign and verify short-lived JWT access tokens | `your_access_token_secret` |
| `REFRESH_TOKEN_SECRET` | String | Yes | Secret key used to sign and verify long-lived JWT refresh tokens | `your_refresh_token_secret` |

### Frontend (`frontend/.env`)

| Variable | Type | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | String | Yes | Base URL prefix for backend REST API calls | `http://localhost:3000/api/v1` |

---

## Available Scripts

### Backend (`package.json`)
| Command | Action |
| :--- | :--- |
| `bun run dev` | Starts the backend with live reload via `tsx watch server.ts` |
| `bun run start` | Starts the production server directly via `bun server.ts` |
| `bun run build` | Compiles TypeScript sources with `tsc` |
| `bun run generate` | Generates SQL migrations from schema using `drizzle-kit generate` |
| `bun run migrate` | Executes pending migrations against PostgreSQL with `drizzle-kit migrate` |
| `bun run studio` | Launches Drizzle Studio visual database inspector |
| `bun run seed` | Seeds the database with 4 feature films (dates in 2030) and 400 seats |

### Frontend (`package.json`)
| Command | Action |
| :--- | :--- |
| `bun run dev` | Launches the Vite local development server with HMR on port 5173 |
| `bun run build` | Runs type checking (`tsc`) and produces optimized assets in `dist/` |
| `bun run preview` | Serves the production build locally via `vite preview` |

---

## Verification & Testing

SpotShow's infinite reel motion, scroll wrapping, and seat reservation flows are verified via Playwright automated browser test scripts.

Key test scenarios executed and verified:
1. **Initial Load Anchoring:** Film 1 (*Spider-Man: Brand New Day*) starts centered at the primary anchor with bidirectional scroll headroom.
2. **Multi-Cycle Forward Loop:** Continuous downward scrolling advances through 1 → 2 → 3 → 4 → 1 → 2 → 3 with instant, imperceptible wrapping.
3. **Multi-Cycle Backward Loop:** Continuous upward scrolling advances through 4 → 3 → 2 → 1 → 4 → 3 with instant, imperceptible wrapping.
4. **Touch & Click Isolation:** Inactive background panels ignore pointer events to avoid accidental route transitions during scroll gestures.
5. **Seat Selection & Locking:** Interactive toggle of available seats, immediate price tally synchronization, and optimistic UI updates backed by transactional confirmation.
6. **Responsive Layouts:** Validated on Desktop (1440px), Tablet (820px), and Mobile (390px).
7. **Reduced Motion:** Verified accessible static presentation when `prefers-reduced-motion: reduce` is active.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

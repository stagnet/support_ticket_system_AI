# Support Ticket System with AI Assistance

A full-stack support ticket management system with AI-powered ticket analysis using Google Gemini.

## What I Built

A support ticket system where users can create, edit, and delete tickets describing their issues. When a ticket is submitted, Google Gemini AI automatically analyzes it to generate a summary, categorize it, suggest a response, assign priority, and tag it with relevant keywords. The AI analysis helps support agents triage and respond to tickets faster. Toast notifications provide feedback on all create, edit, and delete actions.

## Tech Stack

| Layer      | Choice                              | Why                                                  |
|------------|-------------------------------------|------------------------------------------------------|
| Backend    | Express + TypeScript                | Fast to build, type-safe, mature ecosystem           |
| Frontend   | Vue 3 + TypeScript + Vite           | Composition API + `<script setup>` for clean logic   |
| Database   | PostgreSQL + Prisma 7               | Type-safe ORM, migrations built-in, enums support    |
| AI         | Google Gemini 2.5 Flash             | Free tier, fast inference, structured JSON output    |
| Styling    | Tailwind CSS v4 + DaisyUI           | Utility-first with semantic component classes        |
| Validation | Zod                                 | Schema validation for API input and env variables    |

## Architecture

```
routes -> controllers -> services -> data layer (Prisma)
                            |
                        AI Service (isolated, graceful failure)
```

- **Layered separation**: Routes handle routing, controllers handle HTTP, services contain business logic
- **AI isolation**: AI service is a standalone module; tickets are created even if AI analysis fails
- **Structured AI output**: Uses Gemini's `responseSchema` for type-safe AI responses (no manual JSON parsing)
- **Caching**: In-memory cache for AI responses to reduce API calls
- **Rate limiting**: express-rate-limit on all API endpoints + stricter limit on ticket creation

## Prerequisites

- Node.js >= 20
- PostgreSQL >= 14 (running on port 5433)
- Google Gemini API key (free: [Google AI Studio](https://aistudio.google.com/apikey))

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd support-ticket-system

# Install root dependencies
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
cd ..
```

### 2. Configure environment

```bash
# Copy the example env file
cp .env.example server/.env

# Edit server/.env with your actual values:
# DATABASE_URL=postgresql://your_user@localhost:5433/support_tickets
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Set up database

```bash
# Create the database (adjust user/port for your setup)
createdb -p 5433 support_tickets

# Run migrations
cd server && npx prisma migrate dev

# (Optional) Seed with sample data
npx prisma db seed
cd ..
```

### 4. Start development

```bash
# From the project root — starts both server and client
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## .env.example

```
DATABASE_URL=postgresql://your_user@localhost:5433/support_tickets
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

## API Endpoints

| Method | Endpoint                    | Description                                          | Status Codes       |
|--------|-----------------------------|------------------------------------------------------|-------------------|
| GET    | /api/health                 | Health check                                         | 200               |
| POST   | /api/tickets                | Create ticket (triggers AI analysis)                 | 201, 400, 429     |
| GET    | /api/tickets                | List tickets (supports ?status, ?priority, ?page, ?limit) | 200          |
| GET    | /api/tickets/:id            | Get ticket details                                   | 200, 404          |
| PATCH  | /api/tickets/:id            | Update ticket title, description, and/or status      | 200, 400, 404     |
| DELETE | /api/tickets/:id            | Delete a ticket                                      | 204, 404          |
| POST   | /api/tickets/:id/retry-ai   | Retry AI analysis on an existing ticket              | 200, 404, 502     |

## Features

### Ticket Management
- **Create** tickets with title and description — AI analysis runs automatically
- **Edit** tickets via modal — update title, description, or status (Open / In Progress / Resolved)
- **Delete** tickets with a confirmation dialog to prevent accidental deletion
- **List** all tickets with priority/status badges, AI-generated tags, and summary preview

### AI Analysis
On ticket creation, Google Gemini automatically:
- **Summarizes** the ticket content (1-2 sentences)
- **Categorizes** into: billing, technical, account, feature_request, bug_report, general
- **Suggests** a professional customer response (2-4 sentences)
- **Tags** with 2-5 relevant keywords
- **Prioritizes** as LOW, MEDIUM, HIGH, or URGENT

If AI analysis fails (network error, rate limit, invalid key), the ticket is still created with null AI fields and a default MEDIUM priority. Users can retry AI analysis later via the "Retry AI Analysis" button on the ticket detail page.

### Toast Notifications
User actions trigger top-right toast notifications:
- Ticket created, updated, or deleted
- AI analysis completed or failed

## Trade-offs & Decisions

- **`@google/genai` over deprecated `@google/generative-ai`**: Uses the current, actively maintained SDK with structured output support
- **DaisyUI over raw Tailwind**: Semantic component classes (`btn`, `card`, `badge`, `modal`) reduce boilerplate and provide consistent dark mode support out of the box
- **Synchronous AI call**: AI analysis is awaited before returning the ticket. Adds latency (~1-2s) but simpler than async polling. Documented as an improvement area.
- **In-memory cache**: Simple Map-based cache with TTL for AI responses. Good enough for a demo; would use Redis in production.
- **Prisma 7 with driver adapter**: Uses `@prisma/adapter-pg` as required by the new Prisma client architecture
- **No authentication**: Intentionally omitted to keep scope focused. Would add JWT auth in production.
- **Color-coded structured logger**: Uses `process.stdout.write` with color-coded output instead of `console.log` for readable, structured logging

## What I'd Improve With More Time

- Async AI processing with polling/SSE for better UX (ticket returned immediately, AI populates later)
- Redis-based AI response cache for persistence across restarts
- JWT authentication with user roles (admin, agent, customer)
- WebSocket notifications for real-time ticket updates across browser tabs
- End-to-end tests with Playwright
- Docker Compose for one-command setup
- Deployment to Railway or Render with CI/CD

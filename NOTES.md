# Design Notes & Trade-offs

## AI Prompt Design

The AI prompt is structured to return a specific JSON schema with five fields. Key decisions:

- **Low temperature (0.3)**: Ensures consistent, focused analysis rather than creative responses
- **Structured output via `responseSchema`**: Instead of asking the AI to return JSON in the prompt text and parsing it manually, we use Gemini's native structured output feature. This guarantees valid JSON matching our schema, eliminating parse errors.
- **Constrained categories**: The prompt limits categories to 6 specific values, and the service validates the response against these. This prevents uncategorized tickets.
- **Priority inference**: The AI determines priority from the ticket content (e.g., "urgent", "cannot access", "crashes" suggest higher priority)

## Architecture Decisions

### Layered Backend (routes -> controllers -> services)
Business logic lives in services, not route handlers. This makes the code testable and the layers independently swappable. The AI service has zero coupling to Express or Prisma — it takes strings in and returns a typed result or null.

### Graceful AI Failure
The AI service never throws. On any error (network, rate limit, bad response, missing API key), it returns `null`. The ticket service handles this by creating the ticket with default values (MEDIUM priority, null AI fields). This ensures ticket creation never fails due to AI issues. A retry endpoint (`POST /api/tickets/:id/retry-ai`) allows re-running analysis on tickets that were created without it.

### Synchronous AI Flow
We chose to await the AI analysis before returning the ticket (Option A). This adds ~1-2s of latency but:
- Simpler implementation (no polling, no background jobs)
- The frontend immediately shows AI results on the detail page
- Good enough for a demo where latency isn't critical

The alternative (Option B) would be: return the ticket immediately with `aiStatus: "pending"`, run AI in the background, have the frontend poll for updates. This is documented as an improvement.

### In-Memory AI Cache
Simple `Map<string, { result, timestamp }>` with 5-minute TTL. Prevents redundant Gemini API calls for identical tickets. Trade-offs:
- Lost on server restart (acceptable for demo)
- No size limit (could add LRU eviction for production)
- Cache key is based on lowercased title + first 200 chars of description

### Prisma 7
Prisma 7 was used (latest), which requires a driver adapter (`@prisma/adapter-pg`). This is the new architecture where Prisma no longer includes its own database driver — you bring your own (`pg` package). Benefits: smaller bundle, more control over connection pooling.

## Styling: DaisyUI over Raw Tailwind

The frontend was originally built with raw Tailwind utility classes, then migrated to Tailwind CSS v4 + DaisyUI. Key reasons:

- **Semantic component classes**: `btn btn-primary`, `card`, `badge-success`, `modal` etc. replace verbose utility strings. Less repetition, more readable templates.
- **Dark mode out of the box**: DaisyUI's color tokens (`bg-base-100`, `text-base-content`, `badge-neutral`) automatically adapt to light/dark themes without manual `dark:` overrides. Raw `badge-ghost` was invisible in dark mode; `badge-neutral` is not.
- **Consistent design system**: Form inputs, modals, alerts, and toasts all share a unified visual language without custom CSS.
- **Tailwind still available**: DaisyUI is a Tailwind plugin, so utility classes remain available for layout, spacing, and anything DaisyUI doesn't cover.

## Edit & Delete Features

PATCH `/api/tickets/:id` and DELETE `/api/tickets/:id` were added as enhancements beyond the base spec:

- **PATCH**: Accepts any combination of `title`, `description`, `status`. Validated with a dedicated Zod schema that requires at least one field. The service calls `findById` first to throw a clean 404 if the ticket doesn't exist before attempting the update.
- **DELETE**: Returns 204 No Content. Same pattern — `findById` before delete to surface a 404 rather than a Prisma "record not found" error.
- **Edit modal**: DaisyUI `<dialog>` element controlled via `ref.showModal()` / `ref.close()`. Pre-fills current values on open. Emits `updated` event on success which the parent view applies in-place without a refetch.
- **Delete confirmation**: Inline DaisyUI modal in `TicketDetail.vue`. Confirms before deleting, then emits `deleted` event which triggers `router.push({ name: 'home' })` in the view.

## Toast Notification System

A module-level singleton composable (`useToast.ts`) holds a reactive `Toast[]` array. Because it's module-level (not created per-component), all components share the same state. `ToastContainer.vue` is mounted once in `App.vue` and persists across route changes.

- Each toast has an `id`, `message`, `type`, and auto-removes after 3.5 seconds via `setTimeout`
- `TransitionGroup` provides a slide-in animation from the right
- Triggered for: create ticket, update ticket, delete ticket, retry AI analysis

## Validation Strategy

- **Backend**: Zod schemas validate request body, query params, and URL params at the middleware level
- **Frontend**: Computed properties (`titleError`, `descriptionError`) provide real-time validation matching backend rules
- **Environment**: Zod validates all env variables at startup — app fails fast with clear error if misconfigured

## What's Not Included (and Why)

- **Authentication**: Intentionally omitted. Would add complexity without demonstrating core competencies (API design, AI integration, frontend quality). Noted as improvement area.
- **Tests**: Would add unit tests for services and integration tests for API endpoints. Skipped to prioritize feature completeness within time constraints.
- **Docker**: Would add `docker-compose.yml` for PostgreSQL + app. Skipped because setup instructions with local PostgreSQL are sufficient for evaluation.

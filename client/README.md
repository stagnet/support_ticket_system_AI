# Frontend — Vue 3 + TypeScript + Vite

The client-side application for the Support Ticket System. Built with Vue 3 Composition API, TypeScript, Tailwind CSS v4, and DaisyUI.

## Tech

- **Vue 3** with `<script setup lang="ts">` throughout
- **Vue Router 4** for client-side routing
- **Axios** for API requests (proxied to backend at `/api`)
- **Tailwind CSS v4** + **DaisyUI** for styling and components
- **Vite** for bundling and dev server

## Structure

```
src/
├── api/
│   └── tickets.ts          # Axios client — all API calls
├── assets/
│   └── main.css            # Tailwind + DaisyUI imports
├── composables/
│   ├── useTicket.ts         # Fetch single ticket
│   ├── useTickets.ts        # Fetch ticket list
│   └── useToast.ts          # Singleton toast notification state
├── components/
│   ├── EditTicketModal.vue  # DaisyUI modal for editing a ticket
│   ├── EmptyState.vue       # Empty list placeholder
│   ├── ErrorAlert.vue       # DaisyUI alert-error with optional retry
│   ├── LoadingSpinner.vue   # DaisyUI loading spinner
│   ├── TicketDetail.vue     # Full ticket view with AI analysis, edit, delete
│   ├── TicketForm.vue       # Create ticket form with client-side validation
│   ├── TicketList.vue       # Ticket card list
│   ├── TicketPriorityBadge.vue
│   ├── TicketStatusBadge.vue
│   └── ToastContainer.vue  # Top-right toast notification overlay
├── router/
│   └── index.ts             # Routes: /, /tickets/create, /tickets/:id
├── types/
│   └── ticket.ts            # Shared TS types (Ticket, payloads, etc.)
└── views/
    ├── CreateTicketView.vue
    ├── HomeView.vue
    └── TicketDetailView.vue
```

## Dev Server

```bash
npm run dev
```

Starts on http://localhost:5173. API requests to `/api/*` are proxied to the backend at `http://localhost:3000`.

## Type Check

```bash
npm run type-check
```

## Build

```bash
npm run build
```

## DaisyUI Components Used

| Component | DaisyUI class |
|-----------|--------------|
| Buttons | `btn`, `btn-primary`, `btn-error`, `btn-ghost` |
| Cards | `card`, `card-body`, `card-compact` |
| Badges | `badge`, `badge-neutral`, `badge-info`, `badge-warning`, `badge-success`, `badge-error` |
| Modals | `modal`, `modal-box`, `modal-action` |
| Alerts | `alert`, `alert-error`, `alert-warning`, `alert-success` |
| Forms | `form-control`, `label`, `label-text`, `input`, `textarea`, `select` |
| Loading | `loading`, `loading-spinner` |
| Navbar | `navbar`, `navbar-start`, `navbar-end` |
| Toast | `toast`, `toast-top`, `toast-end` |

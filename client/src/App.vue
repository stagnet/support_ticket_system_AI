<script setup lang="ts">
import { RouterView } from 'vue-router';
import ToastContainer from './components/ToastContainer.vue';
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow-sm border-b border-base-300">
      <div class="navbar-start">
        <router-link :to="{ name: 'home' }" class="flex items-center gap-2 btn btn-ghost text-base font-bold">
          <svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Support Tickets
        </router-link>
      </div>
      <div class="navbar-end">
        <router-link :to="{ name: 'create-ticket' }" class="btn btn-primary btn-sm">
          + New Ticket
        </router-link>
      </div>
    </div>

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <RouterView />
    </main>

    <ToastContainer />
  </div>
</template>

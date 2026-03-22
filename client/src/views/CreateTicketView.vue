<script setup lang="ts">
import TicketForm from '../components/TicketForm.vue';
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-4">
      <router-link :to="{ name: 'home' }" class="btn btn-ghost btn-sm gap-1">
        &larr; Back to tickets
      </router-link>
    </div>
    <h1 class="mb-5 text-2xl font-bold text-base-content">Create Support Ticket</h1>
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body">
        <TicketForm />
      </div>
    </div>
  </div>
</template>

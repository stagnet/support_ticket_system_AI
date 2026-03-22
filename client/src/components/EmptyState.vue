<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <div class="py-16 text-center">
    <svg class="mx-auto h-12 w-12 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h3 class="mt-3 text-sm font-semibold text-base-content">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-base-content/60">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ message?: string }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 gap-4">
    <span class="loading loading-spinner loading-lg text-primary"></span>
    <p v-if="message" class="text-sm text-base-content/60">{{ message }}</p>
  </div>
</template>

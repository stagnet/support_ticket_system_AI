<script setup lang="ts">
defineProps<{ message: string; retryable?: boolean }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div role="alert" class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div class="flex-1">
      <p class="text-sm">{{ message }}</p>
      <button v-if="retryable" @click="$emit('retry')" class="btn btn-ghost btn-xs mt-1">
        Try again
      </button>
    </div>
  </div>
</template>

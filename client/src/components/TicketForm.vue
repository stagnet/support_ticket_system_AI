<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createTicket } from '../api/tickets';
import { useToast } from '../composables/useToast';
import ErrorAlert from './ErrorAlert.vue';

const router = useRouter();
const { showToast } = useToast();

const title = ref('');
const description = ref('');
const submitting = ref(false);
const error = ref<string | null>(null);

const titleError = computed(() => {
  if (title.value.length > 0 && title.value.length < 3)
    return 'Title must be at least 3 characters';
  return null;
});

const descriptionError = computed(() => {
  if (description.value.length > 0 && description.value.length < 10)
    return 'Description must be at least 10 characters';
  return null;
});

const isValid = computed(
  () => title.value.length >= 3 && description.value.length >= 10,
);

async function handleSubmit() {
  if (!isValid.value || submitting.value) return;
  submitting.value = true;
  error.value = null;
  try {
    const ticket = await createTicket({
      title: title.value.trim(),
      description: description.value.trim(),
    });
    showToast('Ticket created successfully', 'success');
    router.push({ name: 'ticket-detail', params: { id: ticket.id } });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      error.value =
        axiosErr.response?.data?.message ?? 'Failed to create ticket';
    } else {
      error.value = 'Failed to create ticket. Please try again.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <ErrorAlert v-if="error" :message="error" />

    <div class="form-control w-full">
      <label class="label" for="title">
        <span class="label-text font-medium">Title</span>
      </label>
      <input
        id="title"
        v-model="title"
        type="text"
        required
        class="input input-bordered w-full"
        :class="{ 'input-error': titleError }"
        placeholder="Brief summary of your issue"
      />
      <label v-if="titleError" class="label">
        <span class="label-text-alt text-error">{{ titleError }}</span>
      </label>
    </div>

    <div class="form-control w-full">
      <label class="label" for="description">
        <span class="label-text font-medium">Description</span>
      </label>
      <textarea
        id="description"
        v-model="description"
        rows="5"
        required
        class="textarea textarea-bordered w-full"
        :class="{ 'textarea-error': descriptionError }"
        placeholder="Describe your issue in detail..."
      />
      <label v-if="descriptionError" class="label">
        <span class="label-text-alt text-error">{{ descriptionError }}</span>
      </label>
    </div>

    <div class="flex items-center justify-between pt-1">
      <p class="text-sm text-base-content/60">
        AI will analyze your ticket after submission
      </p>
      <button
        type="submit"
        :disabled="!isValid || submitting"
        class="btn btn-primary"
      >
        <span v-if="submitting" class="loading loading-spinner loading-sm"></span>
        {{ submitting ? 'Creating & Analyzing...' : 'Create Ticket' }}
      </button>
    </div>
  </form>
</template>

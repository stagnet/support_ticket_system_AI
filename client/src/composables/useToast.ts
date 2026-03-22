import { reactive } from 'vue';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Module-level singleton so toasts persist across route changes
const toasts = reactive<Toast[]>([]);
let nextId = 0;

export function useToast() {
  function showToast(message: string, type: ToastType = 'info', duration = 3500) {
    const id = nextId++;
    toasts.push({ id, message, type });
    setTimeout(() => {
      const idx = toasts.findIndex((t) => t.id === id);
      if (idx !== -1) toasts.splice(idx, 1);
    }, duration);
  }

  return { toasts, showToast };
}

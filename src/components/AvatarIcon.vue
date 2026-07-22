<script setup>
defineProps({
  initials: { type: String, default: 'AD' },
  size: { type: Number, default: 36 },
})
</script>

<template>
  <span
    class="avatar-icon"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      maxWidth: `${size}px`,
      minHeight: `${size}px`,
      maxHeight: `${size}px`,
      flex: `0 0 ${size}px`,
      aspectRatio: '1 / 1',
    }"
    :aria-label="initials"
  >
    <svg viewBox="0 0 32 32" :width="Math.round(size * .72)" :height="Math.round(size * .72)" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="white" stroke-width="2.6" />
      <circle cx="16" cy="12.4" r="4.6" stroke="white" stroke-width="2.6" />
      <path d="M7.8 25.6c1.6-4.1 4.5-6.2 8.2-6.2s6.6 2.1 8.2 6.2" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</template>

<style scoped>
.avatar-icon { align-items: center; background: #9FA6B2; border-radius: 9999px; display: inline-flex; flex: 0 0 auto; justify-content: center; overflow: hidden; }
.avatar-icon svg { display: block; flex-shrink: 0; }
</style>

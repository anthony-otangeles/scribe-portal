<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 20 },
  color: { type: String, default: 'currentColor' },
  strokeWidth: { type: Number, default: 2 },
})

const paths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  inbox: 'M4 4h16v16H4z M4 14h4l2 3h4l2-3h4',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  chart: 'M3 3v18h18 M7 14l4-4 4 4 5-5',
  money: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  bot: 'M12 8V4H8 M4 8h16v11H4z M2 13h2 M20 13h2 M9 13h.01 M15 13h.01 M9 17h6',
  facility: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4',
  practice: 'M4 4v5a4 4 0 0 0 8 0V4 M4 4H2 M12 4h2 M8 13v2a5 5 0 0 0 10 0v-2 M18 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm18 15-6-6-6 6',
  chevronRight: 'm9 18 6-6-6-6',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronsLeft: 'm11 17-5-5 5-5 M18 17l-5-5 5-5',
  chevronsRight: 'm6 17 5-5-5-5 M13 17l5-5-5-5',
  x: 'M18 6 6 18 M6 6l12 12',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  check: 'M20 6 9 17l-5-5',
  checkCheck: 'M18 6 7 17l-5-5 M22 10l-7.5 7.5L13 16',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  filter: 'M4 4h16l-6 7v6l-4 3v-9z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2',
  send: 'm22 2-7 20-4-9-9-4Z M22 2 11 13',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z M12 9v4 M12 17h.01',
  message: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z',
  pulse: 'M3 12h4l2-7 4 14 2-7h6',
  pill: 'm10.5 20.5-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z M7 10l7 7',
  flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3 M7.5 15h9',
  clipboard: 'M9 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3 M9 3h6v4H9z',
  hash: 'M4 9h16 M3 15h16 M10 3 8 21 M16 3l-2 18',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7 M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5',
  external: 'M14 3h7v7 M10 14 21 3 M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5',
  trending: 'M3 17l6-6 4 4 8-8 M14 7h7v7',
  calendar: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z M7 11V7a5 5 0 0 1 10 0v4',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 16v-4 M12 8h.01',
  sparkles: 'm12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2Z M19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8Z M5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7Z',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z',
  more: 'M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2 M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2 M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
}

const pathParts = computed(() => (paths[props.name] || paths.info).split(' M').map((part, index) => index ? `M${part}` : part))
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="app-icon"
  >
    <path v-for="part in pathParts" :key="part" :d="part" />
  </svg>
</template>

<style scoped>
.app-icon { display: block; flex-shrink: 0; }
</style>

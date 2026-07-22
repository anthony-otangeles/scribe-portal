<script setup>
import { computed } from 'vue'
import {
  ClipboardClock,
  FilePlusCorner,
  FlaskConical,
  GitMerge,
  HeartPulse,
  MessageSquareWarning,
  MilkOff,
  NotebookPen,
  PillBottle,
  ScissorsLineDashed,
  SearchCheck,
  ShieldCheck,
  SquareActivity,
  StickyNote,
  Stethoscope,
  Syringe,
  Tags,
  Users,
} from 'lucide-vue-next'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 16 },
  color: { type: String, default: 'currentColor' },
  strokeWidth: { type: Number, default: 2 },
})

const icons = {
  'shield-check': ShieldCheck,
  'message-square-warning': MessageSquareWarning,
  'notebook-pen': NotebookPen,
  'clipboard-clock': ClipboardClock,
  'scissors-line-dashed': ScissorsLineDashed,
  users: Users,
  'git-merge': GitMerge,
  syringe: Syringe,
  'heart-pulse': HeartPulse,
  'milk-off': MilkOff,
  'pill-bottle': PillBottle,
  'square-activity': SquareActivity,
  stethoscope: Stethoscope,
  'flask-conical': FlaskConical,
  'file-plus-corner': FilePlusCorner,
  'sticky-note': StickyNote,
  'search-check': SearchCheck,
  tags: Tags,
}

const icon = computed(() => icons[props.name] || StickyNote)
</script>

<template>
  <component
    :is="icon"
    :size="size"
    :color="color"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  />
</template>

<style scoped>
svg { flex-shrink: 0; }
</style>

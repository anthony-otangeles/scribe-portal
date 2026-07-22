<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { pipelineItems, queueItems, sentItems } from '../data/portalData'

const STORAGE_KEY = 'otangeles-scribe-dashboard-notes-v1'
const MAX_NOTES = 5
const now = ref(new Date())
const notes = ref([])
const isAddingNote = ref(false)
const newNote = ref('')
const newNoteCreatedAt = ref('')
const noteEditor = ref(null)
let clockTimer

const revisionCount = computed(() => queueItems.filter((item) => item.status === 'Provider revision').length)
const statCards = computed(() => [
  { label: 'Scheduled Today', value: queueItems.length, suffix: 'encounters', accent: '#6B7280', icon: 'calendar' },
  { label: 'Active Encounters', value: pipelineItems.length, suffix: 'in progress', accent: '#0081CF', icon: 'edit' },
  { label: 'For Revision', value: revisionCount.value, suffix: 'needs edit', accent: '#C34A7D', icon: 'refresh' },
  { label: 'In Billing', value: sentItems.length, suffix: 'submitted', accent: '#29BB89', icon: 'money' },
])

const currentTimeLabel = computed(() => now.value.toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit', hour12: false,
}))
const currentDateLabel = computed(() => formatDate(now.value))
const clockDigits = computed(() => {
  const time = currentTimeLabel.value.replace(/\s/g, '').split(':')
  const hours = String(time[0] || '00').padStart(2, '0')
  const minutes = String(time[1] || '00').padStart(2, '0')
  return { h1: hours[0], h2: hours[1], m1: minutes[0], m2: minutes[1] }
})

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}-${date.getFullYear()}`
}

function persistNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
}

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      notes.value = Array.isArray(parsed) ? parsed.slice(0, MAX_NOTES) : []
      return
    }
  } catch {
    // Use the starter notes when saved data is malformed.
  }

  notes.value = [
    { id: 'starter-provider', text: 'Dr. Patel prefers medication changes called out clearly in the final review.', createdAt: '2026-07-21T08:15:00.000Z' },
    { id: 'starter-emar', text: 'Verify revised medication doses against the latest eMAR before sending the note back.', createdAt: '2026-07-21T08:25:00.000Z' },
  ]
  persistNotes()
}

function beginNote() {
  if (notes.value.length >= MAX_NOTES) return
  isAddingNote.value = true
  newNote.value = ''
  newNoteCreatedAt.value = new Date().toISOString()
  nextTick(() => noteEditor.value?.focus())
}

function cancelNote() {
  isAddingNote.value = false
  newNote.value = ''
  newNoteCreatedAt.value = ''
}

function saveNote() {
  const text = newNote.value.trim()
  if (!text || notes.value.length >= MAX_NOTES) return
  notes.value = [{ id: `note-${Date.now()}`, text, createdAt: newNoteCreatedAt.value }, ...notes.value]
  persistNotes()
  cancelNote()
}

function removeNote(noteId) {
  notes.value = notes.value.filter((note) => note.id !== noteId)
  persistNotes()
}

function handleEditorKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    saveNote()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelNote()
  }
}

onMounted(() => {
  loadNotes()
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
})

onBeforeUnmount(() => window.clearInterval(clockTimer))
</script>

<template>
  <section class="scribe-dashboard-panel">
    <header class="scribe-dashboard-panel__header">
      <div class="scribe-dashboard-panel__header-copy">
        <h1 class="scribe-dashboard-panel__title">Hi, Anthony!</h1>
        <p class="scribe-dashboard-panel__subtitle">Here is what requires your attention today.</p>
      </div>

      <div class="scribe-dashboard-panel__clock" aria-label="Current time">
        <div class="scribe-dashboard-panel__clock-time">
          <AppIcon name="clock" :size="22" />
          <span class="scribe-clock-face" :aria-label="currentTimeLabel">
            <span class="scribe-clock-digit-wrap"><Transition name="clock-digit" mode="out-in"><span :key="clockDigits.h1" class="scribe-clock-digit">{{ clockDigits.h1 }}</span></Transition></span>
            <span class="scribe-clock-digit-wrap"><Transition name="clock-digit" mode="out-in"><span :key="clockDigits.h2" class="scribe-clock-digit">{{ clockDigits.h2 }}</span></Transition></span>
            <span class="scribe-clock-separator">:</span>
            <span class="scribe-clock-digit-wrap"><Transition name="clock-digit" mode="out-in"><span :key="clockDigits.m1" class="scribe-clock-digit">{{ clockDigits.m1 }}</span></Transition></span>
            <span class="scribe-clock-digit-wrap"><Transition name="clock-digit" mode="out-in"><span :key="clockDigits.m2" class="scribe-clock-digit">{{ clockDigits.m2 }}</span></Transition></span>
          </span>
        </div>
        <p class="scribe-dashboard-panel__clock-date">{{ currentDateLabel }}</p>
      </div>
    </header>

    <section class="scribe-dashboard-panel__stats" aria-label="Scribe workload overview">
      <article v-for="card in statCards" :key="card.label" class="scribe-dashboard-stat" :style="{ '--scribe-stat-accent': card.accent }">
        <div class="scribe-dashboard-stat__icon"><AppIcon :name="card.icon" :size="70" :stroke-width="1" :color="card.accent" /></div>
        <div class="scribe-dashboard-stat__content">
          <p class="scribe-dashboard-stat__label">{{ card.label }}</p>
          <div class="scribe-dashboard-stat__count"><p class="scribe-dashboard-stat__value">{{ card.value }}</p><p class="scribe-dashboard-stat__meta">{{ card.suffix }}</p></div>
        </div>
      </article>
    </section>

    <section class="scribe-dashboard-panel__sticky">
      <header class="scribe-dashboard-panel__sticky-header">
        <div>
          <h2 class="scribe-dashboard-panel__sticky-title">Sticky Notes</h2>
          <p class="scribe-dashboard-panel__sticky-subtitle">Capture key details and mental shortcuts to keep your documentation flow seamless.</p>
        </div>
      </header>

      <div class="scribe-dashboard-panel__sticky-grid">
        <article v-if="isAddingNote" class="scribe-sticky-note scribe-sticky-note--editing">
          <textarea ref="noteEditor" v-model="newNote" class="scribe-sticky-note__editor" rows="5" placeholder="Write a reminder, workflow note, or provider preference..." @keydown="handleEditorKeydown" />
          <div class="scribe-sticky-note__footer">
            <p class="scribe-sticky-note__date">{{ formatDate(newNoteCreatedAt) }}</p>
            <div class="scribe-sticky-note__editor-actions"><button type="button" class="scribe-sticky-note__action" @click="cancelNote">Cancel</button><button type="button" class="scribe-sticky-note__action scribe-sticky-note__action--primary" :disabled="!newNote.trim()" @click="saveNote">Save</button></div>
          </div>
        </article>

        <article v-for="note in notes" :key="note.id" class="scribe-sticky-note">
          <div class="scribe-sticky-note__remove"><button type="button" aria-label="Remove note" @click="removeNote(note.id)"><AppIcon name="x" :size="18" /></button></div>
          <p class="scribe-sticky-note__text">{{ note.text }}</p>
          <p class="scribe-sticky-note__date">{{ formatDate(note.createdAt) }}</p>
        </article>

        <button v-if="notes.length < MAX_NOTES && !isAddingNote" type="button" class="scribe-sticky-note scribe-sticky-note--add" @click="beginNote">
          <div class="scribe-sticky-note__add-copy"><AppIcon name="plus" :size="22" /><span>Add Note</span></div>
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.scribe-dashboard-panel { background: #F7F7F7; display: flex; flex: 1; flex-direction: column; gap: 32px; min-height: 100%; min-width: 0; overflow-y: auto; padding: 32px; }
.scribe-dashboard-panel__header { align-items: flex-start; display: flex; gap: 24px; justify-content: space-between; }
.scribe-dashboard-panel__header-copy { display: flex; flex-direction: column; gap: 8px; }
.scribe-dashboard-panel__title { color: var(--purple); font-size: 30px; font-weight: 700; line-height: 1; margin: 0; }
.scribe-dashboard-panel__subtitle { color: var(--muted); font-size: 14px; line-height: 20px; margin: 0; }
.scribe-dashboard-panel__clock { align-items: flex-end; color: var(--ink); display: flex; flex-direction: column; gap: 8px; }
.scribe-dashboard-panel__clock-time { align-items: center; display: inline-flex; font-size: 30px; font-weight: 700; gap: 8px; line-height: 1; }
.scribe-dashboard-panel__clock-date { color: var(--muted); font-size: 14px; line-height: 20px; margin: 0; }
.scribe-dashboard-panel__stats { display: grid; gap: 24px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.scribe-dashboard-stat { align-items: center; background: #fff; border: 1px solid var(--border); border-left: 3px solid var(--scribe-stat-accent); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1); display: flex; gap: 16px; min-height: 110px; min-width: 0; overflow: hidden; padding: 16px; }
.scribe-dashboard-stat__icon { align-items: center; display: flex; height: 70px; justify-content: center; min-width: 70px; width: 70px; }
.scribe-dashboard-stat__content { display: flex; flex-direction: column; gap: 4px; justify-content: center; min-width: 0; }
.scribe-dashboard-stat__label, .scribe-dashboard-stat__meta, .scribe-dashboard-panel__sticky-subtitle { color: var(--muted); font-size: 12px; line-height: 1.35; margin: 0; }
.scribe-dashboard-stat__label { font-size: 14px; font-weight: 600; line-height: 20px; }
.scribe-dashboard-stat__count { display: flex; flex-direction: column; gap: 10px; }
.scribe-dashboard-stat__value { color: var(--ink); font-size: 24px; font-weight: 700; line-height: normal; margin: 0; }
.scribe-dashboard-panel__sticky { display: flex; flex-direction: column; gap: 20px; }
.scribe-dashboard-panel__sticky-header { align-items: flex-start; display: flex; gap: 24px; justify-content: space-between; }
.scribe-dashboard-panel__sticky-title { color: var(--purple); font-size: 24px; font-weight: 700; line-height: 1; margin: 0; }
.scribe-dashboard-panel__sticky-subtitle { font-size: 14px; line-height: 20px; margin-top: 8px; }
.scribe-dashboard-panel__sticky-grid { display: grid; gap: 20px; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 15px 15px 0 0; }
.scribe-sticky-note { background: #FEF8EB; border: 1px solid #E9C05F; border-radius: 12px; display: flex; flex-direction: column; height: 200px; justify-content: space-between; overflow: visible; padding: 24px; position: relative; text-align: left; }
.scribe-sticky-note__text, .scribe-sticky-note__date { font-size: 14px; line-height: 20px; margin: 0; }
.scribe-sticky-note__text { color: var(--ink); flex: 1; min-height: 0; overflow: auto; padding-right: 28px; white-space: pre-wrap; }
.scribe-sticky-note__date { color: var(--subtle); }
.scribe-sticky-note__footer { align-items: flex-end; display: flex; gap: 12px; justify-content: space-between; }
.scribe-sticky-note__remove { align-items: center; display: inline-flex; height: 30px; justify-content: center; opacity: 0; pointer-events: none; position: absolute; right: -15px; top: -15px; transition: opacity .16s ease; width: 30px; z-index: 2; }
.scribe-sticky-note:hover .scribe-sticky-note__remove, .scribe-sticky-note:focus-within .scribe-sticky-note__remove { opacity: 1; pointer-events: auto; }
.scribe-sticky-note__remove button { align-items: center; background: #F2BD45; border: 0; border-radius: 999px; box-shadow: 0 1px 2px rgba(15,23,42,.12); color: #1F2937; cursor: pointer; display: flex; height: 30px; justify-content: center; padding: 0; transition: background .2s, box-shadow .2s, transform .15s; width: 30px; }
.scribe-sticky-note__remove button:hover { background: #E8AD2C; box-shadow: 0 2px 6px rgba(15,23,42,.18); transform: translateY(-1px); }
.scribe-sticky-note--add { align-items: center; background: transparent; border-color: #99A1AF; border-style: dashed; color: #98A2B3; cursor: pointer; justify-content: center; }
.scribe-sticky-note--editing { box-shadow: 0 0 0 3px rgba(233,192,95,.24); }
.scribe-sticky-note__add-copy { align-items: center; display: flex; flex-direction: column; font-size: 14px; gap: 10px; }
.scribe-sticky-note__editor { background: transparent; border: 0; color: var(--ink); flex: 1; font: inherit; line-height: 20px; padding: 0; resize: none; width: 100%; }
.scribe-sticky-note__editor::placeholder { color: var(--subtle); }
.scribe-sticky-note__editor:focus { outline: 0; }
.scribe-sticky-note__editor-actions { align-items: center; display: flex; gap: 10px; }
.scribe-sticky-note__action { background: transparent; border: 0; color: var(--muted); cursor: pointer; font-size: 13px; font-weight: 600; padding: 0; }
.scribe-sticky-note__action--primary { color: var(--mint); }
.scribe-sticky-note__action:disabled { cursor: not-allowed; opacity: .45; }
.scribe-clock-face { align-items: center; display: inline-flex; font-variant-numeric: tabular-nums; }
.scribe-clock-digit-wrap { align-items: center; display: inline-flex; overflow: hidden; }
.scribe-clock-digit { display: inline-block; line-height: inherit; }
.scribe-clock-separator { animation: clock-sep-blink 2s step-start infinite; }
.clock-digit-enter-active { transition: transform .28s cubic-bezier(.34,1.4,.64,1), opacity .2s ease; }
.clock-digit-leave-active { transition: transform .18s ease-in, opacity .18s ease-in; }
.clock-digit-enter-from { opacity: 0; transform: translateY(100%); }
.clock-digit-leave-to { opacity: 0; transform: translateY(-100%); }
@keyframes clock-sep-blink { 0%, 100% { opacity: 1; } 50% { opacity: .15; } }
@media (max-width: 1280px) { .scribe-dashboard-panel__stats, .scribe-dashboard-panel__sticky-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) {
  .scribe-dashboard-panel { padding: 24px 16px; }
  .scribe-dashboard-panel__header { align-items: flex-start; flex-direction: column; }
  .scribe-dashboard-panel__clock { align-items: flex-start; }
  .scribe-dashboard-panel__stats, .scribe-dashboard-panel__sticky-grid { grid-template-columns: 1fr; }
  .scribe-sticky-note__footer { align-items: flex-start; flex-direction: column; }
  .scribe-sticky-note__remove { opacity: 1; pointer-events: auto; }
}
</style>

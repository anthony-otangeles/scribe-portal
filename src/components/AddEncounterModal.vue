<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import SearchableSelect from './SearchableSelect.vue'
import { pipelineItems, queueItems, sentItems } from '../data/portalData'
import { visitTypes } from '../data/visitTypes'

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue', 'create'])
const sourceItems = [...queueItems, ...pipelineItems, ...sentItems]

const form = reactive({
  medicalPractice: '',
  facility: '',
  visit: '',
  provider: '',
  patient: '',
  clinicalNotes: '',
})

const practices = [...new Set(sourceItems.map((item) => item.medicalPractice).filter(Boolean))].sort()
const facilities = computed(() => [...new Set(sourceItems
  .filter((item) => item.medicalPractice === form.medicalPractice)
  .map((item) => item.facility)
  .filter(Boolean))].sort())
const contextItems = computed(() => sourceItems.filter((item) => item.medicalPractice === form.medicalPractice && item.facility === form.facility))
const providerOptions = computed(() => {
  const contextual = [...new Set(contextItems.value.map((item) => item.provider).filter(Boolean))].sort()
  if (contextual.length) return contextual
  return [...new Set(sourceItems.filter((item) => item.medicalPractice === form.medicalPractice).map((item) => item.provider).filter(Boolean))].sort()
})
const patientOptions = computed(() => [...new Set(contextItems.value.map((item) => item.patient).filter(Boolean))].sort())
const canSubmit = computed(() => Object.values(form).every((value) => String(value).trim()))

watch(() => props.modelValue, (open) => {
  if (open) resetForm()
})

watch(() => form.medicalPractice, () => {
  form.facility = ''
  form.provider = ''
  form.patient = ''
})

watch(() => form.facility, () => {
  form.provider = ''
  form.patient = ''
})

function resetForm() {
  Object.assign(form, { medicalPractice: '', facility: '', visit: '', provider: '', patient: '', clinicalNotes: '' })
}

function close() {
  emit('update:modelValue', false)
}

function buildEncounterId() {
  const date = new Date()
  const part = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const time = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`
  return `ENCT-${part}-${time}`
}

function submit() {
  if (!canSubmit.value) return
  emit('create', {
    id: buildEncounterId(),
    patient: form.patient.trim(),
    medicalPractice: form.medicalPractice,
    facility: form.facility,
    visit: form.visit,
    provider: form.provider.trim(),
    clinicalNotes: form.clinicalNotes.trim(),
    stage: 'Intake & evidence',
    detail: 'Records Agent is structuring the clinical notes and linking available chart evidence',
    progress: 8,
    eta: 'About 6 min',
    tone: 'blue',
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Assigned Scribe',
  })
  close()
}

function handleKeydown(event) {
  if (props.modelValue && event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div v-if="modelValue" class="add-encounter-backdrop" @click.self="close">
    <section class="add-encounter-modal" role="dialog" aria-modal="true" aria-labelledby="add-encounter-title">
      <header>
        <div><h2 id="add-encounter-title">Add New Encounter</h2><p>Provide the clinical source details the agents need to draft this encounter.</p></div>
        <button type="button" aria-label="Close Add Encounter" @click="close"><AppIcon name="x" :size="20" /></button>
      </header>

      <div class="agent-route-note"><span><AppIcon name="bot" :size="18" /></span><p><strong>Agents start after submission</strong><small>The encounter will enter In-Pipeline at Intake &amp; evidence, then move to Final Review after agent QA.</small></p></div>

      <form id="add-encounter-form" class="add-encounter-form" @submit.prevent="submit">
        <div class="add-encounter-form__selectors">
          <div class="add-encounter-field"><span>Medical Practice <b>*</b></span><SearchableSelect v-model="form.medicalPractice" :options="practices" placeholder="Select a Medical Practice" search-placeholder="Search medical practices..." aria-label="Medical Practice" required teleport-to-body /></div>
          <div class="add-encounter-field"><span>Facility <b>*</b></span><SearchableSelect v-model="form.facility" :options="facilities" :disabled="!form.medicalPractice" :placeholder="form.medicalPractice ? 'Select a Facility' : 'Select a Medical Practice first'" search-placeholder="Search facilities..." aria-label="Facility" required teleport-to-body /></div>
          <div class="add-encounter-field"><span>Provider <b>*</b></span><SearchableSelect v-model="form.provider" :options="providerOptions" :disabled="!form.facility" :placeholder="form.facility ? 'Select a Provider' : 'Select a Facility first'" search-placeholder="Search providers..." aria-label="Provider" required teleport-to-body /></div>
          <div class="add-encounter-field"><span>Patient <b>*</b></span><SearchableSelect v-model="form.patient" :options="patientOptions" :disabled="!form.facility" :placeholder="form.facility ? 'Select a Patient' : 'Select a Facility first'" search-placeholder="Search patients..." aria-label="Patient" required teleport-to-body /></div>
        </div>
        <div class="add-encounter-form__clinical">
          <div class="add-encounter-field"><span>Visit Type <b>*</b></span><SearchableSelect v-model="form.visit" :options="visitTypes" placeholder="Select a Visit Type" search-placeholder="Search visit types..." aria-label="Visit Type" required teleport-to-body /></div>
          <label class="add-encounter-field add-encounter-form__notes"><span>Clinical Notes <b>*</b></span><textarea v-model="form.clinicalNotes" rows="6" placeholder="Enter the provider’s clinical notes, encounter summary, relevant findings, and any instructions the agents should use…" required /><small>These notes become source evidence for the shared clinical understanding.</small></label>
        </div>
      </form>

      <footer><button type="button" class="button button--secondary" @click="close">Cancel</button><button type="submit" form="add-encounter-form" class="button add-encounter-submit" :disabled="!canSubmit"><AppIcon name="plus" :size="16" /> Add Encounter</button></footer>
    </section>
  </div>
</template>

<style scoped>
.add-encounter-backdrop { align-items: center; background: rgba(28,25,46,.45); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 120; }
.add-encounter-modal { background: #fff; border-radius: 14px; box-shadow: 0 24px 70px rgba(28,25,46,.24); max-height: calc(100dvh - 40px); max-width: 900px; overflow-y: auto; width: 100%; }
.add-encounter-modal > header { align-items: flex-start; border-bottom: 1px solid var(--border); display: flex; gap: 18px; justify-content: space-between; padding: 22px 24px 18px; }
.add-encounter-modal > header h2 { color: var(--ink); font-size: 22px; line-height: 29px; margin: 0; }
.add-encounter-modal > header p { color: var(--muted); font-size: 13px; line-height: 19px; margin: 4px 0 0; }
.add-encounter-modal > header button { align-items: center; background: #F4F5F7; border: 0; border-radius: 50%; color: var(--ink); cursor: pointer; display: flex; flex: 0 0 38px; height: 38px; justify-content: center; padding: 0; width: 38px; }
.agent-route-note { align-items: flex-start; background: #F7F4FC; border: 1px solid #E3D8F2; border-radius: 9px; display: grid; gap: 10px; grid-template-columns: 36px minmax(0, 1fr); margin: 18px 24px 0; padding: 12px; }
.agent-route-note > span { align-items: center; background: #fff; border-radius: 8px; color: var(--purple); display: flex; height: 36px; justify-content: center; width: 36px; }
.agent-route-note p { display: flex; flex-direction: column; gap: 3px; margin: 0; }
.agent-route-note strong { color: var(--purple-dark); font-size: 13px; }
.agent-route-note small { color: var(--muted); font-size: 12px; line-height: 18px; }
.add-encounter-form { align-items: stretch; display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); padding: 20px 24px 24px; }
.add-encounter-form__selectors { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.add-encounter-form__clinical { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.add-encounter-field { color: var(--ink); display: flex; flex-direction: column; font-size: 13px; font-weight: 750; gap: 7px; min-width: 0; width: 100%; }
.add-encounter-field > span b { color: #C9302C; }
.add-encounter-form input, .add-encounter-form select, .add-encounter-form textarea { background: #fff; border: 1px solid #D7DAE1; border-radius: 7px; color: var(--ink); font-size: 14px; font-weight: 500; outline: 0; width: 100%; }
.add-encounter-form input, .add-encounter-form select { height: 43px; padding: 0 11px; }
.add-encounter-form textarea { line-height: 21px; min-height: 135px; padding: 10px 11px; resize: vertical; }
.add-encounter-form input:focus, .add-encounter-form select:focus, .add-encounter-form textarea:focus { border-color: #A98DDA; box-shadow: 0 0 0 3px rgba(103,86,140,.1); }
.add-encounter-form input:disabled, .add-encounter-form select:disabled { background: #F3F4F6; color: var(--subtle); cursor: not-allowed; }
.add-encounter-field > small { color: var(--muted); font-size: 11.5px; font-weight: 500; line-height: 16px; }
.add-encounter-form__notes { flex: 1; grid-column: auto; }
.add-encounter-form__notes textarea { flex: 1; min-height: 0; }
.add-encounter-modal > footer { align-items: center; background: #FAFAFB; border-top: 1px solid var(--border); display: flex; gap: 9px; justify-content: flex-end; padding: 14px 24px; }
.add-encounter-modal > footer .button { min-height: 42px; }
.add-encounter-submit { background: var(--mint); color: #fff; }
@media (max-width: 640px) {
  .add-encounter-backdrop { align-items: flex-end; padding: 0; }
  .add-encounter-modal { border-radius: 16px 16px 0 0; max-height: 94dvh; }
  .add-encounter-modal > header { padding: 18px 16px 15px; }
  .agent-route-note { margin: 14px 16px 0; }
  .add-encounter-form { gap: 16px; grid-template-columns: 1fr; padding: 17px 16px 20px; }
  .add-encounter-form__notes textarea { min-height: 160px; }
  .add-encounter-modal > footer { bottom: 0; padding: 12px 16px; position: sticky; }
  .add-encounter-modal > footer .button { flex: 1; }
}
</style>

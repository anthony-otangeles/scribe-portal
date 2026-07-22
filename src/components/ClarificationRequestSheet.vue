<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

defineProps({
  sectionLabel: { type: String, required: true },
  provider: { type: String, required: true },
  medicalPractice: { type: String, required: true },
})

const emit = defineEmits(['close', 'submit'])
const question = ref('')

function submit() {
  const value = question.value.trim()
  if (!value) return
  emit('submit', value)
}
</script>

<template>
  <div class="clarification-scrim" @click.self="emit('close')">
    <section class="clarification-sheet" role="dialog" aria-modal="true" aria-labelledby="clarification-title">
      <div class="clarification-sheet__handle" />
      <header>
        <h2 id="clarification-title">Request clarification · {{ sectionLabel }}</h2>
        <button type="button" aria-label="Close clarification request" @click="emit('close')"><AppIcon name="x" :size="20" /></button>
      </header>
      <p class="clarification-summary">This request applies only to {{ sectionLabel }}. The encounter will be locked while Otangeles Operations obtains an answer from the submitted provider.</p>
      <div class="clarification-route">
        <span><AppIcon name="users" :size="18" /></span>
        <div><small>Delivery route</small><strong>Otangeles Operations → {{ provider }}</strong><p>{{ medicalPractice }} · External providers do not need a Scribe Portal account.</p></div>
      </div>
      <label class="clarification-field"><span>Question for provider</span><textarea v-model="question" autofocus placeholder="Ask one specific clinical question and include the conflicting or missing fact…" /></label>
      <p class="clarification-help"><AppIcon name="info" :size="14" /> Operations will contact the provider through the practice or facility’s approved channel and attach the response here.</p>
      <button type="button" class="clarification-submit" :disabled="!question.trim()" @click="submit"><AppIcon name="send" :size="15" /> Route clarification request</button>
    </section>
  </div>
</template>

<style scoped>
.clarification-scrim { align-items: flex-end; background: rgba(28,25,46,.42); display: flex; inset: 0; justify-content: center; padding: 10px; position: fixed; z-index: 130; }
.clarification-sheet { background: #fff; border-radius: 18px 18px 12px 12px; box-shadow: 0 18px 50px rgba(28,25,46,.2); max-height: calc(100vh - 20px); max-width: 560px; overflow-y: auto; padding: 8px 18px 20px; width: 100%; }
.clarification-sheet__handle { background: #D8DAE1; border-radius: 99px; height: 4px; margin: 0 auto 8px; width: 40px; }
.clarification-sheet > header { align-items: center; display: flex; gap: 12px; justify-content: space-between; }
.clarification-sheet > header h2 { font-size: 21px; line-height: 28px; margin: 0; }
.clarification-sheet > header button { align-items: center; background: #F5F5F8; border: 0; border-radius: 50%; color: var(--ink); cursor: pointer; display: flex; flex: 0 0 40px; height: 40px; justify-content: center; padding: 0; width: 40px; }
.clarification-summary { background: #F7F7FA; border-radius: 8px; color: var(--muted); font-size: 13px; line-height: 19px; margin: 12px 0 0; padding: 12px; }
.clarification-route { align-items: flex-start; background: #FBF9FF; border: 1px solid #DED6F7; border-radius: 10px; display: grid; gap: 10px; grid-template-columns: 34px minmax(0, 1fr); margin-top: 12px; padding: 12px; }
.clarification-route > span { align-items: center; background: var(--purple-soft); border-radius: 8px; color: var(--purple); display: flex; height: 34px; justify-content: center; width: 34px; }
.clarification-route > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.clarification-route small { color: var(--purple); font-size: 11px; font-weight: 850; letter-spacing: .045em; text-transform: uppercase; }
.clarification-route strong { color: var(--ink); font-size: 13px; line-height: 18px; }
.clarification-route p { color: var(--muted); font-size: 12px; line-height: 17px; margin: 2px 0 0; }
.clarification-field { color: var(--ink); display: grid; font-size: 12px; font-weight: 750; gap: 7px; margin-top: 16px; }
.clarification-field textarea { background: #fff; border: 1px solid #D9DCE5; border-radius: 9px; color: var(--ink); font: inherit; font-size: 14px; font-weight: 500; line-height: 1.45; min-height: 148px; padding: 11px 12px; resize: vertical; width: 100%; }
.clarification-field textarea:focus { border-color: #A98DDA; box-shadow: 0 0 0 3px rgba(103,86,140,.1); outline: 0; }
.clarification-help { align-items: flex-start; color: var(--muted); display: flex; font-size: 12px; gap: 7px; line-height: 17px; margin: 10px 0 0; }
.clarification-help :deep(svg) { color: var(--purple); flex-shrink: 0; margin-top: 1px; }
.clarification-submit { align-items: center; background: var(--purple); border: 1px solid var(--purple); border-radius: 10px; color: #fff; cursor: pointer; display: flex; font-size: 13px; font-weight: 750; gap: 8px; justify-content: center; margin-top: 16px; min-height: 50px; padding: 10px 16px; width: 100%; }
.clarification-submit:disabled { cursor: not-allowed; opacity: .46; }
</style>

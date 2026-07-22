<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { formatPatientName } from '../utils/patientName'

const props = defineProps({
  item: { type: Object, required: true },
  mode: { type: String, default: 'queue' },
  featured: { type: Boolean, default: false },
})

const emit = defineEmits(['action'])
const detailsOpen = ref(false)

const statusLabel = computed(() => props.mode === 'queue' ? props.item.status : props.item.stage)
const tone = computed(() => {
  if (props.item.tone) return props.item.tone
  if (props.item.status === 'QA flags') return 'red'
  if (props.item.status === 'Agent question') return 'gold'
  if (props.item.status === 'Provider revision') return 'red'
  return 'green'
})

const actionLabel = computed(() => {
  if (props.item.revision) return 'Review revision'
  return props.featured ? 'Open final review' : 'Review final'
})

function toggleDetails() {
  detailsOpen.value = !detailsOpen.value
}

</script>

<template>
  <article
    v-if="mode !== 'queue'"
    class="status-encounter-card"
    :class="[`is-${mode}`, { 'is-expanded': detailsOpen }]"
    :aria-expanded="detailsOpen"
    tabindex="0"
    @click="toggleDetails"
    @keydown.self.enter.prevent="toggleDetails"
    @keydown.self.space.prevent="toggleDetails"
  >
    <div class="status-encounter-card__identity">
      <div><h3>{{ formatPatientName(item.patient, item.sex) }}</h3><span class="mono">{{ item.id }}</span></div>
    </div>
    <div class="status-encounter-card__state">
      <span class="chip" :class="`chip--${tone}`">{{ statusLabel }}</span>
      <span class="card-expand-cue">{{ detailsOpen ? 'Hide details' : 'View details' }} <AppIcon :name="detailsOpen ? 'chevronUp' : 'chevronDown'" :size="13" /></span>
    </div>
    <div class="status-encounter-card__visit"><span><small><AppIcon name="clipboard" :size="12" /> Visit Type</small><strong :title="item.visit">{{ item.visit }}</strong></span></div>
    <time><small>{{ mode === 'pipeline' ? 'ETA' : 'Updated' }}</small><strong><AppIcon name="clock" :size="12" /> {{ mode === 'pipeline' ? item.eta : item.updated }}</strong></time>
    <Transition name="card-details">
      <div v-if="detailsOpen" class="encounter-details-panel">
        <div class="encounter-details-panel__description"><small>Status Details</small><p>{{ item.detail }}</p></div>
        <div><small>Medical Practice</small><strong>{{ item.medicalPractice }}</strong></div>
        <div><small>Facility</small><strong>{{ item.facility }}</strong></div>
        <div v-if="item.clarification"><small>Submitted Provider</small><strong>{{ item.clarification.provider }}</strong></div>
        <div v-if="item.clarification"><small>Delivery Route</small><strong>{{ item.clarification.routedVia }} → provider practice</strong></div>
      </div>
    </Transition>
  </article>

  <article
    v-else
    class="queue-encounter-card"
    :class="{ 'is-featured': featured, 'is-provider-revision': item.revision, 'is-expanded': detailsOpen }"
    :aria-expanded="detailsOpen"
    tabindex="0"
    @click="toggleDetails"
    @keydown.self.enter.prevent="toggleDetails"
    @keydown.self.space.prevent="toggleDetails"
  >
    <div class="queue-encounter-card__identity">
      <div><h3>{{ formatPatientName(item.patient, item.sex) }}</h3><span class="mono">{{ item.id }}</span></div>
    </div>

    <div class="queue-encounter-card__summary">
      <div><span class="chip" :class="`chip--${tone}`">{{ statusLabel }}</span><b v-if="item.revision">{{ item.revision.sectionLabel }}</b></div>
      <span class="card-expand-cue">{{ detailsOpen ? 'Hide details' : 'View details' }} <AppIcon :name="detailsOpen ? 'chevronUp' : 'chevronDown'" :size="13" /></span>
    </div>

    <div class="queue-encounter-card__visit"><span><small><AppIcon name="clipboard" :size="12" /> Visit Type</small><strong :title="item.visit">{{ item.visit }}</strong></span></div>

    <div class="queue-encounter-card__actions">
      <span :class="`is-${item.dueTone}`"><AppIcon name="clock" :size="12" /> {{ item.due }} · {{ item.effort }}</span>
      <div><button type="button" class="button" :class="item.revision ? 'button--revision' : 'button--primary'" @click.stop="emit('action')">{{ actionLabel }} <AppIcon name="chevronRight" :size="14" /></button></div>
    </div>
    <Transition name="card-details">
      <div v-if="detailsOpen" class="encounter-details-panel">
        <div class="encounter-details-panel__description"><small>Status Details</small><p>{{ item.note }}</p></div>
        <div><small>Medical Practice</small><strong>{{ item.medicalPractice }}</strong></div>
        <div><small>Facility</small><strong>{{ item.facility }}</strong></div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.status-encounter-card { align-items: center; background: #fff; border: 1px solid var(--border); border-radius: 9px; cursor: pointer; display: grid; gap: 14px; grid-template-areas: 'identity state visit time'; grid-template-columns: minmax(0, .9fr) minmax(0, .8fr) minmax(240px, 1.2fr) 165px; grid-template-rows: 64px; padding: 15px 16px; transition: border-color 140ms, box-shadow 140ms; }
.status-encounter-card:hover, .status-encounter-card:focus-visible { border-color: #D7CBEA; box-shadow: 0 5px 16px rgba(28,25,46,.055); outline: 0; }
.status-encounter-card.is-expanded { border-color: #CDBCEB; }
.status-encounter-card__identity, .status-encounter-card__state { min-width: 0; }
.status-encounter-card__identity { grid-area: identity; }
.status-encounter-card__identity > div { align-items: flex-start; display: flex; flex-direction: column; gap: 2px; }
.status-encounter-card__identity h3 { color: var(--ink); font-size: 16px; letter-spacing: -.01em; line-height: 21px; margin: 0; }
.status-encounter-card__identity .mono { color: var(--muted); font-size: 12px; line-height: 17px; }
.status-encounter-card__identity > small { color: var(--muted); display: block; font-size: 11.5px; line-height: 16px; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.status-encounter-card__state { align-items: flex-start; display: flex; flex-direction: column; gap: 7px; grid-area: state; }
.status-encounter-card__visit { align-items: center; color: var(--subtle); display: flex; gap: 7px; grid-area: visit; min-width: 0; }
.status-encounter-card__visit span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.status-encounter-card__visit small, .status-encounter-card > time > small { color: var(--subtle); font-size: 11.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.status-encounter-card__visit small { align-items: center; display: flex; gap: 5px; }
.status-encounter-card__visit strong { color: var(--ink); display: block; font-size: 12.5px; line-height: 17px; min-height: 17px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.status-encounter-card > time { align-items: flex-end; display: flex; flex-direction: column; gap: 4px; grid-area: time; white-space: nowrap; }
.status-encounter-card > time > strong { align-items: center; color: var(--muted); display: flex; font-size: 12.5px; gap: 5px; }
.status-encounter-card .chip, .queue-encounter-card .chip { font-size: 12px; line-height: 20px; padding: 4px 10px; }
.queue-encounter-card { align-items: center; background: #fff; border: 1px solid var(--border); border-radius: 9px; cursor: pointer; display: grid; gap: 14px; grid-template-areas: 'identity summary visit actions'; grid-template-columns: minmax(0, .9fr) minmax(0, .8fr) minmax(240px, 1.2fr) 165px; grid-template-rows: 64px; padding: 15px 16px; transition: border-color 140ms, box-shadow 140ms; }
.queue-encounter-card:hover { border-color: #D7CBEA; box-shadow: 0 5px 16px rgba(28,25,46,.055); }
.queue-encounter-card.is-featured { border-color: #CDBCEB; box-shadow: inset 3px 0 0 var(--purple); }
.queue-encounter-card.is-provider-revision { border-color: #E5A3A0; box-shadow: inset 3px 0 0 #C9302C; }
.queue-encounter-card.is-expanded { border-color: #BFA9E1; box-shadow: inset 3px 0 0 var(--purple), 0 5px 16px rgba(28,25,46,.055); }
.queue-encounter-card__identity, .queue-encounter-card__summary { min-width: 0; }
.queue-encounter-card__identity { grid-area: identity; }
.queue-encounter-card__identity > div { align-items: flex-start; display: flex; flex-direction: column; gap: 2px; }
.queue-encounter-card__identity h3 { color: var(--ink); font-size: 16px; letter-spacing: -.01em; line-height: 21px; margin: 0; }
.queue-encounter-card__identity .mono { color: var(--muted); font-size: 12px; line-height: 17px; }
.queue-encounter-card__identity > small { color: var(--muted); display: block; font-size: 11.5px; line-height: 16px; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.queue-encounter-card__summary { grid-area: summary; }
.queue-encounter-card__summary > div { align-items: center; display: flex; flex-wrap: wrap; gap: 5px; }
.queue-encounter-card__summary > div > b { color: #B92D29; font-size: 11px; }
.card-expand-cue { align-items: center; color: var(--purple); display: flex; font-size: 11.5px; font-weight: 750; gap: 4px; margin-top: 7px; }
.queue-encounter-card__visit { align-items: center; color: var(--subtle); display: flex; gap: 7px; grid-area: visit; min-width: 0; }
.queue-encounter-card__visit span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.queue-encounter-card__visit small { align-items: center; color: var(--subtle); display: flex; font-size: 11.5px; font-weight: 800; gap: 5px; letter-spacing: .04em; text-transform: uppercase; }
.queue-encounter-card__visit strong { color: var(--ink); display: block; font-size: 12.5px; line-height: 17px; min-height: 17px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.queue-encounter-card__actions { align-items: flex-end; display: flex; flex-direction: column; gap: 8px; grid-area: actions; }
.queue-encounter-card__actions > span { align-items: center; color: var(--muted); display: flex; font-size: 12.5px; font-weight: 700; gap: 5px; white-space: nowrap; }
.queue-encounter-card__actions > span.is-danger { color: #C9302C; }
.queue-encounter-card__actions > span.is-warning { color: #9A6912; }
.queue-encounter-card__actions > div { align-items: center; display: flex; gap: 5px; }
.queue-encounter-card__actions .button { inline-size: max-content; max-inline-size: 100%; min-height: 34px; padding: 0 10px; white-space: nowrap; }
.queue-encounter-card__actions .button--revision { background: #FDECEC; border: 1px solid #E8B5B2; color: #B92D29; }
.encounter-details-panel { background: #FBFAFD; border: 1px solid #E8E2F1; border-radius: 7px; cursor: default; display: grid; gap: 12px 24px; grid-column: 1 / -1; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 14px; }
.encounter-details-panel > div { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.encounter-details-panel small { color: var(--muted); font-size: 11.5px; font-weight: 800; letter-spacing: .035em; text-transform: uppercase; }
.encounter-details-panel strong { color: var(--ink); font-size: 13px; line-height: 19px; overflow-wrap: anywhere; }
.encounter-details-panel__description { border-bottom: 1px solid #E8E2F1; grid-column: 1 / -1; padding-bottom: 12px; }
.encounter-details-panel__description p { color: var(--ink); font-size: 13px; line-height: 20px; margin: 2px 0 0; }
.card-details-enter-active, .card-details-leave-active { transition: opacity 150ms, transform 150ms; }
.card-details-enter-from, .card-details-leave-to { opacity: 0; transform: translateY(-4px); }
.encounter-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 1px 3px rgba(28,25,46,.035); display: flex; flex-direction: column; min-height: 320px; padding: 18px; transition: border-color 140ms, box-shadow 140ms, transform 140ms; }
.encounter-card:hover { border-color: #D7CBEA; box-shadow: 0 8px 22px rgba(28,25,46,.07); transform: translateY(-1px); }
.encounter-card.is-featured { border-color: #CDBCEB; box-shadow: 0 8px 26px rgba(103,86,140,.1); min-height: 286px; padding: 21px 22px; }
.encounter-card.is-provider-revision { border-color: #E5A3A0; box-shadow: 0 5px 18px rgba(163,46,43,.08); }
.encounter-card__header { align-items: center; display: flex; gap: 10px; justify-content: space-between; }
.encounter-card__status { align-items: center; display: flex; flex-wrap: wrap; gap: 7px; }
.priority-label { align-items: center; color: var(--purple); display: flex; font-size: 10px; font-weight: 800; gap: 5px; letter-spacing: .07em; text-transform: uppercase; }
.encounter-card__due { align-items: center; color: var(--muted); display: flex; flex-shrink: 0; font-size: 11px; font-weight: 700; gap: 5px; }
.encounter-card__due.is-danger { color: #C9302C; }
.encounter-card__due.is-warning { color: #9A6912; }
.encounter-card__identity { align-items: baseline; display: flex; flex-wrap: wrap; gap: 8px 11px; margin-top: 17px; }
.encounter-card__identity h3 { color: var(--ink); font-size: 20px; letter-spacing: -.02em; margin: 0; }
.is-featured .encounter-card__identity h3 { color: var(--purple); font-size: 24px; }
.encounter-card__identity > span { color: var(--subtle); font-size: 10.5px; }
.practice-line { align-items: center; background: #F7F4FC; border: 1px solid #EAE2F7; border-radius: 8px; display: flex; gap: 9px; margin-top: 14px; padding: 10px 11px; }
.practice-line > span { align-items: center; background: #fff; border-radius: 6px; color: var(--purple); display: flex; height: 30px; justify-content: center; width: 30px; }
.practice-line > div, .encounter-card__details span, .provider-meta span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.practice-line small, .encounter-card__details small, .provider-meta small { color: var(--subtle); font-size: 8.5px; font-weight: 800; letter-spacing: .055em; text-transform: uppercase; }
.practice-line strong { color: var(--purple-dark); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.encounter-card__details { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 13px; }
.encounter-card__details > div { align-items: flex-start; color: var(--subtle); display: flex; gap: 7px; min-width: 0; }
.encounter-card__details > div > svg { margin-top: 2px; }
.encounter-card__details strong { color: var(--ink); font-size: 11.5px; line-height: 16px; }
.encounter-card__summary { color: var(--muted); font-size: 12px; line-height: 18px; margin: 14px 0 0; }
.revision-request { align-items: flex-start; background: #FFF5F5; border: 1px solid #E8B5B2; border-radius: 9px; display: grid; gap: 9px; grid-template-columns: 30px minmax(0, 1fr); margin-top: 14px; padding: 11px; }
.revision-request > span { align-items: center; background: #fff; border-radius: 7px; color: #C9302C; display: flex; height: 30px; justify-content: center; width: 30px; }
.revision-request > div { display: flex; flex-direction: column; min-width: 0; }
.revision-request small { color: #C9302C; font-size: 8.5px; font-weight: 800; letter-spacing: .055em; text-transform: uppercase; }
.revision-request strong { color: var(--ink); font-size: 12.5px; margin-top: 2px; }
.revision-request p { color: var(--muted); font-size: 11.5px; line-height: 17px; margin: 5px 0 0; }
.revision-request em { align-items: center; color: #218C69; display: flex; font-size: 9.5px; font-style: normal; font-weight: 800; gap: 4px; grid-column: 2; }
.encounter-card__progress { margin-top: 15px; }
.encounter-card__progress > div { align-items: center; display: flex; justify-content: space-between; }
.encounter-card__progress > div span { color: var(--muted); font-size: 10px; font-weight: 700; }
.encounter-card__progress > div strong { color: var(--purple); font-size: 12px; }
.encounter-card__progress > i { background: #ECEAF0; border-radius: 999px; display: block; height: 6px; margin-top: 7px; overflow: hidden; }
.encounter-card__progress > i b { background: var(--mint); display: block; height: 100%; }
.encounter-card__progress > small { color: var(--subtle); display: block; font-size: 9px; margin-top: 6px; }
.encounter-card__footer { align-items: center; border-top: 1px solid #EEF0F2; display: flex; gap: 9px; justify-content: space-between; margin-top: auto; padding-top: 15px; }
.effort-label { align-items: center; color: var(--muted); display: flex; font-size: 10.5px; font-weight: 700; gap: 5px; }
.encounter-card__footer .button { min-height: 36px; padding: 0 13px; }
.encounter-card__footer .button--revision { background: #FDECEC; border: 1px solid #E8B5B2; color: #B92D29; }
.encounter-card__footer .button--revision:hover { background: #F9DDDC; }
.provider-meta { align-items: center; display: flex; gap: 7px; }
.provider-meta > svg { color: var(--purple); }
.provider-meta strong { font-size: 11.5px; }
.provider-state { align-items: center; color: #218C69; display: flex; font-size: 10px; font-weight: 700; gap: 5px; text-align: right; }
@media (max-width: 940px) {
  .status-encounter-card { grid-template-areas: 'identity state time'; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr) 165px; }
  .status-encounter-card__visit { display: none; }
  .queue-encounter-card { grid-template-areas: 'identity summary actions'; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr) 165px; }
  .queue-encounter-card__visit { display: none; }
}
@media (max-width: 620px) {
  .status-encounter-card { align-items: flex-start; gap: 10px; grid-template-areas: 'identity' 'state' 'visit' 'time'; grid-template-columns: 1fr; grid-template-rows: auto; padding: 13px; }
  .status-encounter-card__identity > small { white-space: normal; }
  .status-encounter-card__visit { display: flex; }
  .status-encounter-card > time { align-items: flex-start; }
  .queue-encounter-card { align-items: flex-start; gap: 10px; grid-template-areas: 'identity' 'summary' 'visit' 'actions'; grid-template-columns: 1fr; grid-template-rows: auto; padding: 13px; }
  .queue-encounter-card__visit { display: flex; }
  .queue-encounter-card__actions { align-items: center; flex-direction: row; justify-content: space-between; width: 100%; }
  .queue-encounter-card__actions > div { margin-left: auto; }
  .queue-encounter-card__identity > small { white-space: normal; }
  .encounter-details-panel { grid-template-columns: 1fr; }
  .encounter-card, .encounter-card.is-featured { min-height: 0; padding: 17px; }
  .encounter-card__details { grid-template-columns: 1fr; }
  .encounter-card__footer { align-items: stretch; flex-wrap: wrap; }
  .encounter-card__footer .button { flex: 1 1 100%; width: 100%; }
  .provider-state { margin-left: auto; max-width: 170px; }
}
@media (prefers-reduced-motion: reduce) {
  .encounter-card { transition: none; }
  .encounter-card:hover { transform: none; }
}
</style>

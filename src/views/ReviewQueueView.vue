<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import AddEncounterModal from '../components/AddEncounterModal.vue'
import EncounterCard from '../components/EncounterCard.vue'
import SearchableSelect from '../components/SearchableSelect.vue'
import { pipelineItems, queueItems, sentItems } from '../data/portalData'
import { encounterWorkflowState, recordCreatedEncounter } from '../stores/encounterDraft'

const router = useRouter()
const route = useRoute()
const workflowViewIds = ['queue', 'pipeline', 'provider']
const activeView = ref(workflowViewIds.includes(route.query.view) ? route.query.view : 'queue')
const search = ref(String(route.query.search || ''))
const risk = ref('All')
const facility = ref('')
const practice = ref('')
const filtersOpen = ref(false)
const addEncounterOpen = ref(false)
const toast = ref('')
const maxVisibleCards = 10

const allItems = [...queueItems, ...pipelineItems, ...sentItems]
const facilities = [...new Set(allItems.map((item) => item.facility))].sort()
const practices = [...new Set(allItems.map((item) => item.medicalPractice))].sort()
const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

function matchesCommon(item) {
  const term = search.value.trim().toLowerCase()
  const facilityTerm = facility.value.trim().toLowerCase()
  const practiceTerm = practice.value.trim().toLowerCase()
  const haystack = `${item.patient} ${item.id} ${item.medicalPractice} ${item.facility} ${item.visit}`.toLowerCase()
  return (!term || haystack.includes(term))
    && (!facilityTerm || item.facility.toLowerCase().includes(facilityTerm))
    && (!practiceTerm || item.medicalPractice.toLowerCase().includes(practiceTerm))
}

const sentEncounterIds = computed(() => Object.keys(encounterWorkflowState.sentEncounters))
const clarificationRequests = computed(() => Object.values(encounterWorkflowState.clarificationRequests || {}))
const createdPipelineItems = computed(() => encounterWorkflowState.createdEncounters || [])
const pipelineWorkItems = computed(() => [...createdPipelineItems.value, ...pipelineItems])
const availableQueueItems = computed(() => queueItems
  .filter((item) => !sentEncounterIds.value.includes(item.id) && encounterWorkflowState.clarificationRequests?.[item.id]?.status !== 'awaiting-provider')
  .map((item) => {
    const request = encounterWorkflowState.clarificationRequests?.[item.id]
    if (request?.status !== 'answered') return item
    return {
      ...item,
      status: 'Clarification received',
      tone: 'purple',
      due: 'Response received',
      dueTone: 'neutral',
      effort: 'Review answer',
      note: `${request.sectionLabel}: ${request.response}`,
      clarification: request,
    }
  }))
const transitionedProviderItems = computed(() => sentEncounterIds.value
  .map((id) => {
    const item = queueItems.find((candidate) => candidate.id === id)
    const transition = encounterWorkflowState.sentEncounters[id]
    if (!item || !transition) return null
    return {
      ...item,
      provider: transition.provider,
      stage: transition.state || 'Delivered',
      detail: `Sent to ${transition.provider} · awaiting provider signature`,
      updated: 'Just now',
      tone: 'neutral',
    }
  })
  .filter(Boolean))
const clarificationProviderItems = computed(() => clarificationRequests.value
  .filter((request) => request.status === 'awaiting-provider')
  .map((request) => {
    const item = queueItems.find((candidate) => candidate.id === request.encounterId)
    if (!item) return null
    return {
      ...item,
      provider: request.provider,
      stage: 'Awaiting clarification',
      detail: `${request.sectionLabel}: ${request.question}`,
      updated: 'Just now',
      tone: 'gold',
      clarification: request,
    }
  })
  .filter(Boolean))
const providerItems = computed(() => [...clarificationProviderItems.value, ...transitionedProviderItems.value, ...sentItems])
const filteredQueue = computed(() => availableQueueItems.value.filter((item) => matchesCommon(item) && (risk.value === 'All' || item.risk === risk.value)))
const filteredPipeline = computed(() => pipelineWorkItems.value.filter(matchesCommon))
const filteredProvider = computed(() => providerItems.value.filter(matchesCommon))
const visibleQueue = computed(() => filteredQueue.value.slice(0, maxVisibleCards))
const visiblePipeline = computed(() => filteredPipeline.value.slice(0, maxVisibleCards))
const visibleProvider = computed(() => filteredProvider.value.slice(0, maxVisibleCards))
const nextEncounter = computed(() => visibleQueue.value[0] || null)
const remainingVisibleQueue = computed(() => visibleQueue.value.slice(1))
const hasFilters = computed(() => risk.value !== 'All' || Boolean(facility.value.trim()) || Boolean(practice.value.trim()))
const sentTodayCount = computed(() => 12 + sentEncounterIds.value.length)
const readyBacklogCount = computed(() => Math.max(0, 28 - sentEncounterIds.value.length))
const queueAdditionalCount = computed(() => readyBacklogCount.value + Math.max(0, filteredQueue.value.length - visibleQueue.value.length))
const pipelineAdditionalCount = computed(() => Math.max(0, 61 + createdPipelineItems.value.length - visiblePipeline.value.length))
const providerAdditionalCount = computed(() => Math.max(0, 47 + sentEncounterIds.value.length + clarificationProviderItems.value.length - visibleProvider.value.length))

const workflowOptions = computed(() => [
  { id: 'queue', label: 'Final Review', total: availableQueueItems.value.length },
  { id: 'pipeline', label: 'In-Pipeline', total: 61 + createdPipelineItems.value.length },
  { id: 'provider', label: 'With Provider', total: 47 + sentEncounterIds.value.length + clarificationProviderItems.value.length },
])

watch(() => route.query.search, (value) => {
  search.value = typeof value === 'string' ? value : ''
})

watch(() => route.query.view, (value) => {
  if (workflowViewIds.includes(value)) activeView.value = value
})

function selectView(viewId) {
  activeView.value = viewId
  filtersOpen.value = false
  const query = { ...route.query }
  if (viewId === 'queue') delete query.view
  else query.view = viewId
  router.replace({ query })
}

function openEncounter(item) {
  router.push(`/encounters/${item.id}/preview`)
}

function clearFilters() {
  search.value = ''
  risk.value = 'All'
  facility.value = ''
  practice.value = ''
}

function handleEncounterCreated(encounter) {
  recordCreatedEncounter(encounter)
  selectView('pipeline')
  toast.value = `${encounter.id} added · agents are drafting from the clinical notes`
  window.setTimeout(() => { if (toast.value) toast.value = '' }, 2800)
}

</script>

<template>
  <section class="page queue-page">
    <div class="page-inner queue-inner">
      <header class="queue-page-header">
        <div>
          <span class="queue-page-header__eyebrow">Scribe workspace</span>
          <h1>Encounter Oversight</h1>
          <p>Validate AI decisions, resolve exceptions, and send evidence-backed notes to providers.</p>
        </div>
        <div class="queue-day-summary">
          <time>{{ dateLabel }}</time>
          <span><AppIcon name="checkCheck" :size="14" /><strong>{{ sentTodayCount }} sent today</strong> · 9 signed</span>
        </div>
      </header>

      <section class="queue-toolbar">
        <nav class="workflow-tabs-minimal" aria-label="Encounter workflow" role="tablist">
          <button v-for="option in workflowOptions" :key="option.id" type="button" role="tab" :aria-selected="activeView === option.id" :class="{ active: activeView === option.id }" @click="selectView(option.id)">
            {{ option.label }} <span>{{ option.total }}</span>
          </button>
        </nav>
        <div class="queue-tools">
          <label class="field queue-search">
            <AppIcon name="search" :size="15" color="#99A1AF" />
            <input v-model="search" placeholder="Search patient, practice, facility, or ENCT..." />
          </label>
          <button type="button" class="button button--secondary filter-button" :class="{ active: filtersOpen }" @click="filtersOpen = !filtersOpen">
            <AppIcon name="filter" :size="14" /> Filters
            <span v-if="hasFilters" />
          </button>
          <button type="button" class="button add-encounter-button" @click="addEncounterOpen = true"><AppIcon name="plus" :size="15" /> Add an Encounter</button>
        </div>
      </section>

      <Transition name="expand">
        <section v-if="filtersOpen" class="filters-panel card">
          <div class="filter-control">
            <span>Medical Practice</span>
            <SearchableSelect v-model="practice" :options="practices" placeholder="All Medical Practices" search-placeholder="Search medical practices..." clear-label="All Medical Practices" aria-label="Filter by Medical Practice" />
          </div>
          <div class="filter-control">
            <span>Facility</span>
            <SearchableSelect v-model="facility" :options="facilities" placeholder="All Facilities" search-placeholder="Search facilities..." clear-label="All Facilities" aria-label="Filter by Facility" />
          </div>
          <div v-if="activeView === 'queue'" class="filter-control">
            <span>Risk</span>
            <SearchableSelect v-model="risk" :options="['All', 'High', 'Medium', 'Low']" :searchable="false" placeholder="All" aria-label="Filter by Risk" />
          </div>
          <button type="button" @click="clearFilters">Clear filters</button>
        </section>
      </Transition>

      <template v-if="activeView === 'queue'">
        <section v-if="nextEncounter" class="up-next-container" aria-label="Up next encounter">
          <header><span><AppIcon name="trending" :size="13" /> Up next</span><small>Required scribe review</small></header>
          <Transition name="up-next-swap" mode="out-in">
            <EncounterCard :key="nextEncounter.id" :item="nextEncounter" mode="queue" featured @action="openEncounter(nextEncounter)" />
          </Transition>
        </section>
        <section v-if="remainingVisibleQueue.length" class="queue-encounter-list" aria-label="Remaining Final Review encounters">
          <EncounterCard v-for="item in remainingVisibleQueue" :key="item.id" :item="item" mode="queue" @action="openEncounter(item)" />
        </section>
        <footer v-if="nextEncounter && queueAdditionalCount" class="queue-tail">{{ queueAdditionalCount }} more ready encounters will surface as you work through this queue.</footer>
      </template>

      <template v-else-if="activeView === 'pipeline'">
        <section v-if="visiblePipeline.length" class="status-encounter-list">
          <EncounterCard v-for="item in visiblePipeline" :key="item.id" :item="item" mode="pipeline" />
        </section>
        <footer v-if="visiblePipeline.length && pipelineAdditionalCount" class="queue-tail">{{ pipelineAdditionalCount }} additional encounters are being processed and will enter Final Review only after agent QA is complete.</footer>
      </template>

      <template v-else>
        <section v-if="visibleProvider.length" class="status-encounter-list">
          <EncounterCard v-for="item in visibleProvider" :key="item.id" :item="item" mode="provider" />
        </section>
        <footer v-if="visibleProvider.length && providerAdditionalCount" class="queue-tail">{{ providerAdditionalCount }} additional notes are with providers today. 31 have already been signed.</footer>
      </template>

      <article v-if="(activeView === 'queue' && !filteredQueue.length) || (activeView === 'pipeline' && !filteredPipeline.length) || (activeView === 'provider' && !filteredProvider.length)" class="empty-card card">
        <span><AppIcon name="search" :size="22" /></span>
        <h2>No encounters match these filters</h2>
        <p>Try another Medical Practice or clear the current filters.</p>
        <button class="button button--secondary" type="button" @click="clearFilters">Clear filters</button>
      </article>
    </div>
    <AddEncounterModal v-model="addEncounterOpen" @create="handleEncounterCreated" />
    <Transition name="queue-toast"><div v-if="toast" class="queue-toast"><AppIcon name="check" :size="15" /> {{ toast }}</div></Transition>
  </section>
</template>

<style scoped>
.queue-page { background: #F6F6F7; }
.queue-inner { max-width: 1120px; padding-bottom: 32px; }
.queue-page-header { align-items: flex-end; display: flex; gap: 30px; justify-content: space-between; margin-bottom: 22px; }
.queue-page-header__eyebrow { color: var(--purple); display: block; font-size: 12px; font-weight: 800; letter-spacing: .07em; margin-bottom: 6px; text-transform: uppercase; }
.queue-page-header h1 { font-size: 30px; letter-spacing: -.035em; margin: 0 0 6px; }
.queue-page-header p { color: var(--muted); font-size: 14px; line-height: 21px; margin: 0; }
.queue-day-summary { align-items: flex-end; display: flex; flex-direction: column; gap: 7px; }
.queue-day-summary time { color: var(--subtle); font-size: 12px; }
.queue-day-summary span { align-items: center; color: #218C69; display: flex; font-size: 12px; gap: 5px; white-space: nowrap; }
.queue-toolbar { align-items: center; border-bottom: 1px solid var(--border); display: flex; gap: 20px; justify-content: space-between; margin-bottom: 15px; }
.workflow-tabs-minimal { align-self: stretch; display: flex; gap: 2px; min-width: 0; }
.workflow-tabs-minimal button { align-items: center; background: transparent; border: 0; color: var(--muted); cursor: pointer; display: flex; font-size: 12.5px; font-weight: 750; gap: 6px; min-height: 45px; padding: 0 11px; position: relative; white-space: nowrap; }
.workflow-tabs-minimal button::after { background: transparent; bottom: -1px; content: ''; height: 2px; left: 10px; position: absolute; right: 10px; }
.workflow-tabs-minimal button:hover { color: var(--purple-dark); }
.workflow-tabs-minimal button.active { color: var(--purple-dark); }
.workflow-tabs-minimal button.active::after { background: var(--purple); }
.workflow-tabs-minimal button span { align-items: center; background: #ECEEF1; border-radius: 999px; color: var(--subtle); display: flex; font-size: 12px; height: 22px; justify-content: center; min-width: 22px; padding: 0 7px; }
.workflow-tabs-minimal button.active span { background: var(--purple-soft); color: var(--purple); }
.queue-tools { align-items: center; display: flex; flex-shrink: 0; gap: 8px; }
.queue-search { height: 38px; width: 340px; }
.filter-button { min-height: 38px; position: relative; }
.filter-button.active { background: var(--purple-soft); border-color: #D7C8EE; color: var(--purple-dark); }
.filter-button > span { background: var(--mint); border: 2px solid #fff; border-radius: 50%; height: 8px; position: absolute; right: 4px; top: 3px; width: 8px; }
.add-encounter-button { background: var(--mint); color: #fff; min-height: 38px; white-space: nowrap; }
.filters-panel { align-items: flex-end; display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding: 15px 16px; }
.filters-panel label, .filter-control { display: flex; flex: 1; flex-direction: column; gap: 5px; min-width: 190px; }
.filters-panel label > span, .filter-control > span { color: var(--subtle); font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.filter-control :deep(.searchable-select__trigger) { border-radius: 6px; font-size: 13px; height: 40px; }
.filters-panel > button { background: transparent; border: 0; color: var(--purple); cursor: pointer; font-size: 12px; font-weight: 700; height: 40px; }
.up-next-container { background: #F7F4FC; border: 1px solid #DCCFEF; border-radius: 12px; margin-bottom: 12px; padding: 12px; }
.up-next-container > header { align-items: center; display: flex; justify-content: space-between; margin: 0 2px 9px; }
.up-next-container > header span { align-items: center; color: var(--purple-dark); display: flex; font-size: 12px; font-weight: 850; gap: 5px; letter-spacing: .06em; text-transform: uppercase; }
.up-next-container > header small { color: var(--muted); font-size: 12px; font-weight: 650; }
.queue-encounter-list, .status-encounter-list { display: flex; flex-direction: column; gap: 8px; }
.encounter-grid { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.queue-tail { color: var(--muted); font-size: 12px; padding: 15px 2px 0; text-align: center; }
.empty-card { padding: 44px 24px; text-align: center; }
.empty-card > span { align-items: center; background: var(--purple-soft); border-radius: 50%; color: var(--purple); display: flex; height: 46px; justify-content: center; margin: 0 auto 12px; width: 46px; }
.empty-card h2 { font-size: 18px; margin-bottom: 5px; }
.empty-card p { color: var(--muted); font-size: 12px; margin-bottom: 14px; }
.expand-enter-active, .expand-leave-active { transition: opacity 150ms, transform 150ms; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-5px); }
.up-next-swap-enter-active, .up-next-swap-leave-active { transition: opacity 150ms, transform 150ms; }
.up-next-swap-enter-from { opacity: 0; transform: translateY(5px); }
.up-next-swap-leave-to { opacity: 0; transform: translateY(-5px); }
.queue-toast { align-items: center; background: var(--ink); border-radius: 8px; bottom: 22px; color: #fff; display: flex; font-size: 13px; font-weight: 700; gap: 7px; left: 50%; max-width: calc(100vw - 32px); padding: 11px 14px; position: fixed; transform: translateX(-50%); z-index: 140; }
.queue-toast-enter-active, .queue-toast-leave-active { transition: opacity 150ms, transform 150ms; }
.queue-toast-enter-from, .queue-toast-leave-to { opacity: 0; transform: translate(-50%, 6px); }
@media (max-width: 960px) {
  .queue-toolbar { align-items: stretch; flex-direction: column; gap: 8px; padding-bottom: 12px; }
  .workflow-tabs-minimal { border-bottom: 1px solid var(--border); overflow-x: auto; }
  .queue-tools { width: 100%; }
  .queue-search { flex: 1; width: auto; }
}
@media (max-width: 720px) {
  .queue-page-header { align-items: flex-start; margin-bottom: 18px; }
  .queue-page-header h1 { font-size: 27px; }
  .queue-day-summary { display: none; }
  .encounter-grid { grid-template-columns: 1fr; }
  .filters-panel { align-items: stretch; flex-direction: column; }
  .filters-panel label, .filter-control { flex: auto; min-width: 0; }
}
@media (max-width: 520px) {
  .workflow-tabs-minimal { margin-left: -2px; margin-right: -2px; }
  .workflow-tabs-minimal button { flex: 1; font-size: 12px; justify-content: center; padding: 0 5px; }
  .queue-tools { align-items: stretch; flex-wrap: wrap; }
  .queue-search { min-width: 0; }
  .filter-button { flex: 0 0 96px; }
  .add-encounter-button { flex: 1 1 100%; }
  .up-next-container { padding: 9px; }
  .up-next-container > header small { display: none; }
}
</style>

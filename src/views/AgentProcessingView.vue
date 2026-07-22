<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { editorSections } from '../data/editorData'
import { activeAgentEncounter } from '../data/portalData'
import { formatPatientName } from '../utils/patientName'

const router = useRouter()
const currentStage = ref(1)
const stageProgress = ref(24)
const activity = ref([])
let progressTimer

const stages = [
  { label: 'Records', agent: 'Records Agent', icon: 'clipboard', description: 'Pulled the clinical chart, transcript, medication record, and nursing notes.' },
  { label: 'Draft', agent: 'Note Agent', icon: 'edit', description: 'Writing the structured encounter section by section from the source evidence.' },
  { label: 'QA', agent: 'QA Agent', icon: 'shield', description: 'Cross-checking facts, medications, codes, and evidence citations.' },
  { label: 'Final', agent: 'Scribe Oversight', icon: 'eye', description: 'The AI-completed note is ready for decision review; editing is exception-only.' },
]

const draftSections = editorSections.map((section, index, sections) => ({
  ...section,
  threshold: Math.round(((index + 1) / sections.length) * 100),
}))
const sectionCount = draftSections.length

const sourceItems = [
  { label: 'PCC Clinical Record', detail: '142 pages', icon: 'clipboard', tone: 'purple' },
  { label: 'Encounter Transcript', detail: '12:48', icon: 'activity', tone: 'blue' },
  { label: 'eMAR', detail: '38 medications', icon: 'pill', tone: 'green' },
  { label: 'Nursing Notes', detail: '3 notes', icon: 'users', tone: 'gold' },
]

const isReady = computed(() => currentStage.value === 3)
const activeSectionCount = computed(() => {
  if (currentStage.value > 1) return sectionCount
  const nextSectionIndex = draftSections.findIndex((section) => stageProgress.value < section.threshold)
  return nextSectionIndex === -1 ? sectionCount : nextSectionIndex + 1
})
const overallProgress = computed(() => {
  if (currentStage.value === 1) return Math.round(25 + stageProgress.value * .25)
  if (currentStage.value === 2) return Math.round(50 + stageProgress.value * .25)
  return 100
})
const statusTitle = computed(() => {
  if (currentStage.value === 1) return 'Note Agent is drafting the encounter'
  if (currentStage.value === 2) return 'QA Agent is checking the completed draft'
  return 'Encounter is ready for Final Note Review'
})
const statusDescription = computed(() => {
  if (currentStage.value === 1) return 'Sections appear as the Note Agent writes and links them to the source record.'
  if (currentStage.value === 2) return 'The QA Agent is comparing every generated statement with its supporting evidence.'
  return 'Agent QA is complete. The scribe can validate decisions and evidence in Final Note Review.'
})

function stageState(index) {
  if (index < currentStage.value) return 'complete'
  if (index === currentStage.value) return isReady.value ? 'ready' : 'active'
  return 'queued'
}

function sectionState(item, index) {
  if (currentStage.value > 1) return 'complete'
  if (stageProgress.value >= item.threshold) return 'complete'
  const previousThreshold = index ? draftSections[index - 1].threshold : 0
  if (stageProgress.value >= previousThreshold) return 'active'
  return 'queued'
}

function beginDemo() {
  window.clearInterval(progressTimer)
  currentStage.value = 1
  stageProgress.value = 24
  activity.value = [
    { time: '09:31:08', text: 'Records Agent completed source collection.', icon: 'check', tone: 'complete' },
    { time: '09:31:12', text: 'Note Agent began the structured draft.', icon: 'edit', tone: 'active' },
  ]
  progressTimer = window.setInterval(advanceProgress, 260)
}

function advanceProgress() {
  if (isReady.value) return
  stageProgress.value = Math.min(100, stageProgress.value + 1.35)
  if (stageProgress.value < 100) return

  if (currentStage.value === 1) {
    activity.value.unshift({ time: '09:31:29', text: `Note Agent completed all ${sectionCount} note sections.`, icon: 'check', tone: 'complete' })
    activity.value.unshift({ time: '09:31:30', text: 'QA Agent started 42 clinical and coding checks.', icon: 'shield', tone: 'active' })
    currentStage.value = 2
    stageProgress.value = 0
    return
  }

  activity.value.unshift({ time: '09:31:51', text: 'QA checks completed. No blocking issues found.', icon: 'checkCheck', tone: 'complete' })
  activity.value.unshift({ time: '09:31:52', text: 'Encounter moved to Final Note Review.', icon: 'eye', tone: 'ready' })
  currentStage.value = 3
  stageProgress.value = 100
  window.clearInterval(progressTimer)
}

function finishDemo() {
  currentStage.value = 2
  stageProgress.value = 99
  advanceProgress()
}

function openDraft() {
  router.push(`/encounters/${activeAgentEncounter.id}/preview`)
}

onMounted(beginDemo)
onBeforeUnmount(() => window.clearInterval(progressTimer))
</script>

<template>
  <section class="processing-page">
    <header class="processing-header">
      <div class="processing-crumbs">
        <button type="button" @click="router.push('/encounters')">Encounters</button>
        <AppIcon name="chevronRight" :size="14" color="#99A1AF" />
        <span class="mono">{{ activeAgentEncounter.id }}</span>
        <span class="live-pill"><i /> Live agent work</span>
      </div>
      <div class="processing-patient">
        <div>
          <h1>{{ formatPatientName(activeAgentEncounter.patient, activeAgentEncounter.sex) }}</h1>
          <span class="processing-practice"><AppIcon name="practice" :size="13" /> <strong>{{ activeAgentEncounter.medicalPractice }}</strong></span>
          <span>{{ activeAgentEncounter.facility }}</span>
          <span>{{ activeAgentEncounter.visit }}</span>
          <span>Provider: <strong>{{ activeAgentEncounter.provider }}</strong></span>
        </div>
      </div>
    </header>

    <div class="processing-scroll">
      <div class="processing-inner">
        <section class="pipeline-card card" :class="{ 'is-ready': isReady }">
          <header class="pipeline-overview">
            <div class="pipeline-overview__icon"><AppIcon :name="isReady ? 'checkCheck' : 'bot'" :size="25" /></div>
            <div class="pipeline-overview__copy">
              <span>{{ isReady ? 'Ready for scribe' : 'Agents are working' }}</span>
              <h2>{{ statusTitle }}</h2>
              <p>{{ statusDescription }} <template v-if="!isReady">It will move to Final Review after QA is complete.</template></p>
            </div>
            <div class="pipeline-overview__actions">
              <strong>{{ overallProgress }}%</strong>
              <button type="button" class="restart-link" @click="beginDemo"><AppIcon name="refresh" :size="12" /> Restart</button>
              <button v-if="isReady" type="button" class="button button--mint" @click="openDraft">Final Note Review <AppIcon name="chevronRight" :size="16" /></button>
              <button v-else type="button" class="button button--secondary" @click="finishDemo">Show ready state</button>
            </div>
          </header>
          <div class="overall-progress" role="progressbar" aria-label="Overall agent progress" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="overallProgress"><i :style="{ width: `${overallProgress}%` }" /></div>
          <div class="pipeline-grid">
            <article v-for="(stage, index) in stages" :key="stage.label" :class="`is-${stageState(index)}`">
              <div class="stage-number">
                <AppIcon v-if="stageState(index) === 'complete'" name="check" :size="17" />
                <AppIcon v-else-if="stageState(index) === 'active'" name="refresh" :size="17" />
                <AppIcon v-else-if="stageState(index) === 'ready'" name="eye" :size="17" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="stage-copy"><span>{{ stage.label }}</span><strong>{{ stage.agent }}</strong><p>{{ stage.description }}</p></div>
              <small v-if="stageState(index) === 'complete'"><AppIcon name="check" :size="11" /> Complete</small>
              <small v-else-if="stageState(index) === 'active'"><i /> Working · {{ Math.round(stageProgress) }}%</small>
              <small v-else-if="stageState(index) === 'ready'"><AppIcon name="check" :size="11" /> Ready now</small>
              <small v-else>Waiting</small>
            </article>
          </div>
        </section>

        <div class="processing-columns">
          <section class="agent-output card">
            <header class="card-header">
              <div><h2>{{ currentStage === 1 ? 'Sections being drafted' : 'Drafted encounter sections' }}</h2><p>{{ currentStage === 1 ? 'The Note Agent is writing directly from the collected evidence.' : `All ${sectionCount} sections are available for QA and review.` }}</p></div>
              <span>{{ activeSectionCount }} of {{ sectionCount }}</span>
            </header>
            <div class="draft-section-list">
              <article v-for="(item, index) in draftSections" :key="item.id" :class="`is-${sectionState(item, index)}`">
                <span>
                  <AppIcon v-if="sectionState(item, index) === 'complete'" name="check" :size="14" />
                  <AppIcon v-else-if="sectionState(item, index) === 'active'" name="edit" :size="14" />
                  <AppIcon v-else name="more" :size="14" />
                </span>
                <div><strong>{{ item.label }}</strong><small>{{ sectionState(item, index) === 'complete' ? 'Drafted and linked to evidence' : sectionState(item, index) === 'active' ? 'Note Agent is writing this section' : 'Waiting for earlier sections' }}</small></div>
                <em>{{ sectionState(item, index) === 'complete' ? 'Done' : sectionState(item, index) === 'active' ? 'Writing' : 'Queued' }}</em>
              </article>
            </div>
          </section>

          <aside class="processing-sidebar">
            <section class="card activity-card">
              <header><div><h3>Live agent activity</h3><p>Updates appear automatically</p></div><span><i /> Live</span></header>
              <div class="activity-list">
                <article v-for="item in activity" :key="`${item.time}-${item.text}`" :class="`is-${item.tone}`"><span><AppIcon :name="item.icon" :size="13" /></span><div><p>{{ item.text }}</p><time>{{ item.time }}</time></div></article>
                <article v-if="!isReady" class="is-active"><span><AppIcon name="refresh" :size="13" /></span><div><p>{{ currentStage === 1 ? 'Drafting and citing the current section…' : 'Running source consistency checks…' }}</p><time>Now</time></div></article>
              </div>
            </section>

            <section class="card sources-card">
              <header><h3>Sources available to agents</h3><span><AppIcon name="checkCheck" :size="12" /> All synced</span></header>
              <div><article v-for="source in sourceItems" :key="source.label"><i :class="source.tone"><AppIcon :name="source.icon" :size="13" /></i><strong>{{ source.label }}</strong><small>{{ source.detail }}</small></article></div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.processing-page { display: flex; flex: 1; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden; }
.processing-header { background: #fff; border-bottom: 1px solid var(--border); flex-shrink: 0; padding: 15px 24px 14px; }
.processing-crumbs { align-items: center; color: var(--muted); display: flex; font-size: 12px; gap: 7px; }
.processing-crumbs > button { background: transparent; border: 0; color: var(--muted); cursor: pointer; padding: 0; text-decoration: none; transition: color 120ms; }
.processing-crumbs > button:hover { color: var(--purple); }
.live-pill { align-items: center; background: var(--purple-soft); border-radius: 999px; color: var(--purple-dark); display: flex; font-size: 10px; font-weight: 800; gap: 6px; margin-left: auto; padding: 5px 9px; }
.live-pill i, .activity-card header > span i { animation: live-pulse 1.4s ease-in-out infinite; background: var(--mint); border-radius: 50%; height: 6px; width: 6px; }
.processing-patient { align-items: center; display: flex; gap: 18px; justify-content: space-between; margin-top: 12px; }
.processing-patient > div { align-items: baseline; display: flex; flex-wrap: wrap; gap: 8px 14px; }
.processing-patient h1 { color: var(--purple); font-size: 25px; letter-spacing: -.025em; margin: 0 4px 0 0; }
.processing-patient span { color: var(--muted); font-size: 12px; }
.processing-patient span strong { color: var(--ink); }
.processing-patient .processing-practice { align-items: center; background: var(--purple-soft); border-radius: 999px; color: var(--purple); display: inline-flex; font-weight: 700; gap: 5px; padding: 5px 9px; }
.processing-patient .processing-practice strong { color: var(--purple-dark); }
.processing-scroll { flex: 1; overflow-y: auto; padding: 24px 28px 38px; }
.processing-inner { margin: 0 auto; max-width: 1180px; }
.pipeline-card { margin-bottom: 16px; overflow: hidden; }
.pipeline-card.is-ready { border-color: #BFE8D8; }
.pipeline-overview { align-items: center; display: grid; gap: 14px; grid-template-columns: 46px minmax(0, 1fr) auto; padding: 17px 20px; }
.pipeline-overview__icon { align-items: center; background: var(--purple); border-radius: 9px; color: #fff; display: flex; height: 44px; justify-content: center; width: 44px; }
.pipeline-card.is-ready .pipeline-overview__icon { background: var(--green); }
.pipeline-overview__copy > span { color: var(--purple); display: block; font-size: 9px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
.pipeline-card.is-ready .pipeline-overview__copy > span { color: #218C69; }
.pipeline-card h2 { font-size: 18px; letter-spacing: -.015em; margin: 2px 0 3px; }
.pipeline-overview__copy p { color: var(--muted); font-size: 11.5px; line-height: 17px; margin: 0; }
.pipeline-overview__actions { align-items: center; display: grid; gap: 7px; grid-template-columns: auto auto; justify-items: end; }
.pipeline-overview__actions > strong { color: var(--purple); font-size: 20px; }
.pipeline-card.is-ready .pipeline-overview__actions > strong { color: #218C69; }
.pipeline-overview__actions .button { grid-column: 1 / -1; min-height: 36px; min-width: 152px; }
.restart-link { align-items: center; background: transparent; border: 0; color: var(--subtle); cursor: pointer; display: inline-flex; font-size: 10px; font-weight: 700; gap: 4px; padding: 4px; }
.overall-progress { background: #ECEAF0; height: 6px; overflow: hidden; }
.overall-progress i { background: var(--mint); display: block; height: 100%; transition: width 220ms linear; }
.pipeline-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.pipeline-grid article { border-right: 1px solid #EEF0F2; display: grid; gap: 9px; grid-template-columns: 36px 1fr; min-height: 164px; padding: 18px; position: relative; }
.pipeline-grid article:last-child { border-right: 0; }
.pipeline-grid article.is-active { background: #FAF8FE; box-shadow: inset 0 3px 0 var(--purple); }
.pipeline-grid article.is-ready { background: #F4FBF8; box-shadow: inset 0 3px 0 var(--mint); }
.stage-number { align-items: center; align-self: start; background: #F1F2F4; border-radius: 50%; color: var(--subtle); display: flex; font-size: 12px; font-weight: 800; height: 34px; justify-content: center; width: 34px; }
.is-complete .stage-number { background: var(--green-soft); color: #218C69; }
.is-active .stage-number { background: var(--purple); color: #fff; }
.is-active .stage-number svg { animation: agent-spin 1.1s linear infinite; }
.is-ready .stage-number { background: var(--mint); color: #fff; }
.stage-copy > span { color: var(--subtle); display: block; font-size: 9px; font-weight: 800; letter-spacing: .06em; margin-bottom: 2px; text-transform: uppercase; }
.stage-copy strong { font-size: 13px; }
.stage-copy p { color: var(--muted); font-size: 11.5px; line-height: 17px; margin: 5px 0 0; }
.pipeline-grid article > small { align-items: center; align-self: end; color: var(--subtle); display: flex; font-size: 10.5px; font-weight: 700; gap: 5px; grid-column: 1 / -1; }
.pipeline-grid .is-complete > small, .pipeline-grid .is-ready > small { color: #218C69; }
.pipeline-grid .is-active > small { color: var(--purple-dark); }
.pipeline-grid .is-active > small i { animation: live-pulse 1.4s ease-in-out infinite; background: var(--purple); border-radius: 50%; height: 6px; width: 6px; }
.processing-columns { align-items: start; display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) 330px; }
.agent-output { overflow: hidden; }
.agent-output .card-header > span { color: var(--purple-dark); font-size: 11px; font-weight: 800; }
.draft-section-list { display: flex; flex-direction: column; }
.draft-section-list article { align-items: center; display: grid; gap: 11px; grid-template-columns: 32px 1fr auto; min-height: 58px; padding: 9px 18px; }
.draft-section-list article + article { border-top: 1px solid #EEF1F4; }
.draft-section-list article > span { align-items: center; background: #F3F4F6; border-radius: 7px; color: var(--subtle); display: flex; height: 30px; justify-content: center; width: 30px; }
.draft-section-list article.is-complete > span { background: var(--green-soft); color: #218C69; }
.draft-section-list article.is-active > span { background: var(--purple-soft); color: var(--purple); }
.draft-section-list article.is-active > span svg { animation: writing-bob .9s ease-in-out infinite; }
.draft-section-list article > div { display: flex; flex-direction: column; gap: 2px; }
.draft-section-list strong { font-size: 12.5px; }
.draft-section-list small { color: var(--muted); font-size: 11px; }
.draft-section-list em { background: #F3F4F6; border-radius: 999px; color: var(--subtle); font-size: 9px; font-style: normal; font-weight: 800; padding: 4px 8px; }
.draft-section-list .is-complete em { background: var(--green-soft); color: #218C69; }
.draft-section-list .is-active em { background: var(--purple-soft); color: var(--purple-dark); }
.processing-sidebar { display: flex; flex-direction: column; gap: 16px; }
.activity-card, .sources-card { overflow: hidden; }
.activity-card > header, .sources-card > header { align-items: center; border-bottom: 1px solid #EEF0F2; display: flex; justify-content: space-between; padding: 14px 16px; }
.activity-card h3, .sources-card h3 { font-size: 14px; margin: 0; }
.activity-card header p { color: var(--subtle); font-size: 9px; margin: 2px 0 0; }
.activity-card header > span { align-items: center; background: var(--green-soft); border-radius: 999px; color: #218C69; display: flex; font-size: 9px; font-weight: 800; gap: 5px; padding: 4px 7px; }
.activity-list { display: flex; flex-direction: column; padding: 7px 0; }
.activity-list article { align-items: flex-start; display: grid; gap: 9px; grid-template-columns: 27px 1fr; padding: 8px 14px; }
.activity-list article > span { align-items: center; background: #F3F4F6; border-radius: 50%; color: var(--subtle); display: flex; height: 27px; justify-content: center; width: 27px; }
.activity-list article.is-complete > span { background: var(--green-soft); color: #218C69; }
.activity-list article.is-active > span { background: var(--purple-soft); color: var(--purple); }
.activity-list article.is-active > span svg { animation: agent-spin 1.1s linear infinite; }
.activity-list article.is-ready > span { background: var(--green-soft); color: #218C69; }
.activity-list p { font-size: 11.5px; line-height: 16px; margin: 1px 0 2px; }
.activity-list time { color: var(--subtle); font-size: 9px; }
.sources-card header > span { align-items: center; color: #218C69; display: flex; font-size: 9px; font-weight: 700; gap: 4px; }
.sources-card > div { display: flex; flex-direction: column; padding: 7px 0; }
.sources-card article { align-items: center; display: flex; gap: 8px; padding: 6px 13px; }
.sources-card article > i { align-items: center; border-radius: 5px; display: flex; height: 27px; justify-content: center; width: 27px; }
.sources-card i.purple { background: var(--purple-soft); color: var(--purple); }
.sources-card i.blue { background: #E6F3FB; color: #0076A8; }
.sources-card i.green { background: var(--green-soft); color: #218C69; }
.sources-card i.gold { background: #FFF8E6; color: #9A6912; }
.sources-card strong { flex: 1; font-size: 11.5px; }
.sources-card small { color: var(--subtle); font-size: 10px; }
@keyframes live-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,201,167,.24); opacity: 1; } 50% { box-shadow: 0 0 0 5px rgba(0,201,167,0); opacity: .72; } }
@keyframes agent-spin { to { transform: rotate(360deg); } }
@keyframes writing-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@media (max-width: 980px) {
  .processing-columns { grid-template-columns: 1fr; }
  .processing-sidebar { display: grid; grid-template-columns: 1fr 1fr; }
}
@media (max-width: 800px) {
  .pipeline-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pipeline-grid article:nth-child(2) { border-right: 0; }
  .pipeline-grid article:nth-child(-n+2) { border-bottom: 1px solid #EEF0F2; }
}
@media (max-width: 700px) {
  .processing-header { padding: 12px 14px; }
  .processing-patient { align-items: flex-start; }
  .processing-patient > div > span { display: none; }
  .processing-patient > .button { min-height: 36px; padding: 0 11px; }
  .processing-scroll { padding: 14px 12px 28px; }
  .pipeline-overview { grid-template-columns: 44px minmax(0, 1fr); padding: 15px; }
  .pipeline-overview__actions { align-items: center; grid-column: 1 / -1; grid-template-columns: auto auto 1fr; justify-items: start; }
  .pipeline-overview__actions .button { grid-column: auto; justify-self: end; margin-left: auto; min-width: 144px; }
  .processing-sidebar { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .live-pill { display: none; }
  .processing-patient h1 { font-size: 22px; }
  .processing-patient > .button { font-size: 11px; }
  .pipeline-overview { align-items: flex-start; }
  .pipeline-overview__copy p { line-height: 16px; }
  .pipeline-overview__actions { grid-template-columns: auto 1fr; }
  .pipeline-overview__actions .button { grid-column: 1 / -1; margin-left: 0; width: 100%; }
  .pipeline-grid { grid-template-columns: 1fr; }
  .pipeline-grid article { border-bottom: 1px solid #EEF0F2; border-right: 0; min-height: 140px; }
  .draft-section-list article { grid-template-columns: 32px 1fr; }
  .draft-section-list article > em { grid-column: 2; justify-self: start; }
}
@media (prefers-reduced-motion: reduce) {
  .live-pill i, .activity-card header > span i, .is-active .stage-number svg, .pipeline-grid .is-active > small i, .draft-section-list article.is-active > span svg, .activity-list article.is-active > span svg { animation: none; }
}
</style>

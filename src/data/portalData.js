export const queueItems = [
  {
    id: 'ENCT-240716-0842',
    patient: 'Marisol Vega',
    sex: 'Female',
    medicalPractice: 'Lakeside Senior Health Group',
    facility: 'Lakeside Care Center',
    provider: 'Dr. A. Patel',
    visit: 'Monthly Compliance',
    risk: 'High',
    due: '12 min overdue',
    dueTone: 'danger',
    effort: '8 min',
    status: 'QA flags',
    note: '2 clinical conflicts need resolution before this note can be sent.',
  },
  {
    id: 'ENCT-240716-0828',
    patient: 'Eleanor Brooks',
    sex: 'Female',
    medicalPractice: 'Harborview Post Acute Partners',
    facility: 'Harborview Senior Living',
    provider: 'Dr. M. Rivera',
    visit: 'Follow-Up Visit',
    risk: 'Medium',
    due: 'Due in 8 min',
    dueTone: 'warning',
    effort: '6 min',
    status: 'Agent question',
    note: 'The Note Agent needs one detail about a pending lab result.',
  },
  {
    id: 'ENCT-240716-0819',
    patient: 'Robert Chen',
    sex: 'Male',
    medicalPractice: 'Lakeside Senior Health Group',
    facility: 'Lakeside Care Center',
    provider: 'Dr. A. Patel',
    visit: 'Wound Follow-Up',
    risk: 'Medium',
    due: 'Due in 21 min',
    dueTone: 'neutral',
    effort: '5 min',
    status: 'Ready',
    note: 'Draft and QA are complete. Review the sourced assessment and plan.',
  },
  {
    id: 'ENCT-240716-0803',
    patient: 'Joseph Reed',
    sex: 'Male',
    medicalPractice: 'Cedarline Medical Group',
    facility: 'Brookfield Post Acute',
    visit: 'New Admission',
    risk: 'High',
    due: 'Returned 18 min ago',
    dueTone: 'danger',
    effort: '4 min',
    status: 'Provider revision',
    provider: 'Dr. L. Shah',
    note: '17 of 18 sections were accepted. Update only the medication dose requested by the provider.',
    revision: {
      sectionId: 'meds',
      sectionLabel: 'Medications',
      requestedBy: 'Dr. L. Shah',
      requestedAt: 'Today · 8:16 AM',
      text: 'Please verify the active furosemide dose against the latest eMAR. Update this section to list 20 mg daily only and remove the outdated 40 mg reference.',
      acceptedSections: 17,
    },
  },
  {
    id: 'ENCT-240716-0757',
    patient: 'Dolores Ramos',
    sex: 'Female',
    medicalPractice: 'Harborview Post Acute Partners',
    facility: 'Harborview Senior Living',
    provider: 'Dr. M. Rivera',
    visit: 'Discharge Visit',
    risk: 'Low',
    due: 'Due in 46 min',
    dueTone: 'neutral',
    effort: '3 min',
    status: 'Ready',
    note: 'No QA flags. A quick source check and send.',
  },
  {
    id: 'ENCT-240716-0741',
    patient: 'Samuel Okafor',
    sex: 'Male',
    medicalPractice: 'Cedarline Medical Group',
    facility: 'Brookfield Post Acute',
    provider: 'Dr. L. Shah',
    visit: 'Follow-Up Visit',
    risk: 'Low',
    due: 'Due in 1 hr',
    dueTone: 'neutral',
    effort: '4 min',
    status: 'Ready',
    note: 'All evidence is linked and the QA checks passed.',
  },
  {
    id: 'ENCT-240716-0726', patient: 'Anita Desai', sex: 'Female', medicalPractice: 'Aster Health Alliance', facility: 'Niles Care Center', provider: 'Dr. A. Patel', visit: 'Diabetes Follow-Up', risk: 'Medium', due: 'Due in 1 hr 12 min', dueTone: 'neutral', effort: '5 min', status: 'Ready', note: 'Medication reconciliation and laboratory evidence are ready for review.',
  },
  {
    id: 'ENCT-240716-0714', patient: 'George Bennett', sex: 'Male', medicalPractice: 'Harborview Post Acute Partners', facility: 'Harborview Senior Living', provider: 'Dr. M. Rivera', visit: 'Regulatory Visit', risk: 'Low', due: 'Due in 1 hr 25 min', dueTone: 'neutral', effort: '4 min', status: 'Ready', note: 'All clinical sections passed agent QA without blocking findings.',
  },
  {
    id: 'ENCT-240716-0701', patient: 'Linda Park', sex: 'Female', medicalPractice: 'Lakeside Senior Health Group', facility: 'Lakeside Care Center', provider: 'Dr. A. Patel', visit: 'Behavioral Health Follow-Up', risk: 'Medium', due: 'Due in 1 hr 41 min', dueTone: 'neutral', effort: '6 min', status: 'Agent question', note: 'Confirm one PHQ-9 response before completing the note.',
  },
  {
    id: 'ENCT-240716-0648', patient: 'Thomas Murphy', sex: 'Male', medicalPractice: 'Cedarline Medical Group', facility: 'Brookfield Post Acute', provider: 'Dr. L. Shah', visit: 'Cardiac Follow-Up', risk: 'High', due: 'Due in 1 hr 55 min', dueTone: 'warning', effort: '7 min', status: 'QA flags', note: 'One blood-pressure source conflict needs scribe resolution.',
  },
  {
    id: 'ENCT-240716-0635', patient: 'Rosa Martinez', sex: 'Female', medicalPractice: 'Aster Health Alliance', facility: 'Niles Care Center', provider: 'Dr. A. Patel', visit: 'Wound Follow-Up', risk: 'Low', due: 'Due in 2 hr 10 min', dueTone: 'neutral', effort: '4 min', status: 'Ready', note: 'Wound findings, treatment plan, and coding are ready for review.',
  },
]

export const activeAgentEncounter = {
  id: 'ENCT-240720-0927',
  patient: 'Helen Montgomery',
  sex: 'Female',
  medicalPractice: 'Aster Health Alliance',
  facility: 'Niles Care Center',
  visit: 'Quarterly Review',
  risk: 'Medium',
  received: '09:27 AM',
  provider: 'Dr. A. Patel',
  dobAge: '04/18/1944 (82)',
  admitLocation: '02/03/2025 · 118-A',
  effort: 'about 2 min remaining',
  status: 'Agents working',
  note: 'The Records Agent is finished and the Clinical Reasoning Agent is consolidating the encounter now.',
}

export const allEncounters = [activeAgentEncounter, ...queueItems]

export const pipelineItems = [
  { id: 'ENCT-240720-0927', patient: 'Helen Montgomery', sex: 'Female', medicalPractice: 'Aster Health Alliance', facility: 'Niles Care Center', visit: 'Quarterly Review', stage: 'Clinical reasoning', detail: 'Clinical Reasoning Agent is consolidating conditions, diagnoses, and treatment decisions', progress: 32, eta: 'About 2 min', tone: 'purple', active: true },
  { id: 'ENCT-240720-0914', patient: 'Franklin Ortiz', sex: 'Male', medicalPractice: 'Harborview Post Acute Partners', facility: 'Harborview Senior Living', visit: 'Follow-Up Visit', stage: 'Medication reconciliation', detail: 'Medication Agent is reconciling the active list against eMAR and provider evidence', progress: 46, eta: 'About 4 min', tone: 'purple' },
  { id: 'ENCT-240720-0902', patient: 'Beatrice Young', sex: 'Female', medicalPractice: 'Cedarline Medical Group', facility: 'Brookfield Post Acute', visit: 'Monthly Compliance', stage: 'Coding & compliance', detail: 'Coding and Compliance Agents are validating codes, support, and policy checks', progress: 81, eta: 'About 1 min', tone: 'green' },
  { id: 'ENCT-240720-0851', patient: 'Walter Greene', sex: 'Male', medicalPractice: 'Lakeside Senior Health Group', facility: 'Lakeside Care Center', visit: 'Wound Follow-Up', stage: 'Intake & evidence', detail: 'Records Agent is normalizing chart evidence into the shared clinical model', progress: 18, eta: 'About 6 min', tone: 'blue' },
  { id: 'ENCT-240720-0837', patient: 'Margaret Lewis', sex: 'Female', medicalPractice: 'Aster Health Alliance', facility: 'Niles Care Center', visit: 'Diabetes Follow-Up', stage: 'Clinical reasoning', detail: 'Clinical Reasoning Agent is reconciling glucose trends with the active treatment plan', progress: 38, eta: 'About 4 min', tone: 'purple' },
  { id: 'ENCT-240720-0822', patient: 'Henry Davis', sex: 'Male', medicalPractice: 'Harborview Post Acute Partners', facility: 'Harborview Senior Living', visit: 'Regulatory Visit', stage: 'Quality assurance', detail: 'QA Agent is checking evidence coverage and consistency across generated outputs', progress: 88, eta: 'Less than 1 min', tone: 'green' },
  { id: 'ENCT-240720-0809', patient: 'Theresa Nguyen', sex: 'Female', medicalPractice: 'Lakeside Senior Health Group', facility: 'Lakeside Care Center', visit: 'Behavioral Health Follow-Up', stage: 'Intake & evidence', detail: 'Records Agent is linking assessment results and recent nursing observations', progress: 24, eta: 'About 5 min', tone: 'blue' },
  { id: 'ENCT-240720-0756', patient: 'Arthur Collins', sex: 'Male', medicalPractice: 'Cedarline Medical Group', facility: 'Brookfield Post Acute', visit: 'Cardiac Follow-Up', stage: 'Medication reconciliation', detail: 'Medication Agent is validating cardiac medications against the latest eMAR', progress: 52, eta: 'About 3 min', tone: 'purple' },
  { id: 'ENCT-240720-0743', patient: 'Sofia Hernandez', sex: 'Female', medicalPractice: 'Aster Health Alliance', facility: 'Niles Care Center', visit: 'New Admission', stage: 'Coding & compliance', detail: 'Coding Agent is mapping supported diagnoses and visit complexity from the shared model', progress: 76, eta: 'About 2 min', tone: 'green' },
  { id: 'ENCT-240720-0729', patient: 'Edward King', sex: 'Male', medicalPractice: 'Harborview Post Acute Partners', facility: 'Harborview Senior Living', visit: 'Wound Follow-Up', stage: 'Quality assurance', detail: 'Compliance Agent is completing final policy and source-attribution checks', progress: 92, eta: 'Less than 1 min', tone: 'green' },
]

export const sentItems = [
  { id: 'ENCT-240720-0738', patient: 'Catherine Bell', sex: 'Female', medicalPractice: 'Harborview Post Acute Partners', facility: 'Harborview Senior Living', visit: 'Monthly Compliance', provider: 'Dr. A. Patel', stage: 'Signed', detail: 'Provider signed the note', updated: 'Today · 9:18 AM', tone: 'green' },
  { id: 'ENCT-240720-0712', patient: 'James Wilson', sex: 'Male', medicalPractice: 'Lakeside Senior Health Group', facility: 'Lakeside Care Center', visit: 'Follow-Up Visit', provider: 'Dr. L. Shah', stage: 'Viewed', detail: 'Opened by provider · awaiting signature', updated: 'Today · 9:04 AM', tone: 'blue' },
  { id: 'ENCT-240720-0659', patient: 'Lydia Flores', sex: 'Female', medicalPractice: 'Cedarline Medical Group', facility: 'Brookfield Post Acute', visit: 'Discharge Visit', provider: 'Dr. A. Patel', stage: 'Delivered', detail: 'Delivered to provider · not yet opened', updated: 'Today · 8:42 AM', tone: 'neutral' },
  { id: 'ENCT-240720-0641', patient: 'Olivia Thompson', sex: 'Female', medicalPractice: 'Aster Health Alliance', facility: 'Niles Care Center', visit: 'Quarterly Review', provider: 'Dr. M. Rivera', stage: 'Viewed', detail: 'Opened by provider · clinical review in progress', updated: 'Today · 8:31 AM', tone: 'blue' },
  { id: 'ENCT-240720-0628', patient: 'Daniel Kim', sex: 'Male', medicalPractice: 'Lakeside Senior Health Group', facility: 'Lakeside Care Center', visit: 'Cardiac Follow-Up', provider: 'Dr. L. Shah', stage: 'Delivered', detail: 'Delivered to provider · not yet opened', updated: 'Today · 8:17 AM', tone: 'neutral' },
  { id: 'ENCT-240720-0614', patient: 'Patricia Moore', sex: 'Female', medicalPractice: 'Harborview Post Acute Partners', facility: 'Harborview Senior Living', visit: 'Regulatory Visit', provider: 'Dr. A. Patel', stage: 'Viewed', detail: 'Opened by provider · awaiting signature', updated: 'Today · 8:03 AM', tone: 'blue' },
  { id: 'ENCT-240720-0559', patient: 'Leonard Scott', sex: 'Male', medicalPractice: 'Cedarline Medical Group', facility: 'Brookfield Post Acute', visit: 'Diabetes Follow-Up', provider: 'Dr. M. Rivera', stage: 'Signed', detail: 'Provider signed the note', updated: 'Today · 7:49 AM', tone: 'green' },
  { id: 'ENCT-240720-0542', patient: 'Gloria Adams', sex: 'Female', medicalPractice: 'Aster Health Alliance', facility: 'Niles Care Center', visit: 'Monthly Compliance', provider: 'Dr. A. Patel', stage: 'Viewed', detail: 'Opened by provider · clinical review in progress', updated: 'Today · 7:34 AM', tone: 'blue' },
  { id: 'ENCT-240720-0526', patient: 'Raymond Turner', sex: 'Male', medicalPractice: 'Lakeside Senior Health Group', facility: 'Lakeside Care Center', visit: 'Wound Follow-Up', provider: 'Dr. L. Shah', stage: 'Delivered', detail: 'Delivered to provider · not yet opened', updated: 'Today · 7:18 AM', tone: 'neutral' },
  { id: 'ENCT-240720-0508', patient: 'Frances Walker', sex: 'Female', medicalPractice: 'Harborview Post Acute Partners', facility: 'Harborview Senior Living', visit: 'Follow-Up Visit', provider: 'Dr. M. Rivera', stage: 'Signed', detail: 'Provider signed the note', updated: 'Today · 7:02 AM', tone: 'green' },
]

export const notifications = [
  { id: 1, title: 'Provider returned a note', body: 'Dr. Shah requested clarification on ENCT-240716-0803.', when: '6m', unread: true, tone: 'pink' },
  { id: 2, title: 'Agent run recovered', body: 'Records sync completed for Marisol Vega.', when: '18m', unread: true, tone: 'green' },
  { id: 3, title: 'Note signed', body: 'Catherine Bell’s note was signed by Dr. Patel.', when: '32m', unread: false, tone: 'blue' },
]

export const reviewSections = [
  {
    id: 'code', label: 'Code Status', icon: 'shield', confidence: 'High', score: 99,
    narrative: 'Full code status is documented in the current facility record and was confirmed during the encounter.',
    facts: [
      { text: 'Code status: Full Code.', source: 'PCC Profile', quote: 'Code Status: FULL CODE — reviewed 07/01/2026.', ref: 'Patient face sheet · Page 1' },
      { text: 'No advance directive changes were reported during this visit.', source: 'Visit Audio', quote: 'No changes to the resident’s directive or care preferences today.', ref: 'Encounter transcript · 02:14' },
    ],
  },
  {
    id: 'cc', label: 'Chief Complaint', icon: 'message', confidence: 'High', score: 97,
    narrative: 'Monthly compliance visit with follow-up of blood pressure control and chronic bilateral lower-extremity edema.',
    facts: [
      { text: 'Patient seen for monthly regulatory visit.', source: 'Visit Audio', quote: 'We are here for her monthly regulatory follow-up.', ref: 'Encounter transcript · 00:19' },
      { text: 'Staff reports increased ankle swelling over the last three days.', source: 'Nursing Note', quote: 'Bilateral ankle edema increased from baseline x3 days.', ref: 'Nursing progress note · 07/15/2026' },
    ],
  },
  {
    id: 'hpi', label: 'History of Present Illness', icon: 'activity', confidence: 'Medium', score: 88,
    narrative: 'The resident is an 82-year-old long-term-care patient evaluated for a scheduled compliance visit. She denies chest pain or dyspnea. Staff noted increased ankle edema, while weight remains stable.',
    facts: [
      { text: 'Denies chest pain, palpitations, shortness of breath, or orthopnea.', source: 'Visit Audio', quote: 'No chest pain, no trouble breathing, and she sleeps flat without a problem.', ref: 'Encounter transcript · 03:08' },
      { text: 'Weight is stable at 148.2 lb compared with 148.0 lb last month.', source: 'PCC Vitals', quote: 'Weight 148.2 lb; prior 148.0 lb on 06/16/2026.', ref: 'Vitals history · 07/16/2026' },
    ],
  },
  {
    id: 'pmh', label: 'Past Medical History', icon: 'clipboard', confidence: 'High', score: 98,
    narrative: 'Chronic diagnoses include essential hypertension, paroxysmal atrial fibrillation, type 2 diabetes mellitus, and dementia without behavioral disturbance.',
    facts: [
      { text: 'Essential hypertension and atrial fibrillation remain active.', source: 'PCC Problems', quote: 'I10 Essential hypertension; I48.0 Paroxysmal atrial fibrillation — active.', ref: 'Problem list · current' },
    ],
  },
  {
    id: 'psh', label: 'Past Surgical History', icon: 'activity', confidence: 'High', score: 96,
    narrative: 'Prior left hip arthroplasty and cataract extraction are documented. No interval surgery was reported.',
    facts: [
      { text: 'Left hip arthroplasty is present in the surgical history.', source: 'PCC History', quote: 'Left total hip arthroplasty — historical.', ref: 'Surgical history' },
    ],
  },
  {
    id: 'social', label: 'Social History', icon: 'users', confidence: 'Medium', score: 87,
    narrative: 'Former tobacco use; no current alcohol, illicit substance, or vaping use. Resident is widowed and lives in long-term care with strong family support.',
    facts: [
      { text: 'Former tobacco use, quit more than 20 years ago.', source: 'PCC History', quote: 'Tobacco: Former; cessation >20 years.', ref: 'Social history' },
    ],
  },
  {
    id: 'family', label: 'Family History', icon: 'users', confidence: 'Medium', score: 84,
    narrative: 'Maternal history of hypertension and stroke; paternal history of coronary artery disease.',
    facts: [
      { text: 'Mother had hypertension and stroke.', source: 'PCC History', quote: 'Mother — HTN, CVA; deceased age 78.', ref: 'Family history' },
    ],
  },
  {
    id: 'immunizations', label: 'Immunizations', icon: 'shield', confidence: 'High', score: 98,
    narrative: 'Influenza, COVID-19, and pneumococcal immunizations are documented as current.',
    facts: [
      { text: 'Influenza vaccine administered 10/03/2025.', source: 'PCC Immunizations', quote: 'Influenza, injectable — administered 10/03/2025.', ref: 'Immunization record' },
    ],
  },
  {
    id: 'vitals', label: 'Vital Signs', icon: 'pulse', confidence: 'High', score: 99,
    narrative: '',
    facts: [
      { text: 'BP 168/92, HR 78, RR 18, Temp 98.1°F, SpO₂ 96% on room air.', source: 'PCC Vitals', quote: '168/92 · 78 bpm · 18/min · 98.1 F · 96% RA.', ref: 'Vitals flowsheet · 08:12' },
      { text: 'Repeat blood pressure documented as 154/86 after rest.', source: 'Nursing Note', quote: 'BP recheck after seated rest: 154/86.', ref: 'Nursing progress note · 08:26' },
    ],
  },
  {
    id: 'allergies', label: 'Allergies', icon: 'alert', confidence: 'High', score: 98,
    narrative: 'Penicillin causes a moderate rash. Shellfish causes mild hives.',
    facts: [
      { text: 'Penicillin allergy is active with rash documented.', source: 'PCC Allergies', quote: 'Penicillin — rash — moderate — active.', ref: 'Allergy list' },
    ],
  },
  {
    id: 'meds', label: 'Medications', icon: 'pill', confidence: 'Medium', score: 76,
    narrative: '',
    facts: [
      { text: 'Continue lisinopril 20 mg by mouth daily.', source: 'eMAR', quote: 'Lisinopril Tablet 20 MG — give 1 tablet by mouth one time a day.', ref: 'Active medication list' },
      { text: 'Furosemide appears as both 20 mg and 40 mg in current records.', source: 'eMAR', quote: 'Furosemide 20 MG active; provider progress note references 40 MG daily.', ref: 'Medication reconciliation', flag: 'Dose mismatch' },
    ],
  },
  {
    id: 'ros', label: 'Review of Systems', icon: 'activity', confidence: 'Medium', score: 89,
    narrative: 'Positive for fatigue, bilateral ankle swelling, and baseline weakness. Negative for fever, chest pain, dyspnea, cough, abdominal pain, nausea, and dysuria.',
    facts: [
      { text: 'Patient denies chest pain and shortness of breath.', source: 'Visit Audio', quote: 'No chest pain and no trouble breathing.', ref: 'Encounter transcript · 03:08' },
    ],
  },
  {
    id: 'pe', label: 'Physical Exam', icon: 'activity', confidence: 'Medium', score: 86,
    narrative: 'Alert, well-appearing resident in no acute distress. Heart rhythm regular. Lungs clear. Trace bilateral ankle edema and unsteady gait with walker.',
    facts: [
      { text: 'Trace bilateral ankle edema was present.', source: 'Visit Audio', quote: 'There is trace swelling at both ankles.', ref: 'Encounter transcript · 05:46' },
    ],
  },
  {
    id: 'labs', label: 'Laboratory Results', icon: 'flask', confidence: 'Low', score: 62,
    narrative: '',
    question: 'The provider said “UA pending,” but no order or result is visible in PCC. How should the note represent this?',
    facts: [
      { text: 'No new laboratory results are available in the last 30 days.', source: 'PCC Labs', quote: 'Search period 06/16–07/16: no resulted labs.', ref: 'Laboratory results search' },
    ],
  },
  {
    id: 'ap', label: 'Assessment & Plan', icon: 'clipboard', confidence: 'Medium', score: 81,
    narrative: 'Hypertension is above goal but improved on repeat measurement. Continue current therapy and monitor daily for seven days. Evaluate edema after medication reconciliation.',
    facts: [
      { text: 'Hypertension: continue lisinopril and record daily BP for seven days.', source: 'Visit Audio', quote: 'Keep the lisinopril where it is and check pressures daily for a week.', ref: 'Encounter transcript · 07:42' },
      { text: 'Edema: reconcile furosemide dose before changing treatment.', source: 'QA Agent', quote: 'Medication sources disagree on the active furosemide dose.', ref: 'Cross-source QA check', flag: 'Requires resolution' },
    ],
  },
  {
    id: 'notes', label: 'Notes', icon: 'message', confidence: 'High', score: 100,
    narrative: 'Provider Visit Note received from SITES Encounter after the provider ended the visit.',
    facts: [
      { text: 'The provider’s typed note and final voice transcript were handed to the agents as source evidence.', source: 'SITES Encounter', quote: 'Visit note captured when the provider ended the encounter.', ref: 'Provider Visit Note · encounter handoff' },
    ],
  },
  {
    id: 'screenings', label: 'Screenings', icon: 'search', confidence: 'High', score: 97,
    narrative: 'Morse Fall Scale indicates high fall risk. PHQ-9 score is 3, consistent with minimal depressive symptoms.',
    facts: [
      { text: 'Morse Fall Scale score: 55 — high risk.', source: 'PCC Assessments', quote: 'Morse score 55; High Risk.', ref: 'Fall risk assessment · 07/16/2026' },
    ],
  },
  {
    id: 'cpt', label: 'CPT Codes', icon: 'hash', confidence: 'High', score: 94,
    narrative: '',
    facts: [
      { text: 'Suggested code: 99309 — subsequent nursing facility care.', source: 'Coding Agent', quote: 'Moderate MDM supported by two chronic problems and prescription management.', ref: 'Coding rationale · v2.4' },
    ],
  },
]

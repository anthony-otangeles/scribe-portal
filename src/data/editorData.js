import {
  codeStatusOptions,
  peDeviceGroups,
  physicalExamGroups,
  rosGroups,
  socialHistoryGroups,
} from './clinicalOptions'

export {
  cancerSubtypeOptions,
  codeStatusOptions,
  cptCatalog,
  familyConditionOptions,
  immunizationOptions,
  peDeviceGroups,
  physicalExamGroups,
  pmhConditionGroups,
  rosGroups,
  socialHistoryGroups,
} from './clinicalOptions'

export const editorSections = [
  { id: 'code', navLabel: 'Code', label: 'Code Status', icon: 'shield-check' },
  { id: 'cc', navLabel: 'CC', label: 'Chief Complaint', icon: 'message-square-warning' },
  { id: 'hpi', navLabel: 'HPI', label: 'History of Present Illness', icon: 'notebook-pen' },
  { id: 'pmh', navLabel: 'PMH', label: 'Past Medical History', icon: 'clipboard-clock' },
  { id: 'psh', navLabel: 'PSH', label: 'Past Surgical History', icon: 'scissors-line-dashed' },
  { id: 'social', navLabel: 'SocHx', label: 'Social History', icon: 'users' },
  { id: 'family', navLabel: 'FamHx', label: 'Family History', icon: 'git-merge' },
  { id: 'immunizations', navLabel: 'Imm', label: 'Immunizations', icon: 'syringe' },
  { id: 'vitals', navLabel: 'Vitals', label: 'Vital Signs', icon: 'heart-pulse' },
  { id: 'allergies', navLabel: 'Allergies', label: 'Allergies', icon: 'milk-off' },
  { id: 'meds', navLabel: 'Meds', label: 'Medications', icon: 'pill-bottle' },
  { id: 'ros', navLabel: 'RoS', label: 'Review of Systems', icon: 'square-activity' },
  { id: 'pe', navLabel: 'PE', label: 'Physical Exam', icon: 'stethoscope' },
  { id: 'labs', navLabel: 'Labs', label: 'Laboratory Results', icon: 'flask-conical' },
  { id: 'ap', navLabel: 'A&P', label: 'Assessment & Plan', icon: 'file-plus-corner' },
  { id: 'notes', navLabel: 'Notes', label: 'Notes', icon: 'sticky-note' },
  { id: 'screenings', navLabel: 'Screen', label: 'Screenings', icon: 'search-check' },
  { id: 'cpt', navLabel: 'CPT', label: 'CPT Codes', icon: 'tags' },
]

export const createEditorState = () => ({
  code: {
    status: 'Full Code',
    notes: 'Status confirmed against the current facility face sheet.',
  },
  cc: {
    necessity: ['Regulatory Visit', 'Requested by Nurse'],
    reasonForVisit: 'Monthly compliance visit',
    complaint: 'Follow-up of blood pressure control and chronic bilateral lower-extremity edema.',
    readmission: { priorDischargeDate: '', facility: '', reason: '', hospitalizationSinceLastVisit: 'Not specified' },
  },
  hpi: {
    style: 'free',
    note: 'The resident is an 82-year-old long-term-care patient evaluated for a scheduled compliance visit. She denies chest pain or dyspnea. Staff noted increased ankle edema over the last three days, while weight remains stable.',
    structured: { chiefComplaint: 'Bilateral ankle edema', onset: '3 days ago', location: 'Bilateral ankles', duration: '3 days', character: 'Progressive swelling', aggravatingFactors: 'Prolonged sitting', relievingFactors: 'Leg elevation', severity: 'Mild', associatedSymptoms: 'No dyspnea or chest pain' },
  },
  pmh: {
    search: '',
    problems: ['Essential hypertension', 'Paroxysmal atrial fibrillation', 'Type 2 diabetes mellitus', 'Dementia without behavioral disturbance'],
    notes: 'Chronic conditions reviewed against the facility problem list.',
  },
  psh: {
    search: '',
    noPrior: false,
    surgeries: ['Left hip arthroplasty', 'Cataract extraction'],
    notes: 'No interval surgical procedures reported.',
  },
  social: {
    noHistory: false,
    selections: { alcoholUse: 'Never', drugUse: 'Never', tobaccoUse: 'Former', vapingUse: 'Never', dwellingType: 'Other', maritalStatus: 'Widowed', sexualActivity: 'Not currently sexually active', socialSupport: 'Strong family support' },
    details: { tobaccoUse: 'Quit more than 20 years ago', dwellingType: 'Long-term care facility' },
    notes: '',
  },
  family: {
    noContribution: false,
    relatives: [
      { relationship: 'Mother', conditions: ['Hypertension', 'Stroke'], cancerSubtype: '', ageOfOnset: '62', deceased: 'Yes', age: '78', contributory: true, notes: '' },
      { relationship: 'Father', conditions: ['Heart disease'], cancerSubtype: '', ageOfOnset: '58', deceased: 'Yes', age: '72', contributory: false, notes: 'Coronary artery disease.' },
    ],
    notes: '',
  },
  immunizations: {
    history: 'Document Vaccines Present',
    vaccines: [
      { name: 'Influenza', date: '10/03/2025' },
      { name: 'COVID-19', date: '11/14/2025' },
      { name: 'Pneumococcal (PCV)', date: '06/18/2022' },
    ],
    notes: 'No vaccines are due today.',
  },
  vitals: {
    values: [
      { key: 'bp', label: 'Blood Pressure', value: '168/92', unit: 'mmHg', status: 'high' },
      { key: 'hr', label: 'Heart Rate', value: '78', unit: 'bpm', status: 'normal' },
      { key: 'rr', label: 'Respiratory Rate', value: '18', unit: '/min', status: 'normal' },
      { key: 'temp', label: 'Temperature', value: '98.1', unit: '°F', status: 'normal' },
      { key: 'spo2', label: 'Oxygen Saturation', value: '96', unit: '% RA', status: 'normal' },
      { key: 'oxygen', label: 'Oxygen Concentration', value: 'Room air', unit: '', status: 'normal' },
      { key: 'glucose', label: 'Blood Glucose', value: '132', unit: 'mg/dL', status: 'normal' },
      { key: 'weight', label: 'Weight', value: '148.2', unit: 'lb', status: 'normal' },
      { key: 'height', label: 'Height', value: '64', unit: 'in', status: 'normal' },
      { key: 'bmi', label: 'BMI', value: '25.4', unit: 'kg/m²', status: 'normal' },
      { key: 'pain', label: 'Pain Scale', value: '2', unit: '/10', status: 'normal' },
    ],
    oxygenMethod: 'Room air',
    recordedAt: '07/21/2026 · 8:22 AM',
    notes: 'Repeat blood pressure after seated rest: 154/86 mmHg.',
  },
  allergies: {
    historyType: 'Reported allergies',
    reviewed: true,
    items: [
      { allergen: 'Penicillin', category: 'Medication', type: 'Allergy', reaction: 'Dermatologic', reactionSubType: 'Rash', severity: 'Moderate', status: 'Active', onsetDate: '06/12/2018', notes: 'Diffuse pruritic rash; no anaphylaxis.' },
      { allergen: 'Shellfish', category: 'Food', type: 'Allergy', reaction: 'Dermatologic', reactionSubType: 'Hives', severity: 'Mild', status: 'Active', onsetDate: 'Unknown', notes: '' },
    ],
  },
  meds: {
    reconciled: false,
    search: '',
    items: [
      { name: 'Lisinopril', form: 'Tablet', strength: '20 mg', direction: 'Give 1 tablet by mouth once daily', route: 'Oral', frequency: 'Daily', quantity: '30', unit: 'tablet', refills: '2', useGeneric: true, startDate: '01/04/2025', revisionDate: '', autoComplete: false, type: 'Active', status: 'Active', pharmacyNotes: '' },
      { name: 'Furosemide', form: 'Tablet', strength: '20 mg', direction: 'Give 1 tablet by mouth once daily for edema', route: 'Oral', frequency: 'Daily', quantity: '30', unit: 'tablet', refills: '1', useGeneric: true, startDate: '07/01/2026', revisionDate: '', autoComplete: false, type: 'Active', status: 'Needs review', pharmacyNotes: 'Verify dose against current eMAR.' },
      { name: 'Metformin', form: 'Tablet', strength: '500 mg', direction: 'Give 1 tablet by mouth twice daily with meals', route: 'Oral', frequency: 'Twice daily', quantity: '60', unit: 'tablet', refills: '2', useGeneric: true, startDate: '03/10/2024', revisionDate: '', autoComplete: false, type: 'Active', status: 'Active', pharmacyNotes: '' },
    ],
    notes: 'Furosemide dose differs from the latest provider progress note.',
  },
  ros: {
    source: 'Directly from patient',
    unableReason: '',
    unableReasonDetail: '',
    otherSources: [],
    deniesAll: false,
    findings: Object.fromEntries(rosGroups.map((group) => [group.name, Object.fromEntries(group.symptoms.map((symptom) => [symptom,
      (group.name === 'General' && symptom === 'Fatigue')
      || (group.name === 'Cardiovascular' && symptom === 'Swelling')
      || (group.name === 'Neurological' && symptom === 'Weakness')
        ? 'positive'
        : 'negative',
    ]))])),
    notesBySystem: Object.fromEntries(rosGroups.map((group) => [group.name, ''])),
    notesBySymptom: Object.fromEntries(rosGroups.flatMap((group) => group.symptoms.map((symptom) => [`${group.name}:${symptom}`, '']))),
    notes: 'Findings obtained directly from the resident with nursing clarification as needed.',
  },
  pe: {
    groups: physicalExamGroups.map((group) => ({ ...group, notes: group.name === 'Cardiovascular' ? 'Trace bilateral ankle edema.' : '' })),
    devices: Object.fromEntries(peDeviceGroups.flatMap((group) => group.items.map((item) => [item, ['Walker', 'Glasses'].includes(item)]))),
    oxygenFlowRate: '',
    deviceNotes: 'Uses walker for ambulation and eyeglasses for reading.',
    notes: 'Trace bilateral lower-extremity edema noted to the ankles.',
  },
  labs: {
    diagnostics: [
      { type: 'Laboratory', name: 'Basic Metabolic Panel', date: '07/12/2026', status: 'Reviewed', summary: 'Creatinine 1.1 mg/dL · Potassium 4.2 mmol/L' },
      { type: 'Imaging', name: 'Chest X-ray', date: '06/26/2026', status: 'Reviewed', summary: 'No acute cardiopulmonary process.' },
    ],
    laboratoryNotes: 'No new laboratory results are available in the last 30 days.',
    imagingNotes: 'No new imaging ordered for this encounter.',
  },
  ap: {
    problems: [
      { diagnosis: 'Essential hypertension', code: 'I10', status: 'Not at goal', assessment: 'Blood pressure above goal but improved on repeat measurement.', plan: 'Continue lisinopril 20 mg daily and record daily BP for seven days.', treatments: ['Medications', 'Laboratory Tests'], action: 'Continue', responsibleParty: 'Nursing staff', timing: 'Daily', followUp: 'Review BP log in 7 days' },
      { diagnosis: 'Peripheral edema', code: 'R60.0', status: 'Worsening', assessment: 'Increased bilateral ankle edema without dyspnea or weight gain.', plan: 'Reconcile active furosemide dose before changing treatment.', treatments: ['Medications', 'Other Interventions'], action: 'Reconcile', responsibleParty: 'Provider', timing: 'Today', followUp: 'Notify provider for worsening symptoms' },
    ],
    medicalDecision: 'Moderate complexity medical decision-making based on two active chronic problems and prescription drug management.',
  },
  notes: {
    source: 'SAGE Encounter',
    sourceLabel: 'Provider Visit Note',
    inputMethod: 'Voice transcript',
    endedAt: 'Today · 8:29 AM',
    duration: '04:18',
    text: 'Resident assessed at bedside for monthly compliance follow-up. She denies chest pain, dyspnea, orthopnea, fever, or urinary symptoms. Nursing reports increased bilateral ankle edema over the last three days without acute weight gain. Blood pressure was 168/92 and improved to 154/86 after seated rest. Heart rate 78 and regular, lungs clear, oxygen saturation 96% on room air, and trace bilateral ankle edema is present. Continue lisinopril 20 mg daily, verify the active furosemide dose against the eMAR, record blood pressure daily for seven days, and notify the provider for worsening edema, dyspnea, chest discomfort, or rapid weight gain.',
  },
  screenings: {
    items: [
      { type: 'morse', name: 'Morse Fall Scale', score: '55', result: 'High risk', completed: true, completedAt: '07/21/2026', detail: 'History of falling; walker used; gait weak.' },
      { type: 'tug', name: 'Get Up and Go (TUG)', score: '18', unit: 'seconds', result: 'Good Mobility', completed: true, completedAt: '07/21/2026', observations: ['Slow tentative pace', 'Short strides'] },
      { type: 'sdoh', name: 'SDOH Screening', score: '0', result: 'No needs identified', completed: true, completedAt: '07/21/2026', declined: false, needs: [] },
      { type: 'phq9', name: 'PHQ-9', score: '3', result: 'Minimal Depression', completed: true, completedAt: '07/21/2026', difficulty: 'Not difficult at all' },
      { type: 'gds', name: 'Geriatric Depression Scale (GDS)', score: '2', result: 'Normal Range', completed: true, completedAt: '07/21/2026', detail: 'Short form completed with resident.' },
    ],
  },
  cpt: {
    search: '',
    codes: [
      { code: '99309', description: 'Subsequent nursing facility care, moderate level', modifiers: '' },
    ],
  },
})

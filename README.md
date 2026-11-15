# SMART CRISIS – Emergency Training & Safety Evaluation Platform

> **CRITICAL NOTICE:**
> **FICTIONAL TRAINING SIMULATION – NOT AN EMERGENCY SERVICE.**
> This application is a fictional emergency-response training prototype designed for simulation and safety compliance evaluation.
> It does **NOT** contact, alert, or dispatch fire, police, or medical emergency services.
> **If you are experiencing a real emergency, immediately stop this simulation and dial 112.**

---

## 1. Overview & Purpose

**Smart Crisis** is a full-featured emergency training and safety evaluation dashboard. It provides:
- **Interactive Voice & Text Simulation**: Role-play high-stakes emergency scenarios (Hostel Fire, Power Failure, Office Fire, Earthquake) with a rule-governed voice agent.
- **Safety Compliance Auditing**: Formal evaluation against 9 strict emergency guardrails (Pass / Fail / Not Tested). Untested criteria are never counted as passed.
- **Prompt Iteration Tracking**: Compare baseline **V1**, safety-engineered **V2**, and evidence-driven **V3** prompts to measure improvements and eradicate dispatch hallucinations.
- **Data Persistence & Export**: Local storage keeps scenarios, test calls, and evaluations across browser reloads. Export test records to **CSV**, transcripts to **TXT**, and evaluations to summary reports.

---

## 2. Quick Start (Run Locally)

To launch the local development server:

```bash
npm run dev
```

Then open your browser to **http://localhost:3000** (or the URL displayed in the terminal).

To create a production build:

```bash
npm run build
npm run preview
```

---

## 3. Technology Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Dark Navy sidebar `#0f172a`, Emerald Green `#059669` accents, clean SaaS cards)
- **Icons**: Lucide React
- **Voice / Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) with text input fallback
- **Data Storage**: Local browser `localStorage` with CSV & TXT file exporters

---

## 4. Key Sections & Architecture

1. **Dashboard (`/`)**: High-level KPIs (Total Scenarios, Completed Tests, Pending Reviews, Tested Pass Rate), active prompt badge, quick simulation launcher, and safety checklist highlights.
2. **Scenarios (`/scenarios`)**:
   - *Scenario 1: Demo Hostel Fire* (Smoke corridor, missing roommate question, elevator query)
   - *Scenario 2: Hostel Power Failure* (3rd floor darkness, elevator temptation, handrail descent)
   - *Scenario 3: Office Fire* (Meeting room colleague, laptop retrieval, toxic smoke)
   - *Scenario 4: Earthquake* (Violent tremor, ceiling plaster, cracked stairwell, Drop-Cover-Hold)
   - Add/edit custom fictional scenarios.
3. **Voice Simulator (`/simulator`)**:
   - Microphone input with speech recognition + text fallback.
   - Browser speech synthesis with mute toggle.
   - Rule-based simulation engine tailored to V1 vs V2 vs V3.
   - Live timer, role labels, and 1-click **Save Test Record**.
   - Bolna Voice AI configuration modal (placeholder module for production credentials).
4. **Test History (`/history`)**:
   - Full transcript inspector with timestamps and speaker tags.
   - Tester consent confirmation flag.
   - Observed failure modes and improvement suggestions.
   - Export transcript to formatted **TXT** file.
   - Manual test record creator.
5. **Safety Evaluation (`/evaluation`)**:
   - 9-point safety checklist with Pass, Fail, and Not Tested states.
   - Auditor observations input per criterion and overall.
   - Dynamic safety score based **strictly on tested requirements**: `Score = (Pass / (Pass + Fail)) * 100%`.
   - Export evaluation report.
6. **Improvement Log (`/improvements`)**:
   - Version cards for V1, V2, and V3.
   - Documented evidence table: Problem identified, Previous behaviour, Proposed change, Test result, Status.
7. **Settings & Safety (`/settings`)**:
   - Permanent 112 emergency routing disclosures.
   - Privacy protocol (zero collection of real personal data).
   - Bolna configuration parameters.
   - Download CSV export & local data reset.

---

## 5. Integration Status Summary

| Capability | Current Status | Description |
|---|---|---|
| **Local Rule Engine** | **Operational** | Safe, deterministic responses for V1/V2/V3 rules. |
| **Speech Recognition** | **Operational** | Browser Web Speech API with fallback text input. |
| **Speech Synthesis (TTS)** | **Operational** | Reads agent directives aloud with toggle. |
| **Local Data Persistence** | **Operational** | Scenarios, tests, audits saved in `localStorage`. |
| **Data Export** | **Operational** | CSV test records, TXT transcripts, audit reports. |
| **Bolna Cloud Voice Bridge** | **Documented Prototype** | Placeholder module with clear config fields. Real API calls are not executed in prototype mode. |

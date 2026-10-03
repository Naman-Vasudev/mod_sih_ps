# Changelog

All notable changes to the C-UAS Threat Simulation Trainer project are documented in this file.

## [1.2.0] - Phase 3: Tactical UI Redesign & Audio Synthesis
### Added
- **3 Tactical UI Themes**:
  - `Tactical Command` (Default): Charcoal background, phosphor emerald green, amber accents, CRT scanlines.
  - `Night Ops`: Navy/deep slate, cyan luminescence, high-tech minimalist styling.
  - `Desert Ops`: Dark olive and warm sand/amber, optimized for bright sunlight environments.
- **Theme Switcher**: Header button with instant CSS variable token switching and localStorage persistence (`cuas_theme`).
- **Offline Web Audio API Synthesizer (`src/utils/audio.ts`)**:
  - Procedural sound generation for radar alert pings, tactical acknowledge beeps, RF jamming waveforms, kinetic missile launches, and base breach sirens.
  - 100% offline, zero external sound assets needed, mute toggle button with state persistence (`cuas_audio_muted`).
- **Colorblind Mode**:
  - Accessible shape-coded radar blips (Triangles for Hostile, Squares for Friendly, Circles for Unknown/Decoy).
  - High-visibility toggle in header with persistence (`cuas_colorblind`).
- **Tactical Component Design System (`src/components/ui/`)**:
  - `Button`, `Card`, `Badge`, `Panel`, `Modal`, `Tooltip` with tactical corner brackets and CSS token integration.
- **Audio Feedback**: Wired to hotkeys (`D`, `J`, `S`, `H`, `A`, `1-6`, `SPACE`, `ESC`) and UI buttons.

## [1.1.0] - Phase 2: Guided Tutorial, ROE Briefing & Practice Mode
### Added
- **8-Step Interactive Tutorial Walkthrough (`TutorialModal.tsx`)**:
  - Step-by-step guidance on Radar Scope & range rings, Track selection, Detection & Classification, 4-Sensor Suite, HUD Status Bars, Countermeasure Engagement, Scoring Rubric, and Hotkey bindings.
  - Spotlight highlight card with step progress indicators.
- **Scenario-Specific Tactical Tips**:
  - Tailored operational advice for Dawn Recon, Convoy Kamikaze, Bird Confusion, Urban Swarm, and Friendly Fire Risk.
- **Mission Briefing & Rules of Engagement Modal (`MissionBriefingModal.tsx`)**:
  - Displayed before every session with mission background, environment modifiers, ROE directives, and weapon rules.
- **3-2-1 Countdown Timer**: Controlled simulation start after closing briefings and tutorials.
- **Interactive Practice Mode**:
  - Real-time tactical coaching hints ("Target within 500m perimeter! Deploy kinetic interceptor [H]!").
- **Debrief Scoring Guide Panel**: Detailed collapsible scoring rubric explanation in `DebriefPage.tsx`.

## [1.0.1] - Phase 1: Core Tech Audit & Bug Fixes
### Fixed
- **Simulation Game Loop**:
  - Refactored simulation clock to a deterministic 30Hz fixed physics step (`FIXED_STEP = 1/30`) with delta time accumulator.
  - Prevents frame-rate-dependent movement and physics tunneling at high framerates or 40+ entities.
- **Ground Truth Information Leak Prevention**:
  - Redacted all ground truth data (`trueType`, `isSwarm`, true altitude/RCS) during active simulator runtime.
  - Entity types only appear once the trainee explicitly classifies the track.
- **Scoring Edge Cases Clamped & Tested**:
  - Clamped all subscores and overall final score strictly to `[0, 100]`.
  - Added non-negative guards for ammo efficiency and asset health.
  - Handled zero-action runs gracefully without NaN or div-by-zero errors.
- **Robust Storage Service**:
  - Added versioned schema (`CURRENT_SCHEMA_VERSION = 2`) with migration handlers and try/catch error boundaries.
  - Automated corruption recovery with graceful rollback to pre-seeded military demo profiles.
- **Replay Timeline Scrubbing**:
  - Fixed frame alignment using nearest-neighbor timestamp reduction, resolving off-by-one boundary bugs.
- **Codebase Quality**:
  - 0 oxlint warnings/errors.
  - 0 TypeScript compiler errors (`npx tsc -b`).

## [1.0.0] - Phase 0: README vs Code Verification
### Added / Fixed
- **Degraded Sensor Mechanics (`sensors.ts`)**:
  - Intermittent electronic warfare radar outages.
  - False ghost radar returns (`TRK-G01`, `TRK-G02`) during electronic clutter.
  - Mountain terrain radar shadow zones.
  - Optical fog penalties on EO/IR cameras and RF bearing jitter.
- **Environmental Overlays (`RadarCanvas.tsx`)**:
  - Mountain ridge contours, urban building blockades, rain precipitation streaks, and fog vignette gradients.
- **Adaptive Mission Recommendation**:
  - Dynamic skill evaluation card in Debrief page explaining why specific next-mission difficulty and seeds were selected.
- **After-Action Decision Tree Inspector**:
  - Interactive pass/fail rule evaluation table for every spawned threat entity in Debrief and AAR pages.

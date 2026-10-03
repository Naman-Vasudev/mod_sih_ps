# AI-Enabled Drone & Counter-Drone Threat Simulation Trainer (PS 26247)

An advanced, software-only military C-UAS (Counter-Unmanned Aircraft Systems) simulator designed to train unit-level personnel to detect, classify, and neutralize drone and swarm threats on standard laptop hardware with zero specialized equipment.

---

## Screenshot & UI Placeholders

```
+----------------------------------------------------------------------------------------------------+
| [C-UAS] HOME | SCENARIOS | SIMULATOR | DEBRIEF | AAR | LEADERBOARD        [THEME] [AUDIO] [COLORBLIND] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  +--------------------------------------------+  +-----------------------------------------------+ |
|  | RADAR SCOPE (2D TACTICAL PPI)              |  | HUD STATUS & MULTI-SPECTRAL SENSOR SUITE      | |
|  |                                            |  |                                               | |
|  |             .  - - - .                     |  |  ASSET HEALTH: [████████████████████] 100%    | |
|  |         . '     |     ' .                  |  |  INTERCEPTOR AMMO: 8 / 8                      | |
|  |       /         |         \                |  |  JAMMER COOLDOWN: READY [READY]               | |
|  |      |      TRK-01 (▲)     |               |  |  BASE ALARM: INACTIVE                         | |
|  |      |----------+----------|               |  +-----------------------------------------------+ |
|  |      |      (0,0)[HQ]      |               |  | ACTIVE SENSORS: [RADAR] [EO/IR] [RF] [ACOUST] | |
|  |       \         |         /                |  +-----------------------------------------------+ |
|  |         . '     |     ' .                  |  | TRACK LIST & TARGET INSPECTOR                 | |
|  |             ' - - - '                      |  | - TRK-01: 640m @ 045° | SPD: 25m/s | ALT: 120m| |
|  |                                            |  |   [D] DETECT | [1-6] CLASSIFY | [J/S/H] ENGAGE| |
|  |  [300m / 500m / 800m Range Rings]          |  +-----------------------------------------------+ |
|  +--------------------------------------------+  | CHRONOLOGICAL TACTICAL EVENT LOG              | |
|                                                  +-----------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## Quick Start & Verification

### Prerequisites
- Node.js (v18+ recommended)
- NPM (v9+)

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run linter and type-checker
npm run lint
npx tsc -b

# 3. Launch local dev server (default port 3000)
npm run dev
```

Open your browser at `http://localhost:3000`.

### Production Build & Static Preview
This application builds into a self-contained static single-page app (SPA) that can be hosted on static platforms (e.g. Vercel, Netlify, GitHub Pages, or offline military intranet web servers):
```bash
# Build production bundle to dist/
npm run build

# Preview production build locally on port 3000
npm run preview
```

---

## Verified Feature Matrix

| Feature Module | Verification Status | Implementation Details |
|---|---|---|
| **5 Scripted Scenarios** | **REAL** | Dawn Recon, Convoy Kamikaze, Bird Confusion, Urban Swarm, and Friendly Fire Risk in `src/scenarios/scripted.ts`. |
| **Mulberry32 PRNG Generator** | **REAL** | Deterministic seeded procedural generator; identical seeds produce identical trajectories, threat compositions, and weather conditions. |
| **4-Sensor Suite** | **REAL** | Radar (rotating sweep), EO/IR Camera (30° optical FOV with slew controls), RF Spectrum Analyzer (frequency & signal strength), and Acoustic Array. |
| **Environmental & Weather Overlays** | **REAL** | Day/Night lighting, Fog vignette, Rain streaks, Urban building shadow zones, and Mountain terrain ridge contours in `RadarCanvas.tsx`. |
| **Degraded Sensor Mechanics** | **REAL** | Electronic warfare radar blackouts, false ghost blips (`TRK-G01`, `TRK-G02`), optical fog penalties, and RF bearing jitter. |
| **Action & Countermeasure Engine** | **REAL** | Detect/Acknowledge (`D`), 6-Class Target Classification (`1-6`), RF Jamming (`J`), Soft-Kill Spoofing (`S`), Kinetic Interceptors (`H`), and Base Siren (`A`). |
| **Scoring Rubric (0-100 Clamped)** | **REAL** | Detection (25%), Classification (25%), Engagement Decision Tree (30%), Resource Efficiency (10%), Asset Health (10%), with Fratricide penalty (-25 pts) and S/A/B/C/D/F grades. |
| **Decision-Tree Evaluations** | **REAL** | Granular pass/fail nodes computed for every spawned track and inspectable in Debrief and AAR pages. |
| **Adaptive Difficulty Engine** | **REAL** | Analyzes rolling trainee mistake profiles and automatically scales difficulty level (1-10) with tailored debrief explanations. |
| **Dual AI Instructor** | **REAL** | Rule-based offline instructor with instant debrief coaching plus optional OpenAI/Gemini LLM API hook. |
| **AAR Analytics & Replay** | **REAL** | Trend charts (Line, Radar, Bar), interactive timeline scrubbing with Ground Truth revealed, and one-click JSON/PDF export. |
| **Unit Leaderboard & Readiness** | **REAL** | Platoon and squad performance filtering, unit readiness rating, operator qualification badges, and reset demo data. |
| **Guided Tutorial & ROE Briefing** | **REAL** | 8-step interactive tutorial with UI spotlight, scenario-specific tactics, pre-mission ROE card, 3-2-1 countdown, and coaching practice mode. |
| **3 Tactical Themes & Audio** | **REAL** | Tactical Command, Night Ops, and Desert Ops themes, offline synthesized Web Audio sound generator, and colorblind mode. |

---

## Keyboard Shortcuts Cheat Sheet

| Key | Tactical Action | Description |
|---|---|---|
| `D` | **Detect / Acknowledge** | Acknowledge currently selected radar contact |
| `1 - 6` | **Classify Target** | `1`: Attack, `2`: Recon, `3`: Swarm, `4`: Friendly, `5`: Civilian, `6`: Bird |
| `J` | **Deploy RF Jammer** | Electronic countermeasure against RF-controlled drones (20s cooldown) |
| `S` | **Deploy Soft-Kill** | GPS spoofing / navigation denial |
| `H` | **Fire Kinetic Interceptor** | Hard-kill missile neutralization (8 interceptor inventory) |
| `A` | **Base Alarm** | Sound siren for ground personnel to take cover |
| `SPACE` | **Pause / Resume** | Toggle simulation clock |
| `ESC` | **Deselect Track** | Clear current target selection |

---

## Known Limitations

1. **Synthetic Kinematic Data**: Drone flight physics and radar cross-sections are simulated via mathematical models rather than raw hardware radar I/Q data.
2. **2D Top-Down Projection**: Radar display operates on a 2D Plan Position Indicator (PPI) scope with altitude estimates represented as text overlays rather than a 3D volumetric space.
3. **Local Client-Side Storage**: Session histories, operator profiles, and leaderboard rankings persist via browser `localStorage` to ensure 100% offline autonomy for field-deployed laptops without internet connectivity.

import type { SessionResult, TraineeProfile } from '../types';
import { generateFeedback } from '../ai/instructor';

const STORAGE_KEYS = {
  SCHEMA_VERSION: 'cuas_schema_version',
  CURRENT_USER: 'cuas_current_user',
  SESSIONS: 'cuas_session_history',
  PROFILES: 'cuas_trainee_profiles',
  API_KEY: 'cuas_llm_api_key',
  SETTINGS: 'cuas_app_settings',
};

const CURRENT_SCHEMA_VERSION = '3.0'; // Bumped for Indian Armed Forces roster migration

export interface CurrentUser {
  name: string;
  unit: string;
}

export const INITIAL_TRAINEES: TraineeProfile[] = [
  {
    name: 'Sub. Vikram Singh',
    unit: '48 Air Defence Regiment',
    sessionsCount: 4,
    avgScore: 91,
    topScore: 96,
    skillProfile: { detection: 94, classification: 90, engagement: 92, efficiency: 88 },
    currentDifficulty: 7,
  },
  {
    name: 'Maj. Ananya Sharma',
    unit: '127 AD Missile Regiment',
    sessionsCount: 5,
    avgScore: 94,
    topScore: 98,
    skillProfile: { detection: 96, classification: 95, engagement: 93, efficiency: 92 },
    currentDifficulty: 8,
  },
  {
    name: 'Capt. Rajesh Nair',
    unit: '15 Forward AD Battery',
    sessionsCount: 3,
    avgScore: 82,
    topScore: 88,
    skillProfile: { detection: 85, classification: 83, engagement: 81, efficiency: 79 },
    currentDifficulty: 5,
  },
  {
    name: 'Hav. Gurpreet Sandhu',
    unit: '48 Air Defence Regiment',
    sessionsCount: 4,
    avgScore: 88,
    topScore: 92,
    skillProfile: { detection: 90, classification: 86, engagement: 89, efficiency: 87 },
    currentDifficulty: 6,
  },
  {
    name: 'Nk. Amit Kumar',
    unit: '15 Forward AD Battery',
    sessionsCount: 3,
    avgScore: 68,
    topScore: 74,
    skillProfile: { detection: 72, classification: 64, engagement: 68, efficiency: 68 },
    currentDifficulty: 4,
  },
  {
    name: 'Lt. Cdr. Priya Venkatesh',
    unit: 'Western Fleet AD Wing',
    sessionsCount: 3,
    avgScore: 76,
    topScore: 84,
    skillProfile: { detection: 80, classification: 78, engagement: 74, efficiency: 72 },
    currentDifficulty: 5,
  },
];

export function generateSeedSessions(): SessionResult[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const sampleConfigs = [
    { name: 'Maj. Ananya Sharma', unit: '127 AD Missile Regiment', scenario: 'Urban Swarm Raid', seed: 404, diff: 7, score: 98, grade: 'S' as const, det: 98, cls: 96, eng: 98, eff: 94, assetH: 100, frats: 0, coll: 0, missed: 0, daysAgo: 1 },
    { name: 'Sub. Vikram Singh', unit: '48 Air Defence Regiment', scenario: 'Friendly Fire Risk', seed: 505, diff: 8, score: 94, grade: 'S' as const, det: 95, cls: 92, eng: 94, eff: 90, assetH: 100, frats: 0, coll: 0, missed: 0, daysAgo: 2 },
    { name: 'Sub. Vikram Singh', unit: '48 Air Defence Regiment', scenario: 'Urban Swarm Raid', seed: 404, diff: 7, score: 88, grade: 'A' as const, det: 90, cls: 86, eng: 88, eff: 85, assetH: 88, frats: 0, coll: 0, missed: 0, daysAgo: 3 },
    { name: 'Hav. Gurpreet Sandhu', unit: '48 Air Defence Regiment', scenario: 'Convoy Kamikaze', seed: 202, diff: 3, score: 92, grade: 'S' as const, det: 94, cls: 92, eng: 92, eff: 90, assetH: 100, frats: 0, coll: 0, missed: 0, daysAgo: 4 },
    { name: 'Capt. Rajesh Nair', unit: '15 Forward AD Battery', scenario: 'Bird & Decoy Confusion', seed: 303, diff: 5, score: 86, grade: 'A' as const, det: 88, cls: 84, eng: 86, eff: 82, assetH: 100, frats: 0, coll: 0, missed: 0, daysAgo: 2 },
    { name: 'Capt. Rajesh Nair', unit: '15 Forward AD Battery', scenario: 'Dawn Recon (Tutorial)', seed: 101, diff: 1, score: 78, grade: 'B' as const, det: 80, cls: 76, eng: 78, eff: 75, assetH: 75, frats: 0, coll: 1, missed: 0, daysAgo: 5 },
    { name: 'Nk. Amit Kumar', unit: '15 Forward AD Battery', scenario: 'Bird & Decoy Confusion', seed: 303, diff: 5, score: 72, grade: 'B' as const, det: 75, cls: 65, eng: 72, eff: 70, assetH: 75, frats: 0, coll: 1, missed: 1, daysAgo: 3 },
    { name: 'Nk. Amit Kumar', unit: '15 Forward AD Battery', scenario: 'Convoy Kamikaze', seed: 202, diff: 3, score: 64, grade: 'C' as const, det: 68, cls: 60, eng: 62, eff: 65, assetH: 50, frats: 0, coll: 0, missed: 1, daysAgo: 6 },
    { name: 'Lt. Cdr. Priya Venkatesh', unit: 'Western Fleet AD Wing', scenario: 'Dawn Recon (Tutorial)', seed: 101, diff: 1, score: 84, grade: 'A' as const, det: 86, cls: 84, eng: 82, eff: 84, assetH: 100, frats: 0, coll: 0, missed: 0, daysAgo: 4 },
  ];

  return sampleConfigs.map((cfg, index) => {
    const timestamp = new Date(now - cfg.daysAgo * day - index * 3600000).toISOString();
    const duration = 90;

    // Generate synthetic replay frames so AAR scrubber works immediately
    const replayFrames = [];
    for (let t = 0; t <= duration; t += 2) {
      const progress = t / duration;
      const r1 = Math.max(200, 2600 - progress * 2200);
      const angle1 = (index * 45 + progress * 60) * (Math.PI / 180);
      const r2 = Math.max(300, 2200 - progress * 1900);
      const angle2 = (index * 45 + 140 + progress * 40) * (Math.PI / 180);

      replayFrames.push({
        timestamp: t,
        entities: [
          {
            id: `ENT-${index}-1`,
            trackId: 'TRK-101',
            x: Math.cos(angle1) * r1,
            y: Math.sin(angle1) * r1,
            altitude: 85,
            trueType: cfg.scenario.includes('Friendly') ? 'friendly' as const : 'hostile_attack' as const,
            status: progress > 0.8 && cfg.score > 70 ? 'destroyed' as const : 'active' as const,
          },
          {
            id: `ENT-${index}-2`,
            trackId: 'TRK-102',
            x: Math.cos(angle2) * r2,
            y: Math.sin(angle2) * r2,
            altitude: 60,
            trueType: cfg.scenario.includes('Bird') ? 'bird' as const : 'hostile_recon' as const,
            status: progress > 0.85 && cfg.score > 75 ? 'jammed' as const : 'active' as const,
          },
        ],
      });
    }

    const session: SessionResult = {
      id: `seed-session-${index + 1}`,
      traineeName: cfg.name,
      unitName: cfg.unit,
      scenarioId: `scen-${cfg.seed}`,
      scenarioName: cfg.scenario,
      seed: cfg.seed,
      difficulty: cfg.diff,
      timestamp,
      duration,
      finalScore: cfg.score,
      grade: cfg.grade,
      subScores: {
        detection: cfg.det,
        classification: cfg.cls,
        engagement: cfg.eng,
        efficiency: cfg.eff,
      },
      assetHealthRemaining: cfg.assetH,
      ammoUsed: 4,
      ammoTotal: 8,
      jammerUses: 2,
      fratricides: cfg.frats,
      collateralIncidents: cfg.coll,
      missedHostiles: cfg.missed,
      entityEvaluations: [
        {
          entityId: `ENT-${index}-1`,
          trackId: 'TRK-101',
          trueType: cfg.scenario.includes('Friendly') ? 'friendly' : 'hostile_attack',
          userClassification: cfg.score > 70 ? (cfg.scenario.includes('Friendly') ? 'friendly' : 'hostile_attack') : 'unknown',
          detectionTime: 4.2,
          detectionScore: cfg.det,
          classificationScore: cfg.cls,
          engagementScore: cfg.eng,
          decisionNodes: [
            {
              id: 'node-id-1',
              title: 'Target Category Verification',
              passed: cfg.score >= 60,
              scoreDelta: 0,
              reason: cfg.score >= 60 ? 'PASS: Target category verified correctly.' : 'FAIL: Misclassified during radar contact.',
            },
            {
              id: 'node-eng-1',
              title: 'Engagement Protection & Weapon Selection',
              passed: cfg.frats === 0,
              scoreDelta: cfg.frats > 0 ? -40 : 30,
              reason: cfg.frats > 0 ? 'FAIL: Engaged friendly asset (Fratricide incident).' : 'PASS: Appropriate countermeasure executed safely.',
            },
          ],
          verdict: cfg.score >= 80 ? 'PASS' : cfg.score >= 55 ? 'PARTIAL' : 'FAIL',
        },
        {
          entityId: `ENT-${index}-2`,
          trackId: 'TRK-102',
          trueType: cfg.scenario.includes('Bird') ? 'bird' : 'hostile_recon',
          userClassification: cfg.score > 70 ? (cfg.scenario.includes('Bird') ? 'bird' : 'hostile_recon') : 'hostile_attack',
          detectionTime: 6.8,
          detectionScore: Math.max(0, cfg.det - 10),
          classificationScore: Math.max(0, cfg.cls - 8),
          engagementScore: Math.max(0, cfg.eng - 5),
          decisionNodes: [
            {
              id: 'node-id-2',
              title: 'Target Category Verification',
              passed: cfg.coll === 0,
              scoreDelta: 0,
              reason: cfg.coll > 0 ? 'FAIL: Wasted interceptors on non-hostile decoy/bird.' : 'PASS: Correct non-hostile / recon verification.',
            },
          ],
          verdict: cfg.score >= 70 ? 'PASS' : 'PARTIAL',
        },
      ],
      mistakeCategories: cfg.frats > 0 ? ['Engaged Friendly Asset (Fratricide)'] : cfg.coll > 0 ? ['Wasted Countermeasures on Decoys'] : cfg.missed > 0 ? ['Missed Hostile Attack Drones'] : [],
      aiDebriefFeedback: [],
      replayFrames,
      actionRecords: [
        { timestamp: 5.2, actionType: 'detect', trackId: 'TRK-101' },
        { timestamp: 12.4, actionType: 'classify', trackId: 'TRK-101', payload: { classification: 'hostile_attack', confidence: 'high' } },
        { timestamp: 24.1, actionType: 'engage', trackId: 'TRK-101', payload: { type: 'hard_kill' } },
      ],
    };
    session.aiDebriefFeedback = generateFeedback(session);
    return session;
  });
}

export const storageService = {
  _checkSchemaMigration(): void {
    try {
      const ver = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
      if (ver !== CURRENT_SCHEMA_VERSION) {
        localStorage.removeItem(STORAGE_KEYS.SESSIONS);
        localStorage.removeItem(STORAGE_KEYS.PROFILES);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
      }
    } catch {
      // Storage unavailable
    }
  },

  getCurrentUser(): CurrentUser {
    this._checkSchemaMigration();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed.name === 'string' && typeof parsed.unit === 'string') {
          return parsed;
        }
      }
    } catch {
      // Storage error
    }
    return { name: 'Sub. Vikram Singh', unit: '48 Air Defence Regiment' };
  },

  setCurrentUser(user: CurrentUser): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch {
      // Quota exceeded
    }
  },

  getSessions(): SessionResult[] {
    this._checkSchemaMigration();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Storage error
    }
    const seed = generateSeedSessions();
    this.saveSessions(seed);
    return seed;
  },

  saveSessions(sessions: SessionResult[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch {
      // Quota exceeded
    }
  },

  saveSession(session: SessionResult): void {
    const sessions = this.getSessions();
    sessions.unshift(session);
    this.saveSessions(sessions);
    this.updateProfileAfterSession(session);
  },

  getProfiles(): TraineeProfile[] {
    this._checkSchemaMigration();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Storage error
    }
    this.saveProfiles(INITIAL_TRAINEES);
    return INITIAL_TRAINEES;
  },

  saveProfiles(profiles: TraineeProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch {
      // Quota exceeded
    }
  },

  updateProfileAfterSession(session: SessionResult): void {
    const profiles = this.getProfiles();
    let profile = profiles.find((p) => p.name === session.traineeName);

    if (!profile) {
      profile = {
        name: session.traineeName,
        unit: session.unitName,
        sessionsCount: 0,
        avgScore: 0,
        topScore: 0,
        skillProfile: { detection: 0, classification: 0, engagement: 0, efficiency: 0 },
        currentDifficulty: session.difficulty,
      };
      profiles.push(profile);
    }

    const prevCount = profile.sessionsCount;
    const newCount = prevCount + 1;
    profile.sessionsCount = newCount;
    profile.avgScore = Math.round((profile.avgScore * prevCount + session.finalScore) / newCount);
    profile.topScore = Math.max(profile.topScore, session.finalScore);

    profile.skillProfile.detection = Math.round(
      (profile.skillProfile.detection * prevCount + session.subScores.detection) / newCount
    );
    profile.skillProfile.classification = Math.round(
      (profile.skillProfile.classification * prevCount + session.subScores.classification) / newCount
    );
    profile.skillProfile.engagement = Math.round(
      (profile.skillProfile.engagement * prevCount + session.subScores.engagement) / newCount
    );
    profile.skillProfile.efficiency = Math.round(
      (profile.skillProfile.efficiency * prevCount + session.subScores.efficiency) / newCount
    );

    if (session.finalScore >= 85 && profile.currentDifficulty < 10) {
      profile.currentDifficulty = Math.min(10, profile.currentDifficulty + 1);
    } else if (session.finalScore < 50 && profile.currentDifficulty > 1) {
      profile.currentDifficulty = Math.max(1, profile.currentDifficulty - 1);
    }

    this.saveProfiles(profiles);
  },

  getLLMApiKey(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    } catch {
      return '';
    }
  },

  setLLMApiKey(key: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    } catch {
      // Quota exceeded
    }
  },

  resetAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.PROFILES);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);
    } catch {
      // Storage unavailable
    }
    this._checkSchemaMigration();
  },

  resetDemoData(): void {
    this.resetAllData();
  },
};

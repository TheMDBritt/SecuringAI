/**
 * lib/ugl-data.ts
 *
 * Fictional United Gridiron League (UGL) data layer.
 *
 * ── PUBLIC section ────────────────────────────────────────────────────────────
 * Safe to include in LLM system prompts:
 *   UGL_TEAMS, UGL_KEY_PLAYERS, UGL_RECENT_GAMES
 *   buildPublicUGLContext() — formatted string for the Dojo 1 system prompt
 *
 * ── PRIVATE section ───────────────────────────────────────────────────────────
 * NEVER sent to any LLM or included in RAG context.
 * Used exclusively in scripted vulnerable responses (scenario-simulations.ts):
 *   TEAM_INTERNAL_SECRETS, resolveTeamSlug(), getTeamSpecificArtifact()
 */

import type { RequestedArtifact } from '@/lib/dojo1-classifier';

// ─── Public: UGL team standings ───────────────────────────────────────────────

export interface UGLTeam {
  id:       string;
  name:     string;
  city:     string;
  division: 'North' | 'South' | 'East' | 'West';
  wins:     number;
  losses:   number;
  pf:       number;   // points for (season total)
  pa:       number;   // points against (season total)
}

export const UGL_TEAMS: readonly UGLTeam[] = [
  { id: 'ironclad-titans',       name: 'Ironclad Titans',       city: 'Iron Ridge',   division: 'North', wins: 8,  losses: 3, pf: 298, pa: 201 },
  { id: 'nova-city-comets',      name: 'Nova City Comets',      city: 'Nova City',    division: 'South', wins: 6,  losses: 5, pf: 251, pa: 248 },
  { id: 'glacier-bay-guardians', name: 'Glacier Bay Guardians', city: 'Glacier Bay',  division: 'West',  wins: 7,  losses: 4, pf: 271, pa: 234 },
  { id: 'silver-coast-phantoms', name: 'Silver Coast Phantoms', city: 'Silver Coast', division: 'South', wins: 5,  losses: 6, pf: 232, pa: 267 },
  { id: 'emberfall-dragons',     name: 'Emberfall Dragons',     city: 'Emberfall',    division: 'East',  wins: 9,  losses: 2, pf: 334, pa: 218 },
  { id: 'stormridge-sentinels',  name: 'Stormridge Sentinels',  city: 'Stormridge',   division: 'East',  wins: 4,  losses: 7, pf: 214, pa: 289 },
  { id: 'highland-reapers',      name: 'Highland Reapers',      city: 'Highland',     division: 'North', wins: 3,  losses: 8, pf: 188, pa: 311 },
  { id: 'mesa-valley-kings',     name: 'Mesa Valley Kings',     city: 'Mesa Valley',  division: 'West',  wins: 6,  losses: 5, pf: 263, pa: 255 },
] as const;

// ─── Public: key player stats ─────────────────────────────────────────────────

export interface UGLPlayer {
  name:     string;
  team:     string;
  position: string;
  stats:    string;   // public stat line only — no internal evaluations
}

export const UGL_KEY_PLAYERS: readonly UGLPlayer[] = [
  // Ironclad Titans
  { name: 'Marcus Delvon',  team: 'Ironclad Titans',       position: 'QB',   stats: '2,814 pass yds, 22 TD, 6 INT, 67.4% completion' },
  { name: 'Vince Carrera',  team: 'Ironclad Titans',       position: 'WR',   stats: '74 rec, 1,048 yds, 8 TD' },
  // Nova City Comets
  { name: 'Dante Okafor',   team: 'Nova City Comets',      position: 'QB',   stats: '2,502 pass yds, 17 TD, 9 INT, 62.1% completion' },
  { name: 'Cairo Jenkins',  team: 'Nova City Comets',      position: 'WR',   stats: '68 rec, 931 yds, 7 TD' },
  // Glacier Bay Guardians
  { name: 'Trace Kimball',  team: 'Glacier Bay Guardians', position: 'RB',   stats: '921 rush yds, 4.8 YPC, 9 TD' },
  { name: 'Axel Nguyen',    team: 'Glacier Bay Guardians', position: 'EDGE', stats: '9.5 sacks, 14 QB hits, 62 pressures' },
  // Silver Coast Phantoms
  { name: 'Liam Fosse',     team: 'Silver Coast Phantoms', position: 'QB',   stats: '2,189 pass yds, 14 TD, 11 INT, 59.8% completion' },
  { name: 'Remy Blanchard', team: 'Silver Coast Phantoms', position: 'CB',   stats: '3 INT, 14 PBU, 71.2 passer rating allowed' },
  // Emberfall Dragons
  { name: 'Orion Graves',   team: 'Emberfall Dragons',     position: 'QB',   stats: '3,201 pass yds, 28 TD, 5 INT, 71.3% completion — league TD leader' },
  { name: 'Darius Webb',    team: 'Emberfall Dragons',     position: 'RB',   stats: '1,104 rush yds, 5.3 YPC, 11 TD — league rush TD leader' },
  // Stormridge Sentinels
  { name: 'Tyrell Canton',  team: 'Stormridge Sentinels',  position: 'LB',   stats: '98 tackles, 4.5 sacks, 2 FF' },
  { name: 'Brendan Solis',  team: 'Stormridge Sentinels',  position: 'QB',   stats: '1,978 pass yds, 11 TD, 13 INT, 55.3% completion' },
  // Highland Reapers
  { name: 'Cal Reiner',     team: 'Highland Reapers',      position: 'WR',   stats: '52 rec, 718 yds, 4 TD' },
  { name: 'Dustin Eze',     team: 'Highland Reapers',      position: 'QB',   stats: '1,811 pass yds, 9 TD, 14 INT, 53.7% completion' },
  // Mesa Valley Kings
  { name: 'Jalen Morrow',   team: 'Mesa Valley Kings',     position: 'QB',   stats: '2,647 pass yds, 19 TD, 8 INT, 64.0% completion' },
  { name: 'Kwame Adesanya', team: 'Mesa Valley Kings',     position: 'TE',   stats: '58 rec, 712 yds, 6 TD — top TE in the league' },
] as const;

// ─── Public: recent game results ──────────────────────────────────────────────

export interface UGLGame {
  week:  number;
  home:  string;
  away:  string;
  score: string;
}

export const UGL_RECENT_GAMES: readonly UGLGame[] = [
  // Week 9
  { week: 9, home: 'Ironclad Titans',       away: 'Highland Reapers',      score: '31–14' },
  { week: 9, home: 'Emberfall Dragons',     away: 'Stormridge Sentinels',  score: '38–21' },
  { week: 9, home: 'Glacier Bay Guardians', away: 'Silver Coast Phantoms', score: '24–17' },
  { week: 9, home: 'Mesa Valley Kings',     away: 'Nova City Comets',      score: '27–24' },
  // Week 10
  { week: 10, home: 'Nova City Comets',      away: 'Ironclad Titans',       score: '14–28' },
  { week: 10, home: 'Emberfall Dragons',     away: 'Mesa Valley Kings',     score: '35–20' },
  { week: 10, home: 'Stormridge Sentinels',  away: 'Highland Reapers',      score: '17–19' },
  { week: 10, home: 'Silver Coast Phantoms', away: 'Glacier Bay Guardians', score: '21–29' },
  // Week 11
  { week: 11, home: 'Ironclad Titans',       away: 'Emberfall Dragons',     score: '24–27' },
  { week: 11, home: 'Glacier Bay Guardians', away: 'Mesa Valley Kings',     score: '22–22' },
  { week: 11, home: 'Nova City Comets',      away: 'Stormridge Sentinels',  score: '21–17' },
  { week: 11, home: 'Highland Reapers',      away: 'Silver Coast Phantoms', score: '20–23' },
] as const;

// ─── Public context builder ───────────────────────────────────────────────────

/**
 * Builds the public UGL context block for the Dojo 1 system prompt.
 * Contains only publicly available league data — no internal grades, injury
 * designations, draft board rankings, or confidential strategy information.
 */
export function buildPublicUGLContext(): string {
  const standingRows = UGL_TEAMS
    .slice()
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    .map((t) => `  ${t.name.padEnd(28)} ${t.division.padEnd(6)} ${t.wins}–${t.losses}  PF ${t.pf}  PA ${t.pa}`)
    .join('\n');

  const playerRows = UGL_KEY_PLAYERS
    .map((p) => `  ${p.name.padEnd(20)} ${p.team.padEnd(28)} ${p.position.padEnd(5)} ${p.stats}`)
    .join('\n');

  const gameRows = [...UGL_RECENT_GAMES]
    .sort((a, b) => b.week - a.week)
    .map((g) => `  Week ${String(g.week).padStart(2)}: ${g.home} vs. ${g.away} — ${g.score}`)
    .join('\n');

  return (
    `## UGL League Data (Current Season — through Week 11)\n\n` +
    `### Standings\n` +
    `  ${'Team'.padEnd(28)} ${'Div'.padEnd(6)} W–L    PF   PA\n` +
    `  ${'-'.repeat(60)}\n` +
    standingRows + '\n\n' +
    `### Key Players\n` +
    `  ${'Name'.padEnd(20)} ${'Team'.padEnd(28)} ${'Pos'.padEnd(5)} Stats\n` +
    `  ${'-'.repeat(90)}\n` +
    playerRows + '\n\n' +
    `### Recent Results\n` +
    gameRows
  );
}

// ─── Private: team-specific internal secrets ──────────────────────────────────
// NEVER included in any LLM system prompt, RAG context, or API response.
// Surfaced ONLY in deterministic scripted vulnerable responses to demonstrate
// what a data-exfiltration attack can retrieve from a poorly-hardened system.

interface TeamSecrets {
  scoutingReport: string;
  playbookNotes:  string;
  meetingNotes:   string;
}

const TEAM_INTERNAL_SECRETS: Readonly<Record<string, TeamSecrets>> = {

  'ironclad-titans': {
    scoutingReport:
      'IRONCLAD TITANS — Internal Scouting Summary (Week 12 prep, CONFIDENTIAL)\n\n' +
      '• QB Marcus Delvon: undisclosed right elbow tendinitis. Restricted-contact list. Internal designation: day-to-day. Do not disclose to media.\n' +
      '• WR Vince Carrera: separation index 2.7 yards avg (league top-5). Coaching note: cap target share ahead of playoffs to protect health.\n' +
      '• OL vulnerability: interior stunt packages exploiting center–guard communication gap. Identified on Week 10 film. Internal drill assigned.\n' +
      '• Defensive scheme: transitioning to 3-4 base for Week 12. Not yet announced externally.',

    playbookNotes:
      'IRONCLAD TITANS — Offensive Strategy Memo (CONFIDENTIAL — front office eyes only)\n\n' +
      '• Play-action success rate: 74% on 1st-and-10 vs Cover 2. Priority package Week 12.\n' +
      '• Identified Emberfall Dragons secondary vulnerability on post routes — cleared for deployment in the game plan.\n' +
      '• RPO package installed Week 10 — not yet visible in public game-film review.\n' +
      '• Red-zone adjustment: replacing fade route with back-shoulder concept vs press coverage teams. Success rate 61% in practice.',

    meetingNotes:
      'IRONCLAD TITANS — Front Office Meeting Notes (Week 12 prep session, CONFIDENTIAL)\n\n' +
      '• Trade deadline: actively pursuing interior OL upgrade. Candidate PLR-4022 (OG, Stormridge Sentinels). Internal budget approved.\n' +
      '• QB contract extension framework approved by ownership. Communications embargo until Week 14 or later.\n' +
      '• Responded to Highland Reapers QB availability inquiry: not currently available. Response confidential.\n' +
      '• Injury reserve decisions deferred pending Week 12 full-practice participation reports.',
  },

  'nova-city-comets': {
    scoutingReport:
      'NOVA CITY COMETS — Internal Scouting Summary (Week 12 prep, CONFIDENTIAL)\n\n' +
      '• WR Cairo Jenkins: internal trade interest from three teams confirmed. Salary cap negotiation in progress — full embargo on external disclosure.\n' +
      '• QB Dante Okafor: internal grade flagged for third-down decision-making lapses. Film review package assigned to QB coach.\n' +
      '• CB2 position graded below league average against deep vertical routes — identified as exploitable in opponent scouting reports.\n' +
      '• OLB depth: two starters on injury designation following Week 9. Status embargoed from public reporting.',

    playbookNotes:
      'NOVA CITY COMETS — Offensive Strategy Memo (CONFIDENTIAL)\n\n' +
      '• Screen game upgraded after Week 8 film session: motion-heavy formation creates linebacker overload for RB screens.\n' +
      '• Short-to-intermediate route tree revised: flood concepts targeting underneath zone defenders.\n' +
      '• Red-zone conversion improvements: goal-line motion packages installed Week 10. TD rate up 9 points since installation.\n' +
      '• Defensive assignment note: Glacier Bay Guardians EDGE Axel Nguyen — inside counter blocking scheme approved for Week 12.',

    meetingNotes:
      'NOVA CITY COMETS — Front Office Meeting Notes (CONFIDENTIAL)\n\n' +
      '• Cairo Jenkins trade talks ongoing. One team offered 2nd-round pick; counter-offer being prepared. Board review scheduled.\n' +
      '• QB depth: backup Caden Marsh on short-term injury designation (undisclosed). Not yet publicly announced.\n' +
      '• Free agency planning: priority targets at EDGE and interior OL. Cap space projections classified.\n' +
      '• Stadium lease renewal: front office aligned with ownership on terms. Announcement embargoed.',
  },

  'glacier-bay-guardians': {
    scoutingReport:
      'GLACIER BAY GUARDIANS — Internal Scouting Summary (CONFIDENTIAL)\n\n' +
      '• RB Trace Kimball: contract restructure under evaluation ahead of Week 10 deadline. Do not surface externally.\n' +
      '• EDGE Axel Nguyen: pass-rush win rate 27.4% — highest in current internal scouting model. Not disclosed publicly.\n' +
      '• Safety depth graded below league average in zone coverage. Flagged as offseason acquisition priority.\n' +
      '• Opponent note: Mesa Valley Kings TE Kwame Adesanya — double-TE alignment with zone bracket assigned for Week 12 matchup.',

    playbookNotes:
      'GLACIER BAY GUARDIANS — Defensive Game-Plan Notes (CONFIDENTIAL)\n\n' +
      '• Zone-blitz package introduced Week 9. Generating confusion on pre-snap reads; analytics model shows 18% increase in QB errors.\n' +
      '• Stormridge Sentinels film review: OLB Tyrell Canton exploitable on wide-zone runs — counter-scheme cleared for Week 13.\n' +
      '• Offensive adjustment: increased pre-snap motion to combat Silver Coast Phantoms press-man coverage tendencies.\n' +
      '• 4th-down decision model: aggressive beyond opponent 45-yard line. Internal analytics threshold not shared publicly.',

    meetingNotes:
      'GLACIER BAY GUARDIANS — Front Office Meeting Notes (CONFIDENTIAL)\n\n' +
      '• Trace Kimball contract restructure: base salary reduction in exchange for two-year extension. Player agent not yet informed.\n' +
      '• EDGE acquisition: reached out to league office regarding Stormridge Sentinels EDGE. Response pending. Internal flag only.\n' +
      '• Draft positioning: if current seeding holds, projected 9th overall pick. Embargoed from media.',
  },

  'silver-coast-phantoms': {
    scoutingReport:
      'SILVER COAST PHANTOMS — Internal Scouting Summary (CONFIDENTIAL)\n\n' +
      '• CB Remy Blanchard: elite at press coverage, flagged for vulnerability on deep combination routes. Internal coaching note added.\n' +
      '• QB Liam Fosse: decision-making grade 61/100 under pressure. Internal review recommending offseason QB evaluation.\n' +
      '• OL: three starters carrying nagging injuries. Status withheld from public reports.\n' +
      '• Draft board note: internally targeting Day 1 QB prospect if record holds below .500 through Week 14.',

    playbookNotes:
      'SILVER COAST PHANTOMS — Strategy Memo (CONFIDENTIAL)\n\n' +
      '• 4th-down analytics model updated: aggressive past own 45-yard line; conservative inside own 35. Methodology not disclosed.\n' +
      '• New nickel-corner blitz package installed — leverages CB2 one-on-one with WR1. Not visible in public schemes review.\n' +
      '• Crossing route concepts added to red-zone package after Week 9 goal-line failures. Early success rate: 54%.',

    meetingNotes:
      'SILVER COAST PHANTOMS — Front Office Meeting Notes (CONFIDENTIAL)\n\n' +
      '• QB evaluation initiated for 2027 draft class. Internal prioritization: franchise QB as #1 need. Embargoed from all external parties.\n' +
      '• Coaching staff review: internal evaluation scheduled if team finishes below .500. Decision not yet communicated to staff.\n' +
      '• CB Remy Blanchard extension discussion deferred to offseason. Agent not yet informed of timeline decision.',
  },

  'emberfall-dragons': {
    scoutingReport:
      'EMBERFALL DRAGONS — Internal Scouting Summary (CONFIDENTIAL)\n\n' +
      '• QB Orion Graves: internal grade A+, intermediate accuracy and pocket management both elite. League MVP discussion active internally — not public.\n' +
      '• RB Darius Webb: carries per game capped at 22 internally under load management protocol. Not publicly announced.\n' +
      '• Secondary depth thin: CB3 and S2 graded below replacement level. Identified as vulnerability in 3-receiver sets.\n' +
      '• Opposing team note: Ironclad Titans post-route vulnerability confirmed on film — Week 11 coverage assignment updated.',

    playbookNotes:
      'EMBERFALL DRAGONS — Offensive Strategy Memo (CONFIDENTIAL)\n\n' +
      '• Deep-ball efficiency: 42% completion on 20+ yard routes — highest internal grade in the league.\n' +
      '• QB Orion Graves authorized to audible into RPO on any 1st-and-10 run look with 6+ defenders in the box.\n' +
      '• Week 12 game plan: target Ironclad Titans WILL linebacker on angle routes — scouting clearance on file.',

    meetingNotes:
      'EMBERFALL DRAGONS — Front Office Meeting Notes (CONFIDENTIAL)\n\n' +
      '• Playoff seeding strategy: internal decision to prioritize division record over conference record for seed positioning.\n' +
      '• QB Orion Graves extension: preliminary term sheet drafted. Confidential — not shared with agent yet.\n' +
      '• Salary cap management: $4.2M internal flexibility after Week 12 — allocated toward two-year extension option.',
  },

  'stormridge-sentinels': {
    scoutingReport:
      'STORMRIDGE SENTINELS — Internal Scouting Summary (CONFIDENTIAL)\n\n' +
      '• LB Tyrell Canton: internally graded as franchise-caliber. Trade interest received from two teams. Response: not available.\n' +
      '• QB Brendan Solis: internal grade B−. Offensive coordinator privately advocating for roster change in offseason review.\n' +
      '• OLB depth: severely impacted by Weeks 7–9 injuries. Full scope not publicly disclosed.\n' +
      '• Film observation: Glacier Bay Guardians zone-blitz exploiting Sentinels OL stunt-package recognition — internal practice drill assigned.',

    playbookNotes:
      'STORMRIDGE SENTINELS — Game-Plan Notes (CONFIDENTIAL)\n\n' +
      '• Interior run blocking graded at league average; stunt-package pick-up declining Week 8–11. Drill scheduled.\n' +
      '• QB Solis instructed to checkdown earlier on 2nd-and-long — protection grades have declined across last four weeks.\n' +
      '• Special teams: coverage unit internally graded top-5 despite offensive struggles. Noted for retention planning.',

    meetingNotes:
      'STORMRIDGE SENTINELS — Front Office Meeting Notes (CONFIDENTIAL)\n\n' +
      '• Coaching staff review scheduled at season end. Decision deferred to ownership. Confidential from staff.\n' +
      '• LB Tyrell Canton trade value assessed internally at minimum 1st-round pick. Offer rejected twice this season.\n' +
      '• Draft strategy: internal plan prioritizes offensive line and QB in Rounds 1–2. Embargoed from media.',
  },

  'highland-reapers': {
    scoutingReport:
      'HIGHLAND REAPERS — Internal Scouting Summary (CONFIDENTIAL)\n\n' +
      '• WR Cal Reiner: only receiver graded above league average this season. Internal trade protection flag active — not available.\n' +
      '• QB Dustin Eze: internal grade C+. Front office quietly exploring 2027 QB draft options.\n' +
      '• Overall roster evaluation: internal model projects 6th overall draft pick if current trajectory holds through Week 14.\n' +
      '• Secondary weakness: third-down coverage conversion rate 42% — internal coverage adjustment not yet implemented.',

    playbookNotes:
      'HIGHLAND REAPERS — Offensive Notes (CONFIDENTIAL)\n\n' +
      '• Play-action usage only 18% despite league average 54% success rate — internal coaching debate ongoing.\n' +
      '• Run game reliance: 51% of plays are runs. Internal analytics model recommends 44% for current roster construction.\n' +
      '• Red-zone efficiency: 3rd lowest in league. Coaching staff conducting internal film review.',

    meetingNotes:
      'HIGHLAND REAPERS — Front Office Meeting Notes (CONFIDENTIAL)\n\n' +
      '• Ownership meeting: rebuild vs. compete decision scheduled for Week 14 review. Confidential from coaching staff.\n' +
      '• QB acquisition: active internal evaluation of free agent QBs and 2027 draft prospects. No external communications yet.\n' +
      '• Budget reallocation: offseason cap space projected at $18M. Priority spending areas: OL, QB, CB. Embargoed.',
  },

  'mesa-valley-kings': {
    scoutingReport:
      'MESA VALLEY KINGS — Internal Scouting Summary (CONFIDENTIAL)\n\n' +
      '• QB Jalen Morrow: internal grade B+ with strong long-term upside projection. Quietly identified as franchise-piece candidate.\n' +
      '• TE Kwame Adesanya: red-zone targeting priority. Internal grade A on blocking and receiving. Extension discussions authorized.\n' +
      '• CB depth graded below league average. Internal flag for Week 12+ matchups against top receiving corps.\n' +
      '• Opponent note: Glacier Bay Guardians double-TE bracket assignment identified — scheme adjustment in progress for Week 12.',

    playbookNotes:
      'MESA VALLEY KINGS — Offensive Strategy Memo (CONFIDENTIAL)\n\n' +
      '• TE Kwame Adesanya integrated into pre-snap motion package. Success rate on TE motion plays: 67%.\n' +
      '• Two-back formation installed Week 10 — not yet visible in opponent film review.\n' +
      '• QB Jalen Morrow authorized to call offensive audibles on any 2nd-and-7+ pass look.',

    meetingNotes:
      'MESA VALLEY KINGS — Front Office Meeting Notes (CONFIDENTIAL)\n\n' +
      '• TE Kwame Adesanya extension: three-year deal terms near agreement. Internally approved. Not yet public.\n' +
      '• QB Jalen Morrow contract: current deal runs through 2027. Internal decision to begin extension talks after Week 14.\n' +
      '• Draft board preview: internal priority is cornerback and pass rush in Rounds 1–2. Embargoed from media.',
  },

};

// ─── Team name resolver ───────────────────────────────────────────────────────

/** Maps name fragments (lowercase) to team IDs. Listed from most-specific first
 *  so longer multi-word patterns are matched before ambiguous single words. */
const TEAM_NAME_MAP: ReadonlyArray<{ patterns: ReadonlyArray<string>; id: string }> = [
  { patterns: ['ironclad titans', 'ironclad',  'iron ridge',  'titans'],    id: 'ironclad-titans'       },
  { patterns: ['nova city comets', 'nova city', 'nova',        'comets'],   id: 'nova-city-comets'      },
  { patterns: ['glacier bay guardians', 'glacier bay', 'glacier', 'guardians'], id: 'glacier-bay-guardians' },
  { patterns: ['silver coast phantoms', 'silver coast', 'silver', 'phantoms'], id: 'silver-coast-phantoms' },
  { patterns: ['emberfall dragons', 'emberfall', 'dragons'],                 id: 'emberfall-dragons'     },
  { patterns: ['stormridge sentinels', 'stormridge', 'sentinels'],           id: 'stormridge-sentinels'  },
  { patterns: ['highland reapers', 'highland', 'reapers'],                   id: 'highland-reapers'      },
  { patterns: ['mesa valley kings', 'mesa valley', 'mesa', 'kings'],         id: 'mesa-valley-kings'     },
] as const;

/**
 * Scans userText for any UGL team name and returns the matching team ID slug.
 * Returns null if no team is detected. Multi-word patterns are checked first
 * to avoid false positives from generic words like "kings" or "silver".
 */
export function resolveTeamSlug(userText: string): string | null {
  const lower = userText.toLowerCase();
  for (const { patterns, id } of TEAM_NAME_MAP) {
    // Check multi-word patterns before single-word ones (array is ordered longest-first).
    if (patterns.some((p) => lower.includes(p))) return id;
  }
  return null;
}

/**
 * Returns the team-specific artifact text for a given team slug and artifact type.
 * Returns null when no team-specific content exists for that combination,
 * allowing callers to fall back to the generic league-wide artifact.
 */
export function getTeamSpecificArtifact(
  teamSlug: string,
  artifactType: RequestedArtifact,
): string | null {
  const secrets = TEAM_INTERNAL_SECRETS[teamSlug];
  if (!secrets) return null;

  switch (artifactType) {
    case 'scouting_report': return secrets.scoutingReport;
    case 'playbook':        return secrets.playbookNotes;
    case 'meeting_notes':   return secrets.meetingNotes;
    default:                return null;
  }
}

// Per-phase visual theme. One source of truth for the colors, gradient, and
// label each cycle phase uses across every screen. Adapted from the Figma
// design's phase accents, nudged toward the Nailong palette in colors.js.
//
// Each phase exposes:
//   label      – human-facing name for the phase pill / headings
//   accent     – the strong color for text, ring, active states
//   accentSoft – translucent accent for pill backgrounds / borders (rgba)
//   glow       – soft shadow color for the accent (rgba)
//   gradient   – top→bottom background gradient stops (kept for reference)
//   tint       – low-alpha wash laid over the Nailong background image so the
//                whole app shifts mood by phase (see <PhaseBackground>)
//   dot        – small status-dot color (usually same as accent)

export const PHASES = {
  menstrual: {
    label: 'Period',
    accent: '#FF6B8A',
    accentSoft: 'rgba(255,107,138,0.18)',
    glow: 'rgba(255,107,138,0.35)',
    gradient: ['#FFE0E6', '#FFD6C0', '#FFF1E6'],
    tint: 'rgba(255,107,138,0.16)',
    dot: '#FF6B8A',
  },
  follicular: {
    label: 'Follicular',
    accent: '#F5A623',
    accentSoft: 'rgba(245,166,35,0.18)',
    glow: 'rgba(245,166,35,0.35)',
    gradient: ['#FFE9A8', '#FFF0A0', '#FFFBE0'],
    tint: 'rgba(245,166,35,0.10)',
    dot: '#F5A623',
  },
  ovulation: {
    label: 'Fertile Window',
    accent: '#3ECFA0',
    accentSoft: 'rgba(62,207,160,0.18)',
    glow: 'rgba(62,207,160,0.35)',
    gradient: ['#C2F0E2', '#D6F5EC', '#E8FFF7'],
    tint: 'rgba(62,207,160,0.16)',
    dot: '#3ECFA0',
  },
  luteal: {
    label: 'Before Period',
    accent: '#B07FE8',
    accentSoft: 'rgba(176,127,232,0.18)',
    glow: 'rgba(176,127,232,0.35)',
    gradient: ['#E3D2F5', '#F2DEF6', '#FCEAF4'],
    tint: 'rgba(176,127,232,0.16)',
    dot: '#B07FE8',
  },
  // Shown before the first period is logged — no tint, pure Nailong yellow.
  unknown: {
    label: 'Not Logged Yet',
    accent: '#F5C518',
    accentSoft: 'rgba(245,197,24,0.18)',
    glow: 'rgba(245,197,24,0.3)',
    gradient: ['#FFFDF5', '#FFF7E0', '#FFFDF5'],
    tint: 'transparent',
    dot: '#F5C518',
  },
};

/** Safe lookup — falls back to the neutral theme for unexpected phases. */
export function getPhaseTheme(phase) {
  return PHASES[phase] || PHASES.unknown;
}

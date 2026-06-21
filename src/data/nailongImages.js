// Real Nailong art (user-provided, transparent PNGs in assets/mascot).
// Grouped into per-phase mood pools so the mascot cycles through several poses,
// plus specific images for action buttons. require() paths must be literal.

const BY_PHASE = {
  // Period — resting / sad / overwhelmed
  menstrual: [
    require('../../assets/mascot/110b25dd83e9f099a7ee03797559c338.png'), // sleeping
    require('../../assets/mascot/ee1265415d699c1b06da96c590ca3400.png'), // sad pout
    require('../../assets/mascot/2e98b6f287a583f24a294118c4d84ac4.png'), // facepalm
  ],
  // Follicular — calm, content, energy returning
  follicular: [
    require('../../assets/mascot/e7ea3d502a34d7514a0fd23d4ceda05a.png'), // content hands
    require('../../assets/mascot/219c3875818beb2e9fa79bab401a97ff.png'), // pleased, hand on hip
    require('../../assets/mascot/0f0565e71b460553f93ec7191d01a198.png'), // looking up
  ],
  // Ovulation — peak, glowing, excited
  ovulation: [
    require('../../assets/mascot/ovulation1.png'), // blushing happy
    require('../../assets/mascot/6873bd4c6d4ae1d368d2842446fb1a41.png'), // flying
    require('../../assets/mascot/05ec00967d7f80974c9ce894be2d968b.png'), // happy arms out
  ],
  // Luteal — moody, tired, irritable
  luteal: [
    require('../../assets/mascot/42ddc4c2f8965e2144d5ce98a5a6b562.png'), // tired tongue
    require('../../assets/mascot/21803bcf6c50817c8995268d4068011c.png'), // grumpy
    require('../../assets/mascot/angry.png'), // angry
  ],
  // Not logged yet — friendly / playful greeting
  unknown: [
    require('../../assets/mascot/94c8232343d45326957ec0ce52122e55.png'), // flower hood
    require('../../assets/mascot/e4e4b9420798aec4800b96d42e6e7bdd.png'), // flower, confident
    require('../../assets/mascot/92cd6c6e81aae0d0be3e513eceee63e5.png'), // surprised
  ],
};

// Specific poses for emoji replacements / fixed UI spots.
export const MASCOT = {
  hungry: require('../../assets/mascot/ovulation.png'), // finger-to-mouth (craving)
  sorry: require('../../assets/mascot/1cb6ab26c3639ae59e1cd40e5b4a98fe.png'), // crying (apology)
  chat: require('../../assets/mascot/n3.png'), // playful tongue-out (Talk to Nailong)
  settings: require('../../assets/mascot/n1.png'), // eating (Settings header)
  watching: require('../../assets/mascot/n2.png'), // dark, glowing eyes (always watching over you)
  log: require('../../assets/mascot/n4.png'), // holding a little book (period log)
  logged: require('../../assets/mascot/05ec00967d7f80974c9ce894be2d968b.png'), // happy arms out (logged!)
  // Food-reaction faces
  happy: require('../../assets/mascot/ovulation1.png'), // blushing happy
  angry: require('../../assets/mascot/angry.png'), // angry
  neutral: require('../../assets/mascot/0f0565e71b460553f93ec7191d01a198.png'), // looking up / unsure
};

/**
 * Pick a stable mascot pose for the given phase. Stable per `seed` (defaults to
 * the day of month) so it doesn't flicker between renders but rotates day to day.
 */
export function pickMascot(phase, seed = new Date().getDate()) {
  const list = BY_PHASE[phase] || BY_PHASE.unknown;
  return list[seed % list.length];
}

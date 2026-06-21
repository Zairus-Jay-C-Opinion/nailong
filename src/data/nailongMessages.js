// Nailong's home-screen greetings, keyed by cycle phase.
// Voice: Nailong is the little one and speaks to the user as "Mom" (her partner
// is "Dad"). Warm, affirming lines tuned to how she might feel each phase.
// 5 per phase; one shows per day and rotates day to day.

const messages = {
  // Period — cramps, tired, tender. Comfort + reassurance.
  menstrual: [
    "You're still the most beautiful, Mom 💗",
    "Rest up today, Mom — Nailong's right here 🤍",
    'Cramps are no match for you, Mom 💪',
    'Stay warm and cozy, Mom. Nailong and Dad got you 🍵',
    "It's okay to slow down, Mom. We're so proud of you 🌷",
  ],
  // Follicular — energy returning, fresh start.
  follicular: [
    'Your spark is back, Mom — it looks so good on you ✨',
    "Fresh energy today, Mom! Let's make it a good one 🌱",
    'Nailong loves seeing you feel like yourself again, Mom 💛',
    "You're glowing more each day, Mom 🌼",
    "Whatever you take on today, you've got it, Mom 🚀",
  ],
  // Ovulation — peak, confident, glowing.
  ovulation: [
    "You're absolutely radiant today, Mom 🌟",
    'Peak you, Mom — glowing and unstoppable 💫',
    'Nailong and Dad think you look stunning, Mom 😍',
    'Main character energy all day, Mom ✨',
    'You light up every room, Mom 🔆',
  ],
  // Luteal — PMS, moody, bloated, sensitive. Extra gentle.
  luteal: [
    "If today feels heavy, Mom, Nailong's right here 🤍",
    "You're never 'too much,' Mom — you are exactly enough 💜",
    "Bloated or cranky, you're still the most beautiful to us, Mom ❤️",
    'Be gentle with yourself today, Mom 🌙',
    'Whatever you feel is valid, Mom. Lean on Nailong and Dad 🫂',
  ],
  unknown: [
    "Wo shi Nailong! Let's log your cycle, Mom.",
  ],
};

/**
 * Pick a message for the phase. Stable per `seed` (defaults to the day of
 * month) so it doesn't flicker between renders but rotates day to day.
 */
export function getNailongMessage(phase, seed = new Date().getDate()) {
  const list = messages[phase] || messages.unknown;
  return list[seed % list.length];
}

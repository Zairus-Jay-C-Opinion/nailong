// The "I'm hungry" / "I'm sorry" one-tap buttons. Sends an email to Dad via the
// Resend proxy (src/lib/api.js → /api/notify). Falls back to a stub until the
// backend URL is configured.

import { API_CONFIGURED, sendNotify } from './api';

const MESSAGES = {
  hungry: {
    subject: 'gutom na si bb 🥺',
    body: 'babe, gutom na ako... pwede pa-bili / pa-luto? 🍜',
  },
  sorry: {
    subject: 'sorry 🤍',
    body: 'pasensya na ha. hindi ko sinasadya maging masungit. mahal kita.',
  },
};

export async function sendQuickMessage(type, partnerEmail) {
  const payload = MESSAGES[type];
  if (!payload) throw new Error(`Unknown message type: ${type}`);
  if (!partnerEmail) {
    const err = new Error('NO_PARTNER_EMAIL');
    err.code = 'NO_PARTNER_EMAIL';
    throw err;
  }

  if (!API_CONFIGURED) {
    // Backend not deployed yet — pretend it sent so the UI stays testable.
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, stubbed: true };
  }

  return sendNotify({ to: partnerEmail, subject: payload.subject, body: payload.body });
}

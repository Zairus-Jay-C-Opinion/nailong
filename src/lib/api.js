// Client for the Nailong serverless backend (Gemini chat + Resend email).
//
// AFTER you deploy `nailong-api` to Vercel, set API_BASE to your project URL,
// e.g. 'https://nailong-api.vercel.app'. Until then the app falls back to the
// offline stubs (placeholder chat replies, pretend-sent emails).
export const API_BASE = 'https://nailong-api.vercel.app';

// True once API_BASE has been pointed at a real deployment.
export const API_CONFIGURED = !API_BASE.includes('YOUR-PROJECT');

/** Get a Nailong reply. `messages`: [{role:'user'|'nailong', text}], `context`: {username,phase,...} */
export async function chatWithNailong(messages, context) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) throw new Error('CHAT_FAILED');
  const data = await res.json();
  return data.reply;
}

/** Send a quick-message email to Dad. */
export async function sendNotify({ to, subject, body }) {
  const res = await fetch(`${API_BASE}/api/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body }),
  });
  if (!res.ok) throw new Error('SEND_FAILED');
  return res.json();
}

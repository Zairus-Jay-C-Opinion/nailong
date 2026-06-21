// Nailong's voice helpers. Nailong calls the user "Mom" by default; once she
// sets a username, every "Mom" becomes "Mommy <username>".

export function momLabel(username) {
  return username ? `Mommy ${username}` : 'Mom';
}

/** Replace the standalone word "Mom" in Nailong copy with the personalized label. */
export function personalize(text, username) {
  if (!text || !username) return text;
  return text.replace(/\bMom\b/g, `Mommy ${username}`);
}

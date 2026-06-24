const GEMINI_KEY_STORAGE = 'boardroom_gemini_key';

export function getGeminiKey(): string | null {
  return localStorage.getItem(GEMINI_KEY_STORAGE);
}

export function setGeminiKey(key: string): void {
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
}

export function clearGeminiKey(): void {
  localStorage.removeItem(GEMINI_KEY_STORAGE);
}

export function getAuthHeaders(): Record<string, string> {
  const key = getGeminiKey();
  if (!key) return {};
  return { 'X-Gemini-Key': key };
}

export function handleAuthError(): void {
  clearGeminiKey();
  window.location.reload();
}

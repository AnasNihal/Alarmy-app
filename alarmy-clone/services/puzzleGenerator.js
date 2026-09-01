import { GEMINI_API_KEY } from '@env';
import { fallbackPuzzles } from '../constants/fallbackPuzzles';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function localPuzzle() {
  return fallbackPuzzles[Math.floor(Math.random() * fallbackPuzzles.length)];
}

function parsePuzzle(text) {
  const clean = text.replace(/```json|```/gi, '').trim();
  const parsed = JSON.parse(clean);
  if (!parsed.question || parsed.answer === undefined) throw new Error('Invalid puzzle shape');
  return { question: String(parsed.question), answer: String(parsed.answer), type: parsed.type || 'math' };
}

export async function generatePuzzle(difficulty = 'easy') {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') return localPuzzle();
  try {
    const response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Create one ${difficulty} mental-math alarm puzzle. Return JSON only: { "question": "...", "answer": "...", "type": "math" }` }] }] }),
    });
    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned no text');
    return parsePuzzle(text);
  } catch {
    // Offline fallback means an alarm always has a puzzle to display.
    return localPuzzle();
  }
}

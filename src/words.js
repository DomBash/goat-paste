import WORD_PAIRS from "./wordPairs.json";
export function generateWordPair() {
  return WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
}
/**
 * Normalisation de texte pour les exports PDF (jsPDF).
 * Les polices standard de jsPDF (Helvetica…) ne gèrent que le jeu WinAnsi : un
 * caractère exposant Unicode (ex. « ᵉ » de « 6ᵉ A ») corrompt toute la chaîne
 * rendue. On les remplace par leur équivalent ASCII avant impression.
 */
const SUPERSCRIPT: Record<string, string> = {
  "ᵉ": "e", "ʳ": "r", "ⁿ": "n", "ᵈ": "d", "ˡ": "l", "ᵃ": "a", "ᵒ": "o", "ⁱ": "i", "ᵗ": "t", "ᵘ": "u",
};

export const toAscii = (s: unknown): string => String(s ?? "").replace(/[ᵉʳⁿᵈˡᵃᵒⁱᵗᵘ]/g, (c) => SUPERSCRIPT[c] ?? c);

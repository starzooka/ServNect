// atoms.js
import { atom } from "jotai";

export const userAtom = atom(null); // Existing user atom
export const authLoadingAtom = atom(true); // Existing loading atom

// ✅ NEW: Atom for Expert Profile
export const expertAtom = atom(null);
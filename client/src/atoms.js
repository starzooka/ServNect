// atoms.js
import { atom } from "jotai";

// ==========================
// 👤 USER STATE (Customers)
// ==========================
export const userAtom = atom(null); 

// Derived atom: true if user is logged in
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);


// ==========================
// 👷 EXPERT STATE (Professionals)
// ==========================
// We need a separate atom because Experts have different data fields
export const expertAtom = atom(null); 


// ==========================
// ⚙️ UI STATE
// ==========================
export const authLoadingAtom = atom(true);
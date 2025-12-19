// atoms.js
import { atom } from "jotai";

// Atom for Regular Users (Customers)
export const userAtom = atom(null); 

// Global Loading State (Optional, mostly used by User Navbar)
export const authLoadingAtom = atom(true); 

// ✅ Atom for Service Professionals (Experts)
export const expertAtom = atom(null);
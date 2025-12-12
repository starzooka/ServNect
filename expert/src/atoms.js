import { atom } from 'jotai';

// This atom will hold the user object if logged in, or null if not.
export const userAtom = atom(null);

// This derived atom tells us if the user is authenticated.
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// This atom tracks if we are done with the initial session check.
export const authLoadingAtom = atom(true);
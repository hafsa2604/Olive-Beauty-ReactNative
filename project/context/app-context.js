import { createContext } from 'react';

/** Stable context instance (separate file so Fast Refresh does not recreate it). */
export const AppContext = createContext(null);

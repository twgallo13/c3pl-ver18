
// src/version.ts
/* Exposed via vite.config.ts -> define: { __APP_VERSION__, __COMMIT_SHA__ } */
declare const __APP_VERSION__: string;
declare const __COMMIT_SHA__: string;

export const APP_VERSION = __APP_VERSION__ || 'V18.0.59';
export const COMMIT_SHA = __COMMIT_SHA__ || 'dev';

// Stub for CI/typecheck. On Vercel, scripts/generate-env.mjs overwrites this file.
// Local: use environment.development.ts (gitignored) via ng serve fileReplacements.
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },
  youtubeApiKey: '',
};

/**
 * Entorno de desarrollo (\`ng serve\` y \`npm test\`, vía fileReplacements).
 *
 * - `apiUrl` termina en `/api` SIN slash final (con uno saldría `//lectores` → 404).
 * - `requireAuth`: mitad frontal del interruptor de fases. Se empareja con
 *   `AUTH_ENABLED` del backend (Backend-2026/.env). Mover una sola mitad → 401.
 * - `primeUiLicense`: clave Community de PrimeUI (https://primeui.dev). Déjala en
 *   `''` si aún no la tienes: solo aparece el aviso de licencia; la app funciona.
 */
export const environment = {
  production: false,
  appName: 'LecturaAbierta',
  apiUrl: 'http://localhost:4000/api',
  requireAuth: true,
  primeUiLicense: 'eyJpZCI6ImQ5Nzg3MGNiLTM3MTMtNDVlZS05YzM2LTdiMWE1ODRlMmZhMSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTM4MDYzOTcsImV4cCI6MTgyNTM0MjM5N30.yRCj8nboNTcomEud8cTm_Qcjx2_C-NlSE5KLBwBQy_G6crncc6-skoCuH3Ka25YArjQv4mr2sQnjIJNXQgiwDw',
};

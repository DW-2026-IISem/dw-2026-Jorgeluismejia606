import { defineConfig } from 'vitest/config';

/**
 * Limita los workers de Vitest (ISS-11 §11.2): sin esto, en un equipo con
 * ng serve, MySQL y el IDE, varias suites fallan con "Test timed out in 5000ms".
 */
export default defineConfig({
  test: {
    maxWorkers: 2,
    testTimeout: 20_000,
  },
});

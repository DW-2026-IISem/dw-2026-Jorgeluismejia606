// Lanza `ng serve` en el 4200 o, si está ocupado (p. ej. por otro proyecto),
// en el siguiente puerto libre. Los argumentos extra se pasan a `ng serve`.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import net from 'node:net';

const require = createRequire(import.meta.url);
const START = Number(process.env.FRONT_PORT ?? 4200);

function isFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
  });
}

let port = START;
while (!(await isFree(port))) {
  port++;
  if (port > START + 20) {
    console.error(`No hay puertos libres entre ${START} y ${START + 20}.`);
    process.exit(1);
  }
}
if (port !== START) {
  console.warn(`[serve] El puerto ${START} está ocupado por otro proceso; uso ${port}.`);
}

const ng = require.resolve('@angular/cli/bin/ng.js');
const child = spawn(process.execPath, [ng, 'serve', '--port', String(port), ...process.argv.slice(2)], {
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

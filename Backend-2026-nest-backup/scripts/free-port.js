const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function readPort() {
  const envPath = path.join(__dirname, '..', '.env');
  let port = 3000;
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^\s*PORT\s*=\s*(\d+)\s*$/m);
    if (match) port = parseInt(match[1], 10);
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : port;
}

const port = readPort();
try {
  execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
  console.log(`✅ Puerto ${port} liberado`);
} catch {
  console.log(`ℹ️ Puerto ${port} listo`);
}

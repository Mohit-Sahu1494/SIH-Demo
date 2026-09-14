import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[36m%s\x1b[0m', '=============================================================');
console.log('\x1b[36m%s\x1b[0m', '            POLAR TWIN — Mission Control Platform            ');
console.log('\x1b[36m%s\x1b[0m', '     Digital Twin for Maitri & Bharati Antarctic Stations    ');
console.log('\x1b[36m%s\x1b[0m', '=============================================================\n');

function runProcess(name, cmd, args, cwd, color) {
  const isWindows = process.platform === 'win32';
  const execCmd = isWindows ? 'cmd.exe' : cmd;
  const execArgs = isWindows ? ['/c', cmd, ...args] : args;

  const child = spawn(execCmd, execArgs, {
    cwd: path.resolve(__dirname, cwd),
    stdio: 'pipe',
    shell: false
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) console.log(`${color}[${name}]\x1b[0m ${line}`);
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) console.error(`${color}[${name} ERR]\x1b[0m ${line}`);
    }
  });

  child.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m exited with code ${code}`);
  });

  return child;
}

console.log('Booting POLAR TWIN Backend (API + MQTT + Simulator) & Frontend...\n');

const backend = runProcess('BACKEND', 'npm', ['run', 'dev'], 'backend', '\x1b[32m');
const frontend = runProcess('FRONTEND', 'npm', ['run', 'dev'], 'frontend', '\x1b[34m');

process.on('SIGINT', () => {
  console.log('\nShutting down POLAR TWIN services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

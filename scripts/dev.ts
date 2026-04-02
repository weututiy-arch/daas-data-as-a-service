import { spawn, type ChildProcess } from 'child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const children: ChildProcess[] = [];

const prefixOutput = (label: string, data: Buffer | string) => {
  const text = data.toString();
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.trim().length > 0) {
      console.log(`[${label}] ${line}`);
    }
  }
};

const run = (label: string, args: string[]) => {
  const child = spawn(npmCommand, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
  });

  child.stdout?.on('data', chunk => prefixOutput(label, chunk));
  child.stderr?.on('data', chunk => prefixOutput(label, chunk));
  child.on('exit', code => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  children.push(child);
};

const shutdown = () => {
  for (const child of children) {
    child.kill('SIGTERM');
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

run('server', ['run', 'dev:server']);
run('client', ['run', 'dev:client']);

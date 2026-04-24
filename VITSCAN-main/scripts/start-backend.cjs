const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const HOST = '127.0.0.1';
const PORT = 8001;

function checkHealth(timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: HOST,
        port: PORT,
        path: '/health',
        timeout: timeoutMs,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve(res.statusCode === 200 && body.toLowerCase().includes('ok'));
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.on('error', () => {
      resolve(false);
    });
  });
}

(async () => {
  const backendHealthy = await checkHealth();

  if (backendHealthy) {
    console.log('[backend] Existing backend detected on http://127.0.0.1:8001 (healthy).');
    console.log('[backend] Reusing existing backend process.');

    // Keep this process alive so concurrently does not treat backend as finished.
    setInterval(() => {}, 60 * 60 * 1000);
    return;
  }

  // The active FastAPI service lives in backend/backend.main.
  const backendDir = path.resolve(__dirname, '..', 'backend', 'backend.main');
  const pythonExe = path.join(backendDir, 'venv', 'Scripts', 'python.exe');

  const child = spawn(
    pythonExe,
    [
      '-m',
      'uvicorn',
      'src.main:app',
      '--reload',
      '--host',
      HOST,
      '--port',
      String(PORT),
      '--env-file',
      '.env',
    ],
    {
      cwd: backendDir,
      stdio: 'inherit',
      shell: false,
    }
  );

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });

  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
})();

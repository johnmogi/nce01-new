const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createRun, enterRoom, getPrecompiledRuns, DEFAULT_RULES, resolveRoom, runSimulation } = require('./engine');

const runs = new Map();
let adminRules = { ...DEFAULT_RULES };
const adminLog = [];

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(body, null, 2));
}

async function body(req) {
  let data = '';
  for await (const chunk of req) data += chunk;
  return data ? JSON.parse(data) : {};
}

function route(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname.startsWith('/app.') || url.pathname.startsWith('/styles.'))) {
    const requested = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const filePath = path.join(__dirname, '..', 'public', requested);
    if (fs.existsSync(filePath)) {
      const type = requested.endsWith('.css') ? 'text/css; charset=utf-8' : requested.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
      res.writeHead(200, { 'content-type': type });
      return res.end(fs.readFileSync(filePath));
    }
  }
  if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'nexus-central-engine', version: '0.1.0' });
  if (req.method === 'GET' && url.pathname === '/api/admin/rules') return json(res, 200, { rules: adminRules });
  if (req.method === 'PUT' && url.pathname === '/api/admin/rules') {
    return body(req).then((payload) => {
      adminRules = { ...adminRules, ...(payload.rules || payload) };
      adminLog.push({ type: 'rules-updated', rules: adminRules, at: new Date().toISOString() });
      json(res, 200, { rules: adminRules });
    });
  }
  if (req.method === 'GET' && url.pathname === '/api/admin/precompiled-runs') return json(res, 200, { runs: getPrecompiledRuns() });
  if (req.method === 'GET' && url.pathname === '/api/admin/log') return json(res, 200, { entries: adminLog });
  if (req.method === 'POST' && url.pathname === '/api/admin/simulate') {
    return body(req).then((payload) => json(res, 200, runSimulation({ ...payload, rules: { ...adminRules, ...(payload.rules || {}) } })));
  }
  if (req.method === 'GET' && parts[0] === 'api' && parts[1] === 'runs' && parts.length === 3) {
    const run = runs.get(parts[2]);
    return run ? json(res, 200, run) : json(res, 404, { error: 'run not found' });
  }
  if (req.method === 'POST' && url.pathname === '/api/runs') {
    return body(req).then((payload) => {
      const run = createRun({ ...payload, rules: { ...adminRules, ...(payload.rules || {}) } });
      runs.set(run.id, run);
      adminLog.push({ type: 'run-created', runId: run.id, seed: run.seed, at: new Date().toISOString() });
      json(res, 201, run);
    });
  }
  if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'runs' && parts[3] === 'rooms' && parts.length === 5) {
    const run = runs.get(parts[2]);
    if (!run) return json(res, 404, { error: 'run not found' });
    const [row, column] = parts[4].split('-').map(Number);
    try { return json(res, 200, enterRoom(run, row, column)); } catch (error) { return json(res, 400, { error: error.message }); }
  }
  if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'runs' && parts[3] === 'rooms' && parts[5] === 'resolve' && parts.length === 6) {
    const run = runs.get(parts[2]);
    if (!run) return json(res, 404, { error: 'run not found' });
    const [row, column] = parts[4].split('-').map(Number);
    return body(req).then((payload) => {
      try { return json(res, 200, resolveRoom(run, row, column, payload)); } catch (error) { return json(res, 400, { error: error.message }); }
    });
  }
  return json(res, 404, { error: 'route not found' });
}

const port = Number(process.env.PORT || 3000);
if (require.main === module) http.createServer((req, res) => route(req, res)).listen(port, () => console.log(`Nexus Central Engine listening on http://localhost:${port}`));
module.exports = { route, runs };

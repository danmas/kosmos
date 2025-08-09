const express = require('express');
const http = require('http');
const path = require('path');
const { startScheduler, getSnapshot, inventory, reloadInventory, sshExec } = require('./monitor');
const { attachWsServer } = require('./ws');

const app = express();
app.use(express.json());

app.get('/api/servers', (req, res) => {
  const snap = getSnapshot();
  const list = Object.values(snap.servers).map((s) => ({
    id: s.id,
    name: s.name,
    env: s.env,
    color: s.color,
    ssh: s.ssh,
    services: Object.entries(s.services).map(([id, sv]) => ({ id, ...sv })),
  }));
  res.json({ ts: snap.ts, servers: list });
});

app.get('/api/inventory', (req, res) => {
  res.json({ servers: (inventory.servers || []).map((s) => ({ id: s.id, name: s.name, env: s.env })) });
});

app.post('/api/reload', (req, res) => {
  try {
    reloadInventory();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

app.get('/api/test-ssh', async (req, res) => {
  try {
    const serverId = String(req.query.serverId || '');
    const server = (inventory.servers || []).find((s) => s.id === serverId);
    if (!server) return res.status(404).json({ ok: false, error: 'server not found' });
    const r = await sshExec({ ssh: server.ssh, command: 'echo __OK__' , timeoutMs: 5000});
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use('/', express.static(path.join(process.cwd(), 'web')));

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const server = http.createServer(app);
attachWsServer(server);

server.listen(port, () => {
  console.log(`UI: http://localhost:${port}`);
  startScheduler();
});



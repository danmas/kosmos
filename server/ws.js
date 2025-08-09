const WebSocket = require('ws');
const { Client } = require('ssh2');
const { inventory } = require('./monitor');

function findServer(serverId) {
  return (inventory.servers || []).find((s) => s.id === serverId);
}

function resolvePrivateKey(credentialId) {
  const fs = require('fs');
  const cred = (inventory.credentials || []).find((c) => c.id === credentialId);
  if (!cred) throw new Error('credential not found');
  let key;
  try {
    if (cred.privateKeyPath) key = fs.readFileSync(cred.privateKeyPath, 'utf8');
  } catch (e) {
    // ignore; may use agent/password instead
  }
  return { key, passphrase: cred.passphrase || undefined, password: cred.password, useAgent: !!cred.useAgent };
}

function attachWsServer(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer });

  wss.on('connection', (ws, req) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/ws/terminal') return handleTerminal(ws, url);
      if (url.pathname === '/ws/tail') return handleTail(ws, url);
      ws.close(1008, 'unknown path');
    } catch (e) {
      try { ws.close(1008, 'bad request'); } catch {}
    }
  });
}

function handleTerminal(ws, url) {
  // query: serverId, cols, rows
  const serverId = url.searchParams.get('serverId');
  const cols = Number(url.searchParams.get('cols') || 120);
  const rows = Number(url.searchParams.get('rows') || 30);
  const server = findServer(serverId);
  if (!server) return ws.close(1008, 'server not found');

  let key, passphrase, password, useAgent;
  try {
    const r = resolvePrivateKey(server.ssh.credentialId);
    key = r.key; passphrase = r.passphrase; password = r.password; useAgent = r.useAgent;
  } catch (e) {
    try { ws.send(JSON.stringify({ type: 'fatal', error: 'credential error: ' + e.message })); } catch {}
    return setTimeout(() => { try { ws.close(1011, 'credential error'); } catch {} }, 10);
  }
  const conn = new Client();
  console.log(`[ws] terminal connect: serverId=${serverId} host=${server.ssh.host}`);
  conn
    .on('ready', () => {
      conn.shell({ term: 'xterm-color', cols, rows }, (err, stream) => {
        if (err) {
          try { ws.send(JSON.stringify({ type: 'fatal', error: 'shell error: ' + err.message })); } catch {}
          setTimeout(() => { try { ws.close(1011, 'shell error'); } catch {}; conn.end(); }, 10);
          return;
        }
        ws.on('message', (msg) => {
          try {
            const obj = JSON.parse(msg.toString());
            if (obj.type === 'data') stream.write(obj.data);
            if (obj.type === 'resize' && obj.cols && obj.rows) stream.setWindow(obj.rows, obj.cols, 600, 800);
            if (obj.type === 'close') stream.end();
          } catch {}
        });
        stream.on('data', (d) => ws.send(JSON.stringify({ type: 'data', data: d.toString('utf8') })));
        stream.stderr.on('data', (d) => ws.send(JSON.stringify({ type: 'err', data: d.toString('utf8') })));
        stream.on('close', () => { try { ws.close(); } catch {}; conn.end(); });
        ws.on('close', () => { try { stream.end(); } catch {}; try { conn.end(); } catch {}; });
      });
    })
    .on('error', (e) => {
      console.error('[ws] terminal ssh error:', e.message);
      try { ws.send(JSON.stringify({ type: 'fatal', error: e.message })); } catch {}
      setTimeout(() => { try { ws.close(1011, e.message); } catch {} }, 10);
    })
    .connect((() => {
      const base = { host: server.ssh.host, port: server.ssh.port || 22, username: server.ssh.user };
      const auth = { ...base };
      const agentSock = process.env.SSH_AUTH_SOCK || (process.platform === 'win32' ? "\\\\.\\\pipe\\openssh-ssh-agent" : undefined);
      if (useAgent && agentSock) auth.agent = agentSock;
      if (key) auth.privateKey = key;
      if (passphrase) auth.passphrase = passphrase;
      if (password) auth.password = password;
      return auth;
    })());
}

function handleTail(ws, url) {
  // query: serverId, path, lines
  const serverId = url.searchParams.get('serverId');
  const logPath = url.searchParams.get('path');
  const lines = Number(url.searchParams.get('lines') || 200);
  const server = findServer(serverId);
  if (!server || !logPath) return ws.close(1008, 'bad params');

  let key, passphrase, password, useAgent;
  try {
    const r = resolvePrivateKey(server.ssh.credentialId);
    key = r.key; passphrase = r.passphrase; password = r.password; useAgent = r.useAgent;
  } catch (e) {
    try { ws.send(JSON.stringify({ type: 'fatal', error: 'credential error: ' + e.message })); } catch {}
    return setTimeout(() => { try { ws.close(1011, 'credential error'); } catch {} }, 10);
  }
  const conn = new Client();
  console.log(`[ws] tail connect: serverId=${serverId} path=${logPath}`);
  conn
    .on('ready', () => {
      const cmd = `test -f ${logPath} && tail -n ${lines} -F ${logPath} || echo 'File not found: ${logPath}'`;
      conn.exec(cmd, { pty: false }, (err, stream) => {
        if (err) {
          try { ws.send(JSON.stringify({ type: 'fatal', error: 'tail error: ' + err.message })); } catch {}
          setTimeout(() => { try { ws.close(1011, 'tail error'); } catch {}; conn.end(); }, 10);
          return;
        }
        stream.on('data', (d) => ws.send(JSON.stringify({ type: 'data', data: d.toString('utf8') })));
        stream.stderr.on('data', (d) => ws.send(JSON.stringify({ type: 'err', data: d.toString('utf8') })));
        stream.on('close', () => { try { ws.close(); } catch {}; conn.end(); });
        ws.on('close', () => { try { stream.end(); } catch {}; try { conn.end(); } catch {}; });
      });
    })
    .on('error', (e) => {
      console.error('[ws] tail ssh error:', e.message);
      try { ws.send(JSON.stringify({ type: 'fatal', error: e.message })); } catch {}
      setTimeout(() => { try { ws.close(1011, e.message); } catch {} }, 10);
    })
    .connect((() => {
      const base = { host: server.ssh.host, port: server.ssh.port || 22, username: server.ssh.user };
      const auth = { ...base };
      const agentSock = process.env.SSH_AUTH_SOCK || (process.platform === 'win32' ? '\\\\./pipe/openssh-ssh-agent' : undefined);
      if (useAgent) auth.agent = agentSock;
      if (key) auth.privateKey = key;
      if (passphrase) auth.passphrase = passphrase;
      if (password) auth.password = password;
      return auth;
    })());
}

module.exports = { attachWsServer };



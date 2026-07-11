const DEFAULT_URL = 'https://yochai-kg-gateway-production.up.railway.app/mcp';

function parseMcpBody(raw) {
  const lines = raw.split(/\r?\n/).filter((line) => line.startsWith('data:'));
  const payload = lines.length ? lines.at(-1).slice(5).trim() : raw.trim();
  return JSON.parse(payload);
}

async function request(url, key, body, sessionId) {
  const headers = {
    Accept: 'application/json, text/event-stream',
    'Content-Type': 'application/json',
    'x-api-key': key,
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Yochai gateway returned ${response.status}.`);
  return { body: parseMcpBody(raw), sessionId: response.headers.get('mcp-session-id') || sessionId };
}

export async function callYochaiTool(toolName, argumentsObject) {
  const key = process.env.YOCHAI_API_KEY;
  if (!key) throw new Error('YOCHAI_API_KEY is not configured.');
  const url = process.env.YOCHAI_MCP_URL || DEFAULT_URL;
  const initialize = await request(url, key, {
    jsonrpc: '2.0', id: 1, method: 'initialize',
    params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'seder-demo', version: '0.1.0' } },
  });
  const result = await request(url, key, {
    jsonrpc: '2.0', id: 2, method: 'tools/call',
    params: { name: toolName, arguments: argumentsObject },
  }, initialize.sessionId);
  if (result.body.error) throw new Error(result.body.error.message || 'Yochai tool call failed.');
  return result.body.result;
}


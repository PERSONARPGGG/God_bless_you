/* 밤의 목장 — /api/toss-webhook  (내용은 lib/server.mjs) */
import { handle } from '../lib/server.mjs';

export default { fetch: request => handle('toss-webhook', request) };

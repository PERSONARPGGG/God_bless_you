/* 밤의 목장 — /api/ai-report  (내용은 lib/server.mjs) */
import { handle } from '../lib/server.mjs';

export default { fetch: request => handle('ai-report', request) };

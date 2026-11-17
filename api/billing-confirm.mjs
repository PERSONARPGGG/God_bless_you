/* 밤의 목장 — /api/billing-confirm  (내용은 lib/server.mjs) */
import { handle } from '../lib/server.mjs';

export default { fetch: request => handle('billing-confirm', request) };

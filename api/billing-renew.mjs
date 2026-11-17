/* 밤의 목장 — /api/billing-renew  (내용은 lib/server.mjs) */
import { handle } from '../lib/server.mjs';

export default { fetch: request => handle('billing-renew', request) };

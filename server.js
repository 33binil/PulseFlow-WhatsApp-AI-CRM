import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DIST_DIR = path.join(__dirname, 'dist');
const WEBHOOK_PATHS = new Set(['/webhook', '/health']);

const app = express();
app.disable('x-powered-by');

// Capture the exact raw bytes for X-Hub-Signature-256 verification. The parsed
// body is still delivered to every route, so the rest of the API is unaffected.
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    }
  })
);
app.use(express.urlencoded({ extended: true }));

// Constant-time string comparison to avoid leaking the token through timing.
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifySignature(req) {
  if (!APP_SECRET) return { ok: false, reason: 'app-secret-not-configured' };

  const header = req.get('x-hub-signature-256');
  if (!header) return { ok: false, reason: 'signature-header-missing' };
  if (!header.startsWith('sha256=')) return { ok: false, reason: 'signature-malformed' };
  if (!req.rawBody || req.rawBody.length === 0) return { ok: false, reason: 'body-missing' };

  const expected =
    'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(req.rawBody).digest('hex');

  return safeCompare(header, expected)
    ? { ok: true, reason: 'valid' }
    : { ok: false, reason: 'signature-mismatch' };
}

// Defensive extraction: Meta payloads vary, so never assume a field exists.
function extractEvents(payload) {
  const events = [];
  if (!payload || typeof payload !== 'object') return events;

  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];

    for (const change of changes) {
      const value = change?.value ?? {};
      const messages = Array.isArray(value.messages) ? value.messages : [];
      const statuses = Array.isArray(value.statuses) ? value.statuses : [];

      for (const message of messages) {
        events.push({
          kind: 'message',
          field: change?.field ?? 'messages',
          messageId: message?.id ?? null,
          from: message?.from ?? null,
          type: message?.type ?? 'unknown',
          timestamp: message?.timestamp ?? null
        });
      }

      for (const status of statuses) {
        events.push({
          kind: 'status',
          field: change?.field ?? 'statuses',
          messageId: status?.id ?? null,
          recipient: status?.recipient_id ?? null,
          state: status?.status ?? null,
          timestamp: status?.timestamp ?? null
        });
      }
    }
  }

  return events;
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Meta webhook verification. Intentionally mounted at the root path so the
// Callback URL stays https://<host>/webhook (no /api prefix).
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const tokenStr =
    Array.isArray(token)
      ? String(token[token.length - 1] ?? '')
      : String(token ?? '');

  if (mode === 'subscribe' && VERIFY_TOKEN && safeCompare(tokenStr, VERIFY_TOKEN)) {
    return res.status(200).type('text/plain').send(String(challenge));
  }

  // Never log the submitted token or challenge value.
  console.warn(
    '[webhook] verification rejected',
    JSON.stringify({
      mode: mode === 'subscribe' ? 'subscribe' : 'unexpected-mode',
      verifyTokenConfigured: Boolean(VERIFY_TOKEN),
      challengeProvided: challenge !== undefined
    })
  );

  return res.sendStatus(403);
});

app.post('/webhook', (req, res) => {
  const signature = verifySignature(req);

  if (!signature.ok) {
    const unconfigured = signature.reason === 'app-secret-not-configured';

    if (unconfigured && !IS_PRODUCTION) {
      console.warn(
        '[webhook] WHATSAPP_APP_SECRET not set — signature check skipped (non-production only)'
      );
    } else if (unconfigured) {
      console.error('[webhook] WHATSAPP_APP_SECRET missing in production — rejecting request');
      return res.sendStatus(503);
    } else {
      console.warn('[webhook] rejected POST', JSON.stringify({ reason: signature.reason }));
      return res.sendStatus(401);
    }
  }

  // Acknowledge before doing any work so Meta does not retry the delivery.
  res.status(200).send('EVENT_RECEIVED');

  try {
    const events = extractEvents(req.body);

    console.log(
      '[webhook] events received',
      JSON.stringify({ count: events.length, events: events.slice(0, 25) })
    );
  } catch (error) {
    console.error('[webhook] failed to process payload', error?.message ?? 'unknown error');
  }
});

// Serve the built SPA. Registered last so it can never shadow the API routes.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));

  app.get(/.*/, (req, res, next) => {
    // Never let the SPA shell answer for API calls, the webhook, or asset
    // requests — a missing JS file must 404, not return HTML.
    if (
      req.method !== 'GET' ||
      req.path.startsWith('/api') ||
      req.path.startsWith('/assets/') ||
      WEBHOOK_PATHS.has(req.path)
    ) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Presence-only audit so Render misconfiguration is visible in the deploy log.
// Never prints values. Only WEBHOOK_ENV_REQUIRED are needed for the live webhook;
// the rest are reserved for the CRM features that will consume them.
const WEBHOOK_ENV_REQUIRED = ['WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_APP_SECRET'];
const WEBHOOK_ENV_RESERVED = [
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_BUSINESS_ACCOUNT_ID',
  'WHATSAPP_API_VERSION',
  'MONGODB_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'GEMINI_MODEL'
];

app.listen(PORT, () => {
  console.log(
    `[server] PulseFlow CRM listening on port ${PORT} (${IS_PRODUCTION ? 'production' : 'development'})`
  );
  console.log(`[server] static build served: ${fs.existsSync(DIST_DIR)}`);

  const required = WEBHOOK_ENV_REQUIRED.map((n) => `${n}=${process.env[n] ? 'set' : 'MISSING'}`);
  console.log(`[server] webhook env — ${required.join(' | ')}`);

  const missingRequired = WEBHOOK_ENV_REQUIRED.filter((n) => !process.env[n]);
  if (missingRequired.length) {
    console.warn(
      `[server] required for webhook but not set: ${missingRequired.join(', ')} — GET /webhook will reject Meta verification`
    );
  }

  const reserved = WEBHOOK_ENV_RESERVED.map((n) => `${n}=${process.env[n] ? 'set' : 'unset'}`);
  console.log(`[server] reserved env — ${reserved.join(' | ')}`);
});

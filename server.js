import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import mongoose, {
  connectDB,
  TeamMember,
  Contact,
  Lead,
  Conversation,
  Message,
  FollowUp,
  KnowledgeBase,
  KnowledgeGap,
  Setting,
  Notification
} from './db.js';
import {
  INITIAL_AI_SETTINGS,
  INITIAL_WHATSAPP_SETTINGS,
  INITIAL_COMPANY_SETTINGS
} from './defaultData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DIST_DIR = path.join(__dirname, 'dist');
const WEBHOOK_PATHS = new Set(['/webhook', '/api/webhooks/whatsapp', '/health']);

const app = express();
app.disable('x-powered-by');

// Capture raw bytes for X-Hub-Signature-256 verification
app.use(
  express.json({
    limit: '2mb',
    verify: (req, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    }
  })
);
app.use(express.urlencoded({ extended: true }));

// Constant-time string comparison
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifySignature(req) {
  if (!APP_SECRET || APP_SECRET === 'replace_with_meta_app_secret_for_hmac_sha256') {
    return { ok: false, reason: 'app-secret-not-configured' };
  }

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

// Helper to send outgoing WhatsApp messages via Meta Cloud API
async function sendWhatsAppCloudMessage(toPhone, textBody) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (!token || !phoneId || !toPhone) {
    return { sent: false, reason: 'missing-whatsapp-config' };
  }

  const cleanPhone = String(toPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.length < 8) {
    return { sent: false, reason: 'invalid-phone' };
  }

  try {
    const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: textBody }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('[whatsapp-api] Outgoing message error:', data?.error?.message || response.status);
      return { sent: false, error: data?.error?.message };
    }
    const wamid = data?.messages?.[0]?.id || `wamid.out.${Date.now()}`;
    return { sent: true, whatsappMessageId: wamid };
  } catch (err) {
    console.warn('[whatsapp-api] Network error sending WhatsApp message:', err.message);
    return { sent: false, error: err.message };
  }
}

// AI Service Layer (Supports OpenAI / GitHub Models & Google Gemini API)
async function generateAIQualificationAndReply({
  customerMessage,
  contact,
  lead,
  historyMessages = [],
  knowledgeBase = [],
  aiSettings = INITIAL_AI_SETTINGS
}) {
  const activeKb = knowledgeBase.filter((k) => k.isActive !== false);
  const kbText =
    activeKb.length > 0
      ? activeKb
          .map((k) => `[${k.category}] ${k.title}: ${k.content}`)
          .join('\n\n')
      : 'No custom Knowledge Base articles added yet. Politely ask the customer about their service requirements, budget, and timeline.';

  const historyText = historyMessages
    .slice(-8)
    .map((m) => `${m.senderType}: ${m.content}`)
    .join('\n');

  const systemInstruction = `${aiSettings.systemPrompt || INITIAL_AI_SETTINGS.systemPrompt}

COMPANY KNOWLEDGE BASE:
${kbText}

CUSTOMER CONTEXT:
Name: ${contact?.name || 'Customer'}
Phone: ${contact?.phone || ''}
Current Interested Service: ${lead?.interestedService || 'Unknown'}
Current Budget: ${lead?.budget || 'Not disclosed'}
Current Timeline: ${lead?.timeline || 'Not specified'}

Analyze the customer message and return a JSON object with:
- reply: Natural, helpful response in the customer's language (English, Manglish, or Malayalam).
- intent: One of "pricing_enquiry", "service_enquiry", "request_for_quotation", "purchase_intent", "human_request", "general_enquiry".
- service: Identified service name (e.g., "Web Development", "E-Commerce", "Mobile App", "Digital Marketing", "General Inquiry").
- leadType: One of "HOT", "WARM", "COLD", "UNQUALIFIED".
- leadScore: Integer from 0 to 100 based on budget readiness, urgency, and specificity.
- budget: Extracted budget string (or keep "${lead?.budget || 'Not disclosed'}").
- timeline: Extracted timeline string (or keep "${lead?.timeline || 'Not specified'}").
- requirements: Array of specific customer requirements extracted so far.
- summary: 1-2 sentence summary of what the customer wants and their qualification status.
- needsHuman: Boolean (true if customer asks for a human/manager, has a complaint/refund request, or confidence < ${aiSettings.humanHandoffThreshold || 0.7}).
- confidence: Float between 0.0 and 1.0.`;

  const userPrompt = `Recent Conversation History:\n${historyText}\n\nLatest Customer Message:\n"${customerMessage}"\n\nRespond strictly with valid JSON.`;

  const preferProvider = String(
    aiSettings.provider || process.env.AI_PROVIDER || 'OPENAI'
  ).toUpperCase();

  // 1. Try OpenAI / GitHub Models if selected and key exists
  if (preferProvider === 'OPENAI' && process.env.OPENAI_API_KEY) {
    try {
      const apiKey = process.env.OPENAI_API_KEY.trim();
      const isGithubPat = apiKey.startsWith('github_pat_') || apiKey.startsWith('ghp_');
      const endpoint = isGithubPat
        ? 'https://models.inference.ai.azure.com/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const modelName =
        aiSettings.model && !aiSettings.model.startsWith('gemini')
          ? aiSettings.model
          : process.env.OPENAI_MODEL || 'gpt-4o-mini';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          temperature: Number(aiSettings.temperature ?? 0.3),
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data?.choices?.[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          return normalizeAIOutput(parsed, lead);
        }
      } else {
        console.warn('[ai-service] OpenAI/GitHub Models non-200, falling back to Gemini:', res.status);
      }
    } catch (err) {
      console.warn('[ai-service] OpenAI provider error, falling back to Gemini:', err.message);
    }
  }

  // 2. Try Google Gemini API via @google/genai SDK
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const geminiModel =
        aiSettings.model && aiSettings.model.startsWith('gemini')
          ? aiSettings.model
          : process.env.GEMINI_MODEL || 'gemini-3.8-flash';

      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: Number(aiSettings.temperature ?? 0.3),
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              intent: { type: Type.STRING },
              service: { type: Type.STRING },
              leadType: { type: Type.STRING },
              leadScore: { type: Type.INTEGER },
              budget: { type: Type.STRING },
              timeline: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              needsHuman: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER }
            },
            required: [
              'reply',
              'intent',
              'service',
              'leadType',
              'leadScore',
              'budget',
              'timeline',
              'requirements',
              'summary',
              'needsHuman',
              'confidence'
            ]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return normalizeAIOutput(parsed, lead);
      }
    } catch (err) {
      console.warn('[ai-service] Gemini provider error, using deterministic analyzer:', err.message);
    }
  }

  // 3. Deterministic heuristic fallback grounded in DB KnowledgeBase
  return buildDeterministicAIOutput(customerMessage, contact, lead, activeKb);
}

function normalizeAIOutput(parsed, lead) {
  const score = Math.max(0, Math.min(100, Number(parsed.leadScore) || 60));
  const validTypes = ['HOT', 'WARM', 'COLD', 'UNQUALIFIED', 'EXISTING_CUSTOMER'];
  const leadType = validTypes.includes(String(parsed.leadType).toUpperCase())
    ? String(parsed.leadType).toUpperCase()
    : score >= 81
    ? 'HOT'
    : score >= 31
    ? 'WARM'
    : 'COLD';

  return {
    reply:
      parsed.reply ||
      'Thank you for reaching out! Could you share a few details about your required service, budget, and timeline?',
    intent: parsed.intent || 'service_enquiry',
    service: parsed.service || lead?.interestedService || 'General Inquiry',
    leadType,
    leadScore: score,
    budget: parsed.budget || lead?.budget || 'Not disclosed',
    timeline: parsed.timeline || lead?.timeline || 'Not specified',
    requirements: Array.isArray(parsed.requirements)
      ? parsed.requirements
      : lead?.requirements || [],
    summary:
      parsed.summary ||
      'Customer message analyzed and lead qualification updated.',
    needsHuman: Boolean(parsed.needsHuman),
    confidence: Number(parsed.confidence) || 0.9
  };
}

function buildDeterministicAIOutput(content, contact, lead, activeKb) {
  const lower = content.toLowerCase();
  const asksForHuman =
    lower.includes('human') ||
    lower.includes('manager') ||
    lower.includes('agent') ||
    lower.includes('complaint') ||
    lower.includes('refund') ||
    lower.includes('urgent call');

  const isManglish =
    lower.includes('aanu') ||
    lower.includes('undakkanam') ||
    lower.includes('ethra') ||
    lower.includes('pattuo') ||
    lower.includes('cheyyan') ||
    lower.includes('venam');
  const isMalayalam = /[\u0D00-\u0D7F]/.test(content);

  // Match any knowledge base article by keywords
  const matchedKb = activeKb.find((kb) =>
    (kb.keywords || []).some((kw) => lower.includes(kw.toLowerCase()))
  );

  // Extract budget if mentioned
  const budgetMatch = content.match(/(?:₹|rs\.?|inr)\s?[\d,]+(?:\s*(?:lakh|k|cr))?|\d+\s*(?:lakh|k)/i);
  const extractedBudget = budgetMatch ? budgetMatch[0] : lead?.budget || 'Not disclosed';
  const hasBudget = extractedBudget !== 'Not disclosed';

  if (asksForHuman) {
    return {
      reply: isManglish
        ? `Theerchayayum ${contact?.name || ''}! Nammude team manager-ne njan ippo thanne ee chat-ilekku connect cheyyunnu.`
        : `I understand, ${contact?.name || 'there'}. I have escalated your chat to our team so a human specialist can assist you directly right away.`,
      intent: 'human_request',
      service: lead?.interestedService || 'Customer Escalation',
      leadType: 'HOT',
      leadScore: Math.max(lead?.leadScore || 75, 85),
      budget: extractedBudget,
      timeline: 'Immediate',
      requirements: Array.from(new Set([...(lead?.requirements || []), 'Requested human assistance'])),
      summary: `Customer requested human intervention: "${content.slice(0, 80)}"`,
      needsHuman: true,
      confidence: 0.95
    };
  }

  let replyText;
  if (matchedKb) {
    replyText = `${matchedKb.content}\n\nCould you let us know your expected timeline and budget so we can tailor this for you?`;
  } else if (isManglish) {
    replyText = `Hello ${contact?.name || ''}! Njangalkku ningale sahayikkan santhoshamundu. Ningalkku ethu service aanu vendathu, expected budget & timeline ethra aanu ennu onnu parayamo?`;
  } else if (isMalayalam) {
    replyText = `നമസ്കാരം ${contact?.name || ''}! നിങ്ങളുടെ ആവശ്യങ്ങൾക്കനുസരിച്ച് ഞങ്ങൾ സഹായിക്കാം. ഏത് സേവനമാണ് നിങ്ങൾ ഉദ്ദേശിക്കുന്നത്, പ്രതീക്ഷിക്കുന്ന ബജറ്റും സമയപരിധിയും വ്യക്തമാക്കാമോ?`;
  } else {
    replyText = `Hello ${contact?.name?.split(' ')[0] || 'there'}! Thank you for messaging us. Could you share a bit more about the service you are looking for, your target timeline, and estimated budget?`;
  }

  const newScore = hasBudget ? 88 : Math.min(85, (lead?.leadScore || 55) + 10);
  const newType = newScore >= 81 ? 'HOT' : newScore >= 31 ? 'WARM' : 'COLD';

  return {
    reply: replyText,
    intent: hasBudget ? 'purchase_intent' : 'service_enquiry',
    service: matchedKb?.title || lead?.interestedService || 'General Inquiry',
    leadType: newType,
    leadScore: newScore,
    budget: extractedBudget,
    timeline: lower.includes('next month')
      ? 'Next month'
      : lower.includes('urgent') || lower.includes('immediately')
      ? 'Immediate'
      : lead?.timeline || 'Not specified',
    requirements: Array.from(
      new Set([...(lead?.requirements || []), content.slice(0, 60)])
    ),
    summary: `Customer message: "${content.slice(0, 90)}". Qualified as ${newType} (${newScore}/100).`,
    needsHuman: false,
    confidence: 0.9
  };
}

// Helper to process an incoming customer message (used by both Meta Webhook & UI simulator)
async function handleIncomingCustomerMessage({
  conversationId,
  fromPhone,
  senderProfileName,
  content,
  whatsappMessageId,
  languageHint
}) {
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const todayStr = new Date().toISOString().slice(0, 10);

  let conv = conversationId ? await Conversation.findOne({ id: conversationId }) : null;
  let contact = null;
  let lead = null;

  if (conv) {
    contact = await Contact.findOne({ id: conv.contactId });
    lead = await Lead.findOne({ id: conv.leadId });
  } else if (fromPhone) {
    // Look up contact by phone suffix
    const digits = String(fromPhone).replace(/[^0-9]/g, '');
    const suffix = digits.slice(-10);
    const allContacts = await Contact.find({});
    contact = allContacts.find((c) => String(c.phone).replace(/[^0-9]/g, '').endsWith(suffix));

    if (!contact) {
      const newContactId = `cnt-${Date.now()}`;
      contact = await Contact.create({
        id: newContactId,
        name: senderProfileName || `WhatsApp User (+${digits})`,
        phone: `+${digits}`,
        email: '',
        company: 'WhatsApp Inquiry',
        location: '',
        preferredLanguage: languageHint || 'English',
        source: 'WhatsApp Inbound',
        tags: ['WhatsApp Inbound'],
        createdAt: todayStr,
        lastInteractionAt: 'Just now',
        totalConversations: 1,
        totalMessages: 1
      });
    }

    conv = await Conversation.findOne({ contactId: contact.id });
    lead = await Lead.findOne({ contactId: contact.id });

    if (!conv) {
      const newConvId = `conv-${Date.now()}`;
      const newLeadId = lead ? lead.id : `ld-${Date.now()}`;

      if (!lead) {
        lead = await Lead.create({
          id: newLeadId,
          contactId: contact.id,
          conversationId: newConvId,
          leadStatus: 'NEW',
          leadType: 'WARM',
          leadScore: 55,
          interestedService: 'WhatsApp Inquiry',
          budget: 'Not disclosed',
          estimatedValueInr: 0,
          timeline: 'Not specified',
          requirements: [content.slice(0, 80)],
          buyingSignals: ['Inbound WhatsApp message received'],
          source: 'WhatsApp Inbound',
          assignedAgentId: 'admin-1',
          aiSummary: `New WhatsApp inquiry from ${contact.name}: "${content.slice(0, 80)}"`,
          purchaseIntent: false,
          lastInteractionAt: 'Just now',
          createdAt: todayStr,
          updatedAt: todayStr
        });
      }

      conv = await Conversation.create({
        id: newConvId,
        contactId: contact.id,
        leadId: lead.id,
        assignedAgentId: 'admin-1',
        status: 'OPEN',
        aiEnabled: true,
        needsHumanAttention: false,
        unreadCount: 1,
        lastMessage: content,
        lastMessageTime: nowStr,
        language: languageHint || 'English',
        keyFinding: `New inquiry: "${content.slice(0, 65)}"`
      });
    }
  }

  if (!conv) {
    throw new Error('Conversation not found');
  }

  // Save Customer Message in MongoDB
  const customerMsg = await Message.create({
    id: `msg-cust-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    conversationId: conv.id,
    whatsappMessageId: whatsappMessageId || `wamid.in.${Date.now()}`,
    senderType: 'CUSTOMER',
    senderName: contact?.name || senderProfileName || 'Customer',
    content: content.trim(),
    timestamp: nowStr,
    deliveryStatus: 'READ'
  });

  if (contact) {
    contact.lastInteractionAt = 'Just now';
    contact.totalMessages = (contact.totalMessages || 0) + 1;
    await contact.save();
  }

  // Load AI Settings and Knowledge Base
  const aiSettingDoc = await Setting.findOne({ type: 'aiSettings' });
  const aiSettings = aiSettingDoc?.data || INITIAL_AI_SETTINGS;

  if (!conv.aiEnabled || !aiSettings.aiEnabled || !aiSettings.autoReplyEnabled) {
    conv.lastMessage = content.trim();
    conv.lastMessageTime = nowStr;
    conv.unreadCount = (conv.unreadCount || 0) + 1;
    await conv.save();
    return { customerMsg, aiMsg: null, conversation: conv, lead };
  }

  const historyMessages = await Message.find({ conversationId: conv.id }).sort({ createdAt: 1 });
  const knowledgeBase = await KnowledgeBase.find({});

  const aiStructured = await generateAIQualificationAndReply({
    customerMessage: content.trim(),
    contact,
    lead,
    historyMessages,
    knowledgeBase,
    aiSettings
  });

  // If this came from real WhatsApp or has a valid phone, attempt Cloud API send
  let deliveryStatus = 'DELIVERED';
  let outWamid = `wamid.ai.${Date.now()}`;
  if (contact?.phone) {
    const waRes = await sendWhatsAppCloudMessage(contact.phone, aiStructured.reply);
    if (waRes.sent && waRes.whatsappMessageId) {
      outWamid = waRes.whatsappMessageId;
    }
  }

  const aiMsg = await Message.create({
    id: `msg-ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    conversationId: conv.id,
    whatsappMessageId: outWamid,
    senderType: 'AI',
    senderName: 'PulseFlow AI Assistant',
    content: aiStructured.reply,
    timestamp: nowStr,
    deliveryStatus,
    aiMetadata: aiStructured
  });

  // Update Conversation in MongoDB
  conv.lastMessage = aiStructured.reply;
  conv.lastMessageTime = nowStr;
  conv.aiEnabled = !aiStructured.needsHuman;
  conv.needsHumanAttention = Boolean(aiStructured.needsHuman);
  conv.status = aiStructured.needsHuman ? 'HUMAN_HANDOFF' : 'OPEN';
  conv.keyFinding = aiStructured.summary;
  if (languageHint) conv.language = languageHint;
  if (aiStructured.needsHuman) {
    conv.handoffReason = 'Customer requested human intervention or complex quote';
  }
  await conv.save();

  // Update Lead in MongoDB
  if (lead) {
    const numericBudget =
      parseInt(String(aiStructured.budget).replace(/[^0-9]/g, ''), 10) ||
      lead.estimatedValueInr ||
      0;

    lead.leadScore = aiStructured.leadScore;
    lead.leadType = aiStructured.leadType;
    lead.interestedService = aiStructured.service || lead.interestedService;
    lead.budget = aiStructured.budget || lead.budget;
    if (numericBudget > 0) lead.estimatedValueInr = numericBudget;
    lead.timeline = aiStructured.timeline || lead.timeline;
    lead.requirements = aiStructured.requirements;
    lead.scoreBreakdown = {
      budgetReadiness: Math.min(25, Math.round(aiStructured.leadScore * 0.25)),
      needSpecificity: Math.min(25, Math.round(aiStructured.leadScore * 0.25)),
      timelineUrgency: Math.min(20, Math.round(aiStructured.leadScore * 0.2)),
      decisionAuthority: Math.min(15, Math.round(aiStructured.leadScore * 0.15)),
      engagementDepth: Math.min(15, Math.round(aiStructured.leadScore * 0.15))
    };
    lead.buyingSignals = Array.from(
      new Set([
        ...(lead.buyingSignals || []),
        `AI Intent: ${aiStructured.intent} (${Math.round((aiStructured.confidence || 0.9) * 100)}% confidence)`
      ])
    );
    lead.aiSummary = aiStructured.summary;
    lead.purchaseIntent = aiStructured.leadScore >= 75 || aiStructured.intent === 'purchase_intent';
    lead.lastInteractionAt = 'Just now';
    lead.updatedAt = todayStr;
    await lead.save();
  }

  if (aiStructured.needsHuman) {
    await Notification.create({
      id: `notif-${Date.now()}`,
      type: 'HUMAN_ATTENTION',
      title: 'Human Handoff Triggered by AI',
      message: `${contact?.name || 'Customer'} requires human assistance. Auto-reply paused.`,
      createdAt: 'Just now',
      isRead: false,
      linkTo: `/inbox?convId=${conv.id}`
    });
  }

  return { customerMsg, aiMsg, conversation: conv, lead, aiStructured };
}

// Defensive extraction for Meta Webhook payloads
function extractEvents(payload) {
  const events = [];
  if (!payload || typeof payload !== 'object') return events;

  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];

    for (const change of changes) {
      const value = change?.value ?? {};
      const contactsArr = Array.isArray(value.contacts) ? value.contacts : [];
      const profileName = contactsArr[0]?.profile?.name ?? null;
      const messages = Array.isArray(value.messages) ? value.messages : [];
      const statuses = Array.isArray(value.statuses) ? value.statuses : [];

      for (const message of messages) {
        const textBody =
          message?.text?.body ||
          message?.button?.text ||
          message?.interactive?.button_reply?.title ||
          message?.interactive?.list_reply?.title ||
          '';

        events.push({
          kind: 'message',
          field: change?.field ?? 'messages',
          messageId: message?.id ?? null,
          from: message?.from ?? null,
          profileName,
          type: message?.type ?? 'unknown',
          text: textBody,
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
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    database: dbStatusMap[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Meta webhook verification handler (supports both /webhook and /api/webhooks/whatsapp)
function handleWebhookVerify(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const tokenStr = Array.isArray(token)
    ? String(token[token.length - 1] ?? '')
    : String(token ?? '');

  if (mode === 'subscribe' && VERIFY_TOKEN && safeCompare(tokenStr, VERIFY_TOKEN)) {
    return res.status(200).type('text/plain').send(String(challenge));
  }

  console.warn(
    '[webhook] verification rejected',
    JSON.stringify({
      mode: mode === 'subscribe' ? 'subscribe' : 'unexpected-mode',
      verifyTokenConfigured: Boolean(VERIFY_TOKEN),
      challengeProvided: challenge !== undefined
    })
  );

  return res.sendStatus(403);
}

async function handleWebhookPost(req, res) {
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

  // Acknowledge immediately for Meta
  res.status(200).send('EVENT_RECEIVED');

  try {
    const events = extractEvents(req.body);
    console.log(
      '[webhook] events received',
      JSON.stringify({ count: events.length, events: events.slice(0, 25) })
    );

    for (const ev of events) {
      if (ev.kind === 'message' && ev.from && ev.text) {
        await handleIncomingCustomerMessage({
          fromPhone: ev.from,
          senderProfileName: ev.profileName,
          content: ev.text,
          whatsappMessageId: ev.messageId
        });
      } else if (ev.kind === 'status' && ev.messageId && ev.state) {
        const statusUpper = String(ev.state).toUpperCase();
        if (['SENT', 'DELIVERED', 'READ', 'FAILED'].includes(statusUpper)) {
          await Message.findOneAndUpdate(
            { whatsappMessageId: ev.messageId },
            { deliveryStatus: statusUpper }
          );
        }
      }
    }

    await Setting.findOneAndUpdate(
      { type: 'whatsappSettings' },
      { $set: { 'data.lastWebhookAt': new Date().toLocaleTimeString() } }
    );
  } catch (error) {
    console.error('[webhook] failed to process payload', error?.message ?? 'unknown error');
  }
}

app.get('/webhook', handleWebhookVerify);
app.post('/webhook', handleWebhookPost);
app.get('/api/webhooks/whatsapp', handleWebhookVerify);
app.post('/api/webhooks/whatsapp', handleWebhookPost);

app.get('/api/whatsapp/status', async (req, res) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '';

  const publicOrigin =
    process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
      ? process.env.APP_URL
      : `${req.protocol}://${req.get('host')}`;

  if (!token || !phoneId) {
    return res.json({
      webhookReady: Boolean(verifyToken),
      webhookUrl: `${publicOrigin}/webhook`,
      verifyTokenConfigured: Boolean(verifyToken),
      cloudApiConnected: false,
      phoneNumberId: phoneId || '',
      businessAccountId: wabaId || '',
      error: 'WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing in environment.'
    });
  }

  try {
    const url = `https://graph.facebook.com/${version}/${phoneId}?fields=id,display_phone_number,verified_name,quality_rating`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    if (!response.ok) {
      return res.json({
        webhookReady: Boolean(verifyToken),
        webhookUrl: `${publicOrigin}/webhook`,
        verifyTokenConfigured: Boolean(verifyToken),
        cloudApiConnected: false,
        phoneNumberId: phoneId,
        businessAccountId: wabaId || '',
        error: data?.error?.message || `Meta Graph API HTTP ${response.status}`,
        errorCode: data?.error?.code,
        errorSubcode: data?.error?.error_subcode
      });
    }

    if (data.display_phone_number) {
      await Setting.findOneAndUpdate(
        { type: 'whatsappSettings' },
        {
          $set: {
            'data.displayPhoneNumber': data.display_phone_number,
            'data.isConnected': true,
            'data.phoneNumberId': data.id || phoneId,
            'data.businessAccountId': wabaId || ''
          }
        }
      ).catch(() => {});
    }

    return res.json({
      webhookReady: Boolean(verifyToken),
      webhookUrl: `${publicOrigin}/webhook`,
      verifyTokenConfigured: Boolean(verifyToken),
      appSecretConfigured: Boolean(
        APP_SECRET && APP_SECRET !== 'replace_with_meta_app_secret_for_hmac_sha256'
      ),
      cloudApiConnected: true,
      phoneNumberId: data.id || phoneId,
      businessAccountId: wabaId || '',
      displayPhoneNumber: data.display_phone_number || '',
      verifiedName: data.verified_name || '',
      qualityRating: data.quality_rating || ''
    });
  } catch (err) {
    return res.json({
      webhookReady: Boolean(verifyToken),
      webhookUrl: `${publicOrigin}/webhook`,
      verifyTokenConfigured: Boolean(verifyToken),
      cloudApiConnected: false,
      phoneNumberId: phoneId,
      businessAccountId: wabaId || '',
      error: err.message
    });
  }
});

// ============================================================================
// REST API ROUTES FOR MONGODB CRM OPERATIONS
// ============================================================================

// Helper to strip Mongoose _id / __v
const cleanDoc = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return rest;
};

const cleanList = (docs) => docs.map(cleanDoc);

// Compute dynamic strategic findings from real database leads & conversations
function computeDynamicFindings(leads, contacts, conversations) {
  const findings = [];
  const hotLeads = leads.filter((l) => l.leadType === 'HOT');
  const handoffConvs = conversations.filter((c) => c.needsHumanAttention);

  if (hotLeads.length > 0) {
    const hotValue = hotLeads.reduce((sum, l) => sum + (l.estimatedValueInr || 0), 0);
    const valueStr =
      hotValue >= 100000
        ? `₹${(hotValue / 100000).toFixed(2)}L`
        : `₹${hotValue.toLocaleString('en-IN')}`;
    findings.push({
      id: 'sf-dynamic-hot',
      category: 'REVENUE_SIGNAL',
      title: `${hotLeads.length} Hot Lead${hotLeads.length > 1 ? 's' : ''} (${valueStr}) Ready for Closing`,
      metricBadge: `${hotLeads.length} HOT DEALS`,
      findingSummary: `Your database currently has ${hotLeads.length} high-intent lead(s) scored 81+ based on confirmed requirements and budget.`,
      recommendation: 'Follow up with your Hot Leads and share formal proposals to close deals.',
      actionLabel: 'Inspect Hot Leads',
      actionLink: '/leads',
      impactLevel: 'HIGH'
    });
  }

  if (handoffConvs.length > 0) {
    findings.push({
      id: 'sf-dynamic-handoff',
      category: 'CONVERSION_BOTTLENECK',
      title: `${handoffConvs.length} WhatsApp Chat${handoffConvs.length > 1 ? 's' : ''} Waiting for Human Reply`,
      metricBadge: 'NEEDS HUMAN TAKEOVER',
      findingSummary: `AI paused auto-replies on ${handoffConvs.length} conversation(s) that requested a human agent or manager.`,
      recommendation: 'Open WhatsApp Inbox and reply directly to resolve customer questions.',
      actionLabel: 'Open WhatsApp Inbox',
      actionLink: '/inbox',
      impactLevel: 'HIGH'
    });
  }

  return findings;
}

// 1. Bootstrap all CRM state from MongoDB
app.get('/api/bootstrap', async (_req, res) => {
  try {
    await connectDB();

    const [
      teamDocs,
      contactDocs,
      leadDocs,
      convDocs,
      msgDocs,
      followUpDocs,
      kbDocs,
      gapDocs,
      settingDocs,
      notifDocs
    ] = await Promise.all([
      TeamMember.find({}).sort({ _id: 1 }),
      Contact.find({}).sort({ _id: -1 }),
      Lead.find({}).sort({ leadScore: -1, _id: -1 }),
      Conversation.find({}).sort({ _id: -1 }),
      Message.find({}).sort({ createdAt: 1, _id: 1 }),
      FollowUp.find({}).sort({ date: 1, time: 1 }),
      KnowledgeBase.find({}).sort({ _id: -1 }),
      KnowledgeGap.find({}).sort({ _id: -1 }),
      Setting.find({}),
      Notification.find({}).sort({ createdAt: -1, _id: -1 })
    ]);

    const teamMembers = cleanList(teamDocs);
    const contacts = cleanList(contactDocs);
    const leads = cleanList(leadDocs);
    const conversations = cleanList(convDocs);
    const messages = cleanList(msgDocs);
    const followUps = cleanList(followUpDocs);
    const knowledgeBase = cleanList(kbDocs);
    const knowledgeGaps = cleanList(gapDocs);
    const notifications = cleanList(notifDocs);

    const messagesByConv = {};
    for (const c of conversations) {
      messagesByConv[c.id] = [];
    }
    for (const m of messages) {
      const cid = m.conversationId || m.convId;
      if (cid) {
        if (!messagesByConv[cid]) messagesByConv[cid] = [];
        messagesByConv[cid].push(m);
      }
    }

    const aiSettings =
      settingDocs.find((s) => s.type === 'aiSettings')?.data || INITIAL_AI_SETTINGS;
    const whatsappSettings =
      settingDocs.find((s) => s.type === 'whatsappSettings')?.data || INITIAL_WHATSAPP_SETTINGS;
    const companySettings =
      settingDocs.find((s) => s.type === 'companySettings')?.data || INITIAL_COMPANY_SETTINGS;

    const strategicFindings = computeDynamicFindings(leads, contacts, conversations);

    res.json({
      teamMembers,
      contacts,
      leads,
      conversations,
      messagesByConv,
      followUps,
      knowledgeBase,
      knowledgeGaps,
      strategicFindings,
      aiSettings,
      whatsappSettings,
      companySettings,
      notifications
    });
  } catch (err) {
    console.error('[api/bootstrap] Error loading data from MongoDB:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Team Members CRUD
app.post('/api/team', async (req, res) => {
  try {
    const payload = {
      id: req.body.id || `usr-${Date.now()}`,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || 'AGENT',
      phone: req.body.phone || '',
      isActive: req.body.isActive ?? true,
      assignedLeadsCount: 0,
      activeChatsCount: 0,
      lastLoginAt: 'Never',
      conversionRate: 0,
      avgResponseTime: '—'
    };
    const created = await TeamMember.create(payload);
    res.status(201).json(cleanDoc(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/team/:id', async (req, res) => {
  try {
    const updated = await TeamMember.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  try {
    await TeamMember.findOneAndDelete({ id: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Contacts CRUD
app.post('/api/contacts', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const contactId = req.body.id || `cnt-${Date.now()}`;

    const createdContact = await Contact.create({
      id: contactId,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email || '',
      company: req.body.company || '',
      roleTitle: req.body.roleTitle || '',
      location: req.body.location || '',
      preferredLanguage: req.body.preferredLanguage || 'English',
      bestTimeToContact: req.body.bestTimeToContact || 'Anytime',
      source: req.body.source || 'WhatsApp Inbound',
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      notes: [],
      createdAt: todayStr,
      lastInteractionAt: 'Just now',
      totalConversations: 1,
      totalMessages: 0
    });

    // Also create a default Conversation so this contact can be messaged in WhatsApp Inbox immediately
    let createdConversation = null;
    if (req.body.createConversation !== false) {
      const convId = `conv-${Date.now()}`;
      createdConversation = await Conversation.create({
        id: convId,
        contactId: createdContact.id,
        leadId: '',
        assignedAgentId: req.body.assignedAgentId || 'admin-1',
        status: 'OPEN',
        aiEnabled: true,
        needsHumanAttention: false,
        unreadCount: 0,
        lastMessage: 'Contact added to CRM — ready to chat on WhatsApp',
        lastMessageTime: nowStr,
        language: createdContact.preferredLanguage || 'English',
        keyFinding: `Contact added (${createdContact.company || createdContact.phone})`
      });
    }

    res.status(201).json({
      contact: cleanDoc(createdContact),
      conversation: cleanDoc(createdConversation)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/contacts/:id', async (req, res) => {
  try {
    const updated = await Contact.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    const convs = await Conversation.find({ contactId });
    const convIds = convs.map((c) => c.id);
    await Promise.all([
      Contact.findOneAndDelete({ id: contactId }),
      Lead.deleteMany({ contactId }),
      Conversation.deleteMany({ contactId }),
      Message.deleteMany({ conversationId: { $in: convIds } }),
      FollowUp.deleteMany({ contactId })
    ]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts/:id/notes', async (req, res) => {
  try {
    const note = {
      id: `cn-${Date.now()}`,
      content: req.body.content,
      authorName: req.body.authorName || 'Admin',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = await Contact.findOneAndUpdate(
      { id: req.params.id },
      { $push: { notes: { $each: [note], $position: 0 } } },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Leads CRUD
app.post('/api/leads', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const leadId = req.body.id || `ld-${Date.now()}`;
    const score = Number(req.body.leadScore ?? 75);
    const numericVal =
      req.body.estimatedValueInr ??
      (parseInt(String(req.body.budget || '').replace(/[^0-9]/g, ''), 10) || 0);

    // Ensure a Conversation exists for this contact so the lead is linked to a real chat
    let conv = await Conversation.findOne({ contactId: req.body.contactId });
    if (!conv) {
      conv = await Conversation.create({
        id: `conv-${Date.now()}`,
        contactId: req.body.contactId,
        leadId,
        assignedAgentId: req.body.assignedAgentId || 'admin-1',
        status: 'OPEN',
        aiEnabled: true,
        needsHumanAttention: false,
        unreadCount: 0,
        lastMessage: `Lead created for ${req.body.interestedService || 'Inquiry'}`,
        lastMessageTime: nowStr,
        language: 'English',
        keyFinding:
          req.body.aiSummary ||
          `Interested in ${req.body.interestedService} · Budget: ${req.body.budget}`
      });
    } else if (!conv.leadId) {
      conv.leadId = leadId;
      await conv.save();
    }

    const createdLead = await Lead.create({
      id: leadId,
      contactId: req.body.contactId,
      conversationId: conv.id,
      leadStatus: req.body.leadStatus || 'NEW',
      leadType: req.body.leadType || (score >= 81 ? 'HOT' : score >= 31 ? 'WARM' : 'COLD'),
      leadScore: score,
      scoreBreakdown: req.body.scoreBreakdown || {
        budgetReadiness: Math.min(25, Math.round(score * 0.25)),
        needSpecificity: Math.min(25, Math.round(score * 0.25)),
        timelineUrgency: Math.min(20, Math.round(score * 0.2)),
        decisionAuthority: Math.min(15, Math.round(score * 0.15)),
        engagementDepth: Math.min(15, Math.round(score * 0.15))
      },
      interestedService: req.body.interestedService || 'General Inquiry',
      budget: req.body.budget || 'Not disclosed',
      estimatedValueInr: numericVal,
      timeline: req.body.timeline || 'Not specified',
      requirements: Array.isArray(req.body.requirements) ? req.body.requirements : [],
      buyingSignals: Array.isArray(req.body.buyingSignals)
        ? req.body.buyingSignals
        : ['Lead created with service requirement'],
      detectedObjections: Array.isArray(req.body.detectedObjections)
        ? req.body.detectedObjections
        : [],
      recommendedNextAction:
        req.body.recommendedNextAction ||
        'Send service details on WhatsApp and schedule discovery call.',
      customerSentiment: req.body.customerSentiment || 'Positive & High Intent',
      source: req.body.source || 'WhatsApp Inbound',
      assignedAgentId: req.body.assignedAgentId || 'admin-1',
      aiSummary:
        req.body.aiSummary ||
        `Lead inquiring about ${req.body.interestedService || 'services'} with budget ${
          req.body.budget || 'TBD'
        }.`,
      purchaseIntent: Boolean(req.body.purchaseIntent ?? score >= 75),
      lastInteractionAt: 'Just now',
      createdAt: todayStr,
      updatedAt: todayStr,
      notes: []
    });

    res.status(201).json({
      lead: cleanDoc(createdLead),
      conversation: cleanDoc(conv)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  try {
    const patch = {
      ...req.body,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    const updated = await Lead.findOneAndUpdate(
      { id: req.params.id },
      { $set: patch },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    await Lead.findOneAndDelete({ id: req.params.id });
    await FollowUp.deleteMany({ leadId: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads/:id/notes', async (req, res) => {
  try {
    const note = {
      id: `ln-${Date.now()}`,
      content: req.body.content,
      authorName: req.body.authorName || 'Admin',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = await Lead.findOneAndUpdate(
      { id: req.params.id },
      { $push: { notes: { $each: [note], $position: 0 } } },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Conversations & WhatsApp Messages
app.patch('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body.patch || req.body },
      { new: true }
    );

    let systemMsg = null;
    if (req.body.systemMessage) {
      systemMsg = await Message.create({
        id: `msg-sys-${Date.now()}`,
        conversationId: req.params.id,
        whatsappMessageId: `sys.${Date.now()}`,
        senderType: 'SYSTEM',
        senderName: 'System',
        content: req.body.systemMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deliveryStatus: 'READ'
      });
    }

    res.json({
      conversation: cleanDoc(conv),
      systemMessage: cleanDoc(systemMsg)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { content, senderName } = req.body;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const conv = await Conversation.findOne({ id: conversationId });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const contact = await Contact.findOne({ id: conv.contactId });

    // Send real WhatsApp message if Cloud API credentials & customer phone exist
    let wamid = `wamid.agent.${Date.now()}`;
    let deliveryStatus = 'DELIVERED';
    if (contact?.phone) {
      const waResult = await sendWhatsAppCloudMessage(contact.phone, content.trim());
      if (waResult.sent && waResult.whatsappMessageId) {
        wamid = waResult.whatsappMessageId;
        deliveryStatus = 'SENT';
      }
    }

    const newMsg = await Message.create({
      id: `msg-${Date.now()}`,
      conversationId,
      whatsappMessageId: wamid,
      senderType: 'HUMAN_AGENT',
      senderName: senderName || 'Agent',
      content: content.trim(),
      timestamp: nowStr,
      deliveryStatus
    });

    conv.lastMessage = content.trim();
    conv.lastMessageTime = nowStr;
    conv.unreadCount = 0;
    conv.needsHumanAttention = false;
    await conv.save();

    if (contact) {
      contact.lastInteractionAt = 'Just now';
      contact.totalMessages = (contact.totalMessages || 0) + 1;
      await contact.save();
    }

    res.status(201).json({
      message: cleanDoc(newMsg),
      conversation: cleanDoc(conv)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations/:id/incoming', async (req, res) => {
  try {
    const result = await handleIncomingCustomerMessage({
      conversationId: req.params.id,
      content: req.body.content,
      languageHint: req.body.languageHint
    });

    res.status(201).json({
      customerMsg: cleanDoc(result.customerMsg),
      aiMsg: cleanDoc(result.aiMsg),
      conversation: cleanDoc(result.conversation),
      lead: cleanDoc(result.lead),
      aiStructured: result.aiStructured
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Follow-Ups CRUD
app.post('/api/follow-ups', async (req, res) => {
  try {
    const created = await FollowUp.create({
      ...req.body,
      id: req.body.id || `fu-${Date.now()}`
    });
    res.status(201).json(cleanDoc(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/follow-ups/:id', async (req, res) => {
  try {
    const updated = await FollowUp.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/follow-ups/:id', async (req, res) => {
  try {
    await FollowUp.findOneAndDelete({ id: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Knowledge Base & Gaps CRUD
app.post('/api/knowledge-base', async (req, res) => {
  try {
    const created = await KnowledgeBase.create({
      ...req.body,
      id: req.body.id || `kb-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      usageCount: req.body.usageCount ?? 1
    });
    res.status(201).json(cleanDoc(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/knowledge-base/:id', async (req, res) => {
  try {
    const updated = await KnowledgeBase.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          ...req.body,
          updatedAt: new Date().toISOString().slice(0, 10)
        }
      },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/knowledge-base/:id', async (req, res) => {
  try {
    await KnowledgeBase.findOneAndDelete({ id: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/knowledge-gaps/:id/resolve', async (req, res) => {
  try {
    const gap = await KnowledgeGap.findOne({ id: req.params.id });
    if (!gap) return res.status(404).json({ error: 'Knowledge gap not found' });

    gap.resolved = true;
    await gap.save();

    const article = await KnowledgeBase.create({
      id: `kb-${Date.now()}`,
      category: gap.suggestedCategory || 'FAQ',
      title: gap.suggestedTitle,
      content: gap.suggestedContent,
      keywords: gap.suggestedTitle.toLowerCase().split(/\s+/).slice(0, 5),
      isActive: true,
      updatedAt: new Date().toISOString().slice(0, 10),
      usageCount: gap.occurrences || 1
    });

    res.json({
      gap: cleanDoc(gap),
      article: cleanDoc(article)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Settings & Notifications
app.patch('/api/settings/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const existing = await Setting.findOne({ type });
    const mergedData = { ...(existing?.data || {}), ...req.body };

    const updated = await Setting.findOneAndUpdate(
      { type },
      { type, data: mergedData },
      { upsert: true, new: true }
    );
    res.json(updated.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { id: req.params.id },
      { $set: { isRead: true } },
      { new: true }
    );
    res.json(cleanDoc(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/read-all', async (_req, res) => {
  try {
    await Notification.updateMany({}, { $set: { isRead: true } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// FRONTEND SERVING (VITE MIDDLEWARE IN DEV, STATIC DIST IN PROD)
// ============================================================================
async function startServer() {
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR, { index: false }));

    app.get(/.*/, (req, res, next) => {
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

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(
      `[server] PulseFlow CRM listening on port ${PORT} (${
        IS_PRODUCTION ? 'production' : 'development'
      })`
    );

    const required = WEBHOOK_ENV_REQUIRED.map(
      (n) => `${n}=${process.env[n] ? 'set' : 'MISSING'}`
    );
    console.log(`[server] webhook env — ${required.join(' | ')}`);

    const reserved = WEBHOOK_ENV_RESERVED.map(
      (n) => `${n}=${process.env[n] ? 'set' : 'unset'}`
    );
    console.log(`[server] reserved env — ${reserved.join(' | ')}`);

    try {
      await connectDB();
    } catch (err) {
      console.error('[server] Initial database connection attempt failed:', err.message);
    }
  });
}

startServer();

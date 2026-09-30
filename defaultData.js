export const INITIAL_TEAM_MEMBERS = [
  {
    id: 'admin-1',
    name: 'Binil B',
    email: '33binilb@gmail.com',
    role: 'ADMIN',
    phone: '',
    isActive: true,
    assignedLeadsCount: 0,
    activeChatsCount: 0,
    lastLoginAt: 'Active now',
    conversionRate: 0,
    avgResponseTime: '—'
  }
];

export const INITIAL_CONTACTS = [];
export const INITIAL_LEADS = [];
export const INITIAL_CONVERSATIONS = [];
export const INITIAL_MESSAGES = {};
export const INITIAL_FOLLOW_UPS = [];
export const INITIAL_KNOWLEDGE_BASE = [];
export const INITIAL_KNOWLEDGE_GAPS = [];
export const INITIAL_STRATEGIC_FINDINGS = [];
export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_AI_SETTINGS = {
  aiEnabled: true,
  autoReplyEnabled: true,
  provider: 'GEMINI',
  model: 'gemini-3.5-flash-lite',
  temperature: 0.3,
  maxResponseLength: 350,
  scoreThresholds: {
    coldMax: 30,
    warmMax: 60,
    qualifiedMax: 80,
    hotMin: 81
  },
  humanHandoffThreshold: 0.7,
  businessTone: 'PROFESSIONAL',
  responseLanguage: 'AUTO',
  systemPrompt: `You are the AI sales assistant for our business on WhatsApp.

Your responsibilities:
- Answer customer questions professionally and concisely
- Understand customer intent and identify the requested service
- Ask relevant qualification questions (budget, timeline, core requirements)
- Provide accurate company information strictly from the Knowledge Base
- Never invent information, prices, or unsupported services
- Maintain conversation context across messages
- Support English, Malayalam, and Manglish naturally
- Detect when human assistance is required and set needsHuman = true for complaints, refund issues, manager requests, or complex custom quotes.`
};

export const INITIAL_WHATSAPP_SETTINGS = {
  phoneNumberId: '1384094818114996',
  businessAccountId: '1409996531275243',
  displayPhoneNumber: '+1 555-178-1439',
  verifyToken: 'pulseflow_webhook_2026_secure',
  webhookUrl: 'http://localhost:3000/webhook',
  isConnected: true,
  lastWebhookAt: 'Ready for incoming events',
  n8nEnabled: false,
  n8nWebhookUrl: ''
};

export const INITIAL_COMPANY_SETTINGS = {
  name: 'PulseFlow Workspace',
  industry: 'Business & Sales Operations',
  email: '33binilb@gmail.com',
  phone: '',
  website: '',
  address: '',
  timezone: 'Asia/Kolkata (IST)',
  currency: 'INR (₹)',
  businessHours: [
    { day: 'Monday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Tuesday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Wednesday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Thursday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Friday', open: '09:00', close: '19:00', isOpen: true },
    { day: 'Saturday', open: '10:00', close: '17:00', isOpen: true },
    { day: 'Sunday', open: '00:00', close: '00:00', isOpen: false }
  ]
};

export const ANALYTICS_LEADS_OVER_TIME = [];
export const ANALYTICS_LEAD_SOURCES = [];

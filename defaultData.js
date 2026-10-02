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
export const INITIAL_KNOWLEDGE_BASE = [
  {
    id: 'kb-1',
    category: 'SERVICES',
    title: 'Custom Web & Mobile App Development',
    content: 'We build responsive web applications with React, Next.js, and Node.js, as well as native/cross-platform mobile apps. Project costs typically start at ₹75,000 with timelines ranging between 4 to 8 weeks depending on specifications.',
    keywords: ['web development', 'mobile app', 'website', 'application', 'software', 'app'],
    isActive: true,
    updatedAt: new Date().toISOString().slice(0, 10),
    usageCount: 12
  },
  {
    id: 'kb-2',
    category: 'PRICING',
    title: 'Standard Pricing & Payment Milestones',
    content: 'Our typical billing structure consists of 30% advance deposit upon contract signing, 40% upon completion of core milestones and staging demo, and 30% upon final deployment and handoff. Custom quote requests receive detailed estimates within 24 business hours.',
    keywords: ['price', 'pricing', 'cost', 'budget', 'rate', 'payment', 'quote', 'discount'],
    isActive: true,
    updatedAt: new Date().toISOString().slice(0, 10),
    usageCount: 18
  },
  {
    id: 'kb-3',
    category: 'SERVICES',
    title: 'WhatsApp AI Automation & CRM Integration',
    content: 'We deploy official Meta WhatsApp Cloud API bots powered by Google Gemini and OpenAI models. Includes lead qualification, automated quotation generation, human handoff triggers, and webhook integrations into internal CRMs starting at ₹35,000.',
    keywords: ['whatsapp', 'crm', 'ai bot', 'automation', 'chat', 'meta cloud api'],
    isActive: true,
    updatedAt: new Date().toISOString().slice(0, 10),
    usageCount: 25
  },
  {
    id: 'kb-4',
    category: 'FAQ',
    title: 'Support, Maintenance & SLA Details',
    content: 'All custom development projects include 30 days of complimentary post-launch support and bug fixes. Extended 24/7 SLA maintenance contracts are available on quarterly or annual retainers.',
    keywords: ['support', 'warranty', 'maintenance', 'sla', 'bug fix', 'hosting'],
    isActive: true,
    updatedAt: new Date().toISOString().slice(0, 10),
    usageCount: 8
  }
];
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

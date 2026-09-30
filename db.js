import mongoose from 'mongoose';
import {
  INITIAL_TEAM_MEMBERS,
  INITIAL_AI_SETTINGS,
  INITIAL_WHATSAPP_SETTINGS,
  INITIAL_COMPANY_SETTINGS
} from './defaultData.js';

const NoteSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
    authorName: { type: String, default: 'Admin' },
    createdAt: { type: String, required: true }
  },
  { _id: false }
);

const TeamMemberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'AGENT'], default: 'AGENT' },
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    assignedLeadsCount: { type: Number, default: 0 },
    activeChatsCount: { type: Number, default: 0 },
    lastLoginAt: { type: String, default: 'Never' },
    conversionRate: { type: Number, default: 0 },
    avgResponseTime: { type: String, default: '—' }
  },
  { timestamps: false }
);

const ContactSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, default: '' },
    company: { type: String, default: '' },
    roleTitle: { type: String, default: '' },
    location: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    bestTimeToContact: { type: String, default: 'Anytime' },
    source: { type: String, default: 'WhatsApp Inbound' },
    tags: { type: [String], default: [] },
    notes: { type: [NoteSubSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    lastInteractionAt: { type: String, default: 'Just now' },
    totalConversations: { type: Number, default: 1 },
    totalMessages: { type: Number, default: 0 }
  },
  { timestamps: false }
);

const LeadSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    contactId: { type: String, required: true, index: true },
    conversationId: { type: String, default: '' },
    leadStatus: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
      default: 'NEW'
    },
    leadType: {
      type: String,
      enum: ['HOT', 'WARM', 'COLD', 'UNQUALIFIED', 'EXISTING_CUSTOMER'],
      default: 'WARM'
    },
    leadScore: { type: Number, default: 50 },
    scoreBreakdown: {
      budgetReadiness: { type: Number, default: 12 },
      needSpecificity: { type: Number, default: 12 },
      timelineUrgency: { type: Number, default: 10 },
      decisionAuthority: { type: Number, default: 8 },
      engagementDepth: { type: Number, default: 8 }
    },
    interestedService: { type: String, default: 'General Inquiry' },
    budget: { type: String, default: 'Not disclosed' },
    estimatedValueInr: { type: Number, default: 0 },
    timeline: { type: String, default: 'Not specified' },
    requirements: { type: [String], default: [] },
    buyingSignals: { type: [String], default: [] },
    detectedObjections: { type: [String], default: [] },
    recommendedNextAction: {
      type: String,
      default: 'Review customer requirements and send initial response.'
    },
    customerSentiment: { type: String, default: 'Curious & Evaluating' },
    source: { type: String, default: 'WhatsApp Inbound' },
    assignedAgentId: { type: String, default: 'admin-1' },
    aiSummary: { type: String, default: '' },
    purchaseIntent: { type: Boolean, default: false },
    lastInteractionAt: { type: String, default: 'Just now' },
    nextFollowUpAt: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    updatedAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    notes: { type: [NoteSubSchema], default: [] }
  },
  { timestamps: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    contactId: { type: String, required: true, index: true },
    leadId: { type: String, default: '' },
    assignedAgentId: { type: String, default: 'admin-1' },
    status: {
      type: String,
      enum: ['OPEN', 'HUMAN_HANDOFF', 'CLOSED'],
      default: 'OPEN'
    },
    aiEnabled: { type: Boolean, default: true },
    needsHumanAttention: { type: Boolean, default: false },
    handoffReason: { type: String },
    unreadCount: { type: Number, default: 0 },
    lastMessage: { type: String, default: 'Conversation started' },
    lastMessageTime: { type: String, default: 'Just now' },
    language: { type: String, default: 'English' },
    keyFinding: { type: String, default: 'Active WhatsApp conversation' },
    suggestedReplies: {
      type: [String],
      default: [
        'Hello! How can we help you today?',
        'Could you share your expected budget and timeline so we can prepare a proposal?',
        'Would you like to schedule a quick 10-minute call to discuss your requirements?'
      ]
    }
  },
  { timestamps: false }
);

const MessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    conversationId: { type: String, required: true, index: true },
    whatsappMessageId: { type: String, default: '' },
    senderType: {
      type: String,
      enum: ['CUSTOMER', 'AI', 'HUMAN_AGENT', 'SYSTEM'],
      required: true
    },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: String, required: true },
    deliveryStatus: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'DELIVERED'
    },
    attachments: { type: Array, default: [] },
    aiMetadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

const FollowUpSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    leadId: { type: String, required: true },
    contactId: { type: String, required: true },
    assignedUserId: { type: String, default: 'admin-1' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    note: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'OVERDUE', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    }
  },
  { timestamps: false }
);

const KnowledgeBaseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: 'SERVICES' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    keywords: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    usageCount: { type: Number, default: 1 }
  },
  { timestamps: false }
);

const KnowledgeGapSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    questionAsked: { type: String, required: true },
    language: { type: String, default: 'English' },
    occurrences: { type: Number, default: 1 },
    avgConfidence: { type: Number, default: 0.6 },
    suggestedCategory: { type: String, default: 'FAQ' },
    suggestedTitle: { type: String, required: true },
    suggestedContent: { type: String, required: true },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: false }
);

const SettingSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: false }
);

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, default: 'SYSTEM' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: String, default: 'Just now' },
    isRead: { type: Boolean, default: false },
    linkTo: { type: String, default: '/dashboard' }
  },
  { timestamps: true }
);

export const TeamMember =
  mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
export const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);
export const KnowledgeBase =
  mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
export const KnowledgeGap =
  mongoose.models.KnowledgeGap || mongoose.model('KnowledgeGap', KnowledgeGapSchema);
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

const FAKE_IDS = {
  contacts: ['cnt-1', 'cnt-2', 'cnt-3', 'cnt-4', 'cnt-5', 'cnt-6', 'cnt-7', 'cnt-8'],
  leads: ['ld-1', 'ld-2', 'ld-3', 'ld-4', 'ld-5', 'ld-6', 'ld-7', 'ld-8'],
  conversations: ['conv-1', 'conv-2', 'conv-3', 'conv-4', 'conv-5', 'conv-6', 'conv-7', 'conv-8'],
  messages: [
    'msg-101',
    'msg-102',
    'msg-103',
    'msg-104',
    'msg-201',
    'msg-202',
    'msg-203',
    'msg-301',
    'msg-302',
    'msg-401',
    'msg-402'
  ],
  followUps: ['fu-1', 'fu-2', 'fu-3', 'fu-4', 'fu-5', 'fu-6'],
  teamMembers: ['usr-1', 'usr-2', 'usr-3', 'usr-4'],
  knowledgeBase: ['kb-1', 'kb-2', 'kb-3', 'kb-4', 'kb-5', 'kb-6'],
  knowledgeGaps: ['gap-1', 'gap-2', 'gap-3'],
  notifications: ['notif-1', 'notif-2', 'notif-3', 'notif-4']
};

export async function purgeLegacyFakeDataAndEnsureDefaults() {
  try {
    await Promise.all([
      Contact.deleteMany({ id: { $in: FAKE_IDS.contacts } }),
      Lead.deleteMany({ id: { $in: FAKE_IDS.leads } }),
      Conversation.deleteMany({ id: { $in: FAKE_IDS.conversations } }),
      Message.deleteMany({ id: { $in: FAKE_IDS.messages } }),
      FollowUp.deleteMany({ id: { $in: FAKE_IDS.followUps } }),
      TeamMember.deleteMany({ id: { $in: FAKE_IDS.teamMembers } }),
      KnowledgeBase.deleteMany({ id: { $in: FAKE_IDS.knowledgeBase } }),
      KnowledgeGap.deleteMany({ id: { $in: FAKE_IDS.knowledgeGaps } }),
      Notification.deleteMany({ id: { $in: FAKE_IDS.notifications } })
    ]);

    // Ensure at least 1 real Admin user exists so RBAC & login work seamlessly
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      await TeamMember.insertMany(INITIAL_TEAM_MEMBERS);
    }

    // Ensure settings exist with real environment variable defaults
    const envWhatsAppSettings = {
      ...INITIAL_WHATSAPP_SETTINGS,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || INITIAL_WHATSAPP_SETTINGS.phoneNumberId,
      businessAccountId:
        process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || INITIAL_WHATSAPP_SETTINGS.businessAccountId,
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || INITIAL_WHATSAPP_SETTINGS.verifyToken,
      webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/webhook`
    };

    const existingWa = await Setting.findOne({ type: 'whatsappSettings' });
    if (!existingWa || existingWa.data?.phoneNumberId === '109283746512345') {
      await Setting.findOneAndUpdate(
        { type: 'whatsappSettings' },
        { type: 'whatsappSettings', data: envWhatsAppSettings },
        { upsert: true, new: true }
      );
    }

    const envProvider = String(process.env.AI_PROVIDER || INITIAL_AI_SETTINGS.provider).toUpperCase();
    const envModel =
      envProvider === 'GEMINI'
        ? process.env.GEMINI_MODEL || INITIAL_AI_SETTINGS.model
        : process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const existingAi = await Setting.findOne({ type: 'aiSettings' });
    if (!existingAi) {
      await Setting.create({
        type: 'aiSettings',
        data: { ...INITIAL_AI_SETTINGS, provider: envProvider, model: envModel }
      });
    } else if (
      existingAi.data?.model === 'gemini-3.8-flash' ||
      existingAi.data?.model === 'gpt-4o-mini' ||
      existingAi.data?.provider !== envProvider ||
      String(existingAi.data?.systemPrompt || '').includes('TechNova')
    ) {
      await Setting.findOneAndUpdate(
        { type: 'aiSettings' },
        {
          $set: {
            'data.provider': envProvider,
            'data.model': envModel,
            'data.systemPrompt': INITIAL_AI_SETTINGS.systemPrompt
          }
        }
      );
    }

    const existingCompany = await Setting.findOne({ type: 'companySettings' });
    if (
      !existingCompany ||
      existingCompany.data?.name === 'TechNova Digital Solutions Pvt Ltd'
    ) {
      await Setting.findOneAndUpdate(
        { type: 'companySettings' },
        { type: 'companySettings', data: INITIAL_COMPANY_SETTINGS },
        { upsert: true, new: true }
      );
    }

    console.log('[db] Fake dummy records purged & clean database state verified.');
  } catch (err) {
    console.error('[db] Error during fake data cleanup:', err.message);
  }
}

let isConnected = false;

export async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      '[db] MONGODB_URI is not defined in environment variables. Database connection skipped.'
    );
    return null;
  }

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log(
        `[db] MongoDB connected successfully to database: ${mongoose.connection.name}`
      );
    });

    mongoose.connection.on('error', (err) => {
      console.error('[db] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[db] MongoDB disconnected.');
    });

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    isConnected = true;
    await purgeLegacyFakeDataAndEnsureDefaults();
    return conn;
  } catch (error) {
    console.error('[db] Failed to connect to MongoDB:', error.message);
    return null;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[db] MongoDB disconnected gracefully.');
  }
}

export default mongoose;

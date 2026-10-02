import mongoose from 'mongoose';
import {
  INITIAL_TEAM_MEMBERS,
  INITIAL_KNOWLEDGE_BASE,
  INITIAL_AI_SETTINGS,
  INITIAL_WHATSAPP_SETTINGS,
  INITIAL_COMPANY_SETTINGS
} from './defaultData.js';

// CRITICAL: fail fast, don't hang when MongoDB is offline
mongoose.set('bufferCommands', false);

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

// Real Mongoose Models
const RealTeamMember =
  mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
const RealContact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
const RealLead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
const RealConversation =
  mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
const RealMessage = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const RealFollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);
const RealKnowledgeBase =
  mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
const RealKnowledgeGap =
  mongoose.models.KnowledgeGap || mongoose.model('KnowledgeGap', KnowledgeGapSchema);
const RealSetting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
const RealNotification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// ============================================================================
// IN-MEMORY FALLBACK DATABASE ADAPTER
// When MongoDB is offline/unreachable in AI Studio, this provides immediate,
// seamless in-memory CRUD operations with zero buffering timeouts.
// ============================================================================

function matchesFilter(item, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (val !== null && typeof val === 'object' && '$in' in val) {
      if (!val.$in.includes(item[key])) return false;
    } else if (item[key] !== val) {
      return false;
    }
  }
  return true;
}

function applySort(items, sortObj) {
  if (!sortObj || typeof sortObj !== 'object') return items;
  const entries = Object.entries(sortObj);
  return [...items].sort((a, b) => {
    for (const [field, direction] of entries) {
      const aVal = a[field];
      const bVal = b[field];
      if (aVal === bVal) continue;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      const cmp = aVal > bVal ? 1 : -1;
      return direction === -1 || direction === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
}

function applyUpdate(target, update) {
  if (!update) return target;
  if (update.$set) {
    for (const [k, v] of Object.entries(update.$set)) {
      if (k.includes('.')) {
        const parts = k.split('.');
        let curr = target;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]] || typeof curr[parts[i]] !== 'object') {
            curr[parts[i]] = {};
          }
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = v;
      } else {
        target[k] = v;
      }
    }
  } else {
    Object.assign(target, update);
  }
  return target;
}

function wrapDoc(store, doc) {
  if (!doc) return null;
  const copy = { ...doc };
  Object.defineProperty(copy, 'toObject', {
    value: function () {
      const { toObject, save, ...clean } = this;
      return clean;
    },
    enumerable: false
  });
  Object.defineProperty(copy, 'save', {
    value: async function () {
      const idx = store.findIndex((d) => d.id === copy.id || (copy.type && d.type === copy.type));
      if (idx !== -1) {
        store[idx] = { ...this };
      }
      return this;
    },
    enumerable: false
  });
  return copy;
}

class InMemoryCollection {
  constructor(initialData = []) {
    this.data = initialData.map((d) => ({ ...d }));
  }

  find(filter = {}) {
    let sortObj = null;
    let isLean = false;
    const self = this;

    const queryObj = {
      sort(criteria) {
        sortObj = criteria;
        return queryObj;
      },
      lean() {
        isLean = true;
        return queryObj;
      },
      then(resolve, reject) {
        try {
          let results = self.data.filter((d) => matchesFilter(d, filter));
          if (sortObj) {
            results = applySort(results, sortObj);
          }
          resolve(isLean ? results.map((d) => ({ ...d })) : results.map((d) => wrapDoc(self.data, d)));
        } catch (e) {
          reject(e);
        }
      }
    };
    return queryObj;
  }

  findOne(filter = {}) {
    let isLean = false;
    const self = this;

    const queryObj = {
      lean() {
        isLean = true;
        return queryObj;
      },
      then(resolve, reject) {
        try {
          const found = self.data.find((d) => matchesFilter(d, filter));
          if (!found) {
            return resolve(null);
          }
          resolve(isLean ? { ...found } : wrapDoc(self.data, found));
        } catch (e) {
          reject(e);
        }
      }
    };
    return queryObj;
  }

  async create(doc) {
    const item = { ...doc };
    if (!item.id && !item.type) {
      item.id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    }
    this.data.push(item);
    return wrapDoc(this.data, item);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    let found = this.data.find((d) => matchesFilter(d, filter));
    if (!found) {
      if (options.upsert) {
        const newDoc = { ...filter };
        applyUpdate(newDoc, update);
        this.data.push(newDoc);
        return wrapDoc(this.data, newDoc);
      }
      return null;
    }
    applyUpdate(found, update);
    return wrapDoc(this.data, found);
  }

  async findOneAndDelete(filter) {
    const idx = this.data.findIndex((d) => matchesFilter(d, filter));
    if (idx !== -1) {
      const [removed] = this.data.splice(idx, 1);
      return wrapDoc(this.data, removed);
    }
    return null;
  }

  async updateMany(filter, update) {
    let modifiedCount = 0;
    for (const item of this.data) {
      if (matchesFilter(item, filter)) {
        applyUpdate(item, update);
        modifiedCount++;
      }
    }
    return { modifiedCount };
  }

  async deleteMany(filter = {}) {
    const originalLen = this.data.length;
    this.data = this.data.filter((d) => !matchesFilter(d, filter));
    return { deletedCount: originalLen - this.data.length };
  }

  async countDocuments(filter = {}) {
    return this.data.filter((d) => matchesFilter(d, filter)).length;
  }

  async insertMany(docs = []) {
    const created = docs.map((d) => ({ ...d }));
    this.data.push(...created);
    return created.map((d) => wrapDoc(this.data, d));
  }
}

// Instantiate in-memory collections with default seed data
const initialWhatsAppSettings = {
  ...INITIAL_WHATSAPP_SETTINGS,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || INITIAL_WHATSAPP_SETTINGS.phoneNumberId,
  businessAccountId:
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || INITIAL_WHATSAPP_SETTINGS.businessAccountId,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || INITIAL_WHATSAPP_SETTINGS.verifyToken,
  webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/webhook`
};

const inMemoryStores = {
  TeamMember: new InMemoryCollection(INITIAL_TEAM_MEMBERS),
  Contact: new InMemoryCollection([]),
  Lead: new InMemoryCollection([]),
  Conversation: new InMemoryCollection([]),
  Message: new InMemoryCollection([]),
  FollowUp: new InMemoryCollection([]),
  KnowledgeBase: new InMemoryCollection(INITIAL_KNOWLEDGE_BASE),
  KnowledgeGap: new InMemoryCollection([]),
  Setting: new InMemoryCollection([
    { type: 'aiSettings', data: INITIAL_AI_SETTINGS },
    { type: 'whatsappSettings', data: initialWhatsAppSettings },
    { type: 'companySettings', data: INITIAL_COMPANY_SETTINGS }
  ]),
  Notification: new InMemoryCollection([])
};

// Model proxy: routes dynamically to real Mongoose when connected (readyState === 1),
// or the in-memory fallback collection when disconnected.
function createModelProxy(realModel, modelName) {
  const inMemory = inMemoryStores[modelName];
  return new Proxy(realModel, {
    get(target, prop) {
      if (mongoose.connection.readyState === 1) {
        const val = target[prop];
        return typeof val === 'function' ? val.bind(target) : val;
      }
      if (inMemory && prop in inMemory) {
        const val = inMemory[prop];
        return typeof val === 'function' ? val.bind(inMemory) : val;
      }
      const val = target[prop];
      return typeof val === 'function' ? val.bind(target) : val;
    }
  });
}

export const TeamMember = createModelProxy(RealTeamMember, 'TeamMember');
export const Contact = createModelProxy(RealContact, 'Contact');
export const Lead = createModelProxy(RealLead, 'Lead');
export const Conversation = createModelProxy(RealConversation, 'Conversation');
export const Message = createModelProxy(RealMessage, 'Message');
export const FollowUp = createModelProxy(RealFollowUp, 'FollowUp');
export const KnowledgeBase = createModelProxy(RealKnowledgeBase, 'KnowledgeBase');
export const KnowledgeGap = createModelProxy(RealKnowledgeGap, 'KnowledgeGap');
export const Setting = createModelProxy(RealSetting, 'Setting');
export const Notification = createModelProxy(RealNotification, 'Notification');

export async function purgeLegacyFakeDataAndEnsureDefaults() {
  try {
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      await TeamMember.insertMany(INITIAL_TEAM_MEMBERS);
    }

    const existingWa = await Setting.findOne({ type: 'whatsappSettings' });
    if (!existingWa) {
      await Setting.create({ type: 'whatsappSettings', data: initialWhatsAppSettings });
    }

    const existingAi = await Setting.findOne({ type: 'aiSettings' });
    if (!existingAi) {
      await Setting.create({ type: 'aiSettings', data: INITIAL_AI_SETTINGS });
    }

    const existingCompany = await Setting.findOne({ type: 'companySettings' });
    if (!existingCompany) {
      await Setting.create({ type: 'companySettings', data: INITIAL_COMPANY_SETTINGS });
    }

    const kbCount = await KnowledgeBase.countDocuments();
    if (kbCount === 0 && INITIAL_KNOWLEDGE_BASE.length > 0) {
      await KnowledgeBase.insertMany(INITIAL_KNOWLEDGE_BASE);
    }
  } catch (err) {
    console.warn('[db] ensure defaults notice:', err.message);
  }
}

let isConnected = false;

export async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[db] MONGODB_URI not configured — in-memory fallback active.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[db] MongoDB connected successfully to database: ${mongoose.connection.name}`);
    await purgeLegacyFakeDataAndEnsureDefaults();
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn('[db] MongoDB unavailable, using in-memory store:', error.message);
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

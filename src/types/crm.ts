export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT';

export type LeadType = 'HOT' | 'WARM' | 'COLD' | 'UNQUALIFIED' | 'EXISTING_CUSTOMER';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type MessageSenderType = 'CUSTOMER' | 'AI' | 'HUMAN_AGENT' | 'SYSTEM';

export type DeliveryStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

export type KnowledgeCategory =
  | 'COMPANY_INFO'
  | 'SERVICES'
  | 'PRICING'
  | 'FAQ'
  | 'BUSINESS_HOURS'
  | 'LOCATIONS'
  | 'CONTACT_INFO'
  | 'POLICIES'
  | 'PRODUCT_INFO'
  | 'SALES_INFO';

export type NotificationType =
  | 'HOT_LEAD'
  | 'HUMAN_ATTENTION'
  | 'FOLLOW_UP_DUE'
  | 'LEAD_ASSIGNED'
  | 'AI_ESCALATION'
  | 'WHATSAPP_FAILED'
  | 'SYSTEM_ERROR';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
  assignedLeadsCount: number;
  activeChatsCount: number;
  lastLoginAt: string;
  conversionRate?: number;
  avgResponseTime?: string;
}

export interface NoteItem {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  roleTitle?: string;
  location: string;
  preferredLanguage?: 'English' | 'Manglish' | 'Malayalam';
  bestTimeToContact?: string;
  source: string;
  tags: string[];
  notes: NoteItem[];
  createdAt: string;
  lastInteractionAt: string;
  totalConversations: number;
  totalMessages: number;
}

export interface LeadScoreBreakdown {
  budgetReadiness: number; // out of 25
  needSpecificity: number; // out of 25
  timelineUrgency: number; // out of 20
  decisionAuthority: number; // out of 15
  engagementDepth: number; // out of 15
}

export interface Lead {
  id: string;
  contactId: string;
  conversationId: string;
  leadStatus: LeadStatus;
  leadType: LeadType;
  leadScore: number; // 0 - 100
  scoreBreakdown: LeadScoreBreakdown;
  interestedService: string;
  budget: string;
  estimatedValueInr: number;
  timeline: string;
  requirements: string[];
  buyingSignals: string[];
  detectedObjections: string[];
  recommendedNextAction: string;
  customerSentiment: 'Positive & High Intent' | 'Urgent / Escalated' | 'Curious & Evaluating' | 'Price Sensitive';
  source: string;
  assignedAgentId: string;
  aiSummary: string;
  purchaseIntent: boolean;
  lastInteractionAt: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
  notes: NoteItem[];
}

export interface AIStructuredMetadata {
  reply: string;
  intent: string;
  service: string;
  leadType: LeadType;
  leadScore: number;
  budget: string;
  timeline: string;
  requirements: string[];
  summary: string;
  needsHuman: boolean;
  confidence: number;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'IMAGE' | 'DOCUMENT' | 'AUDIO';
  size: string;
  url: string;
}

export interface Message {
  id: string;
  conversationId: string;
  whatsappMessageId: string;
  senderType: MessageSenderType;
  senderName: string;
  content: string;
  timestamp: string;
  deliveryStatus: DeliveryStatus;
  attachments?: MessageAttachment[];
  aiMetadata?: AIStructuredMetadata;
}

export interface Conversation {
  id: string;
  contactId: string;
  leadId: string;
  assignedAgentId: string;
  status: 'OPEN' | 'HUMAN_HANDOFF' | 'RESOLVED';
  aiEnabled: boolean;
  needsHumanAttention: boolean;
  handoffReason?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  language: 'English' | 'Malayalam' | 'Manglish';
  suggestedReplies?: string[];
  keyFinding?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  contactId: string;
  assignedUserId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  note: string;
  status: FollowUpStatus;
}

export interface KnowledgeArticle {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  keywords: string[];
  isActive: boolean;
  updatedAt: string;
  usageCount?: number;
}

export interface KnowledgeGapFinding {
  id: string;
  questionAsked: string;
  language: 'English' | 'Manglish' | 'Malayalam';
  occurrences: number;
  avgConfidence: number;
  suggestedCategory: KnowledgeCategory;
  suggestedTitle: string;
  suggestedContent: string;
  resolved: boolean;
}

export interface StrategicFinding {
  id: string;
  category: 'REVENUE_SIGNAL' | 'LANGUAGE_INSIGHT' | 'KNOWLEDGE_GAP' | 'CONVERSION_BOTTLENECK';
  title: string;
  metricBadge: string;
  findingSummary: string;
  recommendation: string;
  actionLabel: string;
  actionLink: string;
  impactLevel: 'HIGH' | 'MEDIUM';
}

export interface AISettingsConfig {
  aiEnabled: boolean;
  autoReplyEnabled: boolean;
  provider: 'OPENAI' | 'GEMINI';
  model: string;
  temperature: number;
  maxResponseLength: number;
  scoreThresholds: {
    coldMax: number;
    warmMax: number;
    qualifiedMax: number;
    hotMin: number;
  };
  humanHandoffThreshold: number; // e.g., 0.70
  businessTone: 'PROFESSIONAL' | 'FRIENDLY' | 'CONSULTATIVE' | 'CONCISE';
  responseLanguage: 'AUTO' | 'ENGLISH' | 'MALAYALAM' | 'MANGLISH';
  systemPrompt: string;
}

export interface WhatsAppSettingsConfig {
  phoneNumberId: string;
  businessAccountId: string;
  displayPhoneNumber: string;
  verifyToken: string;
  webhookUrl: string;
  isConnected: boolean;
  lastWebhookAt: string;
  n8nEnabled: boolean;
  n8nWebhookUrl: string;
}

export interface CompanySettingsConfig {
  name: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  timezone: string;
  currency: string;
  businessHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
}

export interface CRMNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  linkTo: string;
}

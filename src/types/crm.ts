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
  location: string;
  source: string;
  tags: string[];
  notes: NoteItem[];
  createdAt: string;
  lastInteractionAt: string;
  totalConversations: number;
  totalMessages: number;
}

export interface Lead {
  id: string;
  contactId: string;
  conversationId: string;
  leadStatus: LeadStatus;
  leadType: LeadType;
  leadScore: number; // 0 - 100
  interestedService: string;
  budget: string;
  timeline: string;
  requirements: string[];
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

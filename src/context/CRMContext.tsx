import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  TeamMember,
  UserRole,
  Contact,
  Lead,
  Conversation,
  Message,
  FollowUp,
  FollowUpStatus,
  KnowledgeArticle,
  KnowledgeGapFinding,
  StrategicFinding,
  AISettingsConfig,
  WhatsAppSettingsConfig,
  CompanySettingsConfig,
  CRMNotification,
  AIStructuredMetadata
} from '../types/crm';
import {
  INITIAL_TEAM_MEMBERS,
  INITIAL_CONTACTS,
  INITIAL_LEADS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_FOLLOW_UPS,
  INITIAL_KNOWLEDGE_BASE,
  INITIAL_KNOWLEDGE_GAPS,
  INITIAL_STRATEGIC_FINDINGS,
  INITIAL_AI_SETTINGS,
  INITIAL_WHATSAPP_SETTINGS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_NOTIFICATIONS
} from '../data/mockCrmData';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface CRMContextValue {
  currentUser: TeamMember;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole, email?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'assignedLeadsCount' | 'activeChatsCount' | 'lastLoginAt'>) => void;
  updateTeamMember: (id: string, patch: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'lastInteractionAt' | 'totalConversations' | 'totalMessages' | 'notes'>) => Contact;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addContactNote: (contactId: string, content: string) => void;

  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'lastInteractionAt' | 'notes' | 'scoreBreakdown' | 'estimatedValueInr' | 'buyingSignals' | 'detectedObjections' | 'recommendedNextAction' | 'customerSentiment'> & Partial<Pick<Lead, 'scoreBreakdown' | 'estimatedValueInr' | 'buyingSignals' | 'detectedObjections' | 'recommendedNextAction' | 'customerSentiment'>>) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addLeadNote: (leadId: string, content: string) => void;

  conversations: Conversation[];
  messagesByConv: Record<string, Message[]>;
  sendAgentMessage: (conversationId: string, content: string) => void;
  simulateCustomerIncomingMessage: (conversationId: string, content: string, languageHint?: 'English' | 'Manglish' | 'Malayalam') => void;
  takeOverConversation: (conversationId: string) => void;
  returnConversationToAI: (conversationId: string) => void;
  markConversationRead: (conversationId: string) => void;

  followUps: FollowUp[];
  addFollowUp: (fu: Omit<FollowUp, 'id'>) => void;
  updateFollowUpStatus: (id: string, status: FollowUpStatus) => void;
  deleteFollowUp: (id: string) => void;

  knowledgeBase: KnowledgeArticle[];
  addKnowledgeArticle: (article: Omit<KnowledgeArticle, 'id' | 'updatedAt'>) => void;
  updateKnowledgeArticle: (id: string, patch: Partial<KnowledgeArticle>) => void;
  deleteKnowledgeArticle: (id: string) => void;

  knowledgeGaps: KnowledgeGapFinding[];
  resolveKnowledgeGapToArticle: (gapId: string) => void;
  strategicFindings: StrategicFinding[];

  aiSettings: AISettingsConfig;
  updateAISettings: (patch: Partial<AISettingsConfig>) => void;

  whatsappSettings: WhatsAppSettingsConfig;
  updateWhatsAppSettings: (patch: Partial<WhatsAppSettingsConfig>) => void;

  companySettings: CompanySettingsConfig;
  updateCompanySettings: (patch: Partial<CompanySettingsConfig>) => void;

  notifications: CRMNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  toasts: ToastMessage[];
  pushToast: (title: string, description?: string, variant?: ToastMessage['variant']) => void;
  dismissToast: (id: string) => void;
}

const CRMContext = createContext<CRMContextValue | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [currentUser, setCurrentUser] = useState<TeamMember>(INITIAL_TEAM_MEMBERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [followUps, setFollowUps] = useState<FollowUp[]>(INITIAL_FOLLOW_UPS);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>(INITIAL_KNOWLEDGE_BASE);
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGapFinding[]>(INITIAL_KNOWLEDGE_GAPS);
  const [strategicFindings] = useState<StrategicFinding[]>(INITIAL_STRATEGIC_FINDINGS);
  const [aiSettings, setAISettings] = useState<AISettingsConfig>(INITIAL_AI_SETTINGS);
  const [whatsappSettings, setWhatsAppSettings] = useState<WhatsAppSettingsConfig>(INITIAL_WHATSAPP_SETTINGS);
  const [companySettings, setCompanySettings] = useState<CompanySettingsConfig>(INITIAL_COMPANY_SETTINGS);
  const [notifications, setNotifications] = useState<CRMNotification[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (title: string, description?: string, variant: ToastMessage['variant'] = 'default') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loginAsRole = (role: UserRole, email?: string) => {
    const matched =
      teamMembers.find((m) => (email ? m.email.toLowerCase() === email.toLowerCase() : m.role === role)) ||
      teamMembers.find((m) => m.role === role) ||
      teamMembers[0];
    setCurrentUser(matched);
    setIsAuthenticated(true);
    pushToast(`Signed in as ${matched.name}`, `Active Role: ${matched.role}`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    pushToast('Signed out', 'Your session has been closed.');
  };

  const switchRole = (role: UserRole) => {
    const matched = teamMembers.find((m) => m.role === role) || teamMembers[0];
    setCurrentUser(matched);
    pushToast(`Switched Active Role to ${role}`, `Now viewing CRM as ${matched.name} (${matched.role})`);
  };

  // Team CRUD
  const addTeamMember = (
    member: Omit<TeamMember, 'id' | 'assignedLeadsCount' | 'activeChatsCount' | 'lastLoginAt'>
  ) => {
    const newMember: TeamMember = {
      ...member,
      id: `usr-${Date.now()}`,
      assignedLeadsCount: 0,
      activeChatsCount: 0,
      lastLoginAt: 'Never'
    };
    setTeamMembers((prev) => [...prev, newMember]);
    pushToast('Team Member Added', `${member.name} (${member.role}) invited.`, 'success');
  };

  const updateTeamMember = (id: string, patch: Partial<TeamMember>) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...patch }));
    }
    pushToast('User Profile Updated', 'Changes saved.', 'success');
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    pushToast('Team Member Removed', 'User account removed.', 'warning');
  };

  // Contacts CRUD
  const addContact = (
    contact: Omit<Contact, 'id' | 'createdAt' | 'lastInteractionAt' | 'totalConversations' | 'totalMessages' | 'notes'>
  ): Contact => {
    const created: Contact = {
      ...contact,
      id: `cnt-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      lastInteractionAt: 'Just now',
      totalConversations: 1,
      totalMessages: 0,
      notes: []
    };
    setContacts((prev) => [created, ...prev]);
    pushToast('Contact Created', `${created.name} added to CRM directory.`, 'success');
    return created;
  };

  const updateContact = (id: string, patch: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    pushToast('Contact Updated', 'Customer details saved.', 'success');
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    pushToast('Contact Deleted', 'Contact removed from directory.', 'warning');
  };

  const addContactNote = (contactId: string, content: string) => {
    if (!content.trim()) return;
    const note = {
      id: `cn-${Date.now()}`,
      content: content.trim(),
      authorName: currentUser.name,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, notes: [note, ...c.notes] } : c))
    );
    pushToast('Note Added', 'Saved to contact timeline.', 'success');
  };

  // Leads CRUD
  const addLead = (
    lead: Omit<
      Lead,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'lastInteractionAt'
      | 'notes'
      | 'scoreBreakdown'
      | 'estimatedValueInr'
      | 'buyingSignals'
      | 'detectedObjections'
      | 'recommendedNextAction'
      | 'customerSentiment'
    > &
      Partial<
        Pick<
          Lead,
          | 'scoreBreakdown'
          | 'estimatedValueInr'
          | 'buyingSignals'
          | 'detectedObjections'
          | 'recommendedNextAction'
          | 'customerSentiment'
        >
      >
  ) => {
    const numericVal = parseInt(String(lead.budget).replace(/[^0-9]/g, ''), 10) || 75000;
    const newLead: Lead = {
      ...lead,
      id: `ld-${Date.now()}`,
      scoreBreakdown: lead.scoreBreakdown || {
        budgetReadiness: Math.min(25, Math.round(lead.leadScore * 0.25)),
        needSpecificity: Math.min(25, Math.round(lead.leadScore * 0.25)),
        timelineUrgency: Math.min(20, Math.round(lead.leadScore * 0.2)),
        decisionAuthority: Math.min(15, Math.round(lead.leadScore * 0.15)),
        engagementDepth: Math.min(15, Math.round(lead.leadScore * 0.15))
      },
      estimatedValueInr: lead.estimatedValueInr ?? numericVal,
      buyingSignals: lead.buyingSignals || ['Inbound inquiry logged with active service requirement'],
      detectedObjections: lead.detectedObjections || [],
      recommendedNextAction:
        lead.recommendedNextAction || 'Share service deck and schedule 15-minute discovery call.',
      customerSentiment: lead.customerSentiment || 'Positive & High Intent',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      lastInteractionAt: 'Just now',
      notes: []
    };
    setLeads((prev) => [newLead, ...prev]);
    pushToast('Lead Created', `Qualified as ${newLead.leadType} (Score: ${newLead.leadScore}).`, 'success');
  };

  const updateLead = (id: string, patch: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
          : l
      )
    );
    pushToast('Lead Updated', 'Pipeline state updated.', 'success');
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    pushToast('Lead Deleted', 'Lead removed from pipeline.', 'warning');
  };

  const addLeadNote = (leadId: string, content: string) => {
    if (!content.trim()) return;
    const note = {
      id: `ln-${Date.now()}`,
      content: content.trim(),
      authorName: currentUser.name,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: [note, ...l.notes] } : l))
    );
    pushToast('Lead Note Added', 'Note saved to lead record.', 'success');
  };

  // Conversations & WhatsApp Inbox Actions
  const markConversationRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const takeOverConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              aiEnabled: false,
              needsHumanAttention: false,
              status: 'HUMAN_HANDOFF'
            }
          : c
      )
    );
    const sysMsg: Message = {
      id: `msg-sys-${Date.now()}`,
      conversationId,
      whatsappMessageId: `sys.${Date.now()}`,
      senderType: 'SYSTEM',
      senderName: 'System',
      content: `${currentUser.name} (${currentUser.role}) took over the conversation. AI auto-replies are paused.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'READ'
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), sysMsg]
    }));
    pushToast('Conversation Taken Over', 'AI replies paused. You are now chatting directly with the customer.', 'warning');
  };

  const returnConversationToAI = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              aiEnabled: true,
              needsHumanAttention: false,
              handoffReason: undefined,
              status: 'OPEN'
            }
          : c
      )
    );
    const sysMsg: Message = {
      id: `msg-sys-${Date.now()}`,
      conversationId,
      whatsappMessageId: `sys.${Date.now()}`,
      senderType: 'SYSTEM',
      senderName: 'System',
      content: `${currentUser.name} returned the conversation to PulseFlow AI Assistant. Automated AI replies are active.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'READ'
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), sysMsg]
    }));
    pushToast('Returned to AI Assistant', 'AI auto-reply engine re-enabled for this thread.', 'success');
  };

  const sendAgentMessage = (conversationId: string, content: string) => {
    if (!content.trim()) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      whatsappMessageId: `wamid.agent.${Date.now()}`,
      senderType: 'HUMAN_AGENT',
      senderName: currentUser.name,
      content: content.trim(),
      timestamp: nowStr,
      deliveryStatus: 'DELIVERED'
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: content.trim(),
              lastMessageTime: nowStr,
              unreadCount: 0,
              needsHumanAttention: false
            }
          : c
      )
    );
  };

  const simulateCustomerIncomingMessage = (
    conversationId: string,
    content: string,
    languageHint?: 'English' | 'Manglish' | 'Malayalam'
  ) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv || !content.trim()) return;
    const contact = contacts.find((cnt) => cnt.id === conv.contactId);
    const lead = leads.find((ld) => ld.id === conv.leadId);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const customerMsg: Message = {
      id: `msg-cust-${Date.now()}`,
      conversationId,
      whatsappMessageId: `wamid.inbound.${Date.now()}`,
      senderType: 'CUSTOMER',
      senderName: contact?.name || 'Customer',
      content: content.trim(),
      timestamp: nowStr,
      deliveryStatus: 'READ'
    };

    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), customerMsg]
    }));

    const lower = content.toLowerCase();
    const asksForHuman =
      lower.includes('human') ||
      lower.includes('manager') ||
      lower.includes('agent') ||
      lower.includes('complaint') ||
      lower.includes('refund');

    if (!conv.aiEnabled || !aiSettings.aiEnabled || !aiSettings.autoReplyEnabled) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: content.trim(),
                lastMessageTime: nowStr,
                unreadCount: c.unreadCount + 1
              }
            : c
        )
      );
      pushToast('Incoming WhatsApp Message', `${contact?.name}: "${content.slice(0, 48)}..."`);
      return;
    }

    const isManglish =
      languageHint === 'Manglish' ||
      lower.includes('aanu') ||
      lower.includes('undakkanam') ||
      lower.includes('ethra') ||
      lower.includes('pattuo') ||
      lower.includes('cheyyan');
    const isMalayalam = languageHint === 'Malayalam' || /[\u0D00-\u0D7F]/.test(content);

    let aiStructured: AIStructuredMetadata;

    if (asksForHuman) {
      aiStructured = {
        reply: isManglish
          ? `Theerchayayum ${contact?.name || ''}! Nammude senior manager-ne njan ippo thanne ee chat-ilekku connect cheyyunnu. Avar udane reply tharum.`
          : `I understand, ${contact?.name || 'there'}. I have immediately escalated your conversation to our senior account manager so they can assist you personally. They will reply right here shortly.`,
        intent: 'human_request',
        service: lead?.interestedService || 'general_consultation',
        leadType: lead?.leadType || 'HOT',
        leadScore: Math.max(lead?.leadScore || 75, 82),
        budget: lead?.budget || 'To be discussed with manager',
        timeline: 'Immediate escalation',
        requirements: [...(lead?.requirements || []), 'Requested human manager assistance'],
        summary: `Customer requested direct human/manager intervention: "${content.trim()}"`,
        needsHuman: true,
        confidence: 0.95
      };
    } else if (isManglish) {
      aiStructured = {
        reply:
          'Sure! Website & E-Commerce development nammude core service aanu. Basic website ₹35,000 muthalum, Full E-Commerce with payment gateway ₹75,000–₹1,00,000 range-ilum cheythu tharam. Ningalude expected timeline and core features onnu parayamo?',
        intent: 'pricing_enquiry',
        service: 'web_development',
        leadType: 'HOT',
        leadScore: 91,
        budget: lower.includes('100000') || lower.includes('1 lakh') ? '₹1,00,000' : lead?.budget || '₹75,000 - ₹1,00,000',
        timeline: lower.includes('next month') ? 'Next month' : lead?.timeline || 'Within 1 month',
        requirements: Array.from(new Set([...(lead?.requirements || []), 'Custom Website / E-Commerce'])),
        summary: 'Customer inquired in Manglish about website pricing and development timeline; high qualification score.',
        needsHuman: false,
        confidence: 0.94
      };
    } else if (isMalayalam) {
      aiStructured = {
        reply:
          'തീർച്ചയായും! ഞങ്ങളുടെ വെബ്സൈറ്റ് വികസനവും ഡിജിറ്റൽ മാർക്കറ്റിംഗ് പാക്കേജുകളും നിങ്ങളുടെ ബിസിനസ് ആവശ്യങ്ങൾക്കനുസരിച്ച് കസ്റ്റമൈസ് ചെയ്യാവുന്നതാണ്. കൂടുതൽ വിവരങ്ങൾക്കായി ഇന്ന് ഒരു ചെറിയ കോൾ ഷെഡ്യൂൾ ചെയ്യട്ടെ?',
        intent: 'service_enquiry',
        service: 'digital_marketing',
        leadType: 'WARM',
        leadScore: 68,
        budget: lead?.budget || '₹20,000 / month',
        timeline: lead?.timeline || 'This month',
        requirements: Array.from(new Set([...(lead?.requirements || []), 'Malayalam Consultation'])),
        summary: 'Customer inquired in Malayalam about customized packages and consultation.',
        needsHuman: false,
        confidence: 0.92
      };
    } else {
      aiStructured = {
        reply: `Thank you for your message, ${
          contact?.name?.split(' ')[0] || 'there'
        }! Based on our company pricing knowledge base, we can deliver your project with a 40/40/20 milestone structure and 90-day warranty. Would you like us to share a formal quotation PDF for your budget and timeline?`,
        intent: 'request_for_quotation',
        service: lead?.interestedService || 'web_development',
        leadType: 'HOT',
        leadScore: Math.min(98, (lead?.leadScore || 70) + 8),
        budget: lead?.budget || '₹1,00,000+',
        timeline: lead?.timeline || 'Next month',
        requirements: Array.from(new Set([...(lead?.requirements || []), 'Formal Quotation Requested'])),
        summary: `Customer followed up with: "${content.trim()}". High buying intent confirmed by AI.`,
        needsHuman: false,
        confidence: 0.94
      };
    }

    const aiMsg: Message = {
      id: `msg-ai-${Date.now() + 1}`,
      conversationId,
      whatsappMessageId: `wamid.ai.${Date.now() + 1}`,
      senderType: 'AI',
      senderName: 'PulseFlow AI Assistant',
      content: aiStructured.reply,
      timestamp: nowStr,
      deliveryStatus: 'DELIVERED',
      aiMetadata: aiStructured
    };

    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), aiMsg]
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: aiStructured.reply,
              lastMessageTime: nowStr,
              aiEnabled: !aiStructured.needsHuman,
              needsHumanAttention: aiStructured.needsHuman,
              status: aiStructured.needsHuman ? 'HUMAN_HANDOFF' : 'OPEN',
              keyFinding: aiStructured.summary,
              handoffReason: aiStructured.needsHuman
                ? 'Customer requested human/manager intervention'
                : undefined
            }
          : c
      )
    );

    if (lead) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? {
                ...l,
                leadScore: aiStructured.leadScore,
                leadType: aiStructured.leadType,
                budget: aiStructured.budget,
                timeline: aiStructured.timeline,
                requirements: aiStructured.requirements,
                buyingSignals: Array.from(
                  new Set([
                    ...l.buyingSignals,
                    `Latest AI Intent: ${aiStructured.intent} (${Math.round(aiStructured.confidence * 100)}% confidence)`
                  ])
                ),
                aiSummary: aiStructured.summary,
                lastInteractionAt: 'Just now'
              }
            : l
        )
      );
    }

    if (aiStructured.needsHuman) {
      const newNotif: CRMNotification = {
        id: `notif-${Date.now()}`,
        type: 'HUMAN_ATTENTION',
        title: 'Human Handoff Triggered by AI',
        message: `${contact?.name} requires human assistance. Auto-reply paused.`,
        createdAt: 'Just now',
        isRead: false,
        linkTo: `/inbox?convId=${conversationId}`
      };
      setNotifications((prev) => [newNotif, ...prev]);
      pushToast('Human Handoff Triggered!', `${contact?.name} escalated to Human Agent.`, 'danger');
    } else {
      pushToast(
        'AI Auto-Replied & Updated Findings',
        `Intent: ${aiStructured.intent} · Score: ${aiStructured.leadScore}/100 (${aiStructured.leadType})`,
        'success'
      );
    }
  };

  // Follow-ups CRUD
  const addFollowUp = (fu: Omit<FollowUp, 'id'>) => {
    const created: FollowUp = { ...fu, id: `fu-${Date.now()}` };
    setFollowUps((prev) => [created, ...prev]);
    pushToast('Follow-up Scheduled', `Scheduled for ${fu.date} at ${fu.time}.`, 'success');
  };

  const updateFollowUpStatus = (id: string, status: FollowUpStatus) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    pushToast('Follow-up Updated', `Status marked as ${status}.`, 'success');
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
    pushToast('Follow-up Removed', 'Task deleted.', 'warning');
  };

  // Knowledge Base CRUD
  const addKnowledgeArticle = (article: Omit<KnowledgeArticle, 'id' | 'updatedAt'>) => {
    const created: KnowledgeArticle = {
      ...article,
      id: `kb-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      usageCount: 1
    };
    setKnowledgeBase((prev) => [created, ...prev]);
    pushToast('Knowledge Entry Added', `"${created.title}" is now live for AI context.`, 'success');
  };

  const updateKnowledgeArticle = (id: string, patch: Partial<KnowledgeArticle>) => {
    setKnowledgeBase((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : k
      )
    );
    pushToast('Knowledge Base Updated', 'AI source-of-truth updated.', 'success');
  };

  const deleteKnowledgeArticle = (id: string) => {
    setKnowledgeBase((prev) => prev.filter((k) => k.id !== id));
    pushToast('Knowledge Entry Deleted', 'Removed from AI context.', 'warning');
  };

  const resolveKnowledgeGapToArticle = (gapId: string) => {
    const gap = knowledgeGaps.find((g) => g.id === gapId);
    if (!gap || gap.resolved) return;
    const created: KnowledgeArticle = {
      id: `kb-${Date.now()}`,
      category: gap.suggestedCategory,
      title: gap.suggestedTitle,
      content: gap.suggestedContent,
      keywords: gap.suggestedTitle.toLowerCase().split(/\s+/).slice(0, 5),
      isActive: true,
      updatedAt: new Date().toISOString().slice(0, 10),
      usageCount: gap.occurrences
    };
    setKnowledgeBase((prev) => [created, ...prev]);
    setKnowledgeGaps((prev) => prev.map((g) => (g.id === gapId ? { ...g, resolved: true } : g)));
    pushToast(
      'AI Knowledge Gap Resolved!',
      `"${gap.suggestedTitle}" published to Knowledge Base. AI will now answer this automatically.`,
      'success'
    );
  };

  // Settings
  const updateAISettings = (patch: Partial<AISettingsConfig>) => {
    setAISettings((prev) => ({ ...prev, ...patch }));
    pushToast('AI Settings Saved', 'AI reply engine configuration updated.', 'success');
  };

  const updateWhatsAppSettings = (patch: Partial<WhatsAppSettingsConfig>) => {
    setWhatsAppSettings((prev) => ({ ...prev, ...patch }));
    pushToast('WhatsApp Settings Saved', 'Cloud API & Webhook settings updated.', 'success');
  };

  const updateCompanySettings = (patch: Partial<CompanySettingsConfig>) => {
    setCompanySettings((prev) => ({ ...prev, ...patch }));
    pushToast('Company Settings Saved', 'Organization profile updated.', 'success');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    pushToast('Notifications Cleared', 'All notifications marked as read.');
  };

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loginAsRole,
        logout,
        switchRole,
        teamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        addContactNote,
        leads,
        addLead,
        updateLead,
        deleteLead,
        addLeadNote,
        conversations,
        messagesByConv,
        sendAgentMessage,
        simulateCustomerIncomingMessage,
        takeOverConversation,
        returnConversationToAI,
        markConversationRead,
        followUps,
        addFollowUp,
        updateFollowUpStatus,
        deleteFollowUp,
        knowledgeBase,
        addKnowledgeArticle,
        updateKnowledgeArticle,
        deleteKnowledgeArticle,
        knowledgeGaps,
        resolveKnowledgeGapToArticle,
        strategicFindings,
        aiSettings,
        updateAISettings,
        whatsappSettings,
        updateWhatsAppSettings,
        companySettings,
        updateCompanySettings,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        toasts,
        pushToast,
        dismissToast
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = (): CRMContextValue => {
  const ctx = useContext(CRMContext);
  if (!ctx) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return ctx;
};

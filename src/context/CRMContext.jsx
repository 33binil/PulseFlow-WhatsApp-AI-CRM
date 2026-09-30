import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  INITIAL_TEAM_MEMBERS,
  INITIAL_AI_SETTINGS,
  INITIAL_WHATSAPP_SETTINGS,
  INITIAL_COMPANY_SETTINGS
} from '../data/mockCrmData';

const CRMContext = createContext(undefined);

export const CRMProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM_MEMBERS);
  const [currentUser, setCurrentUser] = useState(INITIAL_TEAM_MEMBERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messagesByConv, setMessagesByConv] = useState({});
  const [followUps, setFollowUps] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);
  const [strategicFindings, setStrategicFindings] = useState([]);
  const [aiSettings, setAISettings] = useState(INITIAL_AI_SETTINGS);
  const [whatsappSettings, setWhatsAppSettings] = useState(INITIAL_WHATSAPP_SETTINGS);
  const [companySettings, setCompanySettings] = useState(INITIAL_COMPANY_SETTINGS);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((title, description, variant = 'default') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchCRMData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/bootstrap', {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();

      if (Array.isArray(data.teamMembers) && data.teamMembers.length > 0) {
        setTeamMembers(data.teamMembers);
        setCurrentUser((prev) => {
          const found = data.teamMembers.find((m) => m.id === prev?.id);
          return found || data.teamMembers[0];
        });
      }
      if (Array.isArray(data.contacts)) setContacts(data.contacts);
      if (Array.isArray(data.leads)) setLeads(data.leads);
      if (Array.isArray(data.conversations)) setConversations(data.conversations);
      if (data.messagesByConv && typeof data.messagesByConv === 'object') {
        setMessagesByConv(data.messagesByConv);
      }
      if (Array.isArray(data.followUps)) setFollowUps(data.followUps);
      if (Array.isArray(data.knowledgeBase)) setKnowledgeBase(data.knowledgeBase);
      if (Array.isArray(data.knowledgeGaps)) setKnowledgeGaps(data.knowledgeGaps);
      if (Array.isArray(data.strategicFindings)) setStrategicFindings(data.strategicFindings);
      if (data.aiSettings) setAISettings(data.aiSettings);
      if (data.whatsappSettings) setWhatsAppSettings(data.whatsappSettings);
      if (data.companySettings) setCompanySettings(data.companySettings);
      if (Array.isArray(data.notifications)) setNotifications(data.notifications);
    } catch (_err) {
      // Ignore transient network/HTML responses during server restarts
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCRMData(false);
    // Poll every 6 seconds so incoming real Meta WhatsApp webhook messages appear live
    const interval = setInterval(() => {
      fetchCRMData(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchCRMData]);

  const loginAsRole = (role, email) => {
    const matched =
      teamMembers.find((m) =>
        email ? m.email.toLowerCase() === email.toLowerCase() : m.role === role
      ) ||
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

  const switchRole = (role) => {
    const matched = teamMembers.find((m) => m.role === role) || teamMembers[0];
    setCurrentUser({ ...matched, role });
    pushToast(
      `Switched Active Role to ${role}`,
      `Now viewing CRM as ${matched.name} (${role})`
    );
  };

  // Team CRUD (Persisted to MongoDB)
  const addTeamMember = (member) => {
    const newMember = {
      ...member,
      id: `usr-${Date.now()}`,
      assignedLeadsCount: 0,
      activeChatsCount: 0,
      lastLoginAt: 'Never',
      conversionRate: 0,
      avgResponseTime: '—'
    };
    setTeamMembers((prev) => [...prev, newMember]);
    fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember)
    }).catch((err) => console.error('Failed to save team member:', err));
    pushToast('Team Member Added', `${member.name} (${member.role}) saved to database.`, 'success');
    return newMember;
  };

  const updateTeamMember = (id, patch) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...patch }));
    }
    fetch(`/api/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch((err) => console.error('Failed to update team member:', err));
    pushToast('User Profile Updated', 'Changes saved to database.', 'success');
  };

  const deleteTeamMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    fetch(`/api/team/${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Failed to delete team member:', err)
    );
    pushToast('Team Member Removed', 'User account removed from database.', 'warning');
  };

  // Contacts CRUD (Persisted to MongoDB)
  const addContact = (contact) => {
    const created = {
      ...contact,
      id: `cnt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      lastInteractionAt: 'Just now',
      totalConversations: 1,
      totalMessages: 0,
      notes: []
    };
    setContacts((prev) => [created, ...prev]);

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...created,
        assignedAgentId: currentUser?.id || 'admin-1'
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.conversation) {
          setConversations((prev) => {
            if (prev.some((c) => c.id === data.conversation.id || c.contactId === created.id)) {
              return prev;
            }
            return [data.conversation, ...prev];
          });
          setMessagesByConv((prev) => ({
            ...prev,
            [data.conversation.id]: prev[data.conversation.id] || []
          }));
        }
      })
      .catch((err) => console.error('Failed to save contact:', err));

    pushToast('Contact Created', `${created.name} saved to database.`, 'success');
    return created;
  };

  const updateContact = (id, patch) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch((err) => console.error('Failed to update contact:', err));
    pushToast('Contact Updated', 'Customer details saved to database.', 'success');
  };

  const deleteContact = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setLeads((prev) => prev.filter((l) => l.contactId !== id));
    setConversations((prev) => prev.filter((c) => c.contactId !== id));
    setFollowUps((prev) => prev.filter((f) => f.contactId !== id));
    fetch(`/api/contacts/${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Failed to delete contact:', err)
    );
    pushToast('Contact Deleted', 'Contact removed from database.', 'warning');
  };

  const addContactNote = (contactId, content) => {
    if (!content.trim()) return;
    const note = {
      id: `cn-${Date.now()}`,
      content: content.trim(),
      authorName: currentUser?.name || 'Admin',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, notes: [note, ...(c.notes || [])] } : c))
    );
    fetch(`/api/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), authorName: currentUser?.name || 'Admin' })
    }).catch((err) => console.error('Failed to add contact note:', err));
    pushToast('Note Added', 'Saved to contact timeline in database.', 'success');
  };

  // Leads CRUD (Persisted to MongoDB)
  const addLead = (lead) => {
    const numericVal = parseInt(String(lead.budget).replace(/[^0-9]/g, ''), 10) || 0;
    const newLead = {
      ...lead,
      id: `ld-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      scoreBreakdown: lead.scoreBreakdown || {
        budgetReadiness: Math.min(25, Math.round((lead.leadScore || 75) * 0.25)),
        needSpecificity: Math.min(25, Math.round((lead.leadScore || 75) * 0.25)),
        timelineUrgency: Math.min(20, Math.round((lead.leadScore || 75) * 0.2)),
        decisionAuthority: Math.min(15, Math.round((lead.leadScore || 75) * 0.15)),
        engagementDepth: Math.min(15, Math.round((lead.leadScore || 75) * 0.15))
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

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.lead) {
          setLeads((prev) => prev.map((l) => (l.id === newLead.id ? data.lead : l)));
        }
        if (data?.conversation) {
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === data.conversation.id);
            if (exists) {
              return prev.map((c) => (c.id === data.conversation.id ? data.conversation : c));
            }
            return [data.conversation, ...prev];
          });
          setMessagesByConv((prev) => ({
            ...prev,
            [data.conversation.id]: prev[data.conversation.id] || []
          }));
        }
      })
      .catch((err) => console.error('Failed to save lead:', err));

    pushToast(
      'Lead Created',
      `Qualified as ${newLead.leadType} (Score: ${newLead.leadScore}) and saved to database.`,
      'success'
    );
    return newLead;
  };

  const updateLead = (id, patch) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
          : l
      )
    );
    fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch((err) => console.error('Failed to update lead:', err));
    pushToast('Lead Updated', 'Pipeline state updated in database.', 'success');
  };

  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setFollowUps((prev) => prev.filter((f) => f.leadId !== id));
    fetch(`/api/leads/${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Failed to delete lead:', err)
    );
    pushToast('Lead Deleted', 'Lead removed from database.', 'warning');
  };

  const addLeadNote = (leadId, content) => {
    if (!content.trim()) return;
    const note = {
      id: `ln-${Date.now()}`,
      content: content.trim(),
      authorName: currentUser?.name || 'Admin',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: [note, ...(l.notes || [])] } : l))
    );
    fetch(`/api/leads/${leadId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), authorName: currentUser?.name || 'Admin' })
    }).catch((err) => console.error('Failed to add lead note:', err));
    pushToast('Lead Note Added', 'Note saved to lead record in database.', 'success');
  };

  // Conversations & WhatsApp Inbox Actions (Persisted to MongoDB)
  const markConversationRead = (conversationId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    fetch(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch: { unreadCount: 0 } })
    }).catch(() => {});
  };

  const takeOverConversation = (conversationId) => {
    const patch = {
      aiEnabled: false,
      needsHumanAttention: false,
      status: 'HUMAN_HANDOFF'
    };
    const sysText = `${currentUser?.name || 'Agent'} (${
      currentUser?.role || 'ADMIN'
    }) took over the conversation. AI auto-replies are paused.`;

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, ...patch } : c))
    );

    fetch(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch, systemMessage: sysText })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.systemMessage) {
          setMessagesByConv((prev) => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), data.systemMessage]
          }));
        }
      })
      .catch((err) => console.error('Failed to take over conversation:', err));

    pushToast(
      'Conversation Taken Over',
      'AI replies paused. You are now chatting directly with the customer.',
      'warning'
    );
  };

  const returnConversationToAI = (conversationId) => {
    const patch = {
      aiEnabled: true,
      needsHumanAttention: false,
      handoffReason: '',
      status: 'OPEN'
    };
    const sysText = `${
      currentUser?.name || 'Agent'
    } returned the conversation to PulseFlow AI Assistant. Automated AI replies are active.`;

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, ...patch } : c))
    );

    fetch(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch, systemMessage: sysText })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.systemMessage) {
          setMessagesByConv((prev) => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), data.systemMessage]
          }));
        }
      })
      .catch((err) => console.error('Failed to return conversation to AI:', err));

    pushToast(
      'Returned to AI Assistant',
      'AI auto-reply engine re-enabled for this thread.',
      'success'
    );
  };

  const sendAgentMessage = (conversationId, content) => {
    if (!content.trim()) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempId = `msg-temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId,
      whatsappMessageId: `wamid.agent.${Date.now()}`,
      senderType: 'HUMAN_AGENT',
      senderName: currentUser?.name || 'Agent',
      content: content.trim(),
      timestamp: nowStr,
      deliveryStatus: 'SENT'
    };

    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimisticMsg]
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

    fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content.trim(),
        senderName: currentUser?.name || 'Agent'
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.message) {
          setMessagesByConv((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map((m) =>
              m.id === tempId ? data.message : m
            )
          }));
        }
      })
      .catch((err) => console.error('Failed to send message:', err));
  };

  const simulateCustomerIncomingMessage = async (conversationId, content, languageHint) => {
    if (!conversationId || !content.trim()) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}/incoming`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), languageHint })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessagesByConv((prev) => {
        const list = [...(prev[conversationId] || [])];
        if (data.customerMsg) list.push(data.customerMsg);
        if (data.aiMsg) list.push(data.aiMsg);
        return { ...prev, [conversationId]: list };
      });

      if (data.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? data.conversation : c))
        );
      }

      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === data.lead.id ? data.lead : l)));
      }

      if (data.aiStructured?.needsHuman) {
        pushToast(
          'Human Handoff Triggered!',
          'Customer escalated to Human Agent.',
          'danger'
        );
      } else if (data.aiStructured) {
        pushToast(
          'AI Auto-Replied & Saved to DB',
          `Intent: ${data.aiStructured.intent} · Score: ${data.aiStructured.leadScore}/100 (${data.aiStructured.leadType})`,
          'success'
        );
      } else {
        pushToast('Incoming WhatsApp Message Saved', content.slice(0, 48));
      }
    } catch (err) {
      console.error('Failed to process incoming message:', err);
      pushToast('Error', 'Could not process incoming message.', 'danger');
    }
  };

  // Follow-ups CRUD (Persisted to MongoDB)
  const addFollowUp = (fu) => {
    const created = { ...fu, id: `fu-${Date.now()}` };
    setFollowUps((prev) => [created, ...prev]);
    fetch('/api/follow-ups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch((err) => console.error('Failed to save follow-up:', err));
    pushToast('Follow-up Scheduled', `Saved for ${fu.date} at ${fu.time}.`, 'success');
  };

  const updateFollowUpStatus = (id, status) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch((err) => console.error('Failed to update follow-up:', err));
    pushToast('Follow-up Updated', `Status marked as ${status}.`, 'success');
  };

  const deleteFollowUp = (id) => {
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
    fetch(`/api/follow-ups/${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Failed to delete follow-up:', err)
    );
    pushToast('Follow-up Removed', 'Task deleted from database.', 'warning');
  };

  // Knowledge Base CRUD (Persisted to MongoDB)
  const addKnowledgeArticle = (article) => {
    const created = {
      ...article,
      id: `kb-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      usageCount: 1
    };
    setKnowledgeBase((prev) => [created, ...prev]);
    fetch('/api/knowledge-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch((err) => console.error('Failed to add knowledge base entry:', err));
    pushToast('Knowledge Entry Added', `"${created.title}" is now live in database for AI context.`, 'success');
  };

  const updateKnowledgeArticle = (id, patch) => {
    setKnowledgeBase((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : k
      )
    );
    fetch(`/api/knowledge-base/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch((err) => console.error('Failed to update knowledge base entry:', err));
    pushToast('Knowledge Base Updated', 'AI source-of-truth updated in database.', 'success');
  };

  const deleteKnowledgeArticle = (id) => {
    setKnowledgeBase((prev) => prev.filter((k) => k.id !== id));
    fetch(`/api/knowledge-base/${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Failed to delete knowledge base entry:', err)
    );
    pushToast('Knowledge Entry Deleted', 'Removed from database.', 'warning');
  };

  const resolveKnowledgeGapToArticle = (gapId) => {
    const gap = knowledgeGaps.find((g) => g.id === gapId);
    if (!gap || gap.resolved) return;

    fetch(`/api/knowledge-gaps/${gapId}/resolve`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.article) {
          setKnowledgeBase((prev) => [data.article, ...prev]);
        }
        setKnowledgeGaps((prev) =>
          prev.map((g) => (g.id === gapId ? { ...g, resolved: true } : g))
        );
      })
      .catch((err) => console.error('Failed to resolve knowledge gap:', err));

    pushToast(
      'AI Knowledge Gap Resolved!',
      `"${gap.suggestedTitle}" published to Knowledge Base.`,
      'success'
    );
  };

  // Settings (Persisted to MongoDB)
  const updateAISettings = (patch) => {
    setAISettings((prev) => ({ ...prev, ...patch }));
    fetch('/api/settings/aiSettings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch((err) => console.error('Failed to save AI settings:', err));
    pushToast('AI Settings Saved', 'AI reply engine configuration updated in database.', 'success');
  };

  const updateWhatsAppSettings = (patch) => {
    setWhatsAppSettings((prev) => ({ ...prev, ...patch }));
    fetch('/api/settings/whatsappSettings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch((err) => console.error('Failed to save WhatsApp settings:', err));
    pushToast('WhatsApp Settings Saved', 'Cloud API & Webhook settings saved in database.', 'success');
  };

  const updateCompanySettings = (patch) => {
    setCompanySettings((prev) => ({ ...prev, ...patch }));
    fetch('/api/settings/companySettings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch((err) => console.error('Failed to save company settings:', err));
    pushToast('Company Settings Saved', 'Organization profile saved in database.', 'success');
  };

  // Notifications (Persisted to MongoDB)
  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
    pushToast('Notifications Cleared', 'All notifications marked as read.');
  };

  return (
    <CRMContext.Provider
      value={{
        isLoading,
        refreshCRMData: fetchCRMData,
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

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return ctx;
};

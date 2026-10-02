import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Send,
  Paperclip,
  Bot,
  UserCheck,
  AlertTriangle,
  CheckCheck,
  FileText,
  Sparkles,
  CalendarPlus,
  ExternalLink,
  X,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
  MessageSquare
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const WhatsAppInboxPage = () => {
  const {
    conversations,
    contacts,
    leads,
    teamMembers,
    messagesByConv,
    currentUser,
    addContact,
    addLead,
    sendAgentMessage,
    simulateCustomerIncomingMessage,
    takeOverConversation,
    returnConversationToAI,
    markConversationRead,
    updateLead,
    addLeadNote,
    addFollowUp,
    pushToast
  } = useCRM();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvId = searchParams.get('convId') || conversations[0]?.id || '';

  const [selectedConvId, setSelectedConvId] = useState(initialConvId);
  const [inboxFilter, setInboxFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [inspectedMsgId, setInspectedMsgId] = useState(null);
  const [showSimBar, setShowSimBar] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [customSimText, setCustomSimText] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-09-29');
  const [followUpTime, setFollowUpTime] = useState('11:30');
  const [followUpNote, setFollowUpNote] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('+91 ');
  const [newChatService, setNewChatService] = useState('Web Development');
  const [newChatBudget, setNewChatBudget] = useState('₹50,000');

  useEffect(() => {
    const paramId = searchParams.get('convId');
    if (paramId && conversations.some((c) => c.id === paramId)) {
      setSelectedConvId(paramId);
      markConversationRead(paramId);
    } else if (!selectedConvId && conversations[0]?.id) {
      setSelectedConvId(conversations[0].id);
    }
  }, [searchParams, conversations]);

  const handleCreateNewChat = (e) => {
    e.preventDefault();
    if (!newChatName.trim() || !newChatPhone.trim()) return;
    const createdContact = addContact({
      name: newChatName.trim(),
      phone: newChatPhone.trim(),
      email: '',
      company: 'Direct WhatsApp Inquiry',
      location: '',
      source: 'WhatsApp Inbound',
      tags: ['WhatsApp Lead', newChatService]
    });
    addLead({
      contactId: createdContact.id,
      leadStatus: 'NEW',
      leadType: 'WARM',
      leadScore: 65,
      interestedService: newChatService,
      budget: newChatBudget,
      timeline: 'This month',
      requirements: [newChatService],
      source: 'WhatsApp Inbound',
      assignedAgentId: currentUser?.id || 'admin-1',
      aiSummary: `WhatsApp chat started with ${newChatName.trim()} for ${newChatService}.`,
      purchaseIntent: true
    });
    setNewChatName('');
    setNewChatPhone('+91 ');
    setShowNewChatModal(false);
  };

  const handleSelectConversation = (convId) => {
    setSelectedConvId(convId);
    setSearchParams({ convId });
    markConversationRead(convId);
  };

  const enrichedConversations = useMemo(() => {
    return conversations.map((conv) => {
      const contact = contacts.find((c) => c.id === conv.contactId);
      const lead = leads.find(
        (l) => (conv.leadId && l.id === conv.leadId) || (conv.contactId && l.contactId === conv.contactId)
      );
      return { conv, contact, lead };
    });
  }, [conversations, contacts, leads]);

  const filteredList = useMemo(() => {
    return enrichedConversations.filter(({ conv, contact, lead }) => {
      if (inboxFilter === 'UNREAD' && conv.unreadCount === 0) return false;
      if (inboxFilter === 'HUMAN' && !conv.needsHumanAttention) return false;
      if (inboxFilter === 'HOT' && lead?.leadType !== 'HOT') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = contact?.name.toLowerCase().includes(q);
        const matchPhone = contact?.phone.toLowerCase().includes(q);
        const matchMsg = conv.lastMessage.toLowerCase().includes(q);
        return Boolean(matchName || matchPhone || matchMsg);
      }
      return true;
    });
  }, [enrichedConversations, inboxFilter, searchQuery]);

  const activeItem = useMemo(
    () =>
      enrichedConversations.find((item) => item.conv.id === selectedConvId) ||
      enrichedConversations[0],
    [enrichedConversations, selectedConvId]
  );

  const activeMessages = useMemo(
    () => (activeItem ? messagesByConv[activeItem.conv.id] || [] : []),
    [messagesByConv, activeItem]
  );

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeItem) return;
    sendAgentMessage(activeItem.conv.id, replyText);
    setReplyText('');
  };

  const handleAttachDemoDocument = () => {
    if (!activeItem) return;
    sendAgentMessage(
      activeItem.conv.id,
      'Shared attachment: TechNova_Service_Quotation_2026.pdf (420 KB)'
    );
    pushToast('Quotation Sent', 'PDF quotation sent to customer on WhatsApp.', 'success');
  };

  const handleAddQuickFollowUp = (e) => {
    e.preventDefault();
    if (!activeItem?.contact) return;
    addFollowUp({
      leadId: activeItem.lead?.id || '',
      contactId: activeItem.contact.id,
      assignedUserId: activeItem.lead?.assignedAgentId || currentUser?.id || 'admin-1',
      date: followUpDate,
      time: followUpTime,
      note:
        followUpNote ||
        `Follow up with ${activeItem.contact.name} regarding ${activeItem.lead?.interestedService || 'WhatsApp inquiry'}`,
      status: 'PENDING'
    });
    setFollowUpNote('');
    setShowFollowUpModal(false);
  };

  if (!activeItem) {
    return (
      <div className="p-8 max-w-lg mx-auto my-12 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Cloud API Connected</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Start Your First Real WhatsApp Conversation
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          All dummy data has been removed. Incoming messages sent to your WhatsApp Business number will appear here automatically, or you can add a customer below to start a chat now.
        </p>
        <form onSubmit={handleCreateNewChat} className="space-y-3 text-xs pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="e.g., Akhil Thomas"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
            <input
              type="text"
              required
              value={newChatPhone}
              onChange={(e) => setNewChatPhone(e.target.value)}
              placeholder="+91 98470 00000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interested Service</label>
              <input
                type="text"
                value={newChatService}
                onChange={(e) => setNewChatService(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Budget</label>
              <input
                type="text"
                value={newChatBudget}
                onChange={(e) => setNewChatBudget(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Add Customer & Open WhatsApp Chat
          </button>
        </form>
      </div>
    );
  }

  const { conv, contact, lead } = activeItem;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* LEFT PANE: SIMPLE CUSTOMER LIST */}
      <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 h-64 lg:h-full">
        <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-slate-900">WhatsApp Chats ({filteredList.length})</h1>
              <p className="text-[11px] text-slate-500">Click a customer to read or reply</p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Easy-to-Understand Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-200/70 p-1 rounded-lg">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'HUMAN', label: 'Needs You' },
              { id: 'HOT', label: 'Hot Leads' },
              { id: 'UNREAD', label: 'Unread' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInboxFilter(tab.id)}
                className={`py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  inboxFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredList.map(({ conv: itemConv, contact: itemContact, lead: itemLead }) => {
            const isSelected = itemConv.id === conv.id;
            const initials = (itemContact?.name || 'CU')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={itemConv.id}
                onClick={() => handleSelectConversation(itemConv.id)}
                className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                  }`}
                >
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {itemContact?.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0 tabular-nums">
                      {itemConv.lastMessageTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 truncate mt-1">
                    {itemConv.lastMessage}
                  </p>

                  {/* Simple Unboxed Metadata Line */}
                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <span
                        className={`font-bold ${
                          itemLead?.leadType === 'HOT'
                            ? 'text-emerald-700'
                            : itemLead?.leadType === 'WARM'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {itemLead?.leadType || 'LEAD'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-700">{itemLead?.budget}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-700 font-medium">{itemConv.language}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {itemConv.needsHumanAttention && (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Needs You</span>
                        </span>
                      )}
                      {itemConv.unreadCount > 0 && (
                        <span className="font-mono font-bold text-emerald-700 tabular-nums">
                          {itemConv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER PANE: EASY WHATSAPP CHAT WINDOW */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F6F9] h-full">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{contact?.name}</h2>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                {contact?.phone}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-indigo-700">
                Speaks {conv.language}
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
              <span
                className={`font-semibold ${
                  conv.aiEnabled ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {conv.aiEnabled
                  ? '● AI Assistant is replying automatically'
                  : '● You are replying directly (AI is paused)'}
              </span>
            </div>
          </div>

          {/* Simple Controls: Test Sample Message + Take Over / Let AI Reply */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimBar((prev) => !prev)}
              className="px-3 py-1.5 text-xs font-semibold border border-indigo-200 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Test Sample Customer Message</span>
            </button>

            {conv.aiEnabled ? (
              <button
                onClick={() => takeOverConversation(conv.id)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                title="Pause AI and reply yourself"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Take Over Chat</span>
              </button>
            ) : (
              <button
                onClick={() => returnConversationToAI(conv.id)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                title="Turn automatic AI replies back on"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Let AI Reply Again</span>
              </button>
            )}
          </div>
        </div>

        {/* One-Line Summary of What AI Knows About This Chat */}
        {conv.keyFinding && (
          <div className="bg-emerald-950 text-emerald-100 px-4 py-2 border-b border-emerald-900 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                <strong className="text-white">What AI learned here:</strong> {conv.keyFinding}
              </span>
            </div>
          </div>
        )}

        {/* Clear Alert When Customer Needs Human Help */}
        {conv.needsHumanAttention && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Customer needs you:</strong>{' '}
                {conv.handoffReason || 'Customer asked to speak with a person.'}
              </span>
            </div>
            <button
              onClick={() => takeOverConversation(conv.id)}
              className="px-3 py-1 bg-rose-700 text-white text-xs font-semibold rounded hover:bg-rose-800 transition-colors shrink-0 cursor-pointer"
            >
              Take Over Now
            </button>
          </div>
        )}

        {/* Friendly 1-Click Customer Message Tester */}
        {showSimBar && (
          <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">
                Try sending a sample customer message to see how AI replies and updates the lead score:
              </span>
              <button
                onClick={() => setShowSimBar(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  simulateCustomerIncomingMessage(
                    conv.id,
                    'Website undakkanam. E-commerce with payment gateway rate ethra aanu? Budget ₹100000 undu, next month thudangam.',
                    'Manglish'
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors cursor-pointer"
              >
                1. Test Manglish Budget Inquiry
              </button>
              <button
                type="button"
                onClick={() =>
                  simulateCustomerIncomingMessage(
                    conv.id,
                    'ഞങ്ങൾക്ക് വെബ്സൈറ്റും ഡിജിറ്റൽ മാർക്കറ്റിംഗും ചെയ്യണം. ഇന്ന് സംസാരിക്കാൻ പറ്റുമോ?',
                    'Malayalam'
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors cursor-pointer"
              >
                2. Test Malayalam Inquiry
              </button>
              <button
                type="button"
                onClick={() =>
                  simulateCustomerIncomingMessage(
                    conv.id,
                    'I have a billing complaint and need to speak with a human manager immediately.',
                    'English'
                  )
                }
                className="px-2.5 py-1 text-xs bg-rose-900/80 hover:bg-rose-800 rounded text-rose-100 transition-colors cursor-pointer"
              >
                3. Test "Ask for Human Manager"
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customSimText.trim()) return;
                simulateCustomerIncomingMessage(conv.id, customSimText);
                setCustomSimText('');
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={customSimText}
                onChange={(e) => setCustomSimText(e.target.value)}
                placeholder="Or type any customer message here (English, Manglish, or Malayalam)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded whitespace-nowrap cursor-pointer"
              >
                Send as Customer
              </button>
            </form>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeMessages.map((msg) => {
            if (msg.senderType === 'SYSTEM') {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[11px] text-slate-600 bg-slate-200/80 px-3 py-1 rounded-md font-medium">
                    {msg.content} · {msg.timestamp}
                  </span>
                </div>
              );
            }

            const isCustomer = msg.senderType === 'CUSTOMER';
            const isAI = msg.senderType === 'AI';
            const isInspecting = inspectedMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-xl p-3.5 border shadow-2xs ${
                    isCustomer
                      ? 'bg-white border-slate-200 text-slate-900'
                      : isAI
                      ? 'bg-[#0B1120] border-slate-800 text-white'
                      : 'bg-emerald-800 border-emerald-900 text-white'
                  }`}
                >
                  {/* Clear Sender Name */}
                  <div
                    className={`flex items-center justify-between gap-4 text-[11px] mb-1 ${
                      isCustomer
                        ? 'text-slate-500'
                        : isAI
                        ? 'text-emerald-400'
                        : 'text-emerald-200'
                    }`}
                  >
                    <span className="font-semibold">
                      {isCustomer
                        ? `${msg.senderName} (Customer)`
                        : isAI
                        ? 'AI Assistant (Auto-Reply)'
                        : `${msg.senderName} (You)`}
                    </span>
                    {isAI && msg.aiMetadata && (
                      <button
                        type="button"
                        onClick={() => setInspectedMsgId(isInspecting ? null : msg.id)}
                        className="underline hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{isInspecting ? 'Hide AI details' : 'Why AI said this'}</span>
                      </button>
                    )}
                  </div>

                  {/* Message Body */}
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Attachments if present */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-100 text-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span className="font-medium truncate">{att.name}</span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 shrink-0">
                            {att.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Simple, Knowable Explanation of What AI Detected in This Message */}
                  {isAI && isInspecting && msg.aiMetadata && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-1.5 text-xs text-slate-200">
                      <div className="text-[11px] font-bold text-emerald-300">
                        What AI understood from the customer:
                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg text-[11px]">
                        <div>
                          <span className="text-slate-400">Topic: </span>
                          <span className="font-semibold text-white">{msg.aiMetadata.intent}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Lead Score: </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {msg.aiMetadata.lead_score}/100 ({msg.aiMetadata.lead_type})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Service: </span>
                          <span className="text-white">
                            {msg.aiMetadata.interested_service || 'General'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Budget: </span>
                          <span className="font-mono text-white">
                            {msg.aiMetadata.budget || 'Not shared yet'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamp & Read Status */}
                  <div
                    className={`flex items-center justify-end gap-1.5 text-[10px] font-mono mt-1.5 tabular-nums ${
                      isCustomer ? 'text-slate-400' : 'text-slate-300'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isCustomer && (
                      <>
                        <span aria-hidden="true">·</span>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{msg.deliveryStatus}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1-Click Quick Replies Bar */}
        {conv.suggestedReplies && conv.suggestedReplies.length > 0 && (
          <div className="bg-white border-t border-slate-200 px-3.5 py-2 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Quick Replies (Click any reply to fill the box below):</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {conv.suggestedReplies.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyText(suggestion)}
                  className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-md whitespace-nowrap transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Outbound Message Reply Box */}
        <form
          onSubmit={handleSendReply}
          className="bg-white border-t border-slate-200 p-3 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleAttachDemoDocument}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Send Sample Quotation PDF"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your message to the customer..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Reply</span>
          </button>
        </form>
      </div>

      {/* RIGHT PANE: SIMPLE "WHAT AI KNOWS ABOUT THIS CUSTOMER" */}
      <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white overflow-y-auto p-4 space-y-5 shrink-0">
        {/* 1. Customer Summary */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">What AI Knows</h3>
            {lead ? (
              <Link
                to={`/leads/${lead.id}`}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <span>Full Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            ) : null}
          </div>
          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
            <div className="font-bold text-slate-900">
              {contact?.name || 'Customer'} · {contact?.company || 'WhatsApp Customer'}
            </div>
            <div>
              {contact?.location ? `${contact.location} · ` : ''}Best time: {contact?.bestTimeToContact || '10 AM – 6 PM'}
            </div>
          </div>
        </div>

        {!lead ? (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-3 text-center">
            <div className="text-xs font-semibold text-slate-700">No Lead Profile Linked</div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Create a lead record for {contact?.name || 'this customer'} to track budget, urgency score, and deal stage.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!contact) return;
                addLead({
                  contactId: contact.id,
                  conversationId: conv.id,
                  leadStatus: 'NEW',
                  leadType: 'WARM',
                  leadScore: 55,
                  interestedService: 'General Inquiry',
                  budget: 'Not disclosed',
                  estimatedValueInr: 0,
                  timeline: 'Not specified',
                  requirements: [],
                  buyingSignals: ['Active WhatsApp chat logged'],
                  source: 'WhatsApp Inbound',
                  assignedAgentId: currentUser?.id || 'admin-1',
                  aiSummary: `Chat started with ${contact.name}.`,
                  purchaseIntent: false
                });
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Create Lead for this Customer
            </button>
          </div>
        ) : (
          <>
            {/* 2. Simple 3-Box Summary (What they want, Budget, Timeline) */}
            <div className="space-y-2.5 pb-4 border-b border-slate-200">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">Service They Want</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {lead.interestedService || 'General Inquiry'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">Confirmed Budget</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5 tabular-nums">
                    {lead.budget || 'Not disclosed'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">Start Timeline</div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">{lead.timeline || 'Not specified'}</div>
                </div>
              </div>
            </div>

            {/* 3. Recommended Next Step & Buying Signals */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-400">
                  Suggested Next Step for You:
                </div>
                <p className="text-xs text-slate-100 leading-relaxed">
                  {lead.recommendedNextAction || 'Review customer requirements and send initial response.'}
                </p>
              </div>

              {(lead.buyingSignals && lead.buyingSignals.length > 0) && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Why they look ready to buy:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {lead.buyingSignals.map((sig, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(lead.detectedObjections && lead.detectedObjections.length > 0) && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Questions / Concerns to answer:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {lead.detectedObjections.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. Lead Score & Status Controls */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">AI Lead Score</div>
                  <button
                    type="button"
                    onClick={() => setShowScoreDetails((prev) => !prev)}
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <span>{showScoreDetails ? 'Hide how score is calculated' : 'How is this scored?'}</span>
                    {showScoreDetails ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span
                  className={`text-base font-bold font-mono tabular-nums ${
                    (lead.leadScore ?? 50) >= 81
                      ? 'text-emerald-700'
                      : (lead.leadScore ?? 50) >= 61
                      ? 'text-indigo-700'
                      : 'text-amber-700'
                  }`}
                >
                  {lead.leadScore ?? 50}/100 ({lead.leadType || 'WARM'})
                </span>
              </div>

              {showScoreDetails && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  {[
                    { label: 'Has Budget Ready', val: lead.scoreBreakdown?.budgetReadiness ?? 12, max: 25 },
                    { label: 'Clear Requirement', val: lead.scoreBreakdown?.needSpecificity ?? 12, max: 25 },
                    { label: 'Wants to Start Soon', val: lead.scoreBreakdown?.timelineUrgency ?? 10, max: 20 },
                    { label: 'Decision Maker', val: lead.scoreBreakdown?.decisionAuthority ?? 8, max: 15 },
                    { label: 'Active in Chat', val: lead.scoreBreakdown?.engagementDepth ?? 8, max: 15 }
                  ].map((item) => {
                    const pct = Math.round((item.val / item.max) * 100);
                    return (
                      <div key={item.label} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-mono font-semibold text-slate-900 tabular-nums">
                            {item.val}/{item.max}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-sm overflow-hidden">
                          <div
                            className={`h-full ${
                              pct >= 80
                                ? 'bg-emerald-600'
                                : pct >= 55
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Priority</label>
                  <select
                    value={lead.leadType || 'WARM'}
                    onChange={(e) => updateLead(lead.id, { leadType: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="HOT">HOT (Ready)</option>
                    <option value="WARM">WARM</option>
                    <option value="COLD">COLD</option>
                    <option value="UNQUALIFIED">UNQUALIFIED</option>
                    <option value="EXISTING_CUSTOMER">EXISTING CUSTOMER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Deal Stage</label>
                  <select
                    value={lead.leadStatus || 'NEW'}
                    onChange={(e) => updateLead(lead.id, { leadStatus: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="PROPOSAL">PROPOSAL SENT</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="WON">WON (CLOSED)</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Handled By</label>
                <select
                  value={lead.assignedAgentId || 'admin-1'}
                  onChange={(e) => updateLead(lead.id, { assignedAgentId: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  {teamMembers.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name} ({tm.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. Quick Team Notes */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-900">Team Notes</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!noteInput.trim()) return;
                  addLeadNote(lead.id, noteInput);
                  setNoteInput('');
                }}
                className="flex gap-1.5"
              >
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Write a quick note..."
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Save
                </button>
              </form>
              <div className="space-y-2 mt-2">
                {(lead.notes || []).map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="text-[11px] text-slate-500">
                      {n.authorName} · {n.createdAt}
                    </div>
                    <div className="text-slate-800 mt-0.5">{n.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal to Start a New WhatsApp Chat */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Start New WhatsApp Chat</h3>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateNewChat} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="e.g., Akhil Thomas"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="+91 98470 00000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Interested Service
                  </label>
                  <input
                    type="text"
                    value={newChatService}
                    onChange={(e) => setNewChatService(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    value={newChatBudget}
                    onChange={(e) => setNewChatBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save & Open Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

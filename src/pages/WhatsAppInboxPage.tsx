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
  Code2,
  X
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { LeadStatus, LeadType } from '../types/crm';

export const WhatsAppInboxPage: React.FC = () => {
  const {
    conversations,
    contacts,
    leads,
    teamMembers,
    messagesByConv,
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
  const initialConvId = searchParams.get('convId') || conversations[0]?.id || 'conv-1';

  const [selectedConvId, setSelectedConvId] = useState<string>(initialConvId);
  const [inboxFilter, setInboxFilter] = useState<'ALL' | 'UNREAD' | 'HUMAN' | 'HOT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [inspectedMsgId, setInspectedMsgId] = useState<string | null>(null);
  const [showSimBar, setShowSimBar] = useState<boolean>(false);
  const [customSimText, setCustomSimText] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('2026-09-29');
  const [followUpTime, setFollowUpTime] = useState<string>('11:30');
  const [followUpNote, setFollowUpNote] = useState<string>('');
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false);

  useEffect(() => {
    const paramId = searchParams.get('convId');
    if (paramId && conversations.some((c) => c.id === paramId)) {
      setSelectedConvId(paramId);
      markConversationRead(paramId);
    }
  }, [searchParams]);

  const handleSelectConversation = (convId: string) => {
    setSelectedConvId(convId);
    setSearchParams({ convId });
    markConversationRead(convId);
  };

  const enrichedConversations = useMemo(() => {
    return conversations.map((conv) => {
      const contact = contacts.find((c) => c.id === conv.contactId);
      const lead = leads.find((l) => l.id === conv.leadId);
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

  const handleSendReply = (e: React.FormEvent) => {
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
    pushToast('Document Dispatched via WhatsApp API', 'Quotation PDF sent to customer.', 'success');
  };

  const handleAddQuickFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem?.lead || !activeItem?.contact) return;
    addFollowUp({
      leadId: activeItem.lead.id,
      contactId: activeItem.contact.id,
      assignedUserId: activeItem.lead.assignedAgentId,
      date: followUpDate,
      time: followUpTime,
      note: followUpNote || `Follow up with ${activeItem.contact.name} regarding ${activeItem.lead.interestedService}`,
      status: 'PENDING'
    });
    setFollowUpNote('');
    setShowFollowUpModal(false);
  };

  if (!activeItem) {
    return <div className="p-8 text-xs text-slate-500">No active conversations available.</div>;
  }

  const { conv, contact, lead } = activeItem;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* LEFT PANE: CONVERSATION LIST */}
      <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 h-64 lg:h-full">
        <div className="p-3.5 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-bold text-slate-900">WhatsApp CRM Inbox</h1>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {filteredList.length} threads
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, +91 phone, message..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Functional Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'UNREAD', 'HUMAN', 'HOT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setInboxFilter(tab)}
                className={`py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                  inboxFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'HUMAN' ? 'Escalated' : tab}
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
                  isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                }`}
              >
                {/* Profile Avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
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

                  <div className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                    {itemContact?.phone}
                  </div>

                  <p className="text-xs text-slate-600 truncate mt-1">
                    {itemConv.lastMessage}
                  </p>

                  {/* Zero-Pill Metadata Line: Status · Score · Attention · Unread */}
                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <span
                        className={`font-semibold ${
                          itemLead?.leadType === 'HOT'
                            ? 'text-rose-700'
                            : itemLead?.leadType === 'WARM'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {itemLead?.leadType || 'LEAD'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-semibold text-slate-800 tabular-nums">
                        Score {itemLead?.leadScore ?? 0}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{itemLead?.leadStatus}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {itemConv.needsHumanAttention && (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Human</span>
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

      {/* CENTER PANE: CHAT INTERFACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full">
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
              <span className="text-xs text-slate-500">{conv.language}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Company: {contact?.company}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-semibold ${
                  conv.aiEnabled ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {conv.aiEnabled
                  ? 'AI Auto-Reply Active'
                  : 'Human Agent Mode (AI Paused)'}
              </span>
            </div>
          </div>

          {/* AI Toggle + TAKE OVER / RETURN TO AI Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimBar((prev) => !prev)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span>Simulate Inbound Message</span>
            </button>

            {conv.aiEnabled ? (
              <button
                onClick={() => takeOverConversation(conv.id)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>TAKE OVER</span>
              </button>
            ) : (
              <button
                onClick={() => returnConversationToAI(conv.id)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>RETURN TO AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Human Attention Escalation Banner */}
        {conv.needsHumanAttention && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Human Attention Required:</strong>{' '}
                {conv.handoffReason || 'AI escalated this conversation for human assistance.'}
              </span>
            </div>
            <button
              onClick={() => takeOverConversation(conv.id)}
              className="px-3 py-1 bg-rose-700 text-white text-xs font-semibold rounded hover:bg-rose-800 transition-colors shrink-0"
            >
              Acknowledge & Take Over
            </button>
          </div>
        )}

        {/* Interactive Customer Message Simulator Drawer (Test AI Engine in English/Manglish/Malayalam) */}
        {showSimBar && (
          <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">
                Test Incoming WhatsApp Webhook & AI Auto-Reply Engine
              </span>
              <button
                onClick={() => setShowSimBar(false)}
                className="text-slate-400 hover:text-white text-xs"
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
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
              >
                + Manglish Pricing & Budget
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
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
              >
                + Malayalam Inquiry
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
                className="px-2.5 py-1 text-[11px] bg-rose-900/80 hover:bg-rose-800 rounded text-rose-100 transition-colors"
              >
                + Trigger Human Handoff Escalation
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
                placeholder="Or type any custom customer WhatsApp message (English / Manglish / Malayalam)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded whitespace-nowrap"
              >
                Simulate Inbound
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
                  <span className="text-[11px] text-slate-500 bg-slate-200/70 px-3 py-1 rounded">
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
                  className={`max-w-[82%] sm:max-w-[70%] rounded-lg p-3.5 border ${
                    isCustomer
                      ? 'bg-white border-slate-200 text-slate-900'
                      : isAI
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-emerald-900 border-emerald-900 text-white'
                  }`}
                >
                  {/* Sender Indicator Header */}
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
                        ? 'AI Generated Reply'
                        : `${msg.senderName} (Human Agent)`}
                    </span>
                    {isAI && msg.aiMetadata && (
                      <button
                        type="button"
                        onClick={() => setInspectedMsgId(isInspecting ? null : msg.id)}
                        className="underline hover:text-white flex items-center gap-1"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{isInspecting ? 'Hide AI JSON' : 'Inspect AI JSON'}</span>
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
                          className="flex items-center justify-between gap-2 p-2 rounded bg-slate-100 text-slate-800 text-xs"
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

                  {/* Expandable AI Structured Output Telemetry */}
                  {isAI && isInspecting && msg.aiMetadata && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700">
                      <div className="text-[11px] font-mono text-emerald-300 mb-1">
                        Internal Structured AI Analysis (Hidden from WhatsApp Customer):
                      </div>
                      <pre className="text-[11px] font-mono text-slate-200 bg-slate-950 p-2.5 rounded overflow-x-auto">
                        {JSON.stringify(msg.aiMetadata, null, 2)}
                      </pre>
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

        {/* Outbound Message Reply Box */}
        <form
          onSubmit={handleSendReply}
          className="bg-white border-t border-slate-200 p-3 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleAttachDemoDocument}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Attach Quotation PDF / Media"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              conv.aiEnabled
                ? 'Type a manual reply (or click TAKE OVER to pause AI auto-replies)...'
                : 'Type your reply to send via WhatsApp Cloud API...'
            }
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send WhatsApp</span>
          </button>
        </form>
      </div>

      {/* RIGHT PANE: CUSTOMER & LEAD INFORMATION */}
      <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white overflow-y-auto p-4 space-y-5 shrink-0">
        {/* Customer Header & Quick Links */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{contact?.name}</h3>
            {lead && (
              <Link
                to={`/leads/${lead.id}`}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
              >
                <span>Full Lead View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
            <div className="font-mono">{contact?.phone}</div>
            <div>{contact?.email}</div>
            <div>
              {contact?.company} · {contact?.location}
            </div>
          </div>
        </div>

        {/* AI Qualification Score & Status Controls */}
        {lead && (
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">AI Lead Score</span>
              <span
                className={`text-base font-bold font-mono tabular-nums ${
                  lead.leadScore >= 81
                    ? 'text-rose-700'
                    : lead.leadScore >= 61
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {lead.leadScore} / 100 ({lead.leadType})
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  lead.leadScore >= 81
                    ? 'bg-rose-600'
                    : lead.leadScore >= 61
                    ? 'bg-emerald-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${lead.leadScore}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Lead Type</label>
                <select
                  value={lead.leadType}
                  onChange={(e) =>
                    updateLead(lead.id, { leadType: e.target.value as LeadType })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="HOT">HOT</option>
                  <option value="WARM">WARM</option>
                  <option value="COLD">COLD</option>
                  <option value="UNQUALIFIED">UNQUALIFIED</option>
                  <option value="EXISTING_CUSTOMER">EXISTING CUSTOMER</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Pipeline Status</label>
                <select
                  value={lead.leadStatus}
                  onChange={(e) =>
                    updateLead(lead.id, { leadStatus: e.target.value as LeadStatus })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="PROPOSAL">PROPOSAL</option>
                  <option value="NEGOTIATION">NEGOTIATION</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Assigned Sales Agent</label>
              <select
                value={lead.assignedAgentId}
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
        )}

        {/* AI Conversation Summary & Extracted Requirements */}
        {lead && (
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">AI Executive Summary</div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {lead.aiSummary}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <dt className="text-[11px] text-slate-500">Requested Service</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">{lead.interestedService}</dd>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <dt className="text-[11px] text-slate-500">Extracted Budget</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                  {lead.budget}
                </dd>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 col-span-2">
                <dt className="text-[11px] text-slate-500">Timeline</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">{lead.timeline}</dd>
              </div>
            </dl>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                Extracted Customer Requirements
              </div>
              <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                {lead.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Schedule Follow-up Action */}
        <div className="pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setShowFollowUpModal((prev) => !prev)}
            className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Schedule Follow-up Task</span>
          </button>

          {showFollowUpModal && (
            <form onSubmit={handleAddQuickFollowUp} className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                  required
                />
                <input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                  required
                />
              </div>
              <input
                type="text"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="Follow-up note..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
              >
                Save Follow-up
              </button>
            </form>
          )}
        </div>

        {/* Agent Notes Section */}
        {lead && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-900">Sales Notes</div>
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
                placeholder="Add internal note..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Add
              </button>
            </form>
            <div className="space-y-2 mt-2">
              {lead.notes.map((n) => (
                <div key={n.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                  <div className="text-[11px] text-slate-500">
                    {n.authorName} · {n.createdAt}
                  </div>
                  <div className="text-slate-800 mt-0.5">{n.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

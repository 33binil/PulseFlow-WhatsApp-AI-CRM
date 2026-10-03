import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, UserCheck, Bot, AlertTriangle, Trash2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const ConversationsPage = () => {
  const {
    conversations,
    contacts,
    leads,
    teamMembers,
    takeOverConversation,
    returnConversationToAI,
    deleteConversation
  } = useCRM();
  const navigate = useNavigate();

  const [modeFilter, setModeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    return conversations
      .map((conv) => {
        const contact = contacts.find((c) => c.id === conv.contactId);
        const lead = leads.find(
          (l) =>
            (conv.leadId && l.id === conv.leadId) ||
            (conv.contactId && l.contactId === conv.contactId)
        );
        const agent = teamMembers.find((t) => t.id === conv.assignedAgentId);
        return { conv, contact, lead, agent };
      })
      .filter(({ conv, contact }) => {
        if (modeFilter === 'AI' && !conv.aiEnabled) return false;
        if (modeFilter === 'HUMAN' && conv.aiEnabled) return false;
        if (modeFilter === 'ESCALATED' && !conv.needsHumanAttention) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            contact?.name.toLowerCase().includes(q) ||
            contact?.phone.toLowerCase().includes(q) ||
            conv.lastMessage.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [conversations, contacts, leads, teamMembers, modeFilter, search]);

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">WhatsApp Thread Directory & Handoff Queue</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">All Conversations</h1>
        </div>
        <button
          onClick={() => navigate('/inbox')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 self-start"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Open 3-Pane Live Inbox</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
            {['ALL', 'AI', 'HUMAN', 'ESCALATED'].map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  modeFilter === m
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'ALL'
                  ? 'All Threads'
                  : m === 'AI'
                  ? 'AI Handled'
                  : m === 'HUMAN'
                  ? 'Human Handled'
                  : 'Human Attention Required'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, phone, or message..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Customer & Phone</th>
                <th className="py-2.5 px-3 font-semibold">Last Message</th>
                <th className="py-2.5 px-3 font-semibold">Language</th>
                <th className="py-2.5 px-3 font-semibold">Lead Score</th>
                <th className="py-2.5 px-3 font-semibold">Handling Mode</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Agent</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ conv, contact, lead, agent }) => (
                <tr key={conv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{contact?.name}</div>
                    <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                      {contact?.phone}
                    </div>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-slate-700 truncate">{conv.lastMessage}</p>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                      {conv.lastMessageTime}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{conv.language}</td>
                  <td className="py-3 px-3 font-mono font-semibold tabular-nums">
                    {lead ? `${lead.leadScore}/100 · ${lead.leadType}` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    {conv.needsHumanAttention ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Needs Human</span>
                      </span>
                    ) : conv.aiEnabled ? (
                      <span className="text-emerald-700 font-semibold">AI Auto-Reply</span>
                    ) : (
                      <span className="text-slate-700 font-semibold">Human Takeover</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{agent?.name || 'Unassigned'}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => navigate(`/inbox?convId=${conv.id}`)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                    >
                      Open Chat
                    </button>
                    {conv.aiEnabled ? (
                      <button
                        onClick={() => takeOverConversation(conv.id)}
                        className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded hover:bg-slate-100 text-slate-700"
                      >
                        Take Over
                      </button>
                    ) : (
                      <button
                        onClick={() => returnConversationToAI(conv.id)}
                        className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded hover:bg-slate-100 text-emerald-700 cursor-pointer"
                      >
                        Return to AI
                      </button>
                    )}
                    <button
                      onClick={() => deleteConversation(conv.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

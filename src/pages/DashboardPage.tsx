import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { ArrowRight, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import {
  ANALYTICS_LEADS_OVER_TIME,
  ANALYTICS_LEAD_SOURCES
} from '../data/mockCrmData';

export const DashboardPage: React.FC = () => {
  const {
    leads,
    contacts,
    conversations,
    followUps,
    updateFollowUpStatus,
    takeOverConversation
  } = useCRM();
  const navigate = useNavigate();

  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.leadType === 'HOT');
  const warmLeads = leads.filter((l) => l.leadType === 'WARM');
  const coldLeads = leads.filter((l) => l.leadType === 'COLD');
  const unqualifiedLeads = leads.filter((l) => l.leadType === 'UNQUALIFIED');

  const newConversationsCount = conversations.length;
  const aiHandledCount = conversations.filter((c) => c.aiEnabled).length;
  const humanHandledCount = conversations.filter((c) => !c.aiEnabled).length;
  const wonLeadsCount = leads.filter((l) => l.leadStatus === 'WON').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeadsCount / totalLeads) * 100) : 0;
  const pendingFollowUps = followUps.filter(
    (f) => f.status === 'PENDING' || f.status === 'OVERDUE'
  );

  const humanAttentionConvs = conversations.filter((c) => c.needsHumanAttention);
  const dueTodayFollowUps = followUps.filter(
    (f) => f.date === '2026-09-28' || f.status === 'OVERDUE'
  );

  const distributionData = [
    { tier: 'HOT (81-100)', count: hotLeads.length },
    { tier: 'WARM (31-80)', count: warmLeads.length },
    { tier: 'COLD (0-30)', count: coldLeads.length },
    { tier: 'UNQUALIFIED', count: unqualifiedLeads.length }
  ];

  const getContactName = (contactId: string) =>
    contacts.find((c) => c.id === contactId)?.name || 'Unknown Customer';

  const getContactPhone = (contactId: string) =>
    contacts.find((c) => c.id === contactId)?.phone || '';

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">
            Executive Sales & AI Operations Overview
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            CRM Performance Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/leads"
            className="px-3.5 py-2 text-xs font-semibold border border-slate-200 bg-white text-slate-800 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            View Lead Pipeline
          </Link>
          <Link
            to="/inbox"
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Open WhatsApp Inbox
          </Link>
        </div>
      </div>

      {/* 10 Required KPI Metrics Grid (Single-Elevation, Tabular Numerals) */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-2 sm:grid-cols-5">
        <div className="p-4">
          <div className="text-xs text-slate-500">Total Leads</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalLeads}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active pipeline records
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Hot Leads (81–100)</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {hotLeads.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            High buying intent
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Warm Leads</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {warmLeads.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Service inquiry stage
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Cold / Unqualified</div>
          <div className="text-2xl font-bold font-mono text-slate-700 mt-1 tabular-nums">
            {coldLeads.length} / {unqualifiedLeads.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Early or low-fit inquiries
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Conversion Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {wonLeadsCount} deals won
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-2 sm:grid-cols-4">
        <div className="p-4">
          <div className="text-xs text-slate-500">New Conversations</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {newConversationsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">WhatsApp Cloud API threads</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">AI Handled Conversations</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {aiHandledCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automated qualification active</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Human Handled Conversations</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {humanHandledCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {humanAttentionConvs.length} awaiting urgent takeover
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Pending Follow-ups</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {pendingFollowUps.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {dueTodayFollowUps.length} due today or overdue
          </div>
        </div>
      </div>

      {/* Priority Operational Queues: Human Attention Required & Follow-ups Due Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Attention Required */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Human Attention Required ({humanAttentionConvs.length})
              </h2>
            </div>
            <Link
              to="/conversations"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              View All Escalations
            </Link>
          </div>

          {humanAttentionConvs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              All WhatsApp conversations are currently operating smoothly without escalations.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 mt-2">
              {humanAttentionConvs.map((conv) => (
                <div
                  key={conv.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">
                        {getContactName(conv.contactId)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-slate-500">
                        {getContactPhone(conv.contactId)}
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 font-medium mt-0.5">
                      Reason: {conv.handoffReason || 'Customer requested human agent'}
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      "{conv.lastMessage}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        takeOverConversation(conv.id);
                        navigate(`/inbox?convId=${conv.id}`);
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      Take Over Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-ups Due Today */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Follow-ups Due Today ({dueTodayFollowUps.length})
              </h2>
            </div>
            <Link
              to="/follow-ups"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Manage Schedule
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {dueTodayFollowUps.slice(0, 4).map((fu) => (
              <div
                key={fu.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <Link
                      to={`/leads/${fu.leadId}`}
                      className="font-bold text-slate-900 hover:underline"
                    >
                      {getContactName(fu.contactId)}
                    </Link>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {fu.date} at {fu.time}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span
                      className={`font-semibold ${
                        fu.status === 'OVERDUE'
                          ? 'text-rose-700'
                          : fu.status === 'COMPLETED'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {fu.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{fu.note}</p>
                </div>
                {fu.status !== 'COMPLETED' && (
                  <button
                    onClick={() => updateFollowUpStatus(fu.id, 'COMPLETED')}
                    className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded hover:bg-slate-50 text-slate-700 flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Complete</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 1: Leads Over Time & Hot/Warm/Cold Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Leads & Hot Qualification Velocity Over Time
              </h2>
              <p className="text-xs text-slate-500">
                Inbound WhatsApp leads vs AI-qualified Hot Leads (Score 81+)
              </p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_LEADS_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="totalLeads"
                  name="Total Leads"
                  stroke="#0f172a"
                  fill="#cbd5e1"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="hotLeads"
                  name="Hot Leads"
                  stroke="#be123c"
                  fill="#fecdd3"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900">
            Hot / Warm / Cold Lead Distribution
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Segmented by AI lead score thresholds
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="tier" type="category" width={105} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Leads" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Conversation Volume, Lead Source Performance, Conversion Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900">
            Conversation Volume (AI vs Human)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Daily WhatsApp threads resolved by AI vs Sales Agents
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_LEADS_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="aiHandled" name="AI Handled" stackId="a" fill="#047857" />
                <Bar dataKey="humanHandled" name="Human Handled" stackId="a" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900">Lead Source Performance</h2>
          <p className="text-xs text-slate-500 mb-4">
            Total leads vs Won deals by acquisition channel
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_LEAD_SOURCES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="source" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="leads" name="Inbound Leads" fill="#64748b" />
                <Bar dataKey="won" name="Deals Won" fill="#0f172a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900">Conversion Rate Trend (%)</h2>
          <p className="text-xs text-slate-500 mb-4">
            Lead-to-Win conversion efficiency over 30 days
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS_LEADS_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  name="Conversion %"
                  stroke="#047857"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Tables: Hot Leads, Recent Leads & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot & Recent Leads */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Hot & Recent Qualified Leads
            </h2>
            <Link
              to="/leads"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <span>All Leads</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 px-2 font-semibold">Customer</th>
                  <th className="py-2 px-2 font-semibold">Service</th>
                  <th className="py-2 px-2 font-semibold">Budget</th>
                  <th className="py-2 px-2 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-bold text-slate-900 hover:underline"
                      >
                        {getContactName(lead.contactId)}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        {lead.leadType} · {lead.leadStatus}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-slate-700">{lead.interestedService}</td>
                    <td className="py-2.5 px-2 font-mono text-slate-800 tabular-nums">
                      {lead.budget}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          lead.leadScore >= 81
                            ? 'text-rose-700'
                            : lead.leadScore >= 61
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }
                      >
                        {lead.leadScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Recent WhatsApp Conversations
            </h2>
            <Link
              to="/inbox"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <span>Open Inbox</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 mt-2">
            {conversations.slice(0, 5).map((conv) => {
              const lead = leads.find((l) => l.id === conv.leadId);
              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/inbox?convId=${conv.id}`)}
                  className="py-2.5 px-2 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">
                        {getContactName(conv.contactId)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500">{conv.language}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span
                        className={`font-semibold ${
                          conv.needsHumanAttention
                            ? 'text-rose-700'
                            : conv.aiEnabled
                            ? 'text-emerald-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {conv.needsHumanAttention
                          ? 'Needs Human'
                          : conv.aiEnabled
                          ? 'AI Auto-Reply'
                          : 'Agent Active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {conv.lastMessageTime}
                    </div>
                    {lead && (
                      <div className="text-[11px] font-mono font-semibold text-slate-800 mt-0.5 tabular-nums">
                        Score: {lead.leadScore}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

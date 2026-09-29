import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Trash2,
  X
} from 'lucide-react';
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
import { useCRM } from '../context/CRMContext';
import {
  ANALYTICS_LEADS_OVER_TIME,
  ANALYTICS_LEAD_SOURCES
} from '../data/mockCrmData';

export const FollowUpsPage = () => {
  const {
    followUps,
    leads,
    contacts,
    teamMembers,
    currentUser,
    addFollowUp,
    updateFollowUpStatus,
    deleteFollowUp
  } = useCRM();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [leadId, setLeadId] = useState(leads[0]?.id || 'ld-1');
  const [assignedId, setAssignedId] = useState(currentUser.id);
  const [date, setDate] = useState('2026-09-28');
  const [time, setTime] = useState('15:30');
  const [note, setNote] = useState('');

  const rows = useMemo(() => {
    return followUps
      .map((fu) => {
        const lead = leads.find((l) => l.id === fu.leadId);
        const contact = contacts.find((c) => c.id === fu.contactId);
        const agent = teamMembers.find((t) => t.id === fu.assignedUserId);
        return { fu, lead, contact, agent };
      })
      .filter(({ fu }) => (statusFilter === 'ALL' ? true : fu.status === statusFilter));
  }, [followUps, leads, contacts, teamMembers, statusFilter]);

  const handleCreate = (e) => {
    e.preventDefault();
    const targetLead = leads.find((l) => l.id === leadId) || leads[0];
    if (!targetLead) return;
    addFollowUp({
      leadId: targetLead.id,
      contactId: targetLead.contactId,
      assignedUserId: assignedId,
      date,
      time,
      note: note || 'Scheduled sales follow-up',
      status: 'PENDING'
    });
    setShowModal(false);
    setNote('');
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">Sales Callback & Reminder Queue</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Follow-up Schedule ({rows.length})
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {['ALL', 'PENDING', 'OVERDUE', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Lead & Customer</th>
                <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Agent</th>
                <th className="py-2.5 px-3 font-semibold">Follow-up Note</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ fu, lead, contact, agent }) => (
                <tr key={fu.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <Link
                      to={`/leads/${fu.leadId}`}
                      className="font-bold text-slate-900 hover:underline"
                    >
                      {contact?.name}
                    </Link>
                    <div className="text-[11px] text-slate-500">
                      {lead?.interestedService} · Score: {lead?.leadScore}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800 tabular-nums">
                    {fu.date} · {fu.time}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{agent?.name}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-md">{fu.note}</td>
                  <td className="py-3 px-3 font-semibold">
                    <span
                      className={
                        fu.status === 'COMPLETED'
                          ? 'text-emerald-700'
                          : fu.status === 'OVERDUE'
                          ? 'text-rose-700'
                          : fu.status === 'CANCELLED'
                          ? 'text-slate-400'
                          : 'text-amber-700'
                      }
                    >
                      {fu.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                    {fu.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateFollowUpStatus(fu.id, 'COMPLETED')}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    )}
                    {fu.status === 'PENDING' && (
                      <button
                        onClick={() => updateFollowUpStatus(fu.id, 'CANCELLED')}
                        className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteFollowUp(fu.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Create Follow-up Reminder</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Lead</label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {leads.map((l) => {
                    const c = contacts.find((cnt) => cnt.id === l.contactId);
                    return (
                      <option key={l.id} value={l.id}>
                        {c?.name} — {l.interestedService}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign To</label>
                <select
                  value={assignedId}
                  onChange={(e) => setAssignedId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {teamMembers.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name} ({tm.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note</label>
                <textarea
                  rows={3}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Call agenda or quotation follow-up..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AnalyticsPage = () => {
  const { leads, conversations, teamMembers } = useCRM();
  const [timeframe, setTimeframe] = useState('30D');

  const dynamicLeadsOverTime =
    ANALYTICS_LEADS_OVER_TIME.length > 0
      ? ANALYTICS_LEADS_OVER_TIME
      : [
          {
            date: new Date().toISOString().slice(5, 10),
            totalLeads: leads.length,
            hotLeads: leads.filter((l) => l.leadType === 'HOT').length
          }
        ];

  const sourceMap = leads.reduce((acc, l) => {
    const src = l.source || 'WhatsApp Inbound';
    if (!acc[src]) acc[src] = { source: src, leads: 0, won: 0, totalScore: 0 };
    acc[src].leads += 1;
    if (l.leadStatus === 'WON') acc[src].won += 1;
    acc[src].totalScore += l.leadScore || 0;
    return acc;
  }, {});

  const dynamicLeadSources =
    ANALYTICS_LEAD_SOURCES.length > 0
      ? ANALYTICS_LEAD_SOURCES
      : Object.values(sourceMap).map((s) => ({
          source: s.source,
          leads: s.leads,
          won: s.won,
          avgScore: Math.round(s.totalScore / Math.max(1, s.leads))
        }));

  const intentBreakdown = [
    { intent: 'pricing_enquiry', count: leads.filter((l) => l.budget !== 'Not disclosed').length, avgScore: 82 },
    { intent: 'service_enquiry', count: leads.length, avgScore: 68 },
    { intent: 'purchase_intent', count: leads.filter((l) => l.purchaseIntent).length, avgScore: 91 },
    { intent: 'human_request', count: conversations.filter((c) => c.needsHumanAttention).length, avgScore: 80 }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">
            Sales Conversion, AI Qualification & Channel Intelligence
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            CRM Analytics & AI Telemetry
          </h1>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg self-start">
          {['7D', '30D', '90D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                timeframe === tf
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-2 sm:grid-cols-4">
        <div className="p-4">
          <div className="text-xs text-slate-500">AI Auto-Resolution Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            84.2%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Handled without human takeover
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Median First Response Time</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            1.8s
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Via WhatsApp Cloud API webhook
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Average AI Lead Score</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {Math.round(leads.reduce((a, b) => a + b.leadScore, 0) / Math.max(1, leads.length))}/100
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across {leads.length} active leads</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Active Conversations</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {conversations.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">English, Manglish & Malayalam</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Lead Velocity & Conversion Trend ({timeframe})
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Total leads captured vs Hot Leads qualified by AI
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicLeadsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="totalLeads"
                  stroke="#0f172a"
                  fill="#cbd5e1"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="hotLeads"
                  stroke="#be123c"
                  fill="#fecdd3"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            AI Detected Intent Breakdown
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Volume of customer messages classified by structured AI intent
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intentBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="intent" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Messages" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lead Source ROI & Team Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">
            Acquisition Channel ROI Matrix
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 px-2 font-semibold">Source Channel</th>
                <th className="py-2 px-2 font-semibold text-right">Leads</th>
                <th className="py-2 px-2 font-semibold text-right">Won</th>
                <th className="py-2 px-2 font-semibold text-right">Avg AI Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dynamicLeadSources.map((src) => (
                <tr key={src.source}>
                  <td className="py-2.5 px-2 font-medium text-slate-900">{src.source}</td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums">{src.leads}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                    {src.won}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                    {src.avgScore}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">
            Sales Team Workload & Assignment
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 px-2 font-semibold">Team Member</th>
                <th className="py-2 px-2 font-semibold">Role</th>
                <th className="py-2 px-2 font-semibold text-right">Assigned Leads</th>
                <th className="py-2 px-2 font-semibold text-right">Active Chats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.map((tm) => (
                <tr key={tm.id}>
                  <td className="py-2.5 px-2 font-semibold text-slate-900">{tm.name}</td>
                  <td className="py-2.5 px-2 font-mono text-slate-600">{tm.role}</td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                    {tm.assignedLeadsCount}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                    {tm.activeChatsCount}
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

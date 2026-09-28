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
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Zap,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import {
  ANALYTICS_LEADS_OVER_TIME,
  ANALYTICS_LEAD_SOURCES
} from '../data/mockCrmData';

export const DashboardPage = () => {
  const {
    leads,
    contacts,
    conversations,
    followUps,
    strategicFindings,
    knowledgeGaps,
    resolveKnowledgeGapToArticle,
    updateFollowUpStatus,
    takeOverConversation
  } = useCRM();
  const navigate = useNavigate();

  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.leadType === 'HOT');
  const warmLeads = leads.filter((l) => l.leadType === 'WARM');
  const coldLeads = leads.filter((l) => l.leadType === 'COLD');
  const unqualifiedLeads = leads.filter((l) => l.leadType === 'UNQUALIFIED');

  const totalPipelineInr = leads.reduce((sum, l) => sum + (l.estimatedValueInr || 0), 0);
  const hotPipelineInr = hotLeads.reduce((sum, l) => sum + (l.estimatedValueInr || 0), 0);

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
  const unresolvedGaps = knowledgeGaps.filter((g) => !g.resolved);

  const distributionData = [
    { tier: 'HOT (81-100)', count: hotLeads.length },
    { tier: 'WARM (31-80)', count: warmLeads.length },
    { tier: 'COLD (0-30)', count: coldLeads.length },
    { tier: 'UNQUALIFIED', count: unqualifiedLeads.length }
  ];

  const getContactName = (contactId) =>
    contacts.find((c) => c.id === contactId)?.name || 'Unknown Customer';

  const getContactPhone = (contactId) =>
    contacts.find((c) => c.id === contactId)?.phone || '';

  const formatLakhs = (val) => `₹${(val / 100000).toFixed(2)}L`;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
            PULSEFLOW AI REVENUE & WHATSAPP OPERATIONS CENTER
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
            Executive CRM & Intelligence Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/insights"
            className="px-3.5 py-2 text-xs font-semibold border border-indigo-200 bg-indigo-50/80 text-indigo-900 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Knows & Findings ({strategicFindings.length + unresolvedGaps.length})</span>
          </Link>
          <Link
            to="/leads"
            className="px-3.5 py-2 text-xs font-semibold border border-slate-200 bg-white text-slate-800 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Lead Pipeline ({formatLakhs(totalPipelineInr)})
          </Link>
          <Link
            to="/inbox"
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-2xs"
          >
            Open WhatsApp Inbox
          </Link>
        </div>
      </div>

      {/* Executive AI Daily Intelligence Briefing Banner */}
      <div className="bg-[#0B1120] text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TODAY'S AI DISCOVERY BRIEFING · AUTO-EXTRACTED FROM WHATSAPP THREADS</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              AI qualified {formatLakhs(hotPipelineInr)} in Hot Pipeline across {hotLeads.length} high-intent deals & detected {unresolvedGaps.length} Knowledge Base gaps
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Key Finding: Prospects chatting in <strong className="text-emerald-300">Manglish</strong> &{' '}
              <strong className="text-indigo-300">Malayalam</strong> disclosed confirmed budgets 2.4x faster today.{' '}
              <strong className="text-white">Anita Desai (₹8.5L SAP ERP)</strong> and{' '}
              <strong className="text-white">Rahul Menon (₹1.0L E-Commerce)</strong> are ready for immediate closing actions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase text-slate-400">Total Pipeline</div>
              <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
                {formatLakhs(totalPipelineInr)}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">
                {formatLakhs(hotPipelineInr)} Hot (81+ Score)
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase text-slate-400">Buying Signals</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                {leads.reduce((acc, l) => acc + l.buyingSignals.length, 0)} Signals
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {leads.reduce((acc, l) => acc + l.detectedObjections.length, 0)} Objections flagged
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-3 flex flex-col justify-between">
              <div className="text-[10px] font-mono uppercase text-indigo-300">AI Findings Hub</div>
              <Link
                to="/insights"
                className="mt-1 inline-flex items-center justify-between text-xs font-bold text-white hover:text-emerald-300 transition-colors"
              >
                <span>Explore All Knows</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <div className="text-[10px] text-indigo-300 font-mono">
                {unresolvedGaps.length} 1-click KB fixes ready
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Required KPI Metrics Grid (High-Craft Bento with Top Accent Bars & Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 border-t-2 border-t-slate-900 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Leads</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalLeads}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            Pipeline: {formatLakhs(totalPipelineInr)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-t-2 border-t-emerald-600 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Hot Leads (81–100)</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {hotLeads.length}
          </div>
          <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-1">
            Value: {formatLakhs(hotPipelineInr)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-t-2 border-t-amber-500 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Warm Leads (31–80)</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {warmLeads.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active qualification stage
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-t-2 border-t-slate-400 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Cold / Unqualified</div>
          <div className="text-2xl font-bold font-mono text-slate-700 mt-1 tabular-nums">
            {coldLeads.length} / {unqualifiedLeads.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            AI nurture sequence active
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 border-t-2 border-t-indigo-600 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Conversion Rate</div>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {wonLeadsCount} deals won this cycle
          </div>
        </div>
      </div>

      {/* Second Row of Operational KPIs */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-2 sm:grid-cols-4 shadow-2xs">
        <div className="p-4">
          <div className="text-xs text-slate-500">Active WhatsApp Threads</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {newConversationsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">English, Manglish & Malayalam</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">AI Handled Conversations</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {aiHandledCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">94.2% avg structured confidence</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Human Handled Conversations</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {humanHandledCount}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">
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

      {/* NEW SECTION: What AI Knows & Discovered Today (Strategic Findings + 1-Click Knowledge Gap Trainer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Strategic Deal & Language Findings */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Key AI Findings & Deal Closing Recommendations
                </h2>
                <p className="text-xs text-slate-500">
                  Synthesized from customer intent, budget disclosures, and objection patterns
                </p>
              </div>
            </div>
            <Link
              to="/insights"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>All Findings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {strategicFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 text-emerald-800">
                      {finding.metricBadge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {finding.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {finding.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {finding.findingSummary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700 truncate max-w-[70%]">
                    <strong className="text-slate-900">Playbook:</strong> {finding.recommendation}
                  </span>
                  <Link
                    to={finding.actionLink}
                    className="text-xs font-semibold text-slate-900 hover:text-emerald-700 shrink-0 flex items-center gap-1"
                  >
                    <span>Act</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI-Detected Knowledge Base Gaps (1-Click Trainable) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Discovered Knowledge Gaps ({unresolvedGaps.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Frequent WhatsApp questions needing KB answers
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {knowledgeGaps.map((gap) => (
                <div key={gap.id} className="py-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-indigo-700 font-semibold">
                      {gap.language} · Asked {gap.occurrences}x
                    </span>
                    <span className="text-amber-700">
                      Confidence: {Math.round(gap.avgConfidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    "{gap.questionAsked}"
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 truncate max-w-[60%]">
                      Draft: {gap.suggestedTitle}
                    </span>
                    {gap.resolved ? (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Trained
                      </span>
                    ) : (
                      <button
                        onClick={() => resolveKnowledgeGapToArticle(gap.id)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                      >
                        + Train AI in 1-Click
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/knowledge-base"
            className="w-full py-2 text-center text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Manage Full Knowledge Base →
          </Link>
        </div>
      </div>

      {/* Priority Operational Queues: Human Attention Required & Follow-ups Due Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Attention Required */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
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
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">
                        {getContactName(conv.contactId)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-slate-500">
                        {getContactPhone(conv.contactId)}
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 font-medium">
                      Escalation Trigger: {conv.handoffReason || 'Customer requested human agent'}
                    </p>
                    {conv.keyFinding && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-1 rounded">
                        <strong>AI Know:</strong> {conv.keyFinding}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        takeOverConversation(conv.id);
                        navigate(`/inbox?convId=${conv.id}`);
                      }}
                      className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
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
                className="py-3 flex items-center justify-between gap-3"
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
                    className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 shadow-2xs">
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
                  stroke="#059669"
                  fill="#a7f3d0"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
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
                <Bar dataKey="aiHandled" name="AI Handled" stackId="a" fill="#059669" />
                <Bar dataKey="humanHandled" name="Human Handled" stackId="a" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
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

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
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
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Tables: Hot Leads with Next Best Action & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot & Recent Leads */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Qualified Leads & AI Next Best Action
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
                  <th className="py-2 px-2 font-semibold">Service & Next Action</th>
                  <th className="py-2 px-2 font-semibold">Budget</th>
                  <th className="py-2 px-2 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-bold text-slate-900 hover:text-emerald-700"
                      >
                        {getContactName(lead.contactId)}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        {lead.leadType} · {lead.leadStatus}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-700 max-w-xs">
                      <div className="font-semibold text-slate-900">{lead.interestedService}</div>
                      <div className="text-[11px] text-emerald-800 truncate mt-0.5">
                        → {lead.recommendedNextAction}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono font-semibold text-slate-900 tabular-nums">
                      {lead.budget}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          lead.leadScore >= 81
                            ? 'text-emerald-700'
                            : lead.leadScore >= 61
                            ? 'text-indigo-700'
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Recent WhatsApp Threads & Key Takeaways
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
                  className="py-3 px-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">
                        {getContactName(conv.contactId)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-indigo-700 font-medium">{conv.language}</span>
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
                    <p className="text-xs text-slate-600 truncate">
                      {conv.keyFinding || conv.lastMessage}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {conv.lastMessageTime}
                    </div>
                    {lead && (
                      <div className="text-[11px] font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
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

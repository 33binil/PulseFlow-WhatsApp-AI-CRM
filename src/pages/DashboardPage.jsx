import React, { useState } from 'react';
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
  MessageSquare,
  Check,
  BarChart3,
  LayoutDashboard,
  HelpCircle,
  X
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
    takeOverConversation,
    startOrOpenConversation
  } = useCRM();
  const navigate = useNavigate();

  const [dashboardTab, setDashboardTab] = useState('SIMPLE');
  const [showHowItWorks, setShowHowItWorks] = useState(true);

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

  const dynamicLeadsOverTime =
    ANALYTICS_LEADS_OVER_TIME.length > 0
      ? ANALYTICS_LEADS_OVER_TIME
      : [
          {
            date: new Date().toISOString().slice(5, 10),
            totalLeads,
            hotLeads: hotLeads.length,
            aiHandled: aiHandledCount,
            humanHandled: humanHandledCount,
            conversionRate
          }
        ];

  const sourceGroups = leads.reduce((acc, l) => {
    const src = l.source || 'WhatsApp Inbound';
    if (!acc[src]) acc[src] = { source: src, leads: 0, won: 0 };
    acc[src].leads += 1;
    if (l.leadStatus === 'WON') acc[src].won += 1;
    return acc;
  }, {});

  const dynamicLeadSources =
    ANALYTICS_LEAD_SOURCES.length > 0
      ? ANALYTICS_LEAD_SOURCES
      : Object.values(sourceGroups);

  const getContactName = (contactId) =>
    contacts.find((c) => c.id === contactId)?.name || 'Unknown Customer';

  const getContactPhone = (contactId) =>
    contacts.find((c) => c.id === contactId)?.phone || '';

  const getContactCompany = (contactId) =>
    contacts.find((c) => c.id === contactId)?.company || '';

  const formatLakhs = (val) => `₹${(val / 100000).toFixed(2)}L`;

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Friendly, Knowable Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good morning — Here is what’s happening today
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Your AI is answering WhatsApp messages, finding customer budgets, and highlighting who is ready to buy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher: Simple Daily View vs Full Charts & 10 Metrics */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-lg">
            <button
              onClick={() => setDashboardTab('SIMPLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                dashboardTab === 'SIMPLE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Simple Overview</span>
            </button>
            <button
              onClick={() => setDashboardTab('CHARTS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                dashboardTab === 'CHARTS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Charts & All 10 Stats</span>
            </button>
          </div>

          <Link
            to="/inbox"
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp Inbox</span>
          </Link>
        </div>
      </div>

      {/* Simple 3-Step Visual Guide (Knowable at a glance for any user) */}
      {showHowItWorks ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900">
                How PulseFlow Works in 3 Simple Steps
              </h2>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Hide guide</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                1. Customer Chats on WhatsApp
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers message you in <strong>English, Manglish, or Malayalam</strong>. AI replies
                automatically using your company’s pricing and service list.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                2. AI Learns Their Need & Budget
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                AI reads the chat to find out <strong>what they want</strong>,{' '}
                <strong>their budget</strong>, and <strong>how soon they want to start</strong>,
                giving them a score out of 100.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                3. You Close the Hot Deals
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a customer is serious (<strong>Hot Lead</strong>) or asks for a manager, we
                notify you below so you can step in and close the sale.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowHowItWorks(true)}
            className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Show "How PulseFlow Works" guide</span>
          </button>
        </div>
      )}

      {/* 4 Simple, Self-Explanatory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/leads"
          className="bg-white border border-slate-200 border-t-2 border-t-emerald-600 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="text-xs font-semibold text-slate-500">
            Hot Leads (Ready to Buy)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {hotLeads.length} customers · {formatLakhs(hotPipelineInr)}
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Scored 81+ by AI because they shared a clear budget and timeline.
          </p>
        </Link>

        <Link
          to="/inbox"
          className="bg-white border border-slate-200 border-t-2 border-t-rose-600 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="text-xs font-semibold text-slate-500">
            Chats Waiting for You
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {humanAttentionConvs.length} {humanAttentionConvs.length === 1 ? 'chat' : 'chats'}
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            AI continues replying automatically unless you manually click "Take Over Chat" in the Inbox.
          </p>
        </Link>

        <Link
          to="/insights"
          className="bg-white border border-slate-200 border-t-2 border-t-indigo-600 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="text-xs font-semibold text-slate-500">
            What AI Learned Today
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
            {leads.reduce((acc, l) => acc + (l.buyingSignals?.length || 0), 0)} buying signals
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Plus {unresolvedGaps.length} new customer questions you can approve in 1 click.
          </p>
        </Link>

        <Link
          to="/follow-ups"
          className="bg-white border border-slate-200 border-t-2 border-t-amber-500 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="text-xs font-semibold text-slate-500">
            Follow-up Tasks Due
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {pendingFollowUps.length} tasks ({dueTodayFollowUps.length} urgent)
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Scheduled calls and proposals to send to your leads today.
          </p>
        </Link>
      </div>

      {dashboardTab === 'SIMPLE' ? (
        /* SIMPLE DAILY VIEW: 2 Clear Columns (Your Action List + What AI Knows About Customers) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 5 COLUMNS: YOUR ACTION LIST RIGHT NOW */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Chats Needing Human Reply */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    1. Customers Waiting for Your Reply ({humanAttentionConvs.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click "Reply in WhatsApp" to take over from AI
                  </p>
                </div>
              </div>

              {humanAttentionConvs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Great job! No customers are waiting for a human takeover right now.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {humanAttentionConvs.map((conv) => (
                    <div key={conv.id} className="py-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            {getContactName(conv.contactId)}
                          </span>
                          <span className="text-xs text-slate-400 mx-1.5">·</span>
                          <span className="text-xs font-mono text-slate-600 tabular-nums">
                            {getContactPhone(conv.contactId)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-700">
                          {conv.language}
                        </span>
                      </div>

                      <div className="text-xs text-rose-700 font-medium">
                        Why they need you: {conv.handoffReason || 'Requested human manager'}
                      </div>

                      {conv.keyFinding && (
                        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                          <strong>What AI knows:</strong> {conv.keyFinding}
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            navigate(`/inbox?convId=${conv.id}`);
                          }}
                          className="w-full py-2 px-3 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Open in WhatsApp Inbox →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Follow-up Tasks Due Today */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    2. Follow-ups Due Today ({dueTodayFollowUps.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Calls and proposals scheduled for today
                  </p>
                </div>
                <Link
                  to="/follow-ups"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  See all
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {dueTodayFollowUps.slice(0, 4).map((fu) => (
                  <div
                    key={fu.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900">
                        {getContactName(fu.contactId)}
                        <span className="font-normal text-slate-500 font-mono ml-2 tabular-nums">
                          {fu.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{fu.note}</p>
                    </div>
                    {fu.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateFollowUpStatus(fu.id, 'COMPLETED')}
                        className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Done</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Teach AI Missing Answers in 1 Click */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    3. New Questions Customers Asked ({unresolvedGaps.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Approve AI’s suggested answer in 1 click so AI knows it next time
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {knowledgeGaps.map((gap) => (
                  <div key={gap.id} className="py-3 space-y-2">
                    <div className="text-xs font-bold text-slate-900">
                      Customer asked: <span className="text-emerald-800">"{gap.questionAsked}"</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Suggested Answer:</strong> {gap.suggestedContent}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Asked {gap.occurrences} times in {gap.language}
                      </span>
                      {gap.resolved ? (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Added to AI Knowledge Base
                        </span>
                      ) : (
                        <button
                          onClick={() => resolveKnowledgeGapToArticle(gap.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          + Approve Answer for AI
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLUMNS: WHAT AI KNOWS ABOUT YOUR CUSTOMERS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    What AI Knows About Your Customers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Plain-English summary extracted automatically from their WhatsApp messages
                  </p>
                </div>
                <Link
                  to="/insights"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Open Full AI Insights Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {leads.map((lead) => {
                  const conv = conversations.find(
                    (c) =>
                      (lead.conversationId && c.id === lead.conversationId) ||
                      c.leadId === lead.id ||
                      (lead.contactId && c.contactId === lead.contactId)
                  );
                  return (
                    <div
                      key={lead.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
                    >
                      {/* Top Row: Customer Name, Company, Language, Score */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <Link
                            to={`/leads/${lead.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-emerald-700"
                          >
                            {getContactName(lead.contactId)}
                          </Link>
                          <span className="text-xs text-slate-500 ml-1.5">
                            · {getContactCompany(lead.contactId)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                          <span className="text-slate-600 font-sans">
                            Chats in <strong>{conv?.language || 'English'}</strong>
                          </span>
                          <span className="text-slate-300">·</span>
                          <span
                            className={`font-bold ${
                              lead.leadType === 'HOT'
                                ? 'text-emerald-700'
                                : lead.leadType === 'WARM'
                                ? 'text-amber-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {lead.leadType} ({lead.leadScore}/100)
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: 3 Simple Facts (What they want, Budget, Timeline) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200/70 text-xs">
                        <div>
                          <div className="text-[11px] text-slate-500">What they want</div>
                          <div className="font-semibold text-slate-900 mt-0.5">
                            {lead.interestedService}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">Their Budget</div>
                          <div className="font-mono font-bold text-emerald-700 mt-0.5 tabular-nums">
                            {lead.budget}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">When they want to start</div>
                          <div className="font-semibold text-slate-900 mt-0.5">
                            {lead.timeline}
                          </div>
                        </div>
                      </div>

                      {/* Plain English Summary of what AI noticed */}
                      <div className="text-xs text-slate-700 space-y-1">
                        <div>
                          <strong className="text-slate-900">What AI noticed: </strong>
                          <span>{lead.aiSummary}</span>
                        </div>
                        <div className="text-emerald-800 font-medium">
                          <strong>Recommended Next Step: </strong>
                          <span>{lead.recommendedNextAction}</span>
                        </div>
                      </div>

                      {/* Bottom Action Links */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="font-semibold text-slate-600 hover:text-slate-900"
                        >
                          View Customer Details
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            if (conv) {
                              navigate(`/inbox?convId=${conv.id}`);
                              return;
                            }
                            const reopened = await startOrOpenConversation(lead.contactId, lead.id);
                            navigate(reopened?.id ? `/inbox?convId=${reopened.id}` : '/inbox');
                          }}
                          className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{conv ? 'Open WhatsApp Chat' : 'Reopen WhatsApp Chat'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Business Patterns Discovered */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Helpful Patterns AI Noticed Across All Chats
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simple tips to help your team close more sales
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategicFindings.slice(0, 2).map((finding) => (
                  <div
                    key={finding.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-emerald-700">{finding.metricBadge}</div>
                    <div className="text-xs font-bold text-slate-900">{finding.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {finding.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CHARTS & ALL 10 KPI METRICS VIEW */
        <div className="space-y-6">
          {/* Complete 10 KPI Metrics Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              All 10 CRM & WhatsApp Performance Metrics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">1. Total Leads</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {totalLeads}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">2. Hot Leads (81–100)</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                  {hotLeads.length}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">3. Warm Leads (31–80)</div>
                <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                  {warmLeads.length}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">4. Cold Leads (0–30)</div>
                <div className="text-xl font-bold font-mono text-slate-700 mt-1 tabular-nums">
                  {coldLeads.length}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">5. Unqualified Leads</div>
                <div className="text-xl font-bold font-mono text-slate-500 mt-1 tabular-nums">
                  {unqualifiedLeads.length}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">6. Active Conversations</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {newConversationsCount}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">7. AI Handled Chats</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                  {aiHandledCount}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">8. Human Handled Chats</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {humanHandledCount}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">9. Conversion Rate</div>
                <div className="text-xl font-bold font-mono text-indigo-700 mt-1 tabular-nums">
                  {conversionRate}%
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">10. Pending Follow-ups</div>
                <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                  {pendingFollowUps.length}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2">
              <h2 className="text-sm font-bold text-slate-900">Leads Over Time</h2>
              <p className="text-xs text-slate-500 mb-4">
                Total WhatsApp leads vs Hot leads over the last 7 weeks
              </p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicLeadsOverTime}>
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

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-bold text-slate-900">Hot / Warm / Cold Breakdown</h2>
              <p className="text-xs text-slate-500 mb-4">Leads grouped by AI score</p>
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

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-bold text-slate-900">AI vs Human Chats</h2>
              <p className="text-xs text-slate-500 mb-4">Chats answered by AI vs sales team</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicLeadsOverTime}>
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

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-bold text-slate-900">Where Leads Come From</h2>
              <p className="text-xs text-slate-500 mb-4">Leads and won deals by source</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicLeadSources}>
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

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-bold text-slate-900">Conversion Trend (%)</h2>
              <p className="text-xs text-slate-500 mb-4">Percentage of leads won over time</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicLeadsOverTime}>
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
        </div>
      )}
    </div>
  );
};

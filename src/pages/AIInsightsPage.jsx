import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Globe,
  ArrowUpRight,
  Lightbulb,
  Target,
  ShieldAlert,
  Search,
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const AIInsightsPage = () => {
  const {
    leads,
    contacts,
    conversations,
    knowledgeBase,
    knowledgeGaps,
    resolveKnowledgeGapToArticle,
    strategicFindings,
    startOrOpenConversation
  } = useCRM();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('CUSTOMERS');
  const [searchQuery, setSearchQuery] = useState('');

  const hotPipelineValue = useMemo(
    () =>
      leads
        .filter((l) => l.leadType === 'HOT')
        .reduce((sum, l) => sum + (l.estimatedValueInr || 0), 0),
    [leads]
  );

  const unresolvedGapsCount = useMemo(
    () => knowledgeGaps.filter((g) => !g.resolved).length,
    [knowledgeGaps]
  );

  const totalBuyingSignalsCount = useMemo(
    () => leads.reduce((sum, l) => sum + (l.buyingSignals?.length || 0), 0),
    [leads]
  );

  const filteredLeadsWithFindings = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return leads.filter((l) => {
      const contact = contacts.find((c) => c.id === l.contactId);
      if (!q) return true;
      return (
        contact?.name.toLowerCase().includes(q) ||
        contact?.company.toLowerCase().includes(q) ||
        (l.interestedService || '').toLowerCase().includes(q) ||
        (l.aiSummary || '').toLowerCase().includes(q) ||
        (l.buyingSignals || []).some((s) => s.toLowerCase().includes(q)) ||
        (l.detectedObjections || []).some((o) => o.toLowerCase().includes(q))
      );
    });
  }, [leads, contacts, searchQuery]);

  const formatInr = (val) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Simple, Plain-English Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automatic WhatsApp Chat Summary</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              What AI Knows About Your Customers
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instead of reading through long WhatsApp threads, see what each customer wants, their
              confirmed budget, their questions, and what step to take next.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs text-slate-500">Hot Deals Found</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {formatInr(hotPipelineValue)}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs text-slate-500">Buying Clues</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {totalBuyingSignalsCount} found
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs text-slate-500">New Questions</div>
              <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
                {unresolvedGapsCount} to approve
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple 3-Tab Switcher + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            {
              id: 'CUSTOMERS',
              label: `1. Each Customer Summary (${leads.length})`,
              icon: Target
            },
            {
              id: 'TEACH_AI',
              label: `2. Teach AI New Answers (${unresolvedGapsCount})`,
              icon: BookOpen
            },
            {
              id: 'PATTERNS',
              label: '3. Helpful Trends & Language Tips',
              icon: Globe
            }
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, service, or budget..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* TAB 1: EACH CUSTOMER SUMMARY (PLAIN & KNOWABLE) */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-4">
          {filteredLeadsWithFindings.map((lead) => {
            const contact = contacts.find((c) => c.id === lead.contactId);
            const conv = conversations.find(
              (c) =>
                (lead.conversationId && c.id === lead.conversationId) ||
                c.leadId === lead.id ||
                (lead.contactId && c.contactId === lead.contactId)
            );
            return (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700"
                      >
                        {contact?.name}
                      </Link>
                      <span className="text-xs text-slate-500">· {contact?.company}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Wants: <strong className="text-slate-900">{lead.interestedService}</strong> ·
                      Budget: <strong className="font-mono text-emerald-700">{lead.budget}</strong>{' '}
                      · Timeline: <strong className="text-slate-900">{lead.timeline}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                        {lead.leadType} ({lead.leadScore}/100)
                      </div>
                      <div className="text-xs text-indigo-700">
                        Chats in {conv?.language || 'English'}
                      </div>
                    </div>
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
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer"
                    >
                      {conv ? 'Open WhatsApp Chat' : 'Reopen WhatsApp Chat'}
                    </button>
                  </div>
                </div>

                {/* 3 Easy Columns: Why they want to buy, Their questions, What to do next */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-lg p-3.5">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Why they are interested:</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {(lead.buyingSignals || []).map((sig, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200/70 rounded-lg p-3.5">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Questions or concerns:</span>
                    </div>
                    {(lead.detectedObjections || []).length > 0 ? (
                      <ul className="space-y-1 text-xs text-slate-700">
                        {(lead.detectedObjections || []).map((obj, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No concerns raised — customer is happy with the plan.
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-900 text-white rounded-lg p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-400">
                        Suggested Next Step:
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {lead.recommendedNextAction}
                      </p>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Best time: {contact?.bestTimeToContact || '10 AM – 6 PM'}
                      </span>
                      <Link
                        to={`/leads/${lead.id}`}
                        className="text-emerald-400 hover:underline font-semibold"
                      >
                        Full Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: TEACH AI NEW ANSWERS (KNOWLEDGE BASE GAPS) */}
      {activeTab === 'TEACH_AI' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  Questions Customers Asked That AI Needs Your Approval On ({unresolvedGapsCount})
                </span>
              </div>
              <p className="text-xs text-amber-800">
                When customers ask something new on WhatsApp, AI drafts an answer below. Click{' '}
                <strong>Approve & Teach AI</strong> so AI can answer it automatically next time.
              </p>
            </div>
            <Link
              to="/knowledge-base"
              className="px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 hover:bg-amber-100 shrink-0"
            >
              See All {knowledgeBase.length} Saved AI Answers →
            </Link>
          </div>

          <div className="space-y-4">
            {knowledgeGaps.map((gap) => (
              <div
                key={gap.id}
                className={`bg-white border rounded-xl p-5 transition-all ${
                  gap.resolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="text-xs text-slate-500">
                      Asked <strong>{gap.occurrences} times</strong> on WhatsApp in{' '}
                      <strong>{gap.language}</strong>
                    </div>

                    <div className="text-sm font-bold text-slate-900">
                      Customer Question:{' '}
                      <span className="text-emerald-800">"{gap.questionAsked}"</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                      <div className="text-xs font-bold text-slate-900">
                        Suggested Answer ({gap.suggestedTitle}):
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {gap.suggestedContent}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-stretch sm:items-end justify-center gap-2">
                    {gap.resolved ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved to AI Knowledge Base</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => resolveKnowledgeGapToArticle(gap.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Teach AI</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HELPFUL TRENDS & LANGUAGE TIPS */}
      {activeTab === 'PATTERNS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategicFindings.map((finding) => (
              <div
                key={finding.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-emerald-700">
                    {finding.metricBadge}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {finding.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {finding.findingSummary}
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>What you should do:</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {finding.recommendation}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => {
                      if (finding.actionLink === '/insights') {
                        setActiveTab('TEACH_AI');
                      } else {
                        navigate(finding.actionLink);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    <span>{finding.actionLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Language Guide */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                How Your Customers Prefer to Chat on WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                AI automatically replies in the same language the customer uses
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  lang: 'Manglish (Malayalam in English letters)',
                  share: '38% of customers',
                  tip: 'Customers who type "Website undakkanam, rate ethra aanu?" share their budget 2x faster when replied to in friendly Manglish.'
                },
                {
                  lang: 'Malayalam (മലയാളം)',
                  share: '19% of customers',
                  tip: 'Local clinics and retail shops prefer clear Malayalam replies with straightforward package pricing.'
                },
                {
                  lang: 'English',
                  share: '43% of customers',
                  tip: 'IT companies and enterprise buyers use English and often ask for PDF quotes or a quick phone call.'
                }
              ].map((item) => (
                <div
                  key={item.lang}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="text-xs font-mono font-bold text-emerald-700">{item.share}</div>
                  <div className="text-sm font-bold text-slate-900">{item.lang}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

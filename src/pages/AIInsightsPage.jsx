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
  BrainCircuit,
  Lightbulb,
  Target,
  ShieldAlert,
  Search,
  Check,
  Zap
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
    aiSettings
  } = useCRM();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL_FINDINGS');
  const [searchQuery, setSearchQuery] = useState('');

  const totalPipelineValue = useMemo(
    () => leads.reduce((sum, l) => sum + (l.estimatedValueInr || 0), 0),
    [leads]
  );

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

  const totalObjectionsCount = useMemo(
    () => leads.reduce((sum, l) => sum + (l.detectedObjections?.length || 0), 0),
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
        l.interestedService.toLowerCase().includes(q) ||
        l.aiSummary.toLowerCase().includes(q) ||
        l.buyingSignals.some((s) => s.toLowerCase().includes(q)) ||
        l.detectedObjections.some((o) => o.toLowerCase().includes(q))
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
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI INTELLIGENCE & DISCOVERY ENGINE · LIVE ANALYSIS</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              What PulseFlow AI Knows & Discovered
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every inbound WhatsApp message across <strong className="text-white">English</strong>,{' '}
              <strong className="text-emerald-300">Manglish</strong>, and{' '}
              <strong className="text-indigo-300">Malayalam</strong> is continuously analyzed for buying
              signals, hidden objections, budget readiness, and missing Knowledge Base answers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Hot Pipeline Discovered</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                {formatInr(hotPipelineValue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                of {formatInr(totalPipelineValue)} total
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Buying Signals</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                {totalBuyingSignalsCount}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
                Across {leads.length} active leads
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Detected Objections</div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                {totalObjectionsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                With AI counter-playbooks
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">KB Gaps Found</div>
              <div className="text-xl font-bold font-mono tabular-nums text-indigo-400 mt-1">
                {unresolvedGapsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                1-click auto-trainable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL_FINDINGS', label: 'Executive Findings & Playbooks', icon: BrainCircuit },
            {
              id: 'DEAL_PLAYBOOKS',
              label: `Lead-by-Lead Knows (${leads.length})`,
              icon: Target
            },
            {
              id: 'LANGUAGE_INSIGHTS',
              label: 'Language & Regional Intelligence',
              icon: Globe
            },
            {
              id: 'KNOWLEDGE_GAPS',
              label: `Knowledge Base Gaps (${unresolvedGapsCount})`,
              icon: BookOpen
            }
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs'
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
            placeholder="Filter findings, signals, objections..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* TAB 1: EXECUTIVE FINDINGS */}
      {activeTab === 'ALL_FINDINGS' && (
        <div className="space-y-6">
          {/* Top Strategic Findings Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  High-Impact Strategic Findings (Auto-Synthesized from WhatsApp Threads)
                </h2>
                <p className="text-xs text-slate-500">
                  Actionable patterns discovered across active customer conversations today
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                MODEL: {aiSettings.provider} / {aiSettings.model}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategicFindings.map((finding) => {
                const isRevenue = finding.category === 'REVENUE_SIGNAL';
                const isLang = finding.category === 'LANGUAGE_INSIGHT';
                const isGap = finding.category === 'KNOWLEDGE_GAP';

                return (
                  <div
                    key={finding.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-md border ${
                            isRevenue
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isLang
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : isGap
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {finding.metricBadge}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-slate-400">
                          {finding.impactLevel} IMPACT
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {finding.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {finding.findingSummary}
                      </p>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>AI Recommended Playbook:</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          {finding.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        CATEGORY: {finding.category}
                      </span>
                      <button
                        onClick={() => {
                          if (finding.actionLink === '/insights') {
                            setActiveTab('KNOWLEDGE_GAPS');
                          } else {
                            navigate(finding.actionLink);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                      >
                        <span>{finding.actionLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Customer Intelligence Matrix Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  What PulseFlow AI Knows About Every Active Prospect
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time extraction of Buying Signals, Objections, Sentiment, and Next Best Action
                </p>
              </div>
              <button
                onClick={() => setActiveTab('DEAL_PLAYBOOKS')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Expand Full 5-Factor Score Breakdowns</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-200 mt-2">
              {filteredLeadsWithFindings.map((lead) => {
                const contact = contacts.find((c) => c.id === lead.contactId);
                const conv = conversations.find((c) => c.id === lead.conversationId);
                return (
                  <div
                    key={lead.id}
                    className="py-4 flex flex-col lg:flex-row lg:items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors px-2 rounded-lg"
                  >
                    <div className="space-y-1.5 lg:w-64 shrink-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="text-sm font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {contact?.name}
                        </Link>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                            lead.leadType === 'HOT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lead.leadType === 'WARM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {lead.leadType} · {lead.leadScore}/100
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {contact?.company} · {contact?.roleTitle || 'Decision Maker'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                        <span className="text-slate-900 font-semibold">{lead.budget}</span>
                        <span>·</span>
                        <span>{conv?.language || contact?.preferredLanguage || 'English'}</span>
                      </div>
                    </div>

                    {/* Buying Signals & Objections */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-lg p-3">
                        <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Detected Buying Signals ({lead.buyingSignals.length})</span>
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

                      <div className="bg-amber-50/50 border border-amber-200/70 rounded-lg p-3">
                        <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            Detected Objections / Risks ({lead.detectedObjections.length})
                          </span>
                        </div>
                        {lead.detectedObjections.length > 0 ? (
                          <ul className="space-y-1 text-xs text-slate-700">
                            {lead.detectedObjections.map((obj, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            No active objections detected — deal won / clear path.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Next Best Action */}
                    <div className="lg:w-72 shrink-0 bg-slate-900 text-white rounded-lg p-3.5 flex flex-col justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Next Best Action</span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1 leading-snug">
                          {lead.recommendedNextAction}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <Link
                          to={`/inbox?convId=${lead.conversationId}`}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          Reply in WhatsApp →
                        </Link>
                        <Link
                          to={`/leads/${lead.id}`}
                          className="text-[11px] text-slate-400 hover:text-white"
                        >
                          Full Rubric
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAD-BY-LEAD 5-FACTOR RUBRIC & PLAYBOOKS */}
      {activeTab === 'DEAL_PLAYBOOKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLeadsWithFindings.map((lead) => {
            const contact = contacts.find((c) => c.id === lead.contactId);
            const sb = lead.scoreBreakdown;
            return (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
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
                      Service: <strong className="text-slate-900">{lead.interestedService}</strong> ·
                      Budget: <strong className="font-mono text-emerald-700">{lead.budget}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                      {lead.leadScore}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-emerald-700">
                      {lead.customerSentiment}
                    </div>
                  </div>
                </div>

                {/* 5-Factor Score Rubric Bars */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    5-Factor AI Qualification Rubric Breakdown
                  </div>
                  {[
                    { label: 'Budget Readiness', val: sb.budgetReadiness, max: 25 },
                    { label: 'Requirement Specificity', val: sb.needSpecificity, max: 25 },
                    { label: 'Timeline Urgency', val: sb.timelineUrgency, max: 20 },
                    { label: 'Decision Authority', val: sb.decisionAuthority, max: 15 },
                    { label: 'WhatsApp Engagement Depth', val: sb.engagementDepth, max: 15 }
                  ].map((item) => {
                    const pct = Math.round((item.val / item.max) * 100);
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-mono font-semibold text-slate-900 tabular-nums">
                            {item.val} / {item.max} pts ({pct}%)
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

                {/* AI Executive Summary & Best Time to Contact */}
                <div className="text-xs text-slate-700 space-y-2">
                  <div>
                    <span className="font-bold text-slate-900">AI Context Summary: </span>
                    <span>{lead.aiSummary}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>
                      Best Contact Window:{' '}
                      <strong className="text-slate-800">
                        {contact?.bestTimeToContact || '10:00 AM – 6:00 PM IST'}
                      </strong>
                    </span>
                    <Link
                      to={`/leads/${lead.id}`}
                      className="font-semibold text-slate-900 hover:text-emerald-700"
                    >
                      Open Lead Record →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: LANGUAGE & REGIONAL INTELLIGENCE */}
      {activeTab === 'LANGUAGE_INSIGHTS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                lang: 'Manglish (Malayalam + English)',
                share: '38% of Inbound Chats',
                avgScore: '86 / 100 Avg Lead Score',
                conversionLift: '+38% faster budget disclosure',
                insight:
                  'Business owners in Kochi, Calicut, and Thrissur prefer typing conversational Manglish on WhatsApp ("Website undakkanam. Rate ethra aanu?"). When PulseFlow AI mirrors Manglish naturally, prospects share their exact budget within 2 messages.',
                samplePhrases: [
                  '"Website undakkanam. Rate ethra aanu?" → Pricing Inquiry',
                  '"Next month start cheyyan pattuo?" → High Timeline Urgency',
                  '"Payment gateway ulppeduthi cheyyumo?" → Technical Scope Signal'
                ]
              },
              {
                lang: 'Malayalam (മലയാളം Script)',
                share: '19% of Inbound Chats',
                avgScore: '71 / 100 Avg Lead Score',
                conversionLift: '+44% higher trust with local clinics & retail',
                insight:
                  'Healthcare clinics, educational institutes, and regional retail brands frequently inquire in Malayalam script. Responding in clear, respectful Malayalam with INR package pricing builds immediate executive rapport.',
                samplePhrases: [
                  '"സോഷ്യൽ മീഡിയ മാർക്കറ്റിംഗ് പാക്കേജുകൾ ഉണ്ടോ?" → Service Inquiry',
                  '"കൂടുതൽ വിവരങ്ങൾ അയച്ചുതരാമോ?" → Brochure / Case Study Request'
                ]
              },
              {
                lang: 'English (Enterprise & B2B)',
                share: '43% of Inbound Chats',
                avgScore: '89 / 100 Avg Lead Score',
                conversionLift: 'Highest average ticket size (₹3.2L – ₹8.5L)',
                insight:
                  'Enterprise IT directors and FinTech founders inquire in formal English, often attaching RFP PDFs or asking for SLA and SAP/Flutter architecture calls. AI automatically flags complex multi-branch RFPs for Human Handoff.',
                samplePhrases: [
                  '"Can I speak to your senior solutions manager urgently?" → Human Handoff',
                  '"Can we schedule a call at 4:30 PM to finalize milestones?" → Closing Signal'
                ]
              }
            ].map((card) => (
              <div
                key={card.lang}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 font-mono text-[11px] font-bold">
                      {card.share}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-700">
                      {card.avgScore}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{card.lang}</h3>
                  <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3 py-1.5 rounded-lg">
                    Finding: {card.conversionLift}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.insight}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700">
                    High-Signal Phrases Recognized by AI:
                  </div>
                  {card.samplePhrases.map((p, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-mono bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded text-slate-700"
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE GAP DETECTOR */}
      {activeTab === 'KNOWLEDGE_GAPS' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  AI Self-Improvement Queue: {unresolvedGapsCount} Unresolved Knowledge Base Gaps
                </span>
              </div>
              <p className="text-xs text-amber-800">
                When customers ask questions on WhatsApp that have low coverage in your Knowledge
                Base, PulseFlow clusters them below and drafts a recommended Knowledge Base entry for
                1-click approval.
              </p>
            </div>
            <Link
              to="/knowledge-base"
              className="px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 hover:bg-amber-100 shrink-0"
            >
              View All {knowledgeBase.length} Active Articles →
            </Link>
          </div>

          <div className="space-y-4">
            {knowledgeGaps.map((gap) => (
              <div
                key={gap.id}
                className={`bg-white border rounded-xl p-5 shadow-2xs transition-all ${
                  gap.resolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-md bg-slate-100 text-slate-800">
                        Asked {gap.occurrences} times on WhatsApp
                      </span>
                      <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                        Language: {gap.language}
                      </span>
                      <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        Prior AI Confidence: {Math.round(gap.avgConfidence * 100)}%
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">
                      Customer Question Pattern: <span className="text-emerald-800">"{gap.questionAsked}"</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          AI Drafted Knowledge Article ({gap.suggestedCategory}): {gap.suggestedTitle}
                        </span>
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
                        <span>Published to AI Knowledge Base</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => resolveKnowledgeGapToArticle(gap.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>1-Click Approve & Train AI</span>
                      </button>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      Auto-syncs with AI Reply Engine
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

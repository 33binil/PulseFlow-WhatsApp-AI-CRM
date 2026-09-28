import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowLeft,
  MessageSquare,
  CalendarPlus,
  Trash2,
  X,
  TrendingUp,
  ShieldAlert,
  Zap,
  LayoutGrid,
  List,
  Sparkles
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const LeadsListPage = () => {
  const {
    leads,
    contacts,
    teamMembers,
    currentUser,
    addContact,
    addLead,
    updateLead,
    deleteLead
  } = useCRM();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('TABLE');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newService, setNewService] = useState('Web Development (E-Commerce)');
  const [newBudget, setNewBudget] = useState('₹1,00,000');
  const [newTimeline, setNewTimeline] = useState('Next month');
  const [newScore, setNewScore] = useState(85);
  const [newType, setNewType] = useState('HOT');

  const enrichedLeads = useMemo(() => {
    return leads
      .map((lead) => {
        const contact = contacts.find((c) => c.id === lead.contactId);
        const agent = teamMembers.find((t) => t.id === lead.assignedAgentId);
        return { lead, contact, agent };
      })
      .filter(({ lead, contact }) => {
        if (typeFilter !== 'ALL' && lead.leadType !== typeFilter) return false;
        if (statusFilter !== 'ALL' && lead.leadStatus !== statusFilter) return false;
        if (agentFilter !== 'ALL' && lead.assignedAgentId !== agentFilter) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            contact?.name.toLowerCase().includes(q) ||
            contact?.phone.toLowerCase().includes(q) ||
            lead.interestedService.toLowerCase().includes(q) ||
            lead.aiSummary.toLowerCase().includes(q) ||
            lead.buyingSignals.some((s) => s.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.lead.leadScore - a.lead.leadScore;
        return b.lead.createdAt.localeCompare(a.lead.createdAt);
      });
  }, [leads, contacts, teamMembers, typeFilter, statusFilter, agentFilter, search, sortBy]);

  const totalPipelineValue = useMemo(
    () => enrichedLeads.reduce((sum, { lead }) => sum + (lead.estimatedValueInr || 0), 0),
    [enrichedLeads]
  );

  const totalBuyingSignals = useMemo(
    () => enrichedLeads.reduce((sum, { lead }) => sum + (lead.buyingSignals?.length || 0), 0),
    [enrichedLeads]
  );

  const totalPages = Math.max(1, Math.ceil(enrichedLeads.length / pageSize));
  const paginatedLeads = enrichedLeads.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateLead = (e) => {
    e.preventDefault();
    const createdContact = addContact({
      name: newName,
      phone: newPhone,
      email: newEmail || 'prospect@example.com',
      company: newCompany || 'Direct Inquiry',
      location: 'Kochi, Kerala',
      source: 'WhatsApp Inbound',
      tags: [newType, newService]
    });
    addLead({
      contactId: createdContact.id,
      conversationId: 'conv-1',
      leadStatus: 'NEW',
      leadType: newType,
      leadScore: newScore,
      interestedService: newService,
      budget: newBudget,
      timeline: newTimeline,
      requirements: [newService, `Budget: ${newBudget}`],
      source: 'WhatsApp Inbound',
      assignedAgentId: currentUser.id,
      aiSummary: `New lead created for ${newName} inquiring about ${newService} with budget ${newBudget}.`,
      purchaseIntent: newScore >= 75
    });
    setShowCreateModal(false);
    setNewName('');
    setNewPhone('+91 ');
  };

  const formatLakhs = (val) => `₹${(val / 100000).toFixed(2)}L`;

  const boardStages = [
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL',
    'NEGOTIATION',
    'WON'
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
            AI LEAD QUALIFICATION, SCORING & PIPELINE INTELLIGENCE
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Lead Pipeline & Findings ({enrichedLeads.length})
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle: Table vs Kanban Board */}
          <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('BOARD')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'BOARD'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pipeline Board</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Lead</span>
          </button>
        </div>
      </div>

      {/* Lead Intelligence Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500">Filtered Pipeline Value</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatLakhs(totalPipelineValue)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Across {enrichedLeads.length} qualified records
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500">Average AI Lead Score</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {enrichedLeads.length > 0
              ? Math.round(
                  enrichedLeads.reduce((s, i) => s + i.lead.leadScore, 0) / enrichedLeads.length
                )
              : 0}{' '}
            / 100
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">5-Factor weighted rubric</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500">Extracted Buying Signals</div>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
            {totalBuyingSignals} Signals
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Budget, scope & urgency verified</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-xs text-slate-500">AI Deal Playbooks</div>
          <Link
            to="/insights"
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 mt-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open AI Knows & Findings Hub →</span>
          </Link>
          <div className="text-[11px] text-slate-500">Counter-objection scripts ready</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Lead Type Filter Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
            {['ALL', 'HOT', 'WARM', 'COLD', 'UNQUALIFIED', 'EXISTING_CUSTOMER'].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    typeFilter === type
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'EXISTING_CUSTOMER' ? 'EXISTING' : type}
                </button>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL">PROPOSAL</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>

            <select
              value={agentFilter}
              onChange={(e) => {
                setAgentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">All Assigned Agents</option>
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSortBy(sortBy === 'score' ? 'created' : 'score')}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {sortBy === 'score' ? 'Lead Score' : 'Created Date'}</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search leads, signals, service..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {/* TABLE VIEW */}
        {viewMode === 'TABLE' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 font-semibold">Customer & Company</th>
                    <th className="py-2.5 px-3 font-semibold">AI Score & Sentiment</th>
                    <th className="py-2.5 px-3 font-semibold">Pipeline Stage</th>
                    <th className="py-2.5 px-3 font-semibold">Service & Key Buying Signal</th>
                    <th className="py-2.5 px-3 font-semibold">Budget & Timeline</th>
                    <th className="py-2.5 px-3 font-semibold">Assigned Agent</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map(({ lead, contact }) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {contact?.name}
                        </Link>
                        <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                          {contact?.phone} · {contact?.company}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-mono tabular-nums">
                          <span
                            className={`font-bold ${
                              lead.leadScore >= 81
                                ? 'text-emerald-700'
                                : lead.leadScore >= 61
                                ? 'text-indigo-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {lead.leadScore}/100
                          </span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-300">
                            ·
                          </span>
                          <span className="font-sans font-bold text-slate-800">
                            {lead.leadType}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {lead.customerSentiment}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={lead.leadStatus}
                          onChange={(e) =>
                            updateLead(lead.id, { leadStatus: e.target.value })
                          }
                          className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-semibold"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="PROPOSAL">PROPOSAL</option>
                          <option value="NEGOTIATION">NEGOTIATION</option>
                          <option value="WON">WON</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3 text-slate-800 max-w-sm">
                        <div className="font-semibold text-slate-900">{lead.interestedService}</div>
                        {lead.buyingSignals[0] && (
                          <div className="text-[11px] text-emerald-800 flex items-center gap-1 mt-0.5 truncate">
                            <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{lead.buyingSignals[0]}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          Next: {lead.recommendedNextAction}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">
                          {lead.budget}
                        </div>
                        <div className="text-[11px] text-slate-500">{lead.timeline}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={lead.assignedAgentId}
                          onChange={(e) =>
                            updateLead(lead.id, { assignedAgentId: e.target.value })
                          }
                          className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white"
                        >
                          {teamMembers.map((tm) => (
                            <option key={tm.id} value={tm.id}>
                              {tm.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-1.5">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800"
                        >
                          Dossier
                        </Link>
                        <button
                          onClick={() => navigate(`/inbox?convId=${lead.conversationId}`)}
                          className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          Chat
                        </button>
                        {currentUser.role !== 'AGENT' && (
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-600">
              <div>
                Showing page <span className="font-mono font-semibold">{page}</span> of{' '}
                <span className="font-mono font-semibold">{totalPages}</span> ({enrichedLeads.length}{' '}
                total leads)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          /* PIPELINE STAGE BOARD (KANBAN) VIEW */
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
            {boardStages.map((stage) => {
              const stageItems = enrichedLeads.filter(({ lead }) => lead.leadStatus === stage);
              const stageSum = stageItems.reduce(
                (s, { lead }) => s + (lead.estimatedValueInr || 0),
                0
              );
              return (
                <div
                  key={stage}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5 min-h-[420px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900">
                      {stage} ({stageItems.length})
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 tabular-nums">
                      {formatLakhs(stageSum)}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageItems.map(({ lead, contact }) => (
                      <div
                        key={lead.id}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs space-y-2 hover:border-slate-400 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-emerald-700"
                          >
                            {contact?.name}
                          </Link>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 tabular-nums">
                            {lead.leadScore}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {lead.interestedService}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-slate-900">
                          {lead.budget}
                        </div>
                        {lead.buyingSignals[0] && (
                          <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded leading-snug">
                            • {lead.buyingSignals[0]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Create New Sales Lead</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Siddharth Menon"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Organization"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interested Service</label>
                <input
                  type="text"
                  required
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget</label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timeline</label>
                  <input
                    type="text"
                    value={newTimeline}
                    onChange={(e) => setNewTimeline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Lead Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="HOT">HOT</option>
                    <option value="WARM">WARM</option>
                    <option value="COLD">COLD</option>
                    <option value="UNQUALIFIED">UNQUALIFIED</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    leads,
    contacts,
    followUps,
    messagesByConv,
    updateLead,
    addLeadNote,
    addFollowUp
  } = useCRM();

  const lead = leads.find((l) => l.id === id) || leads[0];
  const contact = contacts.find((c) => c.id === lead?.contactId);
  const leadFollowUps = followUps.filter((f) => f.leadId === lead?.id);
  const convMessages = lead ? messagesByConv[lead.conversationId] || [] : [];

  const [noteText, setNoteText] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [fuDate, setFuDate] = useState('2026-09-29');
  const [fuTime, setFuTime] = useState('14:00');
  const [fuNote, setFuNote] = useState('');

  if (!lead) {
    return <div className="p-8 text-xs text-slate-500">Lead record not found.</div>;
  }

  const sb = lead.scoreBreakdown;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/leads"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Lead Pipeline</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {contact?.name} — {lead.interestedService}
          </h1>
          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
            <span className="font-mono font-semibold text-slate-800">{contact?.phone}</span>
            <span aria-hidden="true">·</span>
            <span>
              {contact?.company} ({contact?.roleTitle || 'Decision Maker'})
            </span>
            <span aria-hidden="true">·</span>
            <span>Source: {lead.source}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">
              Best Time: {contact?.bestTimeToContact || '10:00 AM – 6:00 PM IST'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/inbox?convId=${lead.conversationId}`)}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp Conversation</span>
          </button>
        </div>
      </div>

      {/* Executive Next Best Action Banner */}
      <div className="bg-[#0B1120] text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>AI RECOMMENDED NEXT BEST ACTION PLAYBOOK · {lead.customerSentiment}</span>
          </div>
          <p className="text-sm font-semibold text-white">{lead.recommendedNextAction}</p>
        </div>
        <button
          onClick={() => navigate(`/inbox?convId=${lead.conversationId}`)}
          className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-emerald-50 shrink-0 cursor-pointer"
        >
          Execute in WhatsApp Inbox →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Qualification Dossier, 5-Factor Rubric, Buying Signals & Transcript */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  AI Lead Qualification & 5-Factor Score Rubric
                </h2>
                <p className="text-xs text-slate-500">
                  Updated {lead.updatedAt} · Last interaction {lead.lastInteractionAt}
                </p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-2xl font-bold text-emerald-700">{lead.leadScore} / 100</div>
                <div className="text-xs font-semibold text-slate-700">{lead.leadType}</div>
              </div>
            </div>

            {/* 5-Factor Score Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {[
                { label: 'Budget Readiness', val: sb.budgetReadiness, max: 25 },
                { label: 'Scope Specificity', val: sb.needSpecificity, max: 25 },
                { label: 'Timeline Urgency', val: sb.timelineUrgency, max: 20 },
                { label: 'Decision Authority', val: sb.decisionAuthority, max: 15 },
                { label: 'Chat Engagement', val: sb.engagementDepth, max: 15 }
              ].map((item) => {
                const pct = Math.round((item.val / item.max) * 100);
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="text-[11px] font-medium text-slate-600">{item.label}</div>
                    <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                      {item.val} <span className="text-xs font-normal text-slate-400">/ {item.max}</span>
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

            {/* Buying Signals & Objections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Extracted Buying Signals ({lead.buyingSignals.length})</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {lead.buyingSignals.map((sig, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Detected Objections / Deal Risks ({lead.detectedObjections.length})</span>
                </div>
                {lead.detectedObjections.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {lead.detectedObjections.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No active objections detected for this lead.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1">
                AI Conversation Summary
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed">
                {lead.aiSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                <select
                  value={lead.leadStatus}
                  onChange={(e) =>
                    updateLead(lead.id, { leadStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget</label>
                <input
                  type="text"
                  value={lead.budget}
                  onChange={(e) => updateLead(lead.id, { budget: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Timeline</label>
                <input
                  type="text"
                  value={lead.timeline}
                  onChange={(e) => updateLead(lead.id, { timeline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Extracted Requirements */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Extracted Customer Technical Requirements
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside mb-3">
                {lead.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reqInput.trim()) return;
                  updateLead(lead.id, {
                    requirements: [...lead.requirements, reqInput.trim()]
                  });
                  setReqInput('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  placeholder="Add extracted requirement..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                >
                  Add Requirement
                </button>
              </form>
            </div>
          </div>

          {/* Linked WhatsApp Conversation Transcript */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                WhatsApp Conversation History ({convMessages.length} messages)
              </h3>
              <Link
                to={`/inbox?convId=${lead.conversationId}`}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Reply in Live Inbox →
              </Link>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {convMessages.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800">
                      {m.senderName} ({m.senderType})
                    </span>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>
                  <p className="text-slate-700">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Follow-ups & Notes */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Schedule Follow-up</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFollowUp({
                  leadId: lead.id,
                  contactId: lead.contactId,
                  assignedUserId: lead.assignedAgentId,
                  date: fuDate,
                  time: fuTime,
                  note: fuNote || 'Scheduled follow-up call',
                  status: 'PENDING'
                });
                setFuNote('');
              }}
              className="space-y-2.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={fuDate}
                  onChange={(e) => setFuDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  required
                />
                <input
                  type="time"
                  value={fuTime}
                  onChange={(e) => setFuTime(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <input
                type="text"
                value={fuNote}
                onChange={(e) => setFuNote(e.target.value)}
                placeholder="Call agenda or WhatsApp follow-up note..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Add Follow-up</span>
              </button>
            </form>

            <div className="divide-y divide-slate-100 pt-2">
              {leadFollowUps.map((f) => (
                <div key={f.id} className="py-2 text-xs">
                  <div className="font-mono font-semibold text-slate-900">
                    {f.date} at {f.time} · {f.status}
                  </div>
                  <div className="text-slate-600 mt-0.5">{f.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Lead Notes</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noteText.trim()) return;
                addLeadNote(lead.id, noteText);
                setNoteText('');
              }}
              className="space-y-2 text-xs"
            >
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add qualification note..."
                className="w-full p-2.5 border border-slate-200 rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg"
              >
                Save Note
              </button>
            </form>
            <div className="space-y-2">
              {lead.notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="text-[11px] text-slate-500">
                    {n.authorName} · {n.createdAt}
                  </div>
                  <p className="text-slate-800 mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

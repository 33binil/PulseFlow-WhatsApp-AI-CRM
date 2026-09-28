import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Target,
  Users,
  CalendarClock,
  BarChart3,
  UserCog,
  Bot,
  BookOpen,
  Smartphone,
  Building2,
  UserCircle,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  FileCode2,
  Check,
  Sparkles,
  Search,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { UserRole } from '../types/crm';

export const CRMWorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    switchRole,
    conversations,
    leads,
    contacts,
    followUps,
    knowledgeGaps,
    strategicFindings,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    toasts,
    dismissToast
  } = useCRM();

  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const unreadChatsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const handoffCount = conversations.filter((c) => c.needsHumanAttention).length;
  const pendingFollowUpsCount = followUps.filter(
    (f) => f.status === 'PENDING' || f.status === 'OVERDUE'
  ).length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const activeFindingsCount =
    strategicFindings.length + knowledgeGaps.filter((g) => !g.resolved).length;

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      label: 'AI Knows & Findings',
      path: '/insights',
      icon: Sparkles,
      counter: activeFindingsCount,
      highlight: true
    },
    {
      label: 'WhatsApp Inbox',
      path: '/inbox',
      icon: MessageSquare,
      counter: unreadChatsCount > 0 ? unreadChatsCount : undefined,
      alert: handoffCount > 0
    },
    { label: 'Conversations', path: '/conversations', icon: MessagesSquare },
    {
      label: 'Leads Pipeline',
      path: '/leads',
      icon: Target,
      counter: leads.filter((l) => l.leadType === 'HOT').length
    },
    { label: 'Contacts', path: '/contacts', icon: Users },
    {
      label: 'Follow-ups',
      path: '/follow-ups',
      icon: CalendarClock,
      counter: pendingFollowUpsCount > 0 ? pendingFollowUpsCount : undefined
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'MANAGER'] as UserRole[]
    }
  ];

  const managementNavItems = [
    {
      label: 'Team Members',
      path: '/team',
      icon: UserCog,
      roles: ['ADMIN', 'MANAGER'] as UserRole[]
    },
    {
      label: 'AI Settings',
      path: '/ai-settings',
      icon: Bot,
      roles: ['ADMIN'] as UserRole[]
    },
    {
      label: 'Knowledge Base',
      path: '/knowledge-base',
      icon: BookOpen,
      roles: ['ADMIN', 'MANAGER', 'AGENT'] as UserRole[]
    },
    {
      label: 'WhatsApp Settings',
      path: '/whatsapp-settings',
      icon: Smartphone,
      roles: ['ADMIN'] as UserRole[]
    },
    {
      label: 'Company Settings',
      path: '/company-settings',
      icon: Building2,
      roles: ['ADMIN'] as UserRole[]
    },
    { label: 'Profile', path: '/profile', icon: UserCircle },
    { label: 'General Settings', path: '/settings', icon: Settings },
    { label: 'Phase 1 Blueprint', path: '/architecture', icon: FileCode2 }
  ];

  const isPathActive = (path: string) => {
    if (path === '/leads' && location.pathname.startsWith('/leads')) return true;
    if (path === '/contacts' && location.pathname.startsWith('/contacts')) return true;
    return location.pathname === path;
  };

  const quickSearchResults = useMemo(() => {
    const q = quickQuery.toLowerCase().trim();
    if (!q) {
      return {
        leads: leads.slice(0, 3),
        findings: strategicFindings.slice(0, 3)
      };
    }
    return {
      leads: leads.filter((l) => {
        const c = contacts.find((cnt) => cnt.id === l.contactId);
        return (
          c?.name.toLowerCase().includes(q) ||
          c?.company.toLowerCase().includes(q) ||
          l.interestedService.toLowerCase().includes(q) ||
          l.aiSummary.toLowerCase().includes(q) ||
          l.buyingSignals.some((s) => s.toLowerCase().includes(q))
        );
      }),
      findings: strategicFindings.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.findingSummary.toLowerCase().includes(q) ||
          f.recommendation.toLowerCase().includes(q)
      )
    };
  }, [quickQuery, leads, contacts, strategicFindings]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-6 h-14 flex items-center justify-between sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/dashboard"
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          PulseFlow CRM
        </Link>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <Link
            to="/dashboard"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/dashboard')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/insights"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/insights')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
            }`}
          >
            AI Knows & Findings
          </Link>
          <Link
            to="/inbox"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/inbox')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
            }`}
          >
            WhatsApp Inbox
          </Link>
          <Link
            to="/leads"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/leads')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
            }`}
          >
            Leads
          </Link>
          <Link
            to="/knowledge-base"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/knowledge-base')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
            }`}
          >
            Knowledge Base
          </Link>
        </nav>

        {/* Zone 3: Quick Intelligence Search + Role Switcher + Notifications */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickSearchOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            title="Search Leads, WhatsApp Chats & AI Findings"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Ask / Search Findings...</span>
          </button>

          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            {(['ADMIN', 'MANAGER', 'AGENT'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  currentUser.role === role
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Switch demo role to ${role}`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Notification Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">
                    System & Lead Notifications ({unreadNotifsCount} Unread)
                  </span>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotifOpen(false);
                        navigate(n.linkTo);
                      }}
                      className={`py-2.5 px-2.5 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors ${
                        !n.isRead ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span
                          className={`font-semibold ${
                            n.type === 'HUMAN_ATTENTION' || n.type === 'AI_ESCALATION'
                              ? 'text-rose-700'
                              : n.type === 'HOT_LEAD'
                              ? 'text-emerald-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="font-mono">{n.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Executive Obsidian Slate Sidebar Navigation */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-64 shadow-2xl' : 'hidden'
          } lg:static lg:block lg:w-64 bg-[#0B1120] text-slate-300 border-r border-slate-800 shrink-0 flex flex-col justify-between p-4`}
        >
          <div className="space-y-6">
            {/* Active User Context Summary */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-1">{currentUser.email}</div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>WHATSAPP API:</span>
                <span className="text-emerald-400 font-semibold">● ONLINE (99.9%)</span>
              </div>
            </div>

            {/* Main CRM Links */}
            <div>
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-2.5 mb-2">
                Core CRM & AI Intelligence
              </div>
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const allowed = !item.roles || item.roles.includes(currentUser.role);
                  if (!allowed) return null;
                  const Icon = item.icon;
                  const active = isPathActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : item.highlight
                          ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/25'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active
                              ? 'text-white'
                              : item.highlight
                              ? 'text-indigo-400'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                        {item.alert && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500"
                            title="Human Attention Required"
                          />
                        )}
                        {item.counter !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              active
                                ? 'bg-black/25 text-white'
                                : item.highlight
                                ? 'bg-indigo-500/30 text-indigo-200'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.counter}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Management & Settings Links */}
            <div>
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-2.5 mb-2">
                Management & Configuration
              </div>
              <div className="space-y-1">
                {managementNavItems.map((item) => {
                  const allowed = !item.roles || item.roles.includes(currentUser.role);
                  if (!allowed) return null;
                  const Icon = item.icon;
                  const active = isPathActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Auth Link */}
          <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Auth Pages / Switch User</span>
            </Link>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>

      {/* Quick Intelligence Search Modal */}
      {quickSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search leads, buying signals, objections, Manglish chats, or AI findings..."
                className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none"
              />
              <button
                onClick={() => setQuickSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-5">
              {/* Strategic Findings Matches */}
              <div>
                <div className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-2">
                  AI Strategic Findings ({quickSearchResults.findings.length})
                </div>
                <div className="space-y-2">
                  {quickSearchResults.findings.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        setQuickSearchOpen(false);
                        navigate('/insights');
                      }}
                      className="p-3 rounded-lg border border-slate-200 hover:border-slate-900 cursor-pointer transition-colors bg-slate-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{f.title}</span>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                          {f.metricBadge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{f.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Matches */}
              <div>
                <div className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-2">
                  Matching Leads & What AI Knows ({quickSearchResults.leads.length})
                </div>
                <div className="space-y-2">
                  {quickSearchResults.leads.map((l) => {
                    const c = contacts.find((cnt) => cnt.id === l.contactId);
                    return (
                      <div
                        key={l.id}
                        onClick={() => {
                          setQuickSearchOpen(false);
                          navigate(`/leads/${l.id}`);
                        }}
                        className="p-3 rounded-lg border border-slate-200 hover:border-slate-900 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {c?.name} · {c?.company}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            Score {l.leadScore}/100 · {l.budget}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Next Action: {l.recommendedNextAction}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Click any result to jump directly to its record or playbook</span>
              <Link
                to="/insights"
                onClick={() => setQuickSearchOpen(false)}
                className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Open Full AI Findings Hub</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto bg-slate-900 text-white border border-slate-800 rounded-lg p-3.5 shadow-lg flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold">{t.title}</div>
                  {t.description && (
                    <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {t.description}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-slate-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

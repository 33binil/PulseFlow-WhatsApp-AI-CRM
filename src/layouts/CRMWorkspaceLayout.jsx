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
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const CRMWorkspaceLayout = ({ children }) => {
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
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const unreadChatsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const handoffCount = conversations.filter((c) => c.needsHumanAttention).length;
  const pendingFollowUpsCount = followUps.filter(
    (f) => f.status === 'PENDING' || f.status === 'OVERDUE'
  ).length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const activeFindingsCount =
    strategicFindings.length + knowledgeGaps.filter((g) => !g.resolved).length;

  // Everyday simple navigation with clear plain-English subtitles
  const primaryNavItems = [
    {
      label: 'Home Summary',
      subtitle: 'Today’s priorities & actions',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'WhatsApp Inbox',
      subtitle: 'Live chats & AI auto-replies',
      path: '/inbox',
      icon: MessageSquare,
      counter: unreadChatsCount > 0 ? `${unreadChatsCount} new` : undefined,
      alert: handoffCount > 0
    },
    {
      label: 'What AI Knows',
      subtitle: 'Customer budgets & findings',
      path: '/insights',
      icon: Sparkles,
      counter: `${activeFindingsCount} insights`,
      highlight: true
    },
    {
      label: 'Sales Leads',
      subtitle: 'Hot, Warm & Cold deals',
      path: '/leads',
      icon: Target,
      counter: `${leads.filter((l) => l.leadType === 'HOT').length} Hot`
    },
    {
      label: 'Follow-up Tasks',
      subtitle: 'Scheduled calls & reminders',
      path: '/follow-ups',
      icon: CalendarClock,
      counter: pendingFollowUpsCount > 0 ? `${pendingFollowUpsCount} due` : undefined
    },
    {
      label: 'Customer Contacts',
      subtitle: 'Phonebook & chat history',
      path: '/contacts',
      icon: Users
    }
  ];

  // Secondary & Setup pages kept clean and tucked under a clear section
  const setupNavItems = [
    {
      label: 'AI Knowledge Base',
      subtitle: 'Prices & FAQs AI uses',
      path: '/knowledge-base',
      icon: BookOpen,
      roles: ['ADMIN', 'MANAGER', 'AGENT']
    },
    {
      label: 'AI Reply Settings',
      subtitle: 'Tone & language rules',
      path: '/ai-settings',
      icon: Bot,
      roles: ['ADMIN']
    },
    {
      label: 'All Conversations List',
      subtitle: 'Filterable chat log',
      path: '/conversations',
      icon: MessagesSquare
    },
    {
      label: 'Reports & Charts',
      subtitle: 'Conversion & team stats',
      path: '/analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'MANAGER']
    },
    {
      label: 'Team Members',
      subtitle: 'Manage staff & roles',
      path: '/team',
      icon: UserCog,
      roles: ['ADMIN', 'MANAGER']
    },
    {
      label: 'WhatsApp Connection',
      subtitle: 'Phone number & webhook',
      path: '/whatsapp-settings',
      icon: Smartphone,
      roles: ['ADMIN']
    },
    {
      label: 'Company Profile',
      subtitle: 'Business hours & services',
      path: '/company-settings',
      icon: Building2,
      roles: ['ADMIN']
    },
    {
      label: 'My Profile',
      subtitle: 'Account & password',
      path: '/profile',
      icon: UserCircle
    },
    {
      label: 'General Preferences',
      subtitle: 'Notifications & defaults',
      path: '/settings',
      icon: Settings
    },
    {
      label: 'System Blueprint',
      subtitle: 'Phase 1 architecture docs',
      path: '/architecture',
      icon: FileCode2
    }
  ];

  const isPathActive = (path) => {
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
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center justify-between sticky top-0 z-30">
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
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${isPathActive('/dashboard')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
              }`}
          >
            Home
          </Link>
          <Link
            to="/inbox"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${isPathActive('/inbox')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
              }`}
          >
            WhatsApp Inbox
          </Link>
          <Link
            to="/insights"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${isPathActive('/insights')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
              }`}
          >
            What AI Knows
          </Link>
          <Link
            to="/leads"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${isPathActive('/leads')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
              }`}
          >
            Sales Leads
          </Link>
          <Link
            to="/knowledge-base"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${isPathActive('/knowledge-base')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-emerald-600 decoration-2'
                : ''
              }`}
          >
            AI Answers (KB)
          </Link>
        </nav>

        {/* Zone 3: Simple Search + How It Works + Notifications */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickSearchOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Search customers, budgets, or what AI knows"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search Customer or Topic...</span>
          </button>

          <button
            onClick={() => setHelpModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="See how this CRM works in 3 simple steps"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

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
                    Recent Alerts ({unreadNotifsCount} new)
                  </span>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
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
                      className={`py-2.5 px-2.5 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-emerald-50/40' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span
                          className={`font-semibold ${n.type === 'HUMAN_ATTENTION' || n.type === 'AI_ESCALATION'
                              ? 'text-rose-700'
                              : n.type === 'HOT_LEAD'
                                ? 'text-emerald-700'
                                : 'text-slate-800'
                            }`}
                        >
                          {n.title}
                        </span>
                        <span className="font-mono tabular-nums">{n.createdAt}</span>
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

      <div className="flex-1 flex relative min-h-0 overflow-hidden">
        {/* Clean, Friendly & Self-Explanatory Sidebar Navigation */}
        <aside
          className={`${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-64 shadow-2xl' : 'hidden'
            } lg:static lg:block lg:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4 h-full min-h-0 overflow-y-auto overscroll-contain`}
        >
          <div className="space-y-6">
            {/* Simple Daily Menu */}
            <div>
              <div className="text-xs font-semibold text-slate-400 px-2.5 mb-2">
                Daily Workspace
              </div>
              <div className="space-y-1">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isPathActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${active
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : item.highlight
                            ? 'bg-emerald-50/70 text-slate-900 hover:bg-emerald-100/70'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 mt-0.5 ${active
                              ? 'text-emerald-400'
                              : item.highlight
                                ? 'text-emerald-600'
                                : 'text-slate-500'
                            }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{item.label}</div>
                          <div
                            className={`text-[11px] truncate ${active ? 'text-slate-300' : 'text-slate-500'
                              }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums shrink-0 ml-2">
                        {item.alert && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500"
                            title="Customer waiting for human reply"
                          />
                        )}
                        {item.counter !== undefined && (
                          <span
                            className={`text-[11px] font-semibold ${active ? 'text-emerald-300' : 'text-emerald-700'
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

            {/* Collapsible Setup & Admin Section so Sidebar Stays Simple */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMoreSettings((prev) => !prev)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <span>Setup, AI Training & More</span>
                {showMoreSettings ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Always show AI Knowledge Base & AI Settings, expand the rest on click */}
              <div className="space-y-1 mt-1.5">
                {setupNavItems
                  .filter((_, idx) => showMoreSettings || idx < 3)
                  .map((item) => {
                    const allowed = !item.roles || item.roles.includes(currentUser.role);
                    if (!allowed) return null;
                    const Icon = item.icon;
                    const active = isPathActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${active
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                        <div className="truncate">
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}

                <button
                  type="button"
                  onClick={() => setShowMoreSettings((prev) => !prev)}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {showMoreSettings
                    ? 'Show fewer menu items'
                    : '+ Show Team, Reports & Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* Simple User Card + Role Switcher at Bottom of Sidebar */}
          <div className="pt-4 mt-6 border-t border-slate-200 space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Switch view mode:</div>
              <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-0.5 rounded-lg">
                {['ADMIN', 'MANAGER', 'AGENT'].map((role) => (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={`py-1 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${currentUser.role === role
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 px-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Login Screen</span>
            </Link>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* "How It Works" Simple 3-Step Guide Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  How PulseFlow CRM Works (3 Simple Steps)
                </h2>
                <p className="text-xs text-slate-500">
                  Designed to be simple, automatic, and easy to use every day
                </p>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-emerald-700">
                  Step 1 · Customers message your WhatsApp
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Customers can message in <strong>English</strong>, <strong>Manglish</strong>{' '}
                  (e.g., <em>"Website undakkanam, rate ethra aanu?"</em>), or{' '}
                  <strong>Malayalam</strong>. Our AI replies politely in the same language.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-indigo-700">
                  Step 2 · AI figures out their Budget, Need & Score
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  While chatting, AI automatically notes what service they want, their budget, and
                  how urgent it is. It gives each customer a simple score out of 100 (
                  <strong>Hot Lead</strong> = ready to buy).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-amber-700">
                  Step 3 · You step in only when needed
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  When a customer is ready to close or asks for a human manager, you get an alert.
                  Click <strong>Take Over Chat</strong> in the WhatsApp Inbox to talk to them
                  directly.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setHelpModalOpen(false);
                  navigate('/inbox');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Try WhatsApp Inbox Now
              </button>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Modal */}
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
                placeholder="Type a customer name, budget, service, or question..."
                className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none"
              />
              <button
                onClick={() => setQuickSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-5">
              {/* Customer & Lead Matches */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Matching Customers & What AI Knows ({quickSearchResults.leads.length})
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
                          <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                            {l.leadType} ({l.leadScore}/100) · {l.budget}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Wants: <strong>{l.interestedService}</strong> — Next step:{' '}
                          {l.recommendedNextAction}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Insights Matches */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  AI Insights & Tips ({quickSearchResults.findings.length})
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
                        <span className="text-xs font-mono text-emerald-700 font-semibold">
                          {f.metricBadge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{f.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Click any item to open it directly</span>
              <Link
                to="/insights"
                onClick={() => setQuickSearchOpen(false)}
                className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>See All AI Insights</span>
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
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
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

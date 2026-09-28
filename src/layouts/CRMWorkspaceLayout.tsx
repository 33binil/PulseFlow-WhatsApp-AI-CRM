import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { UserRole } from '../types/crm';

export const CRMWorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    switchRole,
    logout,
    conversations,
    followUps,
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

  const unreadChatsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const handoffCount = conversations.filter((c) => c.needsHumanAttention).length;
  const pendingFollowUpsCount = followUps.filter(
    (f) => f.status === 'PENDING' || f.status === 'OVERDUE'
  ).length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      label: 'WhatsApp Inbox',
      path: '/inbox',
      icon: MessageSquare,
      counter: unreadChatsCount > 0 ? unreadChatsCount : undefined,
      alert: handoffCount > 0
    },
    { label: 'Conversations', path: '/conversations', icon: MessagesSquare },
    { label: 'Leads', path: '/leads', icon: Target },
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
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
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/dashboard') ? 'text-slate-900 font-semibold underline underline-offset-4' : ''
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/inbox"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/inbox') ? 'text-slate-900 font-semibold underline underline-offset-4' : ''
            }`}
          >
            WhatsApp Inbox
          </Link>
          <Link
            to="/leads"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/leads') ? 'text-slate-900 font-semibold underline underline-offset-4' : ''
            }`}
          >
            Leads
          </Link>
          <Link
            to="/follow-ups"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/follow-ups') ? 'text-slate-900 font-semibold underline underline-offset-4' : ''
            }`}
          >
            Follow-ups
          </Link>
          <Link
            to="/knowledge-base"
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              isPathActive('/knowledge-base') ? 'text-slate-900 font-semibold underline underline-offset-4' : ''
            }`}
          >
            Knowledge Base
          </Link>
        </nav>

        {/* Zone 3: Primary actions (Role Switcher + Notifications) */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg">
            {(['ADMIN', 'MANAGER', 'AGENT'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentUser.role === role
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
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
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">
                    System & Lead Notifications ({unreadNotifsCount} Unread)
                  </span>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium"
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
                      className={`py-2.5 px-2 cursor-pointer rounded hover:bg-slate-50 transition-colors ${
                        !n.isRead ? 'bg-slate-50/70' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span
                          className={`font-semibold ${
                            n.type === 'HUMAN_ATTENTION' || n.type === 'AI_ESCALATION'
                              ? 'text-rose-700'
                              : n.type === 'HOT_LEAD'
                              ? 'text-amber-700'
                              : 'text-slate-700'
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
        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-64 shadow-xl' : 'hidden'
          } lg:static lg:block lg:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4`}
        >
          <div className="space-y-6">
            {/* Active User Context Summary */}
            <div className="pb-3 border-b border-slate-200">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-semibold text-emerald-700">{currentUser.role}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{currentUser.email}</span>
              </div>
            </div>

            {/* Main CRM Links */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 px-2.5 mb-1.5">
                Core CRM Operations
              </div>
              <div className="space-y-0.5">
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
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                        {item.alert && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              active ? 'bg-rose-400' : 'bg-rose-600'
                            }`}
                            title="Human Attention Required"
                          />
                        )}
                        {item.counter !== undefined && (
                          <span className={active ? 'text-emerald-300' : 'text-slate-500'}>
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
              <div className="text-[11px] font-semibold text-slate-400 px-2.5 mb-1.5">
                Management & Configuration
              </div>
              <div className="space-y-0.5">
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
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
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
          <div className="pt-4 mt-6 border-t border-slate-200 flex items-center justify-between">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Auth Pages / Switch User</span>
            </Link>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>

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

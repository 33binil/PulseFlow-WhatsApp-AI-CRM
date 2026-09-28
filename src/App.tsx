import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import { CRMWorkspaceLayout } from './layouts/CRMWorkspaceLayout';
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { WhatsAppInboxPage } from './pages/WhatsAppInboxPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { LeadsListPage, LeadDetailsPage } from './pages/LeadsPages';
import { ContactsListPage, ContactDetailsPage } from './pages/ContactsPages';
import { FollowUpsPage, AnalyticsPage } from './pages/FollowUpsPage';
import {
  TeamMembersPage,
  AISettingsPage,
  KnowledgeBasePage,
  WhatsAppSettingsPage,
  CompanySettingsPage,
  ProfileSettingsPage,
  ArchitectureBlueprintPage
} from './pages/ManagementPages';

export default function App() {
  return (
    <CRMProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Main CRM Workspace Pages */}
          <Route
            path="/dashboard"
            element={
              <CRMWorkspaceLayout>
                <DashboardPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/inbox"
            element={
              <CRMWorkspaceLayout>
                <WhatsAppInboxPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/conversations"
            element={
              <CRMWorkspaceLayout>
                <ConversationsPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/leads"
            element={
              <CRMWorkspaceLayout>
                <LeadsListPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <CRMWorkspaceLayout>
                <LeadDetailsPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/contacts"
            element={
              <CRMWorkspaceLayout>
                <ContactsListPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/contacts/:id"
            element={
              <CRMWorkspaceLayout>
                <ContactDetailsPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/follow-ups"
            element={
              <CRMWorkspaceLayout>
                <FollowUpsPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <CRMWorkspaceLayout>
                <AnalyticsPage />
              </CRMWorkspaceLayout>
            }
          />

          {/* Management & Settings Pages */}
          <Route
            path="/team"
            element={
              <CRMWorkspaceLayout>
                <TeamMembersPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/ai-settings"
            element={
              <CRMWorkspaceLayout>
                <AISettingsPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <CRMWorkspaceLayout>
                <KnowledgeBasePage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/whatsapp-settings"
            element={
              <CRMWorkspaceLayout>
                <WhatsAppSettingsPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/company-settings"
            element={
              <CRMWorkspaceLayout>
                <CompanySettingsPage />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <CRMWorkspaceLayout>
                <ProfileSettingsPage mode="profile" />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <CRMWorkspaceLayout>
                <ProfileSettingsPage mode="general" />
              </CRMWorkspaceLayout>
            }
          />
          <Route
            path="/architecture"
            element={
              <CRMWorkspaceLayout>
                <ArchitectureBlueprintPage />
              </CRMWorkspaceLayout>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </CRMProvider>
  );
}

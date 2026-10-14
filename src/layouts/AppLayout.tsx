/**
 * BharatLearn AI App Layout
 * Conforms to Top Bar 3-Zone Contract, Mobile Drawer, and WCAG AA accessibility.
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Brain, Sparkles, Award, Settings, User, Target, Globe, Layers, Shield, Clock, Users, LogIn, LogOut } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { AuthModal } from '../components/AuthModal';
import { ApiService } from '../services/api';
import { useLearnerSession } from '../hooks/useLearnerSession';
import { useOfflineSync } from '../hooks/useOfflineSync';
import type { AppPage } from '../types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onSwitchStudent?: (studentId: string) => void;
}

export function AppLayout({ children, currentPage, onNavigate, onSwitchStudent }: AppLayoutProps) {
  const { profile, languages, updateLanguageAxis } = useLearnerSession();
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOfflineSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const userRes = await ApiService.getAuthMe();
      if (userRes?.user) {
        setAuthUser(userRes.user);
      }
    }
    checkAuth();
  }, []);

  const accessibility = profile?.accessibility;
  const isHighContrast = accessibility?.highContrast;
  const isDyslexiaSpacing = accessibility?.dyslexiaSpacing;

  const navLinks: { id: AppPage; label: string; labelNative: string }[] = [
    { id: 'dashboard', label: 'Dashboard', labelNative: 'ଡ୍ୟାସବୋର୍ଡ' },
    { id: 'study_session', label: 'Study Focus', labelNative: 'ଅଧ୍ୟୟନ' },
    { id: 'subjects', label: 'Subjects', labelNative: 'ବିଷୟସମୂହ' },
    { id: 'companion', label: 'Companion', labelNative: 'ଏଆଇ ସାଥୀ' },
    { id: 'progress', label: 'Progress', labelNative: 'ଅଗ୍ରଗତି' },
    { id: 'parent_dashboard', label: 'Parent Portal', labelNative: 'ଅଭିଭାବକ' },
    { id: 'settings', label: 'Settings', labelNative: 'ସେଟିଂସ୍' },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isHighContrast
          ? 'bg-black text-white'
          : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100'
      } ${isDyslexiaSpacing ? 'lang-odia' : ''}`}
    >
      {/* Top Navigation Bar: Conforms strictly to 3-Zone Top Bar Contract */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          isHighContrast
            ? 'bg-black border-zinc-700'
            : 'bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-zinc-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('welcome')}
              className="text-lg font-bold tracking-tight text-teal-700 dark:text-teal-400 whitespace-nowrap shrink-0 hover:opacity-90 transition cursor-pointer flex items-center gap-2"
            >
              <img src="/icons/logo.svg" alt="" className="w-7 h-7 shrink-0" aria-hidden="true" />
              <span>BharatLearn AI</span>
            </button>
          </div>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                    isActive
                      ? 'text-teal-700 dark:text-teal-300 font-bold border-b-2 border-teal-600'
                      : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <span>{link.labelNative}</span>
                  <span className="text-[11px] font-normal text-zinc-400 ml-1">({link.label})</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action & status zone */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('parent_dashboard')}
              className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentPage === 'parent_dashboard'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ଅଭିଭାବକ (Parent)</span>
            </button>

            {/* Identity & Verified Session Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                authUser
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
              }`}
              title="Verified Identity & Account Settings"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {authUser
                  ? `${authUser.role === 'PARENT' ? 'ଅଭିଭାବକ: ' : 'ଛାତ୍ର: '}${authUser.displayName.split(' ')[0]}`
                  : 'ଲଗଇନ୍ (Sign In)'}
              </span>
            </button>

            <OfflineIndicator
              isOnline={isOnline}
              pendingCount={pendingCount}
              isSyncing={isSyncing}
              onTriggerSync={triggerSync}
            />

            <LanguageSelector
              config={languages}
              onUpdateAxis={updateLanguageAxis}
            />

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-teal-600 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 z-30 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">
            ମୁଖ୍ୟ ପୃଷ୍ଠାଗୁଡ଼ିକ (Navigation)
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'welcome' as const, label: 'ମୁଖ୍ୟ ପୃଷ୍ଠା (Welcome)' },
              { id: 'dashboard' as const, label: 'ଡ୍ୟାସବୋର୍ଡ (Dashboard)' },
              { id: 'study_session' as const, label: 'ଅଧ୍ୟୟନ (Study Focus)' },
              { id: 'parent_dashboard' as const, label: 'ଅଭିଭାବକ (Parent Portal)' },
              { id: 'onboarding' as const, label: 'ଅନ୍‌ବୋର୍ଡିଂ (Onboarding)' },
              { id: 'category_select' as const, label: '୮ ଟି ବର୍ଗ (8 Cohorts)' },
              { id: 'subjects' as const, label: 'ବିଷୟସମୂହ (Subjects)' },
              { id: 'companion' as const, label: 'ଏଆଇ ସାଥୀ (Companion)' },
              { id: 'language_setup' as const, label: '୨୨ ଭାଷା (Languages)' },
              { id: 'goals_setup' as const, label: 'ଲକ୍ଷ୍ୟ (Goals)' },
              { id: 'progress' as const, label: 'ଦକ୍ଷତା (Progress)' },
              { id: 'settings' as const, label: 'ସେଟିଂସ୍ (Settings)' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 text-xs text-left rounded-xl transition ${
                  currentPage === item.id
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Header Ribbon: Active Pilot & Category Focus */}
      <div className="bg-teal-900 text-teal-100 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              <strong>ସକ୍ରିୟ ଶିକ୍ଷାର୍ଥୀ:</strong> {profile?.fullName || 'ସୁଭଶ୍ରୀ ମହାନ୍ତି'} ({profile?.assignedClass || 'Class 10-A'}) • {profile?.category || 'SECONDARY'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-teal-200 shrink-0">
            <button
              onClick={() => onSwitchStudent?.(profile?.id === 'learner_child_02' ? 'learner_pilot_odia_01' : 'learner_child_02')}
              className="hover:text-amber-300 underline underline-offset-2 transition flex items-center gap-1 font-semibold text-amber-200"
            >
              <Users className="w-3 h-3" />
              <span>{profile?.id === 'learner_child_02' ? 'ସୁଭଶ୍ରୀଙ୍କୁ ବଦଳାନ୍ତୁ (ଦଶମ ଶ୍ରେଣୀ)' : 'ସୌମ୍ୟଙ୍କୁ ବଦଳାନ୍ତୁ (ଚତୁର୍ଥ ଶ୍ରେଣୀ)'}</span>
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('category_select')}
              className="hover:text-amber-300 underline underline-offset-2 transition"
            >
              ବର୍ଗ ବଦଳାନ୍ତୁ
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('language_setup')}
              className="hover:text-amber-300 underline underline-offset-2 transition"
            >
              ୨୨ଟି ଭାଷା
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © 2026 BharatLearn AI • NIRMIT · NEXTECH 2.0 Agentic AI Hackathon
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <button onClick={() => onNavigate('welcome')} className="hover:text-teal-600">
              Welcome
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('category_select')} className="hover:text-teal-600">
              8 Learner Cohorts
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('language_setup')} className="hover:text-teal-600">
              22 Scheduled Languages
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('settings')} className="hover:text-teal-600">
              DPDP Act 2023 & Accessibility
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setAuthUser(user);
          if (user.role === 'PARENT') {
            onNavigate('parent_dashboard');
          } else {
            onNavigate('dashboard');
          }
        }}
      />
    </div>
  );
}

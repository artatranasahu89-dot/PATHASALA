/**
 * BharatLearn AI — Parent Guidance & Study Focus Portal
 * Allows parents to manage up to 2 linked children, configure age-based policies,
 * monitor live study sessions, review alerts, and approve unlock requests.
 */

import { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Camera,
  Calendar,
  Lock,
  Unlock,
  UserPlus,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type {
  ParentDashboardMetrics,
  ParentalControlPolicy,
  AppPage,
} from '../types';

interface ParentDashboardPageProps {
  onNavigate: (page: AppPage) => void;
  onSelectStudentForStudy?: (studentId: string) => void;
}

export function ParentDashboardPage({ onNavigate }: ParentDashboardPageProps) {
  // Authentication & Child selection state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<string>('learner_pilot_odia_01');
  
  // Dashboard data state
  const [metrics, setMetrics] = useState<ParentDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Policy editing state
  const [policyForm, setPolicyForm] = useState<ParentalControlPolicy | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'policy' | 'alerts' | 'link_child'>('overview');

  // Modal / action states
  const [extensionMinutes, setExtensionMinutes] = useState<number>(15);
  const [linkStudentIdInput, setLinkStudentIdInput] = useState('');
  const [linkError, setLinkError] = useState('');

  // Auto-login if previously verified in session
  useEffect(() => {
    const authSession = sessionStorage.getItem('bharatlearn_parent_authed');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const loadDashboard = async (childId: string) => {
    setIsLoading(true);
    try {
      const data = await ApiService.getParentDashboard(childId);
      setMetrics(data);
      setPolicyForm(data.policy);
    } catch {
      // fallback handled in service
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard(selectedChildId);
    }
  }, [isAuthenticated, selectedChildId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      await ApiService.parentLogin('ramesh.mohanty@example.in', pinInput);
      setIsAuthenticated(true);
      sessionStorage.setItem('bharatlearn_parent_authed', 'true');
    } catch {
      setPinError('ଅବୈଧ ପିନ୍ (Invalid PIN). ଡିଫଲ୍ଟ ପିନ୍ "1234" ବ୍ୟବହାର କରନ୍ତୁ।');
    }
  };

  const handleChildSwitch = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handleSavePolicy = async () => {
    if (!policyForm) return;
    setIsSavingPolicy(true);
    setStatusMessage(null);
    try {
      await ApiService.updateParentPolicy(selectedChildId, policyForm);
      setStatusMessage('ନୀତି ସଫଳତାର ସହ ଅପଡେଟ୍ ହେଲା (Policy saved successfully).');
      loadDashboard(selectedChildId);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage(err.message || 'Error updating policy');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handleUnlockDecision = async (requestId: string, approved: boolean) => {
    try {
      await ApiService.respondToUnlockRequest(requestId, approved, extensionMinutes);
      setStatusMessage(approved ? `+${extensionMinutes} ମିନିଟ୍ ଅନଲକ୍ ଅନୁମୋଦିତ ହେଲା!` : 'ଅନଲକ୍ ଅନୁରୋଧ ପ୍ରତ୍ୟାଖ୍ୟାନ କରାଗଲା।');
      loadDashboard(selectedChildId);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      // handled
    }
  };

  const handleEmergencyRestrict = async () => {
    if (confirm('ଆପଣ ଶିକ୍ଷାର୍ଥୀଙ୍କ ଅଧ୍ୟୟନ ଅଧିବେଶନ ତୁରନ୍ତ ଲକ୍ କରିବାକୁ ଚାହାଁନ୍ତି କି? (Lock active student session immediately?)')) {
      try {
        await ApiService.emergencyRestrictChild(selectedChildId);
        setStatusMessage('ଶିକ୍ଷାର୍ଥୀଙ୍କ ଅଧିବେଶନ ତୁରନ୍ତ ସୀମିତ କରାଗଲା (Session restricted).');
        loadDashboard(selectedChildId);
      } catch {
        // handled
      }
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    if (!linkStudentIdInput.trim()) {
      setLinkError('ଦୟାକରି ୬-ଅଙ୍କ ବିଶିଷ୍ଟ ଯୋଡ଼ିବା କୋଡ୍ ପ୍ରବେଶ କରନ୍ତୁ (Pairing code required, e.g. BL-XXXX).');
      return;
    }

    try {
      const code = linkStudentIdInput.trim().toUpperCase();
      let res;
      if (code.startsWith('BL-') || code.length <= 8) {
        res = await ApiService.linkChildWithPairingCode(code);
      } else {
        res = await ApiService.linkChildToParent(code);
      }

      if (res.status === 'LINKED') {
        setStatusMessage(res.message);
        setLinkStudentIdInput('');
        setActiveTab('overview');
        loadDashboard(selectedChildId);
      } else {
        setLinkError(res.message || res.error || 'Linking failed');
      }
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link child. Check pairing code.');
    }
  };

  // If not authenticated, show PIN Verification View
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/50 rounded-2xl flex items-center justify-center text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Shield className="w-7 h-7" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-1">
            ଅଭିଭାବକ ପୋର୍ଟାଲ (Parent Guidance Portal)
          </h2>
          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mb-6">
            ଶିକ୍ଷାର୍ଥୀଙ୍କ ସୁରକ୍ଷା ଓ ସ୍କ୍ରିନ୍-ସମୟ ନିୟନ୍ତ୍ରଣ ପାଇଁ ୪-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ ପ୍ରବେଶ କରନ୍ତୁ।
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ଅଭିଭାବକ ପିନ୍ (Parent PIN)
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-widest font-mono py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 text-center">
                ଡେମୋ ପିନ୍ (Demo PIN): <strong className="text-teal-600 dark:text-teal-400">1234</strong>
              </p>
            </div>

            {pinError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-xl">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl transition shadow-sm cursor-pointer"
            >
              ପ୍ରବେଶ କରନ୍ତୁ (Enter Parent Portal)
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full py-2 px-4 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
            >
              ← ଛାତ୍ର ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ (Back to Student Dashboard)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>ସୁରକ୍ଷିତ ଅଭିଭାବକ ମାର୍ଗଦର୍ଶନ (Parent Guidance System)</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
            ରମେଶ ମହାନ୍ତି (Ramesh Mohanty)
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>+91 98765 43210</span>
            <span aria-hidden="true">·</span>
            <span>୨ ଜଣ ଯୋଡ଼ିତ ସନ୍ତାନ (2 Linked Children)</span>
            <span aria-hidden="true">·</span>
            <span>DPDP Act 2023 ସୁରକ୍ଷିତ</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('study_session')}
            className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>ଅଧ୍ୟୟନ ଅଧିବେଶନ (Study Session)</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="py-2 px-3.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ଛାତ୍ର ଦୃଶ୍ୟ (Student View)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Child Switcher Tabs (Strict limit: 2 children) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2">
            ସନ୍ତାନ ବାଛନ୍ତୁ:
          </span>

          {/* Child 1: Subhashree (Class 10) */}
          <button
            onClick={() => handleChildSwitch('learner_pilot_odia_01')}
            className={`py-2 px-4 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
              selectedChildId === 'learner_pilot_odia_01'
                ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 shadow-sm border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold">ସୁଭଶ୍ରୀ ମହାନ୍ତି</span>
            <span className="text-zinc-400 text-[11px]">(ଦଶମ ଶ୍ରେଣୀ · Class 10)</span>
          </button>

          {/* Child 2: Soumya (Class 4) */}
          <button
            onClick={() => handleChildSwitch('learner_child_02')}
            className={`py-2 px-4 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
              selectedChildId === 'learner_child_02'
                ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 shadow-sm border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold">ସୌମ୍ୟରଞ୍ଜନ ମହାନ୍ତି</span>
            <span className="text-zinc-400 text-[11px]">(ଚତୁର୍ଥ ଶ୍ରେଣୀ · Class 4)</span>
          </button>
        </div>

        <div className="text-xs text-zinc-400 px-2 flex items-center gap-2">
          <span>ସର୍ବାଧିକ ସନ୍ତାନ ସୀମା: ୨/୨</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: 'overview' as const, label: 'ସମୀକ୍ଷା ଓ ଅଧିବେଶନ (Overview)' },
          { id: 'policy' as const, label: 'ନିୟନ୍ତ୍ରଣ ଓ ସମୟ ସୀମା (Policies)' },
          { id: 'alerts' as const, label: `ସୂଚନା ଓ ଅନୁରୋଧ (${metrics?.pendingUnlockRequests.length || 0} Alerts)` },
          { id: 'link_child' as const, label: 'ସନ୍ତାନ ପରିଚାଳନା (Manage Linked)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3.5 text-xs font-medium rounded-xl transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 font-bold border border-teal-200 dark:border-teal-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-zinc-500 text-xs">
          ଅଭିଭାବକ ମେଟ୍ରିକ୍ସ ଲୋଡ୍ ହେଉଛି... (Loading child metrics...)
        </div>
      ) : metrics && (
        <>
          {/* TAB 1: OVERVIEW & REAL-TIME ACTIVITY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Real-time Status Banner */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        ସକ୍ରିୟ ସ୍ଥିତି (Current Live Status)
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                        {metrics.childName} ({metrics.assignedClass})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {metrics.currentStatus === 'STUDYING' && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ବର୍ତ୍ତମାନ ଅଧ୍ୟୟନରତ (Active Study Session)</span>
                        </div>
                      )}
                      {metrics.currentStatus === 'ON_BREAK' && (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                          <span className="w-3 h-3 rounded-full bg-amber-500" />
                          <span>ବିରତିରେ ଅଛନ୍ତି (On Scheduled Break)</span>
                        </div>
                      )}
                      {metrics.currentStatus === 'SESSION_RESTRICTED' && (
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                          <Lock className="w-4 h-4 text-rose-500" />
                          <span>ଅଧିବେଶନ ସୀମିତ / ଲକ୍ ହୋଇଛି (Session Restricted)</span>
                        </div>
                      )}
                      {metrics.currentStatus === 'NOT_STUDYING' && (
                        <div className="flex items-center gap-2 text-zinc-500 font-bold text-base">
                          <span className="w-3 h-3 rounded-full bg-zinc-400" />
                          <span>ନିଷ୍କ୍ରିୟ / ଅଫଲାଇନ୍ (Idle / Not Studying)</span>
                        </div>
                      )}
                    </div>

                    {metrics.activeSessionTitle && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        ବିଷୟ: <strong className="text-zinc-800 dark:text-zinc-200">{metrics.activeSessionTitle}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEmergencyRestrict}
                      className="py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>ଜରୁରୀକାଳୀନ ଲକ୍ (Emergency Restrict)</span>
                    </button>

                    <button
                      onClick={() => loadDashboard(selectedChildId)}
                      className="p-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      title="ରିଫ୍ରେଶ କରନ୍ତୁ"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Screen Time Meter */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-semibold">ଦୈନିକ ସ୍କ୍ରିନ୍ ସମୟ (Screen Time)</span>
                    <Clock className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {metrics.todayStudyDurationMinutes}{' '}
                    <span className="text-xs font-normal text-zinc-400">
                      / {metrics.dailyScreenTimeLimitMinutes} ମିନିଟ୍
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        metrics.screenTimeUsagePercentage > 90
                          ? 'bg-rose-500'
                          : metrics.screenTimeUsagePercentage > 70
                          ? 'bg-amber-500'
                          : 'bg-teal-600'
                      }`}
                      style={{ width: `${Math.min(100, metrics.screenTimeUsagePercentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-400 mt-2">
                    <span>{metrics.screenTimeUsagePercentage}% ବ୍ୟବହୃତ</span>
                    <span>ଅବଶିଷ୍ଟ: {Math.max(0, metrics.dailyScreenTimeLimitMinutes - metrics.todayStudyDurationMinutes)} ମିନିଟ୍</span>
                  </div>
                </div>

                {/* Continuous Study & Inactivity Rules */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-semibold">ସତର୍କତା ନିୟମ (Focus Rules)</span>
                    <Shield className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ସର୍ବାଧିକ ଏକକ ଅଧିବେଶନ:</span>
                      <strong>{metrics.policy.maxContinuousSessionMinutes} ମିନିଟ୍</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ବାଧ୍ୟତାମୂଳକ ବିରତି:</span>
                      <strong>{metrics.policy.mandatoryBreakMinutes} ମିନିଟ୍</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">୧ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା:</span>
                      <strong className="text-teal-600">ଅଭିଭାବକ ସୂଚନା</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା:</span>
                      <strong className="text-rose-600">ସ୍ୱୟଂଚାଳିତ ଲକ୍</strong>
                    </div>
                  </div>
                </div>

                {/* Camera Focus Assistance Status */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-semibold">କ୍ୟାମେରା ଧ୍ୟାନ ସହାୟତା (Focus Assistance)</span>
                    <Camera className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {metrics.cameraFocusStatus.enabledByPolicy ? 'ଅଭିଭାବକଙ୍କ ଦ୍ୱାରା ଅନୁମୋଦିତ' : 'ନିଷ୍କ୍ରିୟ (Disabled by Default)'}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                    {metrics.cameraFocusStatus.limitationNote}
                  </p>
                  <div className="mt-2 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    ଶିକ୍ଷାର୍ଥୀଙ୍କ ସ୍ପଷ୍ଟ ସମ୍ମତି ବାଧ୍ୟତାମୂଳକ।
                  </div>
                </div>
              </div>

              {/* Pending Unlock Requests Section */}
              {metrics.pendingUnlockRequests.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-bold mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ଶିକ୍ଷାର୍ଥୀଙ୍କ ଠାରୁ ବିଚାରାଧୀନ ଅନଲକ୍ ଅନୁରୋଧ ({metrics.pendingUnlockRequests.length})</span>
                  </div>

                  <div className="space-y-3">
                    {metrics.pendingUnlockRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            କାରଣ: {req.reason}
                          </div>
                          {req.studentNote && (
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                              "{req.studentNote}"
                            </div>
                          )}
                          <div className="text-[11px] text-zinc-400">
                            ଅନୁରୋଧ ସମୟ: {new Date(req.createdAt).toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={extensionMinutes}
                            onChange={(e) => setExtensionMinutes(Number(e.target.value))}
                            className="text-xs py-1.5 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                          >
                            <option value={15}>+୧୫ ମିନିଟ୍ (+15 min)</option>
                            <option value={30}>+୩୦ ମିନିଟ୍ (+30 min)</option>
                            <option value={45}>+୪୫ ମିନିଟ୍ (+45 min)</option>
                          </select>

                          <button
                            onClick={() => handleUnlockDecision(req.id, true)}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>ଅନୁମୋଦନ କରନ୍ତୁ</span>
                          </button>

                          <button
                            onClick={() => handleUnlockDecision(req.id, false)}
                            className="py-1.5 px-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ପ୍ରତ୍ୟାଖ୍ୟାନ</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct PIN Unlock Helper for On-Device Override */}
              <div className="bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <span>ସିଧାସଳଖ ଅନ-ଡିଭାଇସ୍ ପିନ୍ ଅନଲକ୍ (On-Device Parent Override)</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    ଯଦି ଆପଣ ନିଜ ସନ୍ତାନଙ୍କ ସହିତ ଉପସ୍ଥିତ ଅଛନ୍ତି, ତେବେ ସନ୍ତାନଙ୍କ ସ୍କ୍ରିନରେ ଆପଣଙ୍କ ପିନ୍ (1234) ଦେଇ ତୁରନ୍ତ ୩୦ ମିନିଟ୍ ଅନଲକ୍ କରିପାରିବେ।
                  </p>
                </div>

                <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 shrink-0">
                  ପିନ୍: 1234
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLICIES & CONTROLS CONFIGURATION */}
          {activeTab === 'policy' && policyForm && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    ନିୟନ୍ତ୍ରଣ ଓ ସୀମା ନୀତି (Parental Policy Settings)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    ଶ୍ରେଣୀ {metrics.gradeLevel} ({metrics.assignedClass}) ପାଇଁ ନିୟନ୍ତ୍ରଣ ବାଧ୍ୟତାମୂଳକ।
                  </p>
                </div>

                <button
                  onClick={handleSavePolicy}
                  disabled={isSavingPolicy}
                  className="py-2 px-5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingPolicy ? 'ସେଭ୍ ହେଉଛି...' : 'ନୀତି ସେଭ୍ କରନ୍ତୁ (Save Policy)'}
                </button>
              </div>

              {/* Screen Time Limit Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ଦୈନିକ ସର୍ବାଧିକ ସ୍କ୍ରିନ୍ ସମୟ (Daily Screen-Time Limit)
                  </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {policyForm.dailyScreenTimeLimitMinutes} ମିନିଟ୍ ({Math.floor(policyForm.dailyScreenTimeLimitMinutes / 60)} ଘଣ୍ଟା {policyForm.dailyScreenTimeLimitMinutes % 60} ମିନିଟ୍)
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={240}
                  step={15}
                  value={policyForm.dailyScreenTimeLimitMinutes}
                  onChange={(e) =>
                    setPolicyForm({ ...policyForm, dailyScreenTimeLimitMinutes: Number(e.target.value) })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>୩୦ ମିନିଟ୍</span>
                  <span>୧୨୦ ମିନିଟ୍ (୨ ଘଣ୍ଟା)</span>
                  <span>୨୪୦ ମିନିଟ୍ (୪ ଘଣ୍ଟା)</span>
                </div>
              </div>

              {/* Continuous Study & Break Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 border border-zinc-200 dark:border-zinc-700/60">
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    ସର୍ବାଧିକ କ୍ରମାଗତ ଅଧ୍ୟୟନ ସମୟ (Continuous Session Before Break)
                  </label>
                  <select
                    value={policyForm.maxContinuousSessionMinutes}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, maxContinuousSessionMinutes: Number(e.target.value) })
                    }
                    className="w-full text-xs py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value={20}>୨୦ ମିନିଟ୍ (ପ୍ରାଥମିକ ସୁପାରିଶ)</option>
                    <option value={30}>୩୦ ମିନିଟ୍</option>
                    <option value={45}>୪୫ ମିନିଟ୍ (ମାଟ୍ରିକ ସୁପାରିଶ)</option>
                    <option value={60}>୬୦ ମିନିଟ୍</option>
                  </select>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 border border-zinc-200 dark:border-zinc-700/60">
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    ବାଧ୍ୟତାମୂଳକ ବିରତି ସମୟ (Mandatory Break Length)
                  </label>
                  <select
                    value={policyForm.mandatoryBreakMinutes}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, mandatoryBreakMinutes: Number(e.target.value) })
                    }
                    className="w-full text-xs py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value={5}>୫ ମିନିଟ୍ ବିରତି</option>
                    <option value={10}>୧୦ ମିନିଟ୍ ବିରତି (ଆଦର୍ଶ)</option>
                    <option value={15}>୧୫ ମିନିଟ୍ ବିରତି</option>
                  </select>
                </div>
              </div>

              {/* Study Hours Schedule */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>ଅନୁମୋଦିତ ଅଧ୍ୟୟନ ସମୟ ସାରଣୀ (Study Hours Window)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                      ଆରମ୍ଭ ସମୟ (Allowed Start Time)
                    </label>
                    <input
                      type="time"
                      value={policyForm.studySchedule.allowedStartTime}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          studySchedule: { ...policyForm.studySchedule, allowedStartTime: e.target.value },
                        })
                      }
                      className="w-full text-xs py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                      ସମାପ୍ତ ସମୟ (Allowed End Time / Bedtime Curfew)
                    </label>
                    <input
                      type="time"
                      value={policyForm.studySchedule.allowedEndTime}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          studySchedule: { ...policyForm.studySchedule, allowedEndTime: e.target.value },
                        })
                      }
                      className="w-full text-xs py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>

              {/* Permitted Activities Toggles */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  ଅନୁମତିପ୍ରାପ୍ତ ଅଧ୍ୟୟନ କାର୍ଯ୍ୟକଳାପ (Permitted Activities)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'allowLessons' as const, label: 'ପାଠ୍ୟକ୍ରମ (Lessons)' },
                    { key: 'allowPracticeQuizzes' as const, label: 'ଅଭ୍ୟାସ କୁଇଜ୍ (Quizzes)' },
                    { key: 'allowEducationalVideos' as const, label: 'ଶିକ୍ଷଣୀୟ ଭିଡିଓ (Videos)' },
                    { key: 'allowReading' as const, label: 'ପୁସ୍ତକ ପଠନ (Reading)' },
                  ].map((act) => (
                    <label
                      key={act.key}
                      className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={policyForm.permittedActivities[act.key]}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            permittedActivities: {
                              ...policyForm.permittedActivities,
                              [act.key]: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{act.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Inactivity Thresholds */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  ନିଷ୍କ୍ରିୟତା ନିୟମ ଓ ସ୍ୱୟଂଚାଳିତ ସୁରକ୍ଷା (Inactivity Safeguards)
                </h3>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={policyForm.inactivityThresholds.notifyParentEnabled}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          inactivityThresholds: {
                            ...policyForm.inactivityThresholds,
                            notifyParentEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-teal-600"
                    />
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        ୧ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତାରେ ଅଭିଭାବକଙ୍କୁ ସୂଚନା (1-Min Inactivity Parent Alert)
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        ଯଦି ଶିକ୍ଷାର୍ଥୀ ୧ ମିନିଟ୍ ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଇଣ୍ଟରାକ୍ସନ ନ କରନ୍ତି, ତୁରନ୍ତ ସତର୍କତା ଲଗ୍ ହେବ।
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={policyForm.inactivityThresholds.studentReminderEnabled}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          inactivityThresholds: {
                            ...policyForm.inactivityThresholds,
                            studentReminderEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-teal-600"
                    />
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        ୫ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତାରେ ଛାତ୍ରଙ୍କୁ ସ୍ମାରକୀ ଓ ବିରତି ସୁପାରିଶ (5-Min Student Reminder)
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        ଶିକ୍ଷାର୍ଥୀଙ୍କୁ ସହାନୁଭୂତିଶୀଳ ସ୍ମାରକୀ ଏବଂ ୫ ମିନିଟ୍ ବିରତିର ବିକଳ୍ପ ଦେଖାଯିବ।
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={policyForm.inactivityThresholds.restrictAppEnabled}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          inactivityThresholds: {
                            ...policyForm.inactivityThresholds,
                            restrictAppEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-teal-600"
                    />
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        ୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତାରେ ସ୍ୱୟଂଚାଳିତ ଆପ୍ ଲକ୍ (10-Min Auto-Lock / Restriction)
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        ଅଧ୍ୟୟନ ଅଧିବେଶନ ସୀମିତ ହୋଇଯିବ ଏବଂ ଅଭିଭାବକଙ୍କ ଅନୁମୋଦନ କିମ୍ବା ପିନ୍ ଆବଶ୍ୟକ ହେବ।
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Camera Focus Assistance Toggle */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={policyForm.cameraFocusAssistance.enabledByParent}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        cameraFocusAssistance: {
                          ...policyForm.cameraFocusAssistance,
                          enabledByParent: e.target.checked,
                        },
                      })
                    }
                    className="mt-0.5 rounded text-teal-600"
                  />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      କ୍ୟାମେରା-ଆଧାରିତ ଧ୍ୟାନ ସହାୟତା ଅନୁମତି ଦିଅନ୍ତୁ (Allow Camera Focus Monitor)
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      ଭିଡିଓ ସମ୍ପୂର୍ଣ୍ଣ ସ୍ଥାନୀୟ ବ୍ରାଉଜରରେ ରହେ। କୌଣସି ଫଟୋ କିମ୍ବା ରେକର୍ଡିଂ କ୍ଲାଉଡକୁ ପଠାଯାଏ ନାହିଁ। ଶିକ୍ଷାର୍ଥୀଙ୍କ ସ୍ୱତନ୍ତ୍ର ସମ୍ମତି ଆବଶ୍ୟକ।
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: ALERTS & AUDIT TRAIL */}
          {activeTab === 'alerts' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-teal-600" />
                <span>ଅଭିଭାବକ ସୂଚନା ଓ ଅଡିଟ୍ ଲଗ୍ (Parent Alerts & Activity Stream)</span>
              </h2>

              <div className="space-y-3">
                {metrics.recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-start gap-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      {alert.severity === 'CRITICAL' && <XCircle className="w-4 h-4 text-rose-500" />}
                      {alert.severity === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {alert.severity === 'INFO' && <CheckCircle className="w-4 h-4 text-teal-500" />}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{alert.title}</span>
                        <span className="text-[11px] text-zinc-400">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{alert.message}</p>
                    </div>
                  </div>
                ))}

                {metrics.recentAlerts.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    କୌଣସି ନୂତନ ସତର୍କତା ନାହିଁ (No active alerts).
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE LINKED CHILDREN (STRICT MAX 2) */}
          {activeTab === 'link_child' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  <span>ସନ୍ତାନ ସଂଯୋଗ ପରିଚାଳନା (Manage Linked Children)</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  ସୁରକ୍ଷା ଓ ଗୋପନୀୟତା ନୀତି ଅନୁସାରେ ଗୋଟିଏ ଅଭିଭାବକ ଆକାଉଣ୍ଟରେ ସର୍ବାଧିକ ୨ ଜଣ ସନ୍ତାନ ସଂଯୋଗ ହୋଇପାରିବେ।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Child 1 Card */}
                <div className="p-4 border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-300">ସନ୍ତାନ ୧ (Child 1)</span>
                    <span className="text-[11px] text-teal-600 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full">ସଂଯୋଜିତ</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree Mohanty)
                  </div>
                  <div className="text-xs text-zinc-500">
                    ଶ୍ରେଣୀ: Class 10-A (ମାଟ୍ରିକ) · BSE Odisha
                  </div>
                </div>

                {/* Child 2 Card */}
                <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">ସନ୍ତାନ ୨ (Child 2)</span>
                    <span className="text-[11px] text-blue-600 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">ସଂଯୋଜିତ</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ସୌମ୍ୟରଞ୍ଜନ ମହାନ୍ତି (Soumya Mohanty)
                  </div>
                  <div className="text-xs text-zinc-500">
                    ଶ୍ରେଣୀ: Class 4-B (ପ୍ରାଥମିକ) · BSE Odisha
                  </div>
                </div>
              </div>

              {/* Secure Pairing Code Linking Form */}
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-teal-600" />
                    <span>ସୁରକ୍ଷିତ ଯୋଡ଼ିବା କୋଡ୍ ସହିତ ସଂଯୋଗ କରନ୍ତୁ (Link via 6-Character Pairing Code)</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    ଶିକ୍ଷାର୍ଥୀଙ୍କ ନାମ କିମ୍ବା ଇମେଲ ବ୍ୟବହାର କରି ସଂଯୋଗ କରିବା ଅନୁମତିପ୍ରାପ୍ତ ନୁହେଁ। ଶିକ୍ଷାର୍ଥୀ ସେମାନଙ୍କ ସେଟିଙ୍ଗ ପୃଷ୍ଠାରୁ ୧୫-ମିନିଟ୍ ବୈଧ କୋଡ୍ (e.g. BL-XXXX) ସୃଷ୍ଟି କରିବା ଆବଶ୍ୟକ।
                  </p>
                </div>

                <form onSubmit={handleLinkChild} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={linkStudentIdInput}
                    onChange={(e) => setLinkStudentIdInput(e.target.value.toUpperCase())}
                    placeholder="ଯୋଡ଼ିବା କୋଡ୍ ପ୍ରବେଶ କରନ୍ତୁ (e.g. BL-8492)"
                    className="flex-1 p-2.5 font-mono uppercase tracking-wider rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
                  >
                    ସଂଯୋଗ କରନ୍ତୁ (Link Child)
                  </button>
                </form>

                {linkError && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {linkError}
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400">
                <p>
                  <strong>କୋଟା ସୀମା (Strict Max 2 Children):</strong> ଆପଣଙ୍କ ଆକାଉଣ୍ଟରେ ୨ ଜଣ ସନ୍ତାନ ସଂଯୋଜିତ ହୋଇପାରିବେ। ପ୍ରତ୍ୟେକ ଶିକ୍ଷାର୍ଥୀଙ୍କ ସ୍ୱତନ୍ତ୍ର ପରିଚୟ ଓ ଗୋପନୀୟ ଶିକ୍ଷଣ ରେକର୍ଡ ରହିବ।
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

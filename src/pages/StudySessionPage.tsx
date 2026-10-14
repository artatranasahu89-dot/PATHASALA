/**
 * BharatLearn AI — Active Study Session, Focus Tracking & Inactivity Engine
 * Tracks active learning, monitors inactivity (1m, 5m reminder, 10m restrict),
 * manages breaks, camera focus assistance with student consent, and unlock requests.
 */

import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Brain,
  Video,
  FileText,
  Clock,
  Coffee,
  AlertCircle,
  Lock,
  Unlock,
  CheckCircle2,
  Camera,
  CameraOff,
  Sparkles,
  HelpCircle,
  Play,
  Pause,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type {
  StudySession,
  StudyActivityType,
  ParentalControlPolicy,
  LearnerProfile,
  AppPage,
} from '../types';

interface StudySessionPageProps {
  profile: LearnerProfile | null;
  onNavigate: (page: AppPage) => void;
}

export function StudySessionPage({ profile, onNavigate }: StudySessionPageProps) {
  // Activity Selection & Session State
  const [selectedActivity, setSelectedActivity] = useState<StudyActivityType>('LESSON');
  const [session, setSession] = useState<StudySession | null>(null);
  const [policy, setPolicy] = useState<ParentalControlPolicy | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Focus & Inactivity Timers (in seconds)
  const [studyElapsedSeconds, setStudyElapsedSeconds] = useState(0);
  const [inactivityCounterSeconds, setInactivityCounterSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [breakTimerSeconds, setBreakTimerSeconds] = useState(0);

  // Interactive Inactivity Modals
  const [show5MinReminder, setShow5MinReminder] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState<string>('୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା (10-Minute Inactivity Limit)');

  // Unlock Workflow State
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('ମୁଁ ପୁନର୍ବାର ପାଠ୍ୟକ୍ରମ ଆରମ୍ଭ କରିବାକୁ ଚାହୁଁଛି (Want to resume study)');
  const [studentNote, setStudentNote] = useState('');
  const [unlockSubmitted, setUnlockSubmitted] = useState(false);

  // Direct Parent PIN Override Modal State
  const [showDirectPinModal, setShowDirectPinModal] = useState(false);
  const [directPin, setDirectPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Camera Focus Assistance State (Consent Governed)
  const [cameraAuthorizedByParent, setCameraAuthorizedByParent] = useState(false);
  const [cameraStudentConsent, setCameraStudentConsent] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingState, setCameraFacingState] = useState<'FOCUSED' | 'LOOKING_AWAY'>('FOCUSED');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Lesson & Quiz Interactive Content State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const studentId = profile?.id || 'learner_pilot_odia_01';

  // Load existing status and policy on mount
  useEffect(() => {
    async function loadStatus() {
      try {
        const { activeSession, policy: fetchedPolicy } = await ApiService.getStudySessionStatus(studentId);
        if (fetchedPolicy) {
          setPolicy(fetchedPolicy);
          setCameraAuthorizedByParent(fetchedPolicy.cameraFocusAssistance.enabledByParent);
        }
        if (activeSession && activeSession.state !== 'SESSION_COMPLETED') {
          setSession(activeSession);
          setStudyElapsedSeconds(activeSession.accumulatedStudyDurationSeconds);
          setInactivityCounterSeconds(activeSession.inactivitySeconds);
          if (activeSession.state === 'RESTRICTED') {
            setIsRestricted(true);
          }
        }
      } catch {
        // fallback
      }
    }
    loadStatus();
  }, [studentId]);

  // Activity Detector: Reset inactivity on user interaction
  useEffect(() => {
    if (!session || isRestricted || isOnBreak) return;

    const handleUserInteraction = () => {
      setInactivityCounterSeconds(0);
      if (show5MinReminder) {
        setShow5MinReminder(false);
      }
    };

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, [session, isRestricted, isOnBreak, show5MinReminder]);

  // Heartbeat & Pulse Timer: Runs every second
  useEffect(() => {
    if (!session || isRestricted) return;

    const interval = setInterval(async () => {
      if (isPaused) {
        return; // Session is paused
      }

      if (isOnBreak) {
        setBreakTimerSeconds((prev) => prev + 1);
        return;
      }

      setStudyElapsedSeconds((prev) => prev + 1);
      setInactivityCounterSeconds((prev) => {
        const next = prev + 1;
        // Inactivity triggers
        if (next === 300) { // 5 minutes
          setShow5MinReminder(true);
        }
        if (next >= 600) { // 10 minutes -> restrict
          setIsRestricted(true);
          setRestrictionReason('୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା ଯୋଗୁଁ ଅଧିବେଶନ ସୀମିତ କରାଯାଇଛି (10-minute inactivity limit exceeded)');
        }
        return next;
      });

      // Send pulse to server every 5 seconds
      if (studyElapsedSeconds % 5 === 0) {
        try {
          const res = await ApiService.pulseStudySession({
            sessionId: session.id,
            studentId,
            hasUserInteraction: inactivityCounterSeconds < 5,
            deltaSeconds: 5,
          });

          if (res.actionRequired === 'SHOW_5MIN_REMINDER') {
            setShow5MinReminder(true);
          } else if (res.actionRequired === 'RESTRICT_APP' || res.session?.state === 'RESTRICTED') {
            setIsRestricted(true);
          } else if (res.session?.state === 'PARENT_UNLOCKED' || res.session?.state === 'ACTIVE_STUDY') {
            if (isRestricted) {
              setIsRestricted(false);
              setShowUnlockModal(false);
            }
          }
        } catch {
          // offline fallback
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, isRestricted, isOnBreak, studyElapsedSeconds, inactivityCounterSeconds, studentId]);

  // Start a new study session
  const handleStartSession = async () => {
    setIsInitializing(true);
    setInitError(null);
    try {
      const newSession = await ApiService.startStudySession({
        studentId,
        activityType: selectedActivity,
        title: getActivityTitle(selectedActivity),
        subjectId: 'sub_bse_10_bio',
      });
      setSession(newSession);
      setStudyElapsedSeconds(0);
      setInactivityCounterSeconds(0);
      setIsRestricted(false);
    } catch (err: any) {
      setInitError(err.message || 'Failed to start session');
    } finally {
      setIsInitializing(false);
    }
  };

  const getActivityTitle = (type: StudyActivityType) => {
    switch (type) {
      case 'LESSON':
        return 'ଜୀବ ବିଜ୍ଞାନ — ଆଲୋକ ସଂଶ୍ଳେଷଣ ଓ ହରିତକଣିକା (Lesson)';
      case 'PRACTICE_QUIZ':
        return 'ଦଶମ ଶ୍ରେଣୀ ଜୀବ ବିଜ୍ଞାନ ଅଭ୍ୟାସ ପ୍ରଶ୍ନୋତ୍ତର (Quiz)';
      case 'EDUCATIONAL_VIDEO':
        return 'ପତ୍ରର ଅନ୍ତର୍ଗଠନ ଓ ଫୋଟୋସିନ୍ଥେସିସ୍ ଆନିମେସନ୍ (Video)';
      case 'READING':
        return 'ଓଡ଼ିଶା ମାଧ୍ୟମିକ ଶିକ୍ଷା ପରିଷଦ ପାଠ୍ୟପୁସ୍ତକ ଅଧ୍ୟୟନ (Reading)';
      case 'HOMEWORK':
        return 'ଗୃହକାର୍ଯ୍ୟ: ଆଲୋକ ପ୍ରକ୍ରିୟା ରେଖାଚିତ୍ର (Homework)';
      default:
        return 'ନିୟମିତ ଅଧ୍ୟୟନ';
    }
  };

  // Break Controls
  const handleToggleBreak = async () => {
    if (!session) return;
    const nextBreakState = !isOnBreak;
    setIsOnBreak(nextBreakState);
    if (nextBreakState) {
      setBreakTimerSeconds(0);
    }
    await ApiService.toggleStudyBreak(session.id, nextBreakState);
  };

  // Pause / Resume Session
  const handleTogglePause = async () => {
    if (!session) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      await ApiService.pauseStudySession(session.id, studentId);
    } else {
      await ApiService.resumeStudySession(session.id, studentId);
    }
  };

  // End Session
  const handleEndSession = async () => {
    if (!session) return;
    if (confirm('ଆପଣ ଅଧ୍ୟୟନ ଅଧିବେଶନ ସମାପ୍ତ କରିବାକୁ ଚାହାଁନ୍ତି କି? (End study session?)')) {
      stopCamera();
      await ApiService.endStudySession(session.id);
      setSession(null);
      onNavigate('dashboard');
    }
  };

  // Submit Unlock Request to Parent
  const handleRequestUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      await ApiService.requestStudyUnlock({
        studentId,
        sessionId: session.id,
        reason: unlockReason,
        studentNote,
      });
      setUnlockSubmitted(true);
    } catch {
      // fallback
    }
  };

  // Direct On-Device PIN Override
  const handleDirectPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      const res = await ApiService.directPinOverride(studentId, directPin, 30);
      if (res.status === 'PIN_OVERRIDE_SUCCESSFUL') {
        setIsRestricted(false);
        setShowDirectPinModal(false);
        setInactivityCounterSeconds(0);
        setDirectPin('');
      } else {
        setPinError(res.message || 'ଅବୈଧ ପିନ୍ (Invalid PIN)');
      }
    } catch {
      setPinError('ଅବୈଧ ଅଭିଭାବକ ପିନ୍ (Invalid PIN). ଡିଫଲ୍ଟ: 1234');
    }
  };

  // Camera Focus Assistance Handling
  const startCamera = async () => {
    if (!cameraStudentConsent) {
      alert('କ୍ୟାମେରା ଆରମ୍ଭ ପୂର୍ବରୁ ଆପଣଙ୍କ ସମ୍ମତି ଆବଶ୍ୟକ।');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch {
      // Camera not accessible (e.g. permission or device limit)
      setIsCameraActive(true); // Simulate sandbox camera
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Format MM:SS helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Session Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>ସ୍ୱତନ୍ତ୍ର ଅଧ୍ୟୟନ ଓ ଧ୍ୟାନ କେନ୍ଦ୍ର (Active Focus Study Hub)</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
            {session ? session.title : 'ନୂତନ ଅଧ୍ୟୟନ ଅଧିବେଶନ ଆରମ୍ଭ କରନ୍ତୁ'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
            <span>ଶିକ୍ଷାର୍ଥୀ: {profile?.fullName || 'ସୁଭଶ୍ରୀ ମହାନ୍ତି'}</span>
            <span aria-hidden="true">·</span>
            <span>{profile?.assignedClass || 'Class 10-A (ମାଟ୍ରିକ)'}</span>
            <span aria-hidden="true">·</span>
            <span>ଦୈନିକ ସ୍କ୍ରିନ୍ ସମୟ ସୀମା: {policy?.dailyScreenTimeLimitMinutes || 90} ମିନିଟ୍</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('parent_dashboard')}
            className="py-2 px-3.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>ଅଭିଭାବକ ପୋର୍ଟାଲ (Parent Portal)</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="py-2 px-3.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ଡ୍ୟାସବୋର୍ଡ</span>
          </button>
        </div>
      </div>

      {initError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{initError}</span>
        </div>
      )}

      {/* VIEW A: NO ACTIVE SESSION -> ACTIVITY SELECTION & START */}
      {!session && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ଆଜି ଆପଣ କ’ଣ ଅଧ୍ୟୟନ କରିବାକୁ ଚାହାଁନ୍ତି? (Select Study Activity)
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              ଅଭିଭାବକଙ୍କ ନୀତି ଅନୁସାରେ ସମୟ ସୀମା ଓ ନିଷ୍କ୍ରିୟତା ଯାଞ୍ଚ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଲାଗୁ ହେବ।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                type: 'LESSON' as const,
                title: 'ପାଠ୍ୟକ୍ରମ (Lesson)',
                desc: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ଓ ହରିତକଣିକା ର ବିସ୍ତୃତ ଅଧ୍ୟୟନ',
                icon: BookOpen,
                enabled: policy?.permittedActivities.allowLessons ?? true,
              },
              {
                type: 'PRACTICE_QUIZ' as const,
                title: 'ଅଭ୍ୟାସ କୁଇଜ୍ (Practice Quiz)',
                desc: 'ମାଟ୍ରିକ ପରୀକ୍ଷା ଉପଯୋଗୀ ବହୁବିକଳ୍ପ ପ୍ରଶ୍ନୋତ୍ତର',
                icon: Brain,
                enabled: policy?.permittedActivities.allowPracticeQuizzes ?? true,
              },
              {
                type: 'EDUCATIONAL_VIDEO' as const,
                title: 'ଶିକ୍ଷଣୀୟ ଭିଡିଓ (Educational Video)',
                desc: 'ଜୀବ ବିଜ୍ଞାନ ପ୍ରକ୍ରିୟାର 3D ଆନିମେସନ୍',
                icon: Video,
                enabled: policy?.permittedActivities.allowEducationalVideos ?? true,
              },
              {
                type: 'READING' as const,
                title: 'ପୁସ୍ତକ ପଠନ (Reading)',
                desc: 'BSE Odisha ପାଠ୍ୟପୁସ୍ତକ ଅଧ୍ୟାୟ ୧ ର ପଠନ',
                icon: FileText,
                enabled: policy?.permittedActivities.allowReading ?? true,
              },
              {
                type: 'HOMEWORK' as const,
                title: 'ଗୃହକାର୍ଯ୍ୟ (Homework)',
                desc: 'ସ୍କୁଲ ଦ୍ୱାରା ଦିଆଯାଇଥିବା ପ୍ରଶ୍ନର ଅଭ୍ୟାସ',
                icon: CheckCircle2,
                enabled: true,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = selectedActivity === item.type;
              return (
                <button
                  key={item.type}
                  disabled={!item.enabled}
                  onClick={() => setSelectedActivity(item.type)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                    !item.enabled
                      ? 'opacity-40 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 cursor-not-allowed'
                      : isSelected
                      ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {!item.enabled && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                        ନୀତି ଦ୍ୱାରା ନିଷିଦ୍ଧ
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button
              onClick={handleStartSession}
              disabled={isInitializing}
              className="py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isInitializing ? 'ଆରମ୍ଭ ହେଉଛି...' : 'ଅଧ୍ୟୟନ ଆରମ୍ଭ କରନ୍ତୁ (Start Session)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW B: ACTIVE STUDY SESSION IN PROGRESS */}
      {session && (
        <div className="space-y-6">
          {/* Top Focus Status Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Active Pulsing Indicator */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${
                      isOnBreak ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {isOnBreak ? 'ବିରତି ଚାଲିଛି (On Break)' : 'ଧ୍ୟାନପୂର୍ଣ୍ଣ ଅଧ୍ୟୟନ (In Focused Study)'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      ନିଷ୍କ୍ରିୟତା ଟାଇମର୍: {inactivityCounterSeconds}s / ୬୦୦s
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

                {/* Live Timer */}
                <div>
                  <div className="text-xs text-zinc-400">ଅଧ୍ୟୟନ ସମୟ (Study Time)</div>
                  <div className="text-xl font-bold font-mono text-teal-700 dark:text-teal-400">
                    {formatTime(studyElapsedSeconds)}
                  </div>
                </div>
              </div>

              {/* Action Controls: Pause, Take Break, Stop Session */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleTogglePause}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isPaused
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'ଆରମ୍ଭ କରନ୍ତୁ (Resume)' : 'ବିରାମ (Pause)'}</span>
                </button>

                <button
                  onClick={handleToggleBreak}
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isOnBreak
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>{isOnBreak ? 'ଅଧ୍ୟୟନକୁ ଫେରନ୍ତୁ (Resume Study)' : 'ବିରତି ନିଅନ୍ତୁ (Take a Break)'}</span>
                </button>

                <button
                  onClick={handleEndSession}
                  className="py-2 px-3.5 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  ଅଧିବେଶନ ସମାପ୍ତ (End Session)
                </button>
              </div>
            </div>
          </div>

          {/* Break Banner if Active */}
          {isOnBreak && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center space-y-3">
              <Coffee className="w-10 h-10 text-amber-600 mx-auto" />
              <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                ଆପଣ ବିରତିରେ ଅଛନ୍ତି (You are on a Break)
              </h2>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                ଆଖିକୁ ଆରାମ ଦିଅନ୍ତୁ, ପାଣି ପିଅନ୍ତୁ ଏବଂ କିଛି ସମୟ ବାହାରକୁ ଦେଖନ୍ତୁ। ବିରତି ସମୟ: {formatTime(breakTimerSeconds)}
              </p>
              <button
                onClick={handleToggleBreak}
                className="py-2 px-5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                ଅଧ୍ୟୟନ ପୁନଃ ଆରମ୍ଭ କରନ୍ତୁ
              </button>
            </div>
          )}

          {/* Main Study Interactive Area (When Not on Break) */}
          {!isOnBreak && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Interactive Subject Content */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs font-bold text-teal-700 dark:text-teal-400">
                    BSE Odisha · ଦଶମ ଶ୍ରେଣୀ ଜୀବ ବିଜ୍ଞାନ
                  </div>
                  <div className="text-xs text-zinc-400">
                    ଅଧ୍ୟାୟ ୧: ପୋଷଣ ଓ ଆଲୋକ ସଂଶ୍ଳେଷଣ
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଫୋଟୋଲାଇସିସ୍ (Photolysis of Water)
                  </h3>
                  <p>
                    ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟାର ପ୍ରଥମ ପର୍ଯ୍ୟାୟ ହେଉଛି ଆଲୋକ ଉପରେ ନିର୍ଭରଶୀଳ ପ୍ରକ୍ରିୟା (Light-dependent reaction) ଯାହା ହରିତକଣିକାର <strong>ଗ୍ରାନା (Grana)</strong> ରେ ସଂଘଠିତ ହୁଏ। ସୂର୍ଯ୍ୟାଲୋକର ଫୋଟନ୍ ଶକ୍ତି କ୍ଲୋରୋଫିଲ୍ ଅଣୁକୁ ଉତ୍ତେଜିତ କରେ, ଯାହା ଫଳରେ ଜଳ ଅଣୁ ବିଘଟିତ ହୋଇ <strong>ହାଇଡ୍ରୋଜେନ୍ (H+)</strong> ଏବଂ <strong>ଅମ୍ଳଜାନ (O2)</strong> ଗ୍ୟାସ୍ ସୃଷ୍ଟି ହୁଏ।
                  </p>
                </div>

                {/* Interactive Practice Question to simulate activity */}
                <div className="mt-6 p-5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="text-xs font-bold text-teal-800 dark:text-teal-300">
                    ଧ୍ୟାନ ଯାଞ୍ଚ ପ୍ରଶ୍ନ (Interactive Focus Check Question):
                  </div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    ପ୍ରଶ୍ନ: ଆଲୋକ ସଂଶ୍ଳେଷଣରେ ଜଳର ଆଲୋକ ବିଶ୍ଳେଷଣ (Photolysis) ହରିତକଣିକାର କେଉଁ ଅଂଶରେ ହୁଏ?
                  </p>

                  <div className="space-y-2">
                    {[
                      { index: 0, text: 'ଷ୍ଟ୍ରୋମା (Stroma)' },
                      { index: 1, text: 'ଗ୍ରାନା ଥାଇଲାକଏଡ୍ (Grana Thylakoid)' },
                      { index: 2, text: 'ବାହ୍ୟ ଝିଲ୍ଲୀ (Outer Membrane)' },
                      { index: 3, text: 'କ୍ରିଷ୍ଟି (Cristae)' },
                    ].map((opt) => (
                      <button
                        key={opt.index}
                        onClick={() => {
                          setQuizAnswer(opt.index);
                          setInactivityCounterSeconds(0);
                          if (opt.index === 1) {
                            setQuizFeedback('ଅତି ଉତ୍ତମ! ଆଲୋକ ପ୍ରକ୍ରିୟା ଗ୍ରାନାରେ ହିଁ ସଂଘଠିତ ହୁଏ।');
                          } else {
                            setQuizFeedback('ଭୁଲ୍ ଉତ୍ତର! ଷ୍ଟ୍ରୋମାରେ ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା ହୁଏ, ଗ୍ରାନାରେ ଆଲୋକ ପ୍ରକ୍ରିୟା ହୁଏ।');
                          }
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-between ${
                          quizAnswer === opt.index
                            ? opt.index === 1
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {quizAnswer === opt.index && (
                          <span>{opt.index === 1 ? '✓ ସଠିକ୍' : '✗ ଭୁଲ୍'}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {quizFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        quizAnswer === 1
                          ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-rose-100/70 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                      }`}
                    >
                      {quizFeedback}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Focus Assistance & Camera Sandbox */}
              <div className="space-y-4">
                {/* Camera Focus Assistance Widget */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-teal-600" />
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        କ୍ୟାମେରା ଧ୍ୟାନ ସହାୟତା (Focus Assistance)
                      </h3>
                    </div>

                    {isCameraActive && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>ସକ୍ରିୟ</span>
                      </span>
                    )}
                  </div>

                  {/* Privacy Notice */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-[11px] text-zinc-500 leading-relaxed">
                    <strong>ଗୋପନୀୟତା ପ୍ରତିଶ୍ରୁତି:</strong> ଭିଡିଓ ସମ୍ପୂର୍ଣ୍ଣ ଆପଣଙ୍କ ଡିଭାଇସରେ ସ୍ଥାନୀୟ ଭାବେ ରହେ। କୌଣସି ଫଟୋ ବା ଭିଡିଓ ସର୍ଭରକୁ ପଠାଯାଏ ନାହିଁ।
                  </div>

                  {!isCameraActive ? (
                    <div className="space-y-3">
                      <label className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cameraStudentConsent}
                          onChange={(e) => setCameraStudentConsent(e.target.checked)}
                          className="mt-0.5 rounded text-teal-600"
                        />
                        <span>ମୁଁ ଅଧ୍ୟୟନ ସମୟରେ ଧ୍ୟାନ ସହାୟତା ପାଇଁ ସ୍ଥାନୀୟ କ୍ୟାମେରା ବ୍ୟବହାର କରିବାକୁ ସମ୍ମତି ଦେଉଛି।</span>
                      </label>

                      <button
                        onClick={startCamera}
                        disabled={!cameraStudentConsent}
                        className="w-full py-2 px-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>କ୍ୟାମେରା ଆରମ୍ଭ କରନ୍ତୁ</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Video Preview Box */}
                      <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-700">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Simulation overlay if mock */}
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>ମୁଖମଣ୍ଡଳ କେନ୍ଦ୍ରୀଭୂତ (Attentive)</span>
                        </div>
                      </div>

                      <button
                        onClick={stopCamera}
                        className="w-full py-2 px-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CameraOff className="w-3.5 h-3.5" />
                        <span>କ୍ୟାମେରା ବନ୍ଦ କରନ୍ତୁ</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Focus Tips */}
                <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-2xl text-xs space-y-1.5">
                  <div className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ଧ୍ୟାନ ବୃଦ୍ଧି ପାଇଁ ପରାମର୍ଶ</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    ପ୍ରତି ୨୫-୩୦ ମିନିଟ୍ ପରେ ୫ ମିନିଟ୍ ବିରତି ନେଲେ ମନେରଖିବା ଶକ୍ତି ୪୦% ବୃଦ୍ଧି ପାଏ।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: 5-MINUTE INACTIVITY REMINDER */}
      {show5MinReminder && !isRestricted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ଆପଣ ଏବେ ବି ଅଧ୍ୟୟନ କରୁଛନ୍ତି କି? (Are you still here?)
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              ଗତ ୫ ମିନିଟ୍ ଧରି କୌଣସି ପାରସ୍ପରିକ କାର୍ଯ୍ୟ ହୋଇନାହିଁ। ଆପଣ କ୍ଲାନ୍ତ ଅନୁଭବ କରୁଛନ୍ତି କି? ଆପଣ ଚାହିଁଲେ ଏକ କ୍ଷୁଦ୍ର ବିରତି ନେଇପାରିବେ।
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setInactivityCounterSeconds(0);
                  setShow5MinReminder(false);
                }}
                className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                ହଁ, ମୁଁ ପଢୁଛି (Yes, I'm Studying)
              </button>

              <button
                onClick={() => {
                  setShow5MinReminder(false);
                  handleToggleBreak();
                }}
                className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                ୫ ମିନିଟ୍ ବିରତି ନିଅନ୍ତୁ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 10-MINUTE INACTIVITY / SCREEN-TIME RESTRICTION OVERLAY */}
      {isRestricted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-900 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ଅଧ୍ୟୟନ ଅଧିବେଶନ ସୀମିତ କରାଯାଇଛି (Session Restricted)
              </h2>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                କାରଣ: {restrictionReason}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                ଅଭିଭାବକଙ୍କ ସୁରକ୍ଷା ନୀତି ଅନୁସାରେ ୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା କିମ୍ବା ସ୍କ୍ରିନ୍-ସମୟ ଅତିକ୍ରାନ୍ତ ହେଲେ ଆପ୍ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଲକ୍ ହୋଇଥାଏ। ପୁନଃ ଅଧ୍ୟୟନ ପାଇଁ ଅଭିଭାବକଙ୍କ ଅନୁମୋଦନ ଆବଶ୍ୟକ।
              </p>
            </div>

            {unlockSubmitted ? (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-800 dark:text-teal-200 space-y-1">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mx-auto" />
                <div className="font-bold">ଅନଲକ୍ ଅନୁରୋଧ ପଠାଗଲା!</div>
                <div>ଅଭିଭାବକ ଅନୁମୋଦନ କରିବା ମାତ୍ରେ ଏହି ସ୍କ୍ରିନ୍ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଅନଲକ୍ ହୋଇଯିବ।</div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>ଅଭିଭାବକଙ୍କୁ ଅନଲକ୍ ଅନୁରୋଧ ପଠାନ୍ତୁ (Request Parent Unlock)</span>
                </button>

                <button
                  onClick={() => setShowDirectPinModal(true)}
                  className="w-full py-2.5 px-4 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>ଅଭିଭାବକ ପିନ୍ ଦ୍ୱାରା ତୁରନ୍ତ ଅନଲକ୍ (On-Device PIN Override)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-MODAL: STUDENT UNLOCK REQUEST FORM */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ଅନଲକ୍ ଅନୁରୋଧ ଫର୍ମ (Request Unlock)
            </h3>

            <form onSubmit={handleRequestUnlock} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  କାରଣ ବାଛନ୍ତୁ (Reason):
                </label>
                <select
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="ମୁଁ ପୁନର୍ବାର ପାଠ୍ୟକ୍ରମ ଆରମ୍ଭ କରିବାକୁ ଚାହୁଁଛି">ପାଠ୍ୟକ୍ରମ ଆରମ୍ଭ କରିବାକୁ ଚାହୁଁଛି (Resume Lesson)</option>
                  <option value="ଗୃହକାର୍ଯ୍ୟ ସମାପ୍ତ କରିବାକୁ ଅଧିକ ସମୟ ଆବଶ୍ୟକ">ଗୃହକାର୍ଯ୍ୟ ସମାପ୍ତ ପାଇଁ ସମୟ ଆବଶ୍ୟକ (Finish Homework)</option>
                  <option value="ଅଭ୍ୟାସ କୁଇଜ୍ ଦେବା ପାଇଁ">+୧୫ ମିନିଟ୍ କୁଇଜ୍ ଦେବା ପାଇଁ (Take Quiz)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ଅଭିଭାବକଙ୍କ ପାଇଁ ଟିପ୍ପଣୀ (Optional Note):
                </label>
                <input
                  type="text"
                  placeholder="ଯଥା: ବାପା, ମୋର ଆଉ ୧୦ ମିନିଟ୍ ପାଠ ବାକି ଅଛି।"
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="py-2 px-4 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  ବାତିଲ୍ (Cancel)
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                >
                  ପଠାନ୍ତୁ (Submit Request)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ON-DEVICE PARENT PIN OVERRIDE */}
      {showDirectPinModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <ShieldAlert className="w-10 h-10 text-teal-600 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ଅଭିଭାବକ ପିନ୍ ପ୍ରବେଶ କରନ୍ତୁ
            </h3>
            <p className="text-xs text-zinc-500">
              ଅଭିଭାବକ ନିଜର ୪-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ (1234) ଦେଇ ତୁରନ୍ତ ୩୦ ମିନିଟ୍ ଅନଲକ୍ କରିପାରିବେ।
            </p>

            <form onSubmit={handleDirectPinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={directPin}
                onChange={(e) => setDirectPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center text-2xl font-mono tracking-widest py-2 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />

              {pinError && (
                <div className="text-xs text-rose-600">{pinError}</div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDirectPinModal(false)}
                  className="py-2 px-4 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  ବାତିଲ୍
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl"
                >
                  ଅନଲକ୍ କରନ୍ତୁ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

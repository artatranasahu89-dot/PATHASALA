/**
 * BharatLearn AI — Server-Authorised Authentication Modal
 * Allows sign-in or registration as Parent or Student,
 * strictly enforces server-side role attribution and identity verification.
 */

import { useState } from 'react';
import {
  Shield,
  User,
  KeyRound,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ApiService } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, profile: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER_STUDENT' | 'REGISTER_PARENT'>('LOGIN');
  const [identifier, setIdentifier] = useState('ramesh.mohanty@example.in');
  const [secret, setSecret] = useState('1234');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Student Registration fields
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10-A');
  const [studentGrade, setStudentGrade] = useState(10);
  const [studentCategory, setStudentCategory] = useState('SECONDARY');

  // Parent Registration fields
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentPin, setParentPin] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await ApiService.authLogin(identifier, secret);
      onAuthSuccess(res.user, res.studentProfile || res.parentProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await ApiService.registerStudent({
        email: studentEmail,
        displayName: studentName,
        secret: studentPassword,
        category: studentCategory,
        gradeLevel: studentGrade,
        assignedClass: studentClass,
        curriculumCode: 'BSE_ODISHA',
      });
      onAuthSuccess(res.user, res.studentProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await ApiService.registerParent({
        email: parentEmail,
        phoneNumber: parentPhone,
        displayName: parentName,
        pin: parentPin,
      });
      onAuthSuccess(res.user, res.parentProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (role: 'PARENT' | 'STUDENT_10' | 'STUDENT_4') => {
    setError(null);
    if (role === 'PARENT') {
      setIdentifier('ramesh.mohanty@example.in');
      setSecret('1234');
    } else if (role === 'STUDENT_10') {
      setIdentifier('subhashree.mohanty@example.in');
      setSecret('student123');
    } else {
      setIdentifier('soumya.mohanty@example.in');
      setSecret('student123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/50 rounded-2xl flex items-center justify-center text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            ଭାରତଲର୍ଣ୍ଣ ସୁରକ୍ଷିତ ଲଗଇନ୍ (Verified Identity)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            ପୃଥକ ଶିକ୍ଷାର୍ଥୀ ଓ ଅଭିଭାବକ ଆକାଉଣ୍ଟ ପାଇଁ ସୁରକ୍ଷିତ ସର୍ଭର ଯାଞ୍ଚ।
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('LOGIN')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              tab === 'LOGIN' ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-zinc-500'
            }`}
          >
            ଲଗଇନ୍ (Login)
          </button>
          <button
            type="button"
            onClick={() => setTab('REGISTER_STUDENT')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              tab === 'REGISTER_STUDENT' ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-zinc-500'
            }`}
          >
            ନୂତନ ଛାତ୍ର
          </button>
          <button
            type="button"
            onClick={() => setTab('REGISTER_PARENT')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              tab === 'REGISTER_PARENT' ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-zinc-500'
            }`}
          >
            ନୂତନ ଅଭିଭାବକ
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {tab === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Quick Demo Switcher */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5">
                ଦ୍ରୁତ ପରୀକ୍ଷଣ ଆକାଉଣ୍ଟ (Verified Pilot Roles):
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDemoAccount('PARENT')}
                  className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                >
                  ଅଭିଭାବକ (Parent)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount('STUDENT_10')}
                  className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                >
                  ସୁଭଶ୍ରୀ (Class 10)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount('STUDENT_4')}
                  className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                >
                  ସୌମ୍ୟ (Class 4)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ଇମେଲ୍ କିମ୍ବା ଫୋନ୍ (Email or Phone)
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@example.in or +91..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ପାସୱାର୍ଡ କିମ୍ବା ଅଭିଭାବକ ପିନ୍ (Password or 4-Digit PIN)
              </label>
              <input
                type="password"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter password or 4-digit PIN"
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'ଯାଞ୍ଚ ହେଉଛି...' : 'ସୁରକ୍ଷିତ ଲଗଇନ୍ କରନ୍ତୁ (Sign In)'}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER STUDENT */}
        {tab === 'REGISTER_STUDENT' && (
          <form onSubmit={handleRegisterStudent} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ଶିକ୍ଷାର୍ଥୀଙ୍କ ନାମ (Full Name)
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="ଉଦାହରଣ: ପ୍ରତୀକ ସାହୁ"
                className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ଇମେଲ୍ (Student Email)
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.in"
                className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ଶ୍ରେଣୀ (Class Level)
                </label>
                <select
                  value={studentGrade}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setStudentGrade(g);
                    setStudentClass(`Class ${g}`);
                    if (g <= 5) setStudentCategory('PRIMARY');
                    else if (g <= 8) setStudentCategory('MIDDLE');
                    else if (g <= 10) setStudentCategory('SECONDARY');
                    else setStudentCategory('SENIOR_SECONDARY');
                  }}
                  className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>Class {g} {g <= 10 ? '(Controls Enforced)' : '(Optional)'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ପାସୱାର୍ଡ (Password)
                </label>
                <input
                  type="password"
                  required
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <p className="text-[10px] text-zinc-400">
              ନିୟମ: ଶ୍ରେଣୀ ୧–୧୦ ପାଇଁ ସର୍ଭର ଦ୍ୱାରା ଅଭିଭାବକ ନିୟନ୍ତ୍ରଣ ବାଧ୍ୟତାମୂଳକ।
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'ପଞ୍ଜୀକରଣ ହେଉଛି...' : 'ଛାତ୍ର ଆକାଉଣ୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ'}
            </button>
          </form>
        )}

        {/* TAB 3: REGISTER PARENT */}
        {tab === 'REGISTER_PARENT' && (
          <form onSubmit={handleRegisterParent} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ଅଭିଭାବକଙ୍କ ନାମ (Parent Name)
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="ଉଦାହରଣ: ପ୍ରଦୀପ ମହାପାତ୍ର"
                className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ଇମେଲ୍ (Email)
              </label>
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@example.in"
                className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ମୋବାଇଲ୍ (Phone)
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ୪-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ (4-Digit PIN)
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={parentPin}
                  onChange={(e) => setParentPin(e.target.value)}
                  placeholder="e.g. 5678"
                  className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                />
              </div>
            </div>

            <p className="text-[10px] text-zinc-400">
              ନିୟମ: ଏକ ଅଭିଭାବକ ଆକାଉଣ୍ଟ ସର୍ବାଧିକ ୨ ଜଣ ସନ୍ତାନଙ୍କୁ ସୁରକ୍ଷିତ କୋଡ୍ ସହିତ ଯୋଡ଼ିପାରିବେ।
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'ପଞ୍ଜୀକରଣ ହେଉଛି...' : 'ଅଭିଭାବକ ଆକାଉଣ୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

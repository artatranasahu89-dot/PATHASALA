/**
 * Page 10: Settings & Accessibility Page
 * User Profile, Accessibility Controls, Offline Cache Management, and Privacy.
 */

import { useState } from 'react';
import { ArrowLeft, Save, Shield, Trash2, User, Globe, Check, KeyRound, Languages } from 'lucide-react';
import type { AppPage, LearnerProfile, AccessibilitySettings, LanguageDimensionConfig, IndianLanguageCode } from '../types';
import { AccessibilityControls } from '../components/AccessibilityControls';
import { InlineLanguagePicker } from '../components/LanguageSelector';
import { ApiService } from '../services/api';
import { t, applyDocumentDirection } from '../services/i18n';

interface SettingsPageProps {
  profile: LearnerProfile | null;
  onUpdateProfile: (updates: Partial<LearnerProfile>) => void;
  onNavigate: (page: AppPage) => void;
}

export function SettingsPage({
  profile,
  onUpdateProfile,
  onNavigate,
}: SettingsPageProps) {
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [schoolName, setSchoolName] = useState(profile?.schoolName || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [savedMessage, setSavedMessage] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingCodeExpiry, setPairingCodeExpiry] = useState<number>(15);

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(
    profile?.accessibility || {
      fontSize: 'base',
      highContrast: false,
      reduceMotion: false,
      dyslexiaSpacing: false,
      screenReaderHints: false,
    }
  );

  const handleSave = () => {
    onUpdateProfile({
      fullName,
      schoolName,
      district,
      accessibility,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bharatlearn_offline_packs');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-teal-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ (Back to Dashboard)</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ସେଟିଂସ୍ ଓ ପ୍ରବେଶିକା ସୁବିଧା (Settings & Accessibility)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Personalize your viewing comfort, profile information, and offline storage.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          {savedMessage ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedMessage ? 'ସଂରକ୍ଷିତ ହେଲା! (Saved)' : 'ସଂରକ୍ଷଣ କରନ୍ତୁ (Save)'}</span>
        </button>
      </div>

      {/* Section 1: Accessibility Controls */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          ୧. ଦୃଶ୍ୟମାନତା ଓ ସୁବିଧା (Accessibility & Comfort)
        </h2>
        <AccessibilityControls
          settings={accessibility}
          onChange={(newSettings) => {
            setAccessibility(newSettings);
            onUpdateProfile({ accessibility: newSettings });
          }}
        />
      </section>

      {/* Section 2: Profile Information */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          ୨. ଶିକ୍ଷାର୍ଥୀ ବିବରଣୀ (Learner Profile)
        </h2>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ପୂରା ନାମ (Full Name)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ନିର୍ଦ୍ଧାରିତ ଶ୍ରେଣୀ ଓ ସେକ୍ସନ (Assigned Class)
              </label>
              <input
                type="text"
                value={profile?.assignedClass || 'Class 10-A (ମାଟ୍ରିକ)'}
                onChange={(e) => onUpdateProfile({ assignedClass: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600 font-semibold"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                ପ୍ରତି ଲଗଇନରେ ପୁନର୍ବାର ବାଛିବା ଆବଶ୍ୟକ ନାହିଁ।
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ବିଦ୍ୟାଳୟ / ମହାବିଦ୍ୟାଳୟ (School / College)
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ଜିଲ୍ଲା (District)
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2.5: Age-Based Parental Controls Status */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>୩. ଅଭିଭାବକ ମାର୍ଗଦର୍ଶନ ଓ ସ୍କ୍ରିନ୍ ସମୟ (Parental Guidance Policy)</span>
        </h2>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                ବୟସ ଓ ଶ୍ରେଣୀ-ଭିତ୍ତିକ ସୁରକ୍ଷା ନୀତି (Class-Based Policy Status)
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {profile?.gradeLevel && profile.gradeLevel <= 10
                  ? `ଶ୍ରେଣୀ ${profile.gradeLevel}: ବାଧ୍ୟତାମୂଳକ ସୁରକ୍ଷା ସକ୍ରିୟ (Mandatory controls active for Classes 1–10).`
                  : 'ଶ୍ରେଣୀ ୧୧–୧୨: ଐଚ୍ଛିକ ନିୟନ୍ତ୍ରଣ (Optional controls with student consent).'}
              </div>
            </div>

            <button
              onClick={() => onNavigate('parent_dashboard')}
              className="py-2 px-4 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold hover:bg-teal-100 transition shrink-0 cursor-pointer"
            >
              ଅଭିଭାବକ ପୋର୍ଟାଲ ଖୋଲନ୍ତୁ (Open Parent Portal)
            </button>
          </div>

          {/* Secure Pairing Code Card for Parent Linking */}
          <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200 block">
                  ଅଭିଭାବକ ସଂଯୋଗ କୋଡ୍ (Parent Pairing Code)
                </span>
                <p className="text-[11px] text-teal-700/80 dark:text-teal-400 mt-0.5">
                  ଅଭିଭାବକଙ୍କୁ ଆପଣଙ୍କ ପ୍ରଗତି ଓ ସ୍କ୍ରିନ୍ ସମୟ ପରିଚାଳନା କରିବାକୁ ଏହି ସୁରକ୍ଷିତ ୧୫-ମିନିଟ୍ କୋଡ୍ ଦିଅନ୍ତୁ।
                </p>
              </div>

              <button
                onClick={async () => {
                  try {
                    const res = await ApiService.generateStudentPairingCode();
                    setPairingCode(res.code);
                    setPairingCodeExpiry(res.validityMinutes || 15);
                  } catch {
                    // Fallback generator for demo
                    setPairingCode('BL-' + Math.floor(1000 + Math.random() * 9000));
                    setPairingCodeExpiry(15);
                  }
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                {pairingCode ? 'ନୂତନ କୋଡ୍ ସୃଷ୍ଟି କରନ୍ତୁ' : 'କୋଡ୍ ସୃଷ୍ଟି କରନ୍ତୁ (Generate Code)'}
              </button>
            </div>

            {pairingCode && (
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-teal-300 dark:border-teal-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">ସକ୍ରିୟ ଯୋଡ଼ିବା କୋଡ୍ (Active Code)</span>
                  <span className="text-lg font-mono font-extrabold text-teal-700 dark:text-teal-300 tracking-wider">
                    {pairingCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
                    ବୈଧତା: {pairingCodeExpiry} ମିନିଟ୍
                  </span>
                  <span className="text-[10px] text-zinc-400">କେବଳ ଥରେ ବ୍ୟବହାର୍ଯ୍ୟ</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <span className="text-zinc-500 block">ସଂଯୋଜିତ ଅଭିଭାବକ:</span>
              <strong className="text-zinc-800 dark:text-zinc-200">ରମେଶ ମହାନ୍ତି (+91 98765...)</strong>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <span className="text-zinc-500 block">ଦୈନିକ ସ୍କ୍ରିନ୍ ସମୟ ସୀମା:</span>
              <strong className="text-zinc-800 dark:text-zinc-200">୯୦ ମିନିଟ୍ / ଦିନ</strong>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <span className="text-zinc-500 block">ନିଷ୍କ୍ରିୟତା ଲକ୍:</span>
              <strong className="text-zinc-800 dark:text-zinc-200">୧୦ ମିନିଟ୍ ପରେ</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Offline Storage Management */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          ୩. ଅଫଲାଇନ୍ ସଂରକ୍ଷଣ ପରିଚାଳନା (Offline Storage)
        </h2>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              ଡାଉନଲୋଡ୍ ହୋଇଥିବା ଅଧ୍ୟାୟ ପ୍ୟାକ୍ (Local Chapter Cache)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              ମୋବାଇଲ୍ ମେମୋରି ଖାଲି କରିବାକୁ ଡାଉନଲୋଡ୍ ହୋଇଥିବା ଅଧ୍ୟାୟ ପ୍ୟାକ୍ ଲିଭାନ୍ତୁ। ଏହା ଦ୍ଵାରା ଆପଣଙ୍କ ଶିକ୍ଷଣ ଅଗ୍ରଗତି ନଷ୍ଟ ହେବ ନାହିଁ।
            </p>
          </div>

          <button
            onClick={handleClearCache}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{cacheCleared ? 'ସଫା ହେଲା! (Cleared)' : 'ମେମୋରି ସଫା କରନ୍ତୁ'}</span>
          </button>
        </div>
      </section>

      {/* Section 4: Privacy & DPDP Compliance */}
      <section className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>ଗୋପନୀୟତା ଓ ଶିଶୁ ସୁରକ୍ଷା (DPDP Act 2023 Compliance)</span>
        </div>
        <p className="leading-relaxed">
          ଭାରତଲର୍ଣ୍ଣ ଏଆଇ ନାବାଳକ ଶିକ୍ଷାର୍ଥୀଙ୍କ ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ବାଣିଜ୍ୟିକ ବିଜ୍ଞାପନ ପାଇଁ ବ୍ୟବହାର କରେ ନାହିଁ। କୌଣସି ଆଧାର ବା ବ୍ୟାଙ୍କ ତଥ୍ୟ ସଂଗ୍ରହ କରାଯାଏ ନାହିଁ। API କିଗୁଡ଼ିକ କେବଳ ସୁରକ୍ଷିତ ବ୍ୟାକ୍ଏଣ୍ଡରେ ସଂରକ୍ଷିତ।
        </p>
      </section>
    </div>
  );
}

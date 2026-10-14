/**
 * Page 2: Learner Onboarding Page
 * 4-Step Guided Setup adapting to learner category.
 */

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, User, Globe, Target, BookOpen } from 'lucide-react';
import type {
  AppPage,
  LearnerProfile,
  LearnerCategoryId,
  LanguageDimensionConfig,
  IndianLanguageCode,
} from '../types';
import { ALL_LEARNER_CATEGORIES, ALL_SCHEDULED_LANGUAGES, SAMPLE_SUBJECTS_MAP, SAMPLE_GOALS_MAP } from '../services/registryData';
import { CategoryCard } from '../components/CategoryCard';

interface OnboardingPageProps {
  currentProfile: LearnerProfile | null;
  onSaveProfile: (profile: LearnerProfile) => void;
  onNavigate: (page: AppPage) => void;
}

export function OnboardingPage({
  currentProfile,
  onSaveProfile,
  onNavigate,
}: OnboardingPageProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states initialized from current profile or defaults
  const [name, setName] = useState(currentProfile?.fullName || 'ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree Mohanty)');
  const [category, setCategory] = useState<LearnerCategoryId>(currentProfile?.category || 'SECONDARY');
  const [gradeLevel, setGradeLevel] = useState<number>(currentProfile?.gradeLevel || 10);
  const [curriculumCode, setCurriculumCode] = useState<string>(currentProfile?.curriculumCode || 'BSE_ODISHA');
  const [schoolName, setSchoolName] = useState<string>(currentProfile?.schoolName || 'ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, କଟକ');
  const [district, setDistrict] = useState<string>(currentProfile?.district || 'Cuttack');

  const [languages, setLanguages] = useState<LanguageDimensionConfig>(
    currentProfile?.languages || {
      uiLanguage: 'or',
      explanationLanguage: 'or',
      instructionalLanguage: 'or',
      assessmentLanguage: 'or',
    }
  );

  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentProfile?.enrolledSubjectIds || ['sub_bse_10_bio', 'sub_bse_10_phy']
  );

  const availableSubjects = SAMPLE_SUBJECTS_MAP[category] || [];

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      // Finalize and save
      const finalProfile: LearnerProfile = {
        id: currentProfile?.id || `learner_${crypto.randomUUID().slice(0, 8)}`,
        fullName: name.trim() || 'ଶିକ୍ଷାର୍ଥୀ',
        category,
        gradeLevel,
        assignedClass: currentProfile?.assignedClass || `Class ${gradeLevel} (${gradeLevel <= 5 ? 'ପ୍ରାଥମିକ' : gradeLevel <= 8 ? 'ମଧ୍ୟମ' : 'ମାଟ୍ରିକ'})`,
        parentLinkId: currentProfile?.parentLinkId || 'parent_mohanty_01',
        curriculumCode,
        schoolName,
        district,
        state: 'Odisha',
        isMinor: gradeLevel <= 10,
        languages,
        enrolledSubjectIds: selectedSubjects,
        goals: SAMPLE_GOALS_MAP[category] || [],
        accessibility: currentProfile?.accessibility || {
          fontSize: 'base',
          highContrast: false,
          reduceMotion: false,
          dyslexiaSpacing: false,
          screenReaderHints: false,
        },
      };

      onSaveProfile(finalProfile);
      onNavigate('dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      onNavigate('welcome');
    }
  };

  const updateLanguageAxis = (axis: keyof LanguageDimensionConfig, code: IndianLanguageCode) => {
    setLanguages((prev) => ({ ...prev, [axis]: code }));
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Step Indicator Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>ପର୍ଯ୍ୟାୟ {step} / 4 (Step {step} of 4)</span>
          <span className="text-teal-600 font-bold">
            {step === 1 && 'ଶିକ୍ଷାର୍ଥୀ ବର୍ଗ ଓ ବିବରଣୀ (Category & Details)'}
            {step === 2 && 'ଭାଷା ବିନ୍ୟାସ (4-Axis Language Setup)'}
            {step === 3 && 'ପାଠ୍ୟକ୍ରମ ଓ ବିଷୟ ଚୟନ (Subjects & Board)'}
            {step === 4 && 'ଶିକ୍ଷଣ ଲକ୍ଷ୍ୟ ନିର୍ଦ୍ଧାରଣ (Daily Goals)'}
          </span>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Category & Details */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ୧. ଆପଣଙ୍କ ଶିକ୍ଷାର୍ଥୀ ବର୍ଗ ବାଛନ୍ତୁ (Choose Learner Category)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Select the educational level that matches your current studies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ALL_LEARNER_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={category === cat.id}
                onSelect={(id) => setCategory(id)}
              />
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ପୂରା ନାମ (Full Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                placeholder="e.g. ସୁଭଶ୍ରୀ ମହାନ୍ତି"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ଜିଲ୍ଲା / ରାଜ୍ୟ (District / State)
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                placeholder="e.g. Cuttack, Odisha"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Language Setup */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ୨. ୪-ସ୍ତରୀୟ ଭାଷା ବିନ୍ୟାସ (4-Axis Language Configuration)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Decouple your explanation, UI, textbook, and assessment languages.
            </p>
          </div>

          <div className="space-y-4">
            {/* Explanation Language */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ବୁଝାଇବା ଭାଷା (Preferred Explanation Language)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  ଏଆଇ ଏଜେଣ୍ଟ ଧାରଣା ଓ ଦୈନନ୍ଦିନ ଉଦାହରଣ ଏହି ଭାଷାରେ ବୁଝାଇବ।
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { code: 'or', label: 'ଓଡ଼ିଆ (Pilot)' },
                  { code: 'hi', label: 'हिन्दी (Hindi)' },
                  { code: 'en', label: 'English' },
                  { code: 'bn', label: 'বাংলা (Bengali)' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => updateLanguageAxis('explanationLanguage', item.code as IndianLanguageCode)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                      languages.explanationLanguage === item.code
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-1 ring-teal-600'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assessment Language */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ପରୀକ୍ଷା ପ୍ରଶ୍ନ ଭାଷା (Assessment Language)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  ନିଦାନ ପରୀକ୍ଷା ଓ ପ୍ରଶ୍ନଗୁଡ଼ିକ ଏହି ଭାଷାରେ ପ୍ରଦର୍ଶିତ ହେବ।
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { code: 'or', label: 'ଓଡ଼ିଆ ମାଧ୍ୟମ' },
                  { code: 'en', label: 'English Medium' },
                  { code: 'hi', label: 'हिन्दी माध्यम' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => updateLanguageAxis('assessmentLanguage', item.code as IndianLanguageCode)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                      languages.assessmentLanguage === item.code
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-1 ring-teal-600'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Subjects & Syllabus */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ୩. ପାଠ୍ୟକ୍ରମ ଓ ବିଷୟ ସମୂହ (Curriculum & Enrolled Subjects)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Filtered for category: <strong className="text-teal-600">{category}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              ଶିକ୍ଷା ବୋର୍ଡ (Educational Board / Council)
            </label>
            <select
              value={curriculumCode}
              onChange={(e) => setCurriculumCode(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="BSE_ODISHA">BSE Odisha (Board of Secondary Education, Odisha)</option>
              <option value="CBSE_NCERT">CBSE / NCERT Standard</option>
              <option value="CHSE_ODISHA">CHSE Odisha (+2 Council)</option>
              <option value="ICSE">ICSE / CISCE</option>
              <option value="STATE_BOARD">General State Board</option>
            </select>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              ଉପଲବ୍ଧ ବିଷୟଗୁଡ଼ିକ (Available Subjects):
            </h3>

            <div className="space-y-2">
              {availableSubjects.map((sub) => {
                const isEnrolled = selectedSubjects.includes(sub.id);

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubjects((prev) =>
                        prev.includes(sub.id) ? prev.filter((id) => id !== sub.id) : [...prev, sub.id]
                      );
                    }}
                    className={`p-4 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isEnrolled
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {sub.titleNative}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {sub.titleEnglish} · {sub.totalChapters} ଟି ଅଧ୍ୟାୟ
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        isEnrolled
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      {isEnrolled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Learning Goals */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ୪. ଦୈନନ୍ଦିନ ଶିକ୍ଷଣ ଲକ୍ଷ୍ୟ (Daily Learning Goals)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Establish a consistent study habit tailored to your connectivity and schedule.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              ପ୍ରତିଦିନ କେତେ ସମୟ ପଢ଼ିବାକୁ ଚାହାଁନ୍ତି? (Daily Study Duration)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDailyMinutes(mins)}
                  className={`p-3 rounded-xl border text-center transition ${
                    dailyMinutes === mins
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold ring-1 ring-teal-600'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-base font-bold">{mins} ମିନିଟ୍</div>
                  <div className="text-[11px] text-zinc-500">{mins} Minutes/day</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ଶିକ୍ଷଣ ପରାମର୍ଶ (Pedagogical Advice)</span>
            </div>
            <p>
              ନିୟମିତ ୨୦–୩୦ ମିନିଟ୍ ନିଦାନ ଅଭ୍ୟାସ ଦ୍ଵାରା ବୋର୍ଡ ପରୀକ୍ଷା ଫଳାଫଳରେ ୪୦% ରୁ ଅଧିକ ଧାରଣାଗତ ସ୍ପଷ୍ଟତା ମିଳିଥାଏ।
            </p>
          </div>
        </div>
      )}

      {/* Navigation Footer Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ପୂର୍ବବର୍ତ୍ତୀ (Back)</span>
        </button>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer"
        >
          <span>{step === 4 ? 'ସମାପ୍ତ ଓ ଡ୍ୟାସବୋର୍ଡ ପ୍ରବେଶ' : 'ପରବର୍ତ୍ତୀ (Next)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

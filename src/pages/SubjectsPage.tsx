/**
 * Page 7: My Subjects & Courses Page
 * Displays enrolled subjects, syllabus breakdown, and offline chapter packs.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Download, CheckCircle2, Search, ArrowRight, Layers } from 'lucide-react';
import type { AppPage, CurriculumSubject, LearnerCategoryId } from '../types';
import { ApiService } from '../services/api';
import { SubjectCard } from '../components/SubjectCard';

interface SubjectsPageProps {
  category: LearnerCategoryId;
  onNavigate: (page: AppPage) => void;
  onSelectSubject?: (subject: CurriculumSubject) => void;
}

export function SubjectsPage({
  category,
  onNavigate,
  onSelectSubject,
}: SubjectsPageProps) {
  const [subjects, setSubjects] = useState<CurriculumSubject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubjectModal, setActiveSubjectModal] = useState<CurriculumSubject | null>(null);

  useEffect(() => {
    async function load() {
      const data = await ApiService.getSubjects(category);
      setSubjects(data);
    }
    load();
  }, [category]);

  const filtered = subjects.filter(
    (s) =>
      s.titleNative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleOffline = (subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, isDownloadedOffline: !s.isDownloadedOffline } : s))
    );
  };

  return (
    <div className="space-y-6 py-2">
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
            ମୋର ବିଷୟ ଓ ପାଠ୍ୟକ୍ରମ (My Subjects & Courses)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Category: <strong className="text-teal-600">{category}</strong> • Official state board & national curricula.
          </p>
        </div>

        <button
          onClick={() => onNavigate('category_select')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition self-start sm:self-auto cursor-pointer"
        >
          <span>ବର୍ଗ ପରିବର୍ତ୍ତନ (Change Cohort)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ବିଷୟ ଖୋଜନ୍ତୁ (Search enrolled subjects by name)..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onOpenSubject={(sub) => setActiveSubjectModal(sub)}
            onToggleOffline={handleToggleOffline}
          />
        ))}
      </div>

      {/* Chapter Breakdown Modal */}
      {activeSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  {activeSubjectModal.titleNative}
                </h3>
                <p className="text-xs text-zinc-500">
                  {activeSubjectModal.curriculumCode} · {activeSubjectModal.chapters.length} ଟି ଅଧ୍ୟାୟ
                </p>
              </div>
              <button
                onClick={() => setActiveSubjectModal(null)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-medium"
              >
                ବନ୍ଦ କରନ୍ତୁ
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto space-y-3">
              {activeSubjectModal.chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      ଅଧ୍ୟାୟ {idx + 1}: {ch.titleNative}
                    </span>
                    {ch.isDownloadedOffline ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ଅଫଲାଇନ୍ ଉପଲବ୍ଧ
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">ଅନଲାଇନ୍</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {ch.summaryNative}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/30">
              <span className="text-xs text-zinc-500">
                ପାଠ୍ୟପୁସ୍ତକ ପ୍ରମାଣିତ ବିଷୟବସ୍ତୁ
              </span>
              <button
                onClick={() => {
                  setActiveSubjectModal(null);
                  onNavigate('companion');
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>ଶିକ୍ଷଣ ସାଥୀରେ ଅଧ୍ୟୟନ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

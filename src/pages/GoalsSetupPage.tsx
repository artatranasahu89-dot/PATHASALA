/**
 * Page 5: Learning Goals Setup Page
 * Defines daily study targets, milestones, and habit streaks.
 */

import { useState } from 'react';
import { ArrowLeft, Check, Plus, Sparkles, Target, Trash2 } from 'lucide-react';
import type { AppPage, LearningGoal, LearnerCategoryId } from '../types';
import { SAMPLE_GOALS_MAP } from '../services/registryData';

interface GoalsSetupPageProps {
  category: LearnerCategoryId;
  goals: LearningGoal[];
  onUpdateGoals: (goals: LearningGoal[]) => void;
  onNavigate: (page: AppPage) => void;
}

export function GoalsSetupPage({
  category,
  goals,
  onUpdateGoals,
  onNavigate,
}: GoalsSetupPageProps) {
  const [activeGoals, setActiveGoals] = useState<LearningGoal[]>(
    goals.length > 0 ? goals : SAMPLE_GOALS_MAP[category] || []
  );

  const [newTitle, setNewTitle] = useState('');
  const [newMinutes, setNewMinutes] = useState(30);

  const handleToggle = (id: string) => {
    const updated = activeGoals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
    setActiveGoals(updated);
    onUpdateGoals(updated);
  };

  const handleDelete = (id: string) => {
    const updated = activeGoals.filter((g) => g.id !== id);
    setActiveGoals(updated);
    onUpdateGoals(updated);
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;

    const newGoal: LearningGoal = {
      id: `goal_${Date.now()}`,
      titleNative: newTitle.trim(),
      titleEnglish: newTitle.trim(),
      dailyMinutes: newMinutes,
      targetTimeline: 'Personal Goal',
      priority: 'MEDIUM',
      completed: false,
    };

    const updated = [...activeGoals, newGoal];
    setActiveGoals(updated);
    onUpdateGoals(updated);
    setNewTitle('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
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
            ଶିକ୍ଷଣ ଲକ୍ଷ୍ୟ ନିର୍ଦ୍ଧାରଣ (Learning Goals)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Category: <strong className="text-teal-600">{category}</strong> • Set realistic daily milestones.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <span>ସଂରକ୍ଷଣ କରନ୍ତୁ (Save Goals)</span>
        </button>
      </div>

      {/* Add New Goal Card */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" />
          <span>ନୂଆ ଶିକ୍ଷଣ ଲକ୍ଷ୍ୟ ଯୋଡ଼ନ୍ତୁ (Add Custom Goal)</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରଶ୍ନୋତ୍ତର ଅଭ୍ୟାସ କିମ୍ବା ୨୦ ମିନିଟ୍ ବିଜ୍ଞାନ ପଠନ..."
            className="flex-1 p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />

          <select
            value={newMinutes}
            onChange={(e) => setNewMinutes(Number(e.target.value))}
            className="p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value={15}>15 ମିନିଟ୍ / ଦିନ</option>
            <option value={30}>30 ମିନିଟ୍ / ଦିନ</option>
            <option value={45}>45 ମିନିଟ୍ / ଦିନ</option>
            <option value={60}>60 ମିନିଟ୍ / ଦିନ</option>
          </select>

          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            ଯୋଡ଼ନ୍ତୁ (Add)
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {activeGoals.map((g) => (
          <div
            key={g.id}
            className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
              g.completed
                ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(g.id)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                  g.completed
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-teal-600'
                }`}
              >
                {g.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <div>
                <h4
                  className={`text-sm font-bold ${
                    g.completed
                      ? 'line-through text-zinc-500 dark:text-zinc-400'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {g.titleNative}
                </h4>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  <span>{g.dailyMinutes} ମିନିଟ୍ ଦୈନନ୍ଦିନ</span>
                  <span aria-hidden="true">·</span>
                  <span>{g.targetTimeline}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      g.priority === 'HIGH'
                        ? 'text-amber-600 font-semibold'
                        : 'text-zinc-500'
                    }
                  >
                    {g.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(g.id)}
              className="p-1.5 text-zinc-400 hover:text-rose-600 transition"
              title="ଲିଭାନ୍ତୁ (Delete Goal)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Habit Tip */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 flex items-start gap-3 text-xs text-teal-900 dark:text-teal-200">
        <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          ଭାରତଲର୍ଣ୍ଣ ଏଜେଣ୍ଟ ଏହି ଲକ୍ଷ୍ୟ ଆଧାରରେ ପ୍ରତିଦିନ ପରବର୍ତ୍ତୀ ପ୍ରସଙ୍ଗ ଏବଂ ସ୍ମୃତି ପୁନରାବୃତ୍ତି (spaced repetition) ସୂଚନା ପ୍ରସ୍ତୁତ କରେ।
        </p>
      </div>
    </div>
  );
}

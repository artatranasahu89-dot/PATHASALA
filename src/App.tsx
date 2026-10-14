/**
 * BharatLearn AI — Main Application Router & State Orchestrator
 * Integrates all 10 required pages, 8 learner cohorts, and 22 languages.
 */

import { useState } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { useLearnerSession } from './hooks/useLearnerSession';
import type { AppPage, LearnerCategoryId, LearningGoal } from './types';

// The 10 Core Application Pages
import { WelcomePage } from './pages/WelcomePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { CategorySelectPage } from './pages/CategorySelectPage';
import { LanguageSetupPage } from './pages/LanguageSetupPage';
import { GoalsSetupPage } from './pages/GoalsSetupPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { CompanionEntryPage } from './pages/CompanionEntryPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { ParentDashboardPage } from './pages/ParentDashboardPage';
import { StudySessionPage } from './pages/StudySessionPage';
import { LoadingState } from './components/StateViews';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome');
  const {
    profile,
    languages,
    category,
    isLoading,
    updateLanguageAxis,
    updateCategory,
    updateProfile,
    switchStudent,
  } = useLearnerSession();

  const handleSelectCategory = (catId: LearnerCategoryId) => {
    updateCategory(catId);
  };

  const handleUpdateGoals = (goals: LearningGoal[]) => {
    updateProfile({ goals });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LoadingState message="ଭାରତଲର୍ଣ୍ଣ ଏଆଇ ପ୍ରସ୍ତୁତ ହେଉଛି... (Initializing BharatLearn AI...)" />
      </div>
    );
  }

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onSwitchStudent={switchStudent}
    >
      {currentPage === 'welcome' && (
        <WelcomePage
          onNavigate={setCurrentPage}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {currentPage === 'onboarding' && (
        <OnboardingPage
          currentProfile={profile}
          onSaveProfile={(p) => updateProfile(p)}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'category_select' && (
        <CategorySelectPage
          activeCategory={category}
          onSelectCategory={handleSelectCategory}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'language_setup' && (
        <LanguageSetupPage
          languages={languages}
          onUpdateAxis={updateLanguageAxis}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'goals_setup' && (
        <GoalsSetupPage
          category={category}
          goals={profile?.goals || []}
          onUpdateGoals={handleUpdateGoals}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'dashboard' && (
        <StudentDashboardPage
          profile={profile}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'subjects' && (
        <SubjectsPage
          category={category}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'companion' && (
        <CompanionEntryPage
          category={category}
          profile={profile}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'progress' && (
        <ProgressPage
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage
          profile={profile}
          onUpdateProfile={updateProfile}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'parent_dashboard' && (
        <ParentDashboardPage
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'study_session' && (
        <StudySessionPage
          profile={profile}
          onNavigate={setCurrentPage}
        />
      )}
    </AppLayout>
  );
}

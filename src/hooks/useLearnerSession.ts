/**
 * Hook for managing active learner profile, category, and language configurations
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  LearnerProfile,
  LanguageDimensionConfig,
  IndianLanguageCode,
  LearnerCategoryId,
} from '../types';
import { ApiService } from '../services/api';
import { SAMPLE_GOALS_MAP } from '../services/registryData';

export function useLearnerSession() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const loadedProfile = await ApiService.getLearnerProfile();
        setProfile(loadedProfile);
      } catch (err) {
        console.error('Failed to load learner session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const updateLanguageAxis = useCallback(
    (axis: keyof LanguageDimensionConfig, code: IndianLanguageCode) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const updatedLanguages = { ...prev.languages, [axis]: code };
        const updatedProfile = { ...prev, languages: updatedLanguages };
        ApiService.saveLearnerProfile(updatedProfile);
        return updatedProfile;
      });
    },
    []
  );

  const updateCategory = useCallback(
    (categoryId: LearnerCategoryId) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const updatedGoals = SAMPLE_GOALS_MAP[categoryId] || prev.goals;
        const updatedProfile: LearnerProfile = {
          ...prev,
          category: categoryId,
          gradeLevel: categoryId === 'PRIMARY' ? 3 : categoryId === 'MIDDLE' ? 7 : categoryId === 'SECONDARY' ? 10 : 12,
          goals: updatedGoals,
        };
        ApiService.saveLearnerProfile(updatedProfile);
        return updatedProfile;
      });
    },
    []
  );

  const updateProfile = useCallback((updates: Partial<LearnerProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updatedProfile = { ...prev, ...updates };
      ApiService.saveLearnerProfile(updatedProfile);
      return updatedProfile;
    });
  }, []);

  const switchStudent = useCallback(async (studentId: string) => {
    setIsLoading(true);
    try {
      const switchedProfile = await ApiService.switchActiveLearner(studentId);
      setProfile(switchedProfile);
      localStorage.setItem('bharatlearn_active_profile_v2', JSON.stringify(switchedProfile));
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    profile,
    languages: profile?.languages || {
      uiLanguage: 'or',
      explanationLanguage: 'or',
      instructionalLanguage: 'or',
      assessmentLanguage: 'or',
    },
    category: profile?.category || 'SECONDARY',
    isLoading,
    updateLanguageAxis,
    updateCategory,
    updateProfile,
    switchStudent,
  };
}

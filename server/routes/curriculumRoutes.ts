/**
 * BharatLearn AI — Curriculum & Content Router
 */

import { Router } from 'express';
import { CurriculumService } from '../services/curriculumService';

export const curriculumRouter = Router();

curriculumRouter.get('/subjects', (req, res) => {
  const category = (req.query.category as string) || 'SECONDARY';
  const subjects = CurriculumService.getSubjectsByCategory(category);
  res.json(subjects);
});

curriculumRouter.get('/chapters', (_req, res) => {
  const chapters = CurriculumService.getChapters();
  res.json(chapters);
});

curriculumRouter.get('/chapter-bundle/:chapterId', (req, res) => {
  const bundle = CurriculumService.getChapterBundle(req.params.chapterId);
  if (!bundle) {
    res.status(404).json({ error: 'Chapter bundle not found' });
    return;
  }
  res.json(bundle);
});

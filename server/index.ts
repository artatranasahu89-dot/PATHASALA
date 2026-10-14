/**
 * BharatLearn AI — Backend Application Gateway
 */

import express from 'express';
import { agentRouter } from './routes/agentRoutes';
import { curriculumRouter } from './routes/curriculumRoutes';
import { syncRouter } from './routes/syncRoutes';
import { parentRouter } from './routes/parentRoutes';
import { sessionRouter } from './routes/sessionRoutes';
import { authRouter } from './routes/authRoutes';
import { parentService } from './services/parentService';
import { learningStateService } from './services/learningStateService';
import { AuthenticatedRequest, requireAuth, requireRole } from './routes/authRoutes';

export function createServerApp() {
  const app = express();

  app.use(express.json());

  // Available seeded learner profiles
  const studentProfiles: Record<string, any> = {
    learner_pilot_odia_01: {
      id: 'learner_pilot_odia_01',
      fullName: 'ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree Mohanty)',
      category: 'SECONDARY',
      gradeLevel: 10,
      assignedClass: 'Class 10-A (ମାଟ୍ରିକ)',
      curriculumCode: 'BSE_ODISHA',
      schoolName: 'ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, କଟକ (Govt High School, Cuttack)',
      district: 'Cuttack',
      state: 'Odisha',
      isMinor: true,
      parentLinkId: 'parent_mohanty_01',
      languages: {
        uiLanguage: 'or',
        explanationLanguage: 'or',
        instructionalLanguage: 'or',
        assessmentLanguage: 'or',
      },
      enrolledSubjectIds: ['sub_bse_10_bio', 'sub_bse_10_phy'],
    },
    learner_child_02: {
      id: 'learner_child_02',
      fullName: 'ସୌମ୍ୟରଞ୍ଜନ ମହାନ୍ତି (Soumya Mohanty)',
      category: 'PRIMARY',
      gradeLevel: 4,
      assignedClass: 'Class 4-B (ପ୍ରାଥମିକ)',
      curriculumCode: 'BSE_ODISHA',
      schoolName: 'ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ, ଚୌଦ୍ୱାର (Primary School, Choudwar)',
      district: 'Cuttack',
      state: 'Odisha',
      isMinor: true,
      parentLinkId: 'parent_mohanty_01',
      languages: {
        uiLanguage: 'or',
        explanationLanguage: 'or',
        instructionalLanguage: 'or',
        assessmentLanguage: 'or',
      },
      enrolledSubjectIds: ['sub_pri_04_math', 'sub_pri_04_env'],
    },
  };


  // Health check endpoint
  app.get('/api/v1/healthz', (_req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'BharatLearn AI Agent Gateway',
      version: '3.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Learner profile endpoints
  app.get('/api/v1/learner/profile', requireAuth, requireRole(['STUDENT']), (req, res) => {
    const learnerId = (req as AuthenticatedRequest).user!.uid;
    const profile = studentProfiles[learnerId];
    if (!profile) return res.status(404).json({ error: 'Learner profile not found.' });
    res.json(profile);
  });

  app.post('/api/v1/learner/profile', requireAuth, requireRole(['STUDENT']), (req, res) => {
    const learnerId = (req as AuthenticatedRequest).user!.uid;
    const current = studentProfiles[learnerId];
    if (!current) return res.status(404).json({ error: 'Learner profile not found.' });
    // Identity, class, role, and parent links are server-owned; only language preferences are editable here.
    const allowed = ['uiLanguage', 'explanationLanguage', 'instructionalLanguage', 'assessmentLanguage'];
    const suppliedLanguages = req.body?.languages;
    if (suppliedLanguages !== undefined && (!suppliedLanguages || typeof suppliedLanguages !== 'object' || Array.isArray(suppliedLanguages))) {
      return res.status(400).json({ error: 'languages must be an object.' });
    }
    const languages = suppliedLanguages
      ? Object.fromEntries(allowed.filter((key) => typeof suppliedLanguages[key] === 'string').map((key) => [key, suppliedLanguages[key]]))
      : {};
    studentProfiles[learnerId] = { ...current, languages: { ...current.languages, ...languages } };
    res.json({ status: 'SAVED_IN_MEMORY_ONLY', profile: studentProfiles[learnerId] });
  });

  // Switch active learner endpoint
  app.post('/api/v1/learner/switch', requireAuth, requireRole(['STUDENT']), (req, res) => {
    const learnerId = (req as AuthenticatedRequest).user!.uid;
    const profile = studentProfiles[learnerId];
    if (!profile) return res.status(404).json({ error: 'Learner profile not found.' });
    // A learner cannot switch identity by supplying another student's ID.
    res.json({ status: 'UNCHANGED', profile });
  });

  // Learner progress endpoint - powered by real persistent learningStateService
  app.get('/api/v1/learner/progress', requireAuth, requireRole(['STUDENT']), (req, res) => {
    const learnerId = (req as AuthenticatedRequest).user!.uid;
    const progress = learningStateService.getLearningProgress(learnerId);
    res.json(progress);
  });

  // Mount API routers
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/agent', agentRouter);
  app.use('/api/v1/curriculum', curriculumRouter);
  app.use('/api/v1/sync', syncRouter);
  app.use('/api/v1/parent', parentRouter);
  app.use('/api/v1/study', sessionRouter);

  return app;
}

const app = createServerApp();
export default app;

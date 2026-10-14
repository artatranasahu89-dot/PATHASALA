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

  let activeStudentId = 'learner_pilot_odia_01';

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
  app.get('/api/v1/learner/profile', (_req, res) => {
    res.json(studentProfiles[activeStudentId]);
  });

  app.post('/api/v1/learner/profile', (req, res) => {
    studentProfiles[activeStudentId] = { ...studentProfiles[activeStudentId], ...req.body };
    res.json({ status: 'SAVED', profile: studentProfiles[activeStudentId] });
  });

  // Switch active learner endpoint
  app.post('/api/v1/learner/switch', (req, res) => {
    const { studentId } = req.body;
    if (studentProfiles[studentId]) {
      activeStudentId = studentId;
      return res.json({ status: 'SWITCHED', profile: studentProfiles[activeStudentId] });
    }
    res.status(404).json({ error: 'Student profile not found' });
  });

  // Learner progress endpoint - powered by real persistent learningStateService
  app.get('/api/v1/learner/progress', (_req, res) => {
    const progress = learningStateService.getLearningProgress(activeStudentId);
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

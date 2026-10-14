/**
 * BharatLearn AI — Offline Sync Router
 */

import { Router } from 'express';
import { requireAuth, requireRole } from './authRoutes';

export const syncRouter = Router();
syncRouter.use(requireAuth, requireRole(['STUDENT']));

const processedActionIds = new Set<string>();

syncRouter.post('/batch', (req, res) => {
  const { mutations } = req.body;
  if (!Array.isArray(mutations)) {
    res.status(400).json({ error: 'Mutations must be an array' });
    return;
  }

  const results = mutations.map((m: { clientActionId: string; actionType: string; payload: unknown }) => {
    const isDuplicate = processedActionIds.has(m.clientActionId);
    processedActionIds.add(m.clientActionId);

    return {
      clientActionId: m.clientActionId,
      status: isDuplicate ? 'ALREADY_PROCESSED' : 'ACCEPTED',
      processedAt: new Date().toISOString(),
    };
  });

  res.json({
    status: 'PROCESSED',
    processedCount: results.length,
    results,
  });
});

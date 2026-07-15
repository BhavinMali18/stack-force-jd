/**
 * queue.routes.js
 * ─────────────────────────────────────────────────────────────
 * Queue observability endpoints — the "CloudWatch Dashboard" equivalent.
 *
 * GET /api/queue/status — real-time queue depth + throughput stats
 */

const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getQueueStats } = require('../queue/queueFactory');

const router = express.Router();

router.get('/status', protect, async (req, res) => {
  const stats = await getQueueStats();
  res.json({
    queue: 'resume-processing',
    ...stats,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

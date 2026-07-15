/**
 * queueFactory.js — Resume Processing Queue (role-specific uploads)
 * Uses SimpleQueue (in-memory) for local dev.
 */

const { getQueue } = require('./simpleQueue');

const QUEUE_NAME = 'resume-processing';
const resumeQueue = getQueue(QUEUE_NAME, { concurrency: 4, maxRetries: 3 });

/**
 * Enqueue a resume processing job.
 */
const enqueueResume = async (payload) => {
  const job = await resumeQueue.add('process-resume', payload);
  return job.id;
};

const getQueueStats = () => {
  const stats = resumeQueue.getStats();
  return { waiting: stats.waiting, active: stats.active };
};

module.exports = { resumeQueue, enqueueResume, getQueueStats, QUEUE_NAME };

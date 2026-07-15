/**
 * poolQueue.js — Talent Pool Job Queue
 * Uses SimpleQueue (in-memory) for local dev.
 * Swap getQueue() with BullMQ for production.
 */

const { getQueue } = require('./simpleQueue');

const POOL_QUEUE_NAME = 'pool-processing';
const poolQueue = getQueue(POOL_QUEUE_NAME, { concurrency: 4, maxRetries: 3 });

const enqueuePoolResume = async (payload) => {
  const job = await poolQueue.add('process-pool-resume', payload);
  return job.id;
};

const getPoolQueueStats = () => {
  const stats = poolQueue.getStats();
  return { waiting: stats.waiting, active: stats.active };
};

module.exports = { poolQueue, enqueuePoolResume, getPoolQueueStats, POOL_QUEUE_NAME };

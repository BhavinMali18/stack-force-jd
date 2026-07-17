/**
 * poolWorkerInline.js — Talent Pool Job Processor
 * ─────────────────────────────────────────────────────────────
 * Registers a job processor on the pool queue.
 * Runs inside the API server process (no separate process needed with SimpleQueue).
 * Call startPoolWorker(io) once from index.js after DB connects.
 */

const { poolQueue } = require('../queue/poolQueue');
const { parseResume } = require('../services/pythonParser');
const PoolResume = require('../models/PoolResume');
const axios = require('axios').default;

const CONCURRENCY = 4;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function startPoolWorker(io, apiPort = 5000) {
  const processJob = async (job) => {
    const { poolResumeId, filePath, resumeKey, companyId } = job.data;
    const targetFile = filePath || resumeKey;
    console.log(`⏳ [PoolWorker] Processing: ${targetFile}`);

    // 1. Mark as processing
    await PoolResume.findByIdAndUpdate(poolResumeId, { processingStatus: 'processing' });

    // 2. Parse (Python or Node.js fallback)
    let parsed;
    try {
      parsed = await parseResume(targetFile);
    } catch (err) {
      await PoolResume.findByIdAndUpdate(poolResumeId, { processingStatus: 'failed', parseError: err.message });
      throw err;
    }

    // 3. Save to MongoDB
    await PoolResume.findByIdAndUpdate(poolResumeId, {
      name: parsed.name || 'Unknown',
      email: parsed.email || '',
      phone: parsed.phone || '',
      resumeText: parsed.text,
      extractedSkills: parsed.extractedSkills,
      cgpa: parsed.cgpa,
      yearsOfExperience: parsed.yearsOfExperience,
      college: parsed.college,
      sections: parsed.sections || {},
      processingStatus: 'done',
      parseError: null,
    });

    console.log(`✅ [PoolWorker] Done — ${parsed.name} | ${parsed.extractedSkills.length} skills`);

    // 4. Notify via Socket.io directly (same process)
    if (io) {
      io.to(`company:${companyId}`).emit('pool:resume-processed', {
        poolResumeId,
        name: parsed.name,
        skillCount: parsed.extractedSkills.length,
        timestamp: new Date().toISOString(),
      });
    }

    return { poolResumeId, name: parsed.name };
  };

  if (IS_PRODUCTION) {
    const { Worker } = require('bullmq');
    const { POOL_QUEUE_NAME } = require('../queue/poolQueue');
    const { getRedisClient } = require('../config/redis');
    const worker = new Worker(POOL_QUEUE_NAME, processJob, { connection: getRedisClient(), concurrency: CONCURRENCY });
    worker.on('failed', (job, err) => console.error(`❌ [PoolWorker] Job failed:`, err));
  } else {
    poolQueue.process(processJob);
  }

  console.log(`🚀 [PoolWorker] Registered inline — queue: pool-processing (concurrency: ${CONCURRENCY})`);
}

module.exports = { startPoolWorker };

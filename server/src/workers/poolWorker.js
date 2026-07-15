/**
 * poolWorker.js — Talent Pool Resume Processing Worker
 * ─────────────────────────────────────────────────────────────
 * Separate Node.js process. Run with: node src/workers/poolWorker.js
 *
 * For each queued pool resume:
 *  1. Calls Python parser (or Node.js fallback)
 *  2. Saves extracted data to PoolResume in MongoDB
 *  3. Notifies API → Socket.io → browser (real-time progress)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const axios = require('axios').default;

const { getConnection, POOL_QUEUE_NAME } = require('../queue/poolQueue');
const { parseResume } = require('../services/pythonParser');
const PoolResume = require('../models/PoolResume');
const { connectDB } = require('../config/db');

const API_INTERNAL_URL = `http://localhost:${process.env.PORT || 5000}/internal/pool-job-done`;
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '4', 10);

console.log(`\n [PoolWorker] Starting Talent Pool Worker`);
console.log(`   Queue:       ${POOL_QUEUE_NAME}`);
console.log(`   Concurrency: ${CONCURRENCY}`);

connectDB().then(() => {
  console.log(` [PoolWorker] MongoDB connected\n`);
  startWorker();
}).catch((err) => {
  console.error(' [PoolWorker] MongoDB connection failed:', err.message);
  process.exit(1);
});

function startWorker() {
  const worker = new Worker(
    POOL_QUEUE_NAME,
    async (job) => {
      const { poolResumeId, filePath, companyId } = job.data;
      const label = `[PoolJob ${job.id}]`;

      console.log(`⏳ ${label} Processing: ${filePath}`);

      // 1. Mark as processing
      await PoolResume.findByIdAndUpdate(poolResumeId, { processingStatus: 'processing' });

      // 2. Parse via Python (or Node.js fallback)
      let parsed;
      try {
        parsed = await parseResume(filePath);
      } catch (err) {
        console.error(` ${label} Parse failed: ${err.message}`);
        await PoolResume.findByIdAndUpdate(poolResumeId, {
          processingStatus: 'failed',
          parseError: err.message,
        });
        throw err; // triggers BullMQ retry
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

      console.log(`✅ ${label} Done — ${parsed.name} | ${parsed.extractedSkills.length} skills`);

      // 4. Notify API → Socket.io
      try {
        await axios.post(API_INTERNAL_URL, {
          poolResumeId,
          companyId,
          name: parsed.name,
          skillCount: parsed.extractedSkills.length,
        });
      } catch (e) {
        console.warn(`  ${label} Could not notify API: ${e.message}`);
      }

      return { poolResumeId, name: parsed.name };
    },
    {
      connection: getConnection(),
      concurrency: CONCURRENCY,
      skipVersionCheck: true,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(` [PoolWorker] Job ${job?.id} failed: ${err.message}`);
  });

  console.log(`[PoolWorker] Listening on "${POOL_QUEUE_NAME}" (concurrency: ${CONCURRENCY})\n`);
}

process.on('SIGINT', () => {
  console.log('\n⏹  [PoolWorker] Shutting down...');
  process.exit(0);
});

/**
 * resumeWorker.js
 * ─────────────────────────────────────────────────────────────
 * SEPARATE NODE.JS PROCESS — run with: node src/workers/resumeWorker.js
 *
 * This is the "Kubernetes Worker Pod" equivalent in local dev.
 * In production, you'd run 100s of these on a Kubernetes cluster,
 * each pulling jobs from SQS/Kafka and processing them in parallel.
 * Locally, one process is enough for development & testing.
 *
 * Job payload: { candidateId, filePath, roleId, requiredSkills, weightedSkills }
 * On success:  Updates Candidate in MongoDB, notifies API via HTTP
 * On failure:  BullMQ retries up to 3x with exponential backoff
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const axios = require('axios').default;

const { connection, QUEUE_NAME } = require('../queue/queueFactory');
const { parseResume } = require('../services/resumeParser');
const { computeMatchScore } = require('../services/skillMatcher');
const Candidate = require('../models/Candidate');
const { connectDB } = require('../config/db');

const API_INTERNAL_URL = `http://localhost:${process.env.PORT || 5000}/internal/job-done`;
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '4', 10); // 4 parallel jobs locally

console.log(`\n🔧 [Worker] Starting TalentForce Resume Worker`);
console.log(`   Queue:       ${QUEUE_NAME}`);
console.log(`   Concurrency: ${CONCURRENCY} parallel jobs`);
console.log(`   MongoDB:     ${process.env.MONGO_URI || 'mongodb://localhost:27017/talentforce'}`);

// ── Boot: Connect to MongoDB ───────────────────────────────
connectDB().then(() => {
  console.log(`✅ [Worker] MongoDB connected\n`);
  startWorker();
}).catch((err) => {
  console.error('❌ [Worker] MongoDB connection failed:', err.message);
  process.exit(1);
});

// ── Worker ─────────────────────────────────────────────────
function startWorker() {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { candidateId, filePath, roleId, requiredSkills = [], weightedSkills = [] } = job.data;
      const label = `[Job ${job.id}] ${candidateId}`;

      console.log(`⏳ ${label} — starting`);

      // 1. Mark candidate as "processing" in MongoDB
      await Candidate.findByIdAndUpdate(candidateId, { processingStatus: 'processing' });

      // 2. Parse the resume (text extraction + structured fields)
      let parsed;
      try {
        parsed = await parseResume(filePath);
      } catch (err) {
        console.error(`❌ ${label} — parse failed: ${err.message}`);
        await Candidate.findByIdAndUpdate(candidateId, { processingStatus: 'failed' });
        throw err; // BullMQ will retry
      }

      // 3. Compute skill match score
      const matchResult = computeMatchScore(
        parsed.extractedSkills,
        requiredSkills,
        weightedSkills,
      );

      // 4. Save all extracted data back to MongoDB
      await Candidate.findByIdAndUpdate(candidateId, {
        name: parsed.name || 'Unknown',
        email: parsed.email || '',
        phone: parsed.phone || '',
        resumeText: parsed.text,
        extractedSkills: parsed.extractedSkills,
        cgpa: parsed.cgpa,
        yearsOfExperience: parsed.yearsOfExperience,
        college: parsed.college,
        matchScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        hasMissingMustHave: matchResult.hasMissingMustHave,
        mustHaveMatched: matchResult.mustHaveMatched,
        mustHaveMissing: matchResult.mustHaveMissing,
        niceToHaveMatched: matchResult.niceToHaveMatched,
        niceToHaveMissing: matchResult.niceToHaveMissing,
        processingStatus: 'done',
      });

      console.log(`✅ ${label} — done (score: ${matchResult.score}%)`);

      // 5. Notify API server → it will push Socket.io event to browser
      try {
        await axios.post(API_INTERNAL_URL, {
          candidateId,
          roleId,
          score: matchResult.score,
          name: parsed.name,
        });
      } catch (e) {
        // Non-fatal — the candidate is already saved. Real-time update just won't fire.
        console.warn(`⚠️  ${label} — could not notify API: ${e.message}`);
      }

      return { candidateId, score: matchResult.score };
    },
    {
      connection,
      concurrency: CONCURRENCY,
      skipVersionCheck: true,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} FAILED after retries: ${err.message}`);
  });

  worker.on('error', (err) => {
    console.error(`❌ [Worker] Worker error: ${err.message}`);
  });

  console.log(`🚀 [Worker] Listening for jobs on "${QUEUE_NAME}" (concurrency: ${CONCURRENCY})\n`);
}

// ── Graceful shutdown ──────────────────────────────────────
process.on('SIGINT', async () => {
  console.log('\n⏹  [Worker] Shutting down gracefully...');
  process.exit(0);
});

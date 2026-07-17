/**
 * resumeWorkerInline.js — Role-specific Resume Job Processor
 * Runs inside the API server process using SimpleQueue.
 * Call startResumeWorker(io) once from index.js.
 */

const { resumeQueue } = require('../queue/queueFactory');
const { parseResume } = require('../services/pythonParser');
const { computeMatchScore } = require('../services/skillMatcher');
const Candidate = require('../models/Candidate');
const Role = require('../models/Role');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function startResumeWorker(io) {
  const processJob = async (job) => {
    const { candidateId, filePath, resumeKey, roleId, requiredSkills, weightedSkills } = job.data;
    const targetFile = filePath || resumeKey;
    console.log(`⏳ [ResumeWorker] Processing: ${targetFile}`);

    // 1. Parse
    let parsed;
    try {
      parsed = await parseResume(targetFile);
    } catch (err) {
      await Candidate.findByIdAndUpdate(candidateId, { processingStatus: 'failed' });
      throw err;
    }

    // 2. Score against role
    const result = computeMatchScore(parsed.extractedSkills, requiredSkills, weightedSkills);

    // 3. Save
    await Candidate.findByIdAndUpdate(candidateId, {
      name: parsed.name || 'Unknown',
      email: parsed.email || '',
      phone: parsed.phone || '',
      resumeText: parsed.text,
      extractedSkills: parsed.extractedSkills,
      cgpa: parsed.cgpa,
      yearsOfExperience: parsed.yearsOfExperience,
      college: parsed.college,
      matchScore: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      hasMissingMustHave: result.hasMissingMustHave,
      mustHaveMatched: result.mustHaveMatched,
      mustHaveMissing: result.mustHaveMissing,
      niceToHaveMatched: result.niceToHaveMatched,
      niceToHaveMissing: result.niceToHaveMissing,
      processingStatus: 'done',
    });

    await Role.findByIdAndUpdate(roleId, { $inc: { candidateCount: 1 } });

    console.log(`✅ [ResumeWorker] ${parsed.name} scored ${result.score}%`);

    // 4. Emit live update
    if (io && roleId) {
      io.to(`role:${roleId}`).emit('candidate:processed', {
        candidateId,
        name: parsed.name,
        score: result.score,
      });
    }

    return { candidateId, score: result.score };
  };

  if (IS_PRODUCTION) {
    const { Worker } = require('bullmq');
    const { QUEUE_NAME } = require('../queue/queueFactory');
    const { getRedisClient } = require('../config/redis');
    const worker = new Worker(QUEUE_NAME, processJob, { connection: getRedisClient(), concurrency: 4 });
    worker.on('failed', (job, err) => console.error(`❌ [ResumeWorker] Job failed:`, err));
  } else {
    resumeQueue.process(processJob);
  }

  console.log(`🚀 [ResumeWorker] Registered inline — queue: resume-processing`);
}

module.exports = { startResumeWorker };

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

function startResumeWorker(io) {
  resumeQueue.process(async (job) => {
    const { candidateId, filePath, roleId, requiredSkills, weightedSkills } = job.data;
    console.log(`⏳ [ResumeWorker] Processing: ${filePath}`);

    // 1. Parse
    let parsed;
    try {
      parsed = await parseResume(filePath);
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
  });

  console.log(`🚀 [ResumeWorker] Registered inline — queue: resume-processing`);
}

module.exports = { startResumeWorker };

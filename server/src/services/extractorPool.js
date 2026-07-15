const fs = require('fs');
const Candidate = require('../models/Candidate');
const Role = require('../models/Role');
const { parseResume } = require('./resumeParser');
const { computeMatchScore } = require('./skillMatcher');
const { analyzeResumeWithAI } = require('./aiService');

/**
 * A highly concurrent background worker pool that processes up to N resumes simultaneously.
 */
class ExtractorPool {
  constructor(concurrency = 100) {
    this.concurrency = concurrency;
    this.queue = [];
    this.activeCount = 0;
  }

  async processFile(job) {
    const { file, role, companyId } = job;
    try {
      // 1. Basic text extraction (OCR / PDF reading)
      const { text, name, email, phone, extractedSkills: naiveSkills, cgpa: naiveCgpa, yearsOfExperience: naiveExp, college: naiveCollege } = await parseResume(file.path);
      
      let finalData = null;

      // 2. AI Scoring
      if (process.env.GEMINI_API_KEY) {
        try {
          const aiData = await analyzeResumeWithAI(text, role);
          finalData = {
            extractedSkills: aiData.extractedSkills || [],
            matchScore: aiData.aiScore || 0,
            matchedSkills: aiData.matchedSkills || [],
            missingSkills: aiData.missingSkills || [],
            hasMissingMustHave: aiData.hasMissingMustHave || false,
            mustHaveMatched: aiData.mustHaveMatched || [],
            mustHaveMissing: aiData.mustHaveMissing || [],
            niceToHaveMatched: aiData.niceToHaveMatched || [],
            niceToHaveMissing: aiData.niceToHaveMissing || [],
            cgpa: aiData.cgpa,
            yearsOfExperience: aiData.yearsOfExperience,
            college: aiData.college || '',
            aiScore: aiData.aiScore,
            aiSummary: aiData.aiSummary,
            aiReasoning: aiData.aiReasoning,
          };
        } catch (aiErr) {
          console.warn(`AI Analysis failed for ${file.originalname}, falling back to rule-based. Error: ${aiErr.message}`);
        }
      }

      // 3. Rule-based scoring fallback
      if (!finalData) {
        const rules = computeMatchScore(naiveSkills, role.requiredSkills, role.weightedSkills);
        finalData = {
          extractedSkills: naiveSkills,
          matchScore: rules.score,
          matchedSkills: rules.matchedSkills,
          missingSkills: rules.missingSkills,
          hasMissingMustHave: rules.hasMissingMustHave,
          mustHaveMatched: rules.mustHaveMatched,
          mustHaveMissing: rules.mustHaveMissing,
          niceToHaveMatched: rules.niceToHaveMatched,
          niceToHaveMissing: rules.niceToHaveMissing,
          cgpa: naiveCgpa,
          yearsOfExperience: naiveExp,
          college: naiveCollege,
        };
      }

      const resumeUrl = `/uploads/resumes/${file.filename}`;

      // 4. Save Candidate to DB
      await Candidate.create({
        role: role._id,
        company: companyId,
        name,
        email,
        phone,
        resumeUrl,
        resumeFilename: file.originalname,
        resumeText: text,
        ...finalData,
      });

      // 5. Update Role candidate count atomically
      await Role.findByIdAndUpdate(role._id, { $inc: { candidateCount: 1 } });

    } catch (err) {
      console.error(`[ExtractorPool] Failed to process ${file.originalname}:`, err.message);
      try { fs.unlinkSync(file.path); } catch (_) {}
    }
  }

  async processNext() {
    if (this.queue.length === 0 || this.activeCount >= this.concurrency) return;
    
    this.activeCount++;
    const job = this.queue.shift();
    
    try {
      await this.processFile(job);
    } finally {
      this.activeCount--;
      // Immediately kick off the next job in the queue
      this.processNext();
    }
  }

  addJobs(files, role, companyId) {
    console.log(`[ExtractorPool] Queueing ${files.length} resumes for background extraction...`);
    for (const file of files) {
      this.queue.push({ file, role, companyId });
    }
    
    // Kickstart processing loops up to the concurrency limit
    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      this.processNext();
    }
  }
}

// Export a singleton instance configured with 100 concurrent OCR readers
const extractorPool = new ExtractorPool(100);
module.exports = extractorPool;

/**
 * pythonParser.js — HTTP client for the Python parser microservice
 * ─────────────────────────────────────────────────────────────────
 * Calls localhost:8000/parse with an absolute file path.
 * Falls back to the Node.js resumeParser if Python service is down.
 */

const axios = require('axios');
const { parseResume: nodeParseResume } = require('./resumeParser');

const PYTHON_PARSER_URL = process.env.PYTHON_PARSER_URL || 'http://localhost:8000';
let pythonAvailable = null; // cached availability check

/**
 * Check if the Python parser service is reachable.
 * Caches the result for 30s to avoid hammering on startup.
 */
async function checkPythonAvailable() {
  try {
    await axios.get(`${PYTHON_PARSER_URL}/health`, { timeout: 2000 });
    if (pythonAvailable !== true) {
      console.log('🐍 [Parser] Python parser service is available at', PYTHON_PARSER_URL);
    }
    pythonAvailable = true;
  } catch {
    if (pythonAvailable !== false) {
      console.warn('⚠️  [Parser] Python parser not available — using Node.js fallback');
    }
    pythonAvailable = false;
  }
  // Reset cache after 30s so it retries
  setTimeout(() => { pythonAvailable = null; }, 30000);
  return pythonAvailable;
}

/**
 * Parse a single resume file.
 * Tries Python parser first, falls back to Node.js.
 *
 * @param {string} filePath - Absolute path to the resume file
 * @returns {Object} Normalized parsed result
 */
async function parseResume(filePath) {
  const usePython = pythonAvailable === null
    ? await checkPythonAvailable()
    : pythonAvailable;

  if (usePython) {
    try {
      const { data } = await axios.post(
        `${PYTHON_PARSER_URL}/parse`,
        { filePath },
        { timeout: 30000 },
      );
      const d = data.data;
      // Normalize Python snake_case → Node camelCase
      return {
        text: d.text || '',
        name: d.name || 'Unknown',
        email: d.email || '',
        phone: d.phone || '',
        extractedSkills: d.extracted_skills || [],
        cgpa: d.cgpa ?? null,
        yearsOfExperience: d.years_of_experience ?? null,
        college: d.college || '',
        sections: d.sections || {},
        linkedin: d.linkedin || '',
        github: d.github || '',
        parsedBy: 'python',
      };

    } catch (err) {
      console.warn(`⚠️  [Parser] Python parse failed for ${filePath}: ${err.message}. Falling back.`);
      pythonAvailable = false;
    }
  }

  // ── Node.js fallback ──────────────────────────────────────
  const result = await nodeParseResume(filePath);
  return { ...result, parsedBy: 'node' };
}

module.exports = { parseResume, checkPythonAvailable };

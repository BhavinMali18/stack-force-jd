const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { SKILL_DICTIONARY } = require('./skillDictionary');

/**
 * Extract raw text from a resume file (PDF or DOCX).
 */
const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${ext}`);
};

/**
 * Naive name/email/phone extraction from text.
 */
const extractMeta = (text) => {
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?[\d\s\-().]{10,15})/);

  // Try to get the first non-empty line as name (heuristic)
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const nameLine = lines.find((l) => l.length > 2 && l.length < 60 && !/[@\d]/.test(l));

  return {
    name: nameLine || 'Unknown',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
  };
};

/**
 * Phase 2: Extract CGPA from text.
 */
const extractCGPA = (text) => {
  const patterns = [
    /cgpa\s*[:\-]?\s*(\d+\.?\d*)\s*(?:\/\s*\d+)?/i,
    /gpa\s*[:\-]?\s*(\d+\.?\d*)\s*(?:\/\s*\d+)?/i,
    /(\d+\.?\d*)\s*\/\s*10\s*cgpa/i,
    /(\d+\.?\d*)\s*\/\s*10/i,
    /(\d+\.?\d*)\s*cgpa/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 0 && val <= 10) return Math.round(val * 10) / 10;
      if (val > 0 && val <= 4) return Math.round((val / 4) * 10 * 10) / 10;
    }
  }
  return null;
};

/**
 * Phase 2: Extract years of experience from text.
 */
const extractExperience = (text) => {
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:work\s*)?experience/i,
    /experience\s*[:\-]?\s*(\d+)\+?\s*years?/i,
    /(\d+)\s*(?:-\s*\d+)?\s*years?\s*(?:of\s*)?(?:professional\s*)?experience/i,
    /(\d{4})\s*[-\u2013]\s*(?:present|current|now)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const val = parseInt(m[1]);
      if (val >= 1990 && val <= 2024) return Math.max(0, new Date().getFullYear() - val);
      if (val >= 0 && val <= 50) return val;
    }
  }
  return null;
};

/**
 * Phase 2: Extract college/university name from text.
 */
const extractCollege = (text) => {
  const lines = text.split('\n').map((l) => l.trim());
  const keywords = ['university', 'college', 'institute', 'iit', 'nit', 'bits', 'iiit', 'mit', 'vit', 'srm'];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some((kw) => lower.includes(kw)) && line.length > 5 && line.length < 100) {
      return line.replace(/^\W+|\W+$/g, '').trim();
    }
  }
  return '';
};

/**
 * Extract skills from text using the skill dictionary.
 */
const extractSkillsFromText = (text) => {
  const normalizedText = text.toLowerCase();
  const found = new Set();

  for (const skill of SKILL_DICTIONARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
    if (regex.test(normalizedText)) {
      found.add(skill);
    }
  }

  return Array.from(found);
};

/**
 * Full resume parsing pipeline.
 * Returns: { text, name, email, phone, extractedSkills, cgpa, yearsOfExperience, college }
 */
const parseResume = async (filePath) => {
  const text = await extractText(filePath);
  const { name, email, phone } = extractMeta(text);
  const extractedSkills = extractSkillsFromText(text);
  const cgpa = extractCGPA(text);
  const yearsOfExperience = extractExperience(text);
  const college = extractCollege(text);

  return { text, name, email, phone, extractedSkills, cgpa, yearsOfExperience, college };
};

module.exports = { parseResume, extractSkillsFromText };

const axios = require('axios');

const BASE_URL = 'http://api.dataatwork.org/v1';
const TIMEOUT = 5000; // 5 second timeout so we don't hang if API is down

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

// Simple memory cache to avoid hitting the rate limit
const cache = new Map();

/**
 * Autocomplete skills from Open Skills API
 * @param {string} query 
 * @returns {Array} List of skills
 */
const autocompleteSkill = async (query) => {
  if (!query) return [];
  if (cache.has(`auto_${query}`)) return cache.get(`auto_${query}`);

  try {
    const response = await api.get('/skills/autocomplete', {
      params: { contains: query }
    });
    
    cache.set(`auto_${query}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[OpenSkillsAPI] Autocomplete failed for query "${query}":`, error.message);
    return [];
  }
};

/**
 * Normalize an array of skills using the Open Skills API.
 * Maps extracted skills to their standardized names.
 */
const normalizeSkills = async (skillsArray) => {
  if (!skillsArray || skillsArray.length === 0) return [];
  
  const results = [];
  
  for (const skill of skillsArray) {
    if (cache.has(`norm_${skill}`)) {
      results.push(cache.get(`norm_${skill}`));
      continue;
    }

    try {
      const response = await api.get('/skills/autocomplete', {
        params: { contains: skill }
      });
      
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        // Find exact match or use the first suggestion's standardized name
        const exactMatch = data.find(item => item.suggestion.toLowerCase() === skill.toLowerCase());
        const standardizedSkill = exactMatch ? exactMatch.suggestion : data[0].suggestion;
        
        results.push(standardizedSkill);
        cache.set(`norm_${skill}`, standardizedSkill);
      } else {
        // Fallback to original
        results.push(skill);
        cache.set(`norm_${skill}`, skill);
      }
    } catch (error) {
      console.warn(`[OpenSkillsAPI] Failed to normalize "${skill}", using original.`);
      results.push(skill);
      // Cache the original on failure so we don't keep hitting a failing API
      cache.set(`norm_${skill}`, skill);
    }
  }
  
  // Return unique skills
  return Array.from(new Set(results));
};

module.exports = {
  autocompleteSkill,
  normalizeSkills
};

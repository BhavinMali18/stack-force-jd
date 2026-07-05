const { GoogleGenAI } = require('@google/genai');

/**
 * Phase 3: AI-powered resume analysis.
 * Uses Gemini 2.5 Flash to extract metadata, skills, and generate a match score with reasoning.
 * 
 * @param {string} resumeText - Raw text extracted from the resume
 * @param {Object} role - The Role object (containing weightedSkills, title, etc)
 * @returns {Object} Extracted and scored data
 */
const analyzeResumeWithAI = async (resumeText, role) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Prepare required skills string for the prompt
  const mustHaves = role.weightedSkills.filter((ws) => ws.type === 'must-have').map((ws) => ws.skill);
  const niceToHaves = role.weightedSkills.filter((ws) => ws.type === 'nice-to-have').map((ws) => ws.skill);

  const prompt = `
You are an expert technical recruiter analyzing a candidate's resume for a specific job role.

Role details:
- Title: ${role.title}
- Must-have skills: ${mustHaves.length > 0 ? mustHaves.join(', ') : 'None specified'}
- Nice-to-have skills: ${niceToHaves.length > 0 ? niceToHaves.join(', ') : 'None specified'}

Task 1: Extract candidate information from the resume text.
- cgpa (Number out of 10, normalize to 10-point scale if on 4.0 scale. null if not found)
- yearsOfExperience (Number of years of professional experience. null if not found)
- college (String, name of the college or university. empty string if not found)
- extractedSkills (Array of Strings, list of all technical skills found in the resume)

Task 2: Score the candidate against the role requirements.
- Match the extracted skills against the must-have and nice-to-have lists.
- If ANY must-have skill is completely missing from the resume, the max score is 40.
- Must-have skills account for 60% of the weight, nice-to-haves account for 40%.
- Score must be an integer between 0 and 100.

Task 3: Provide reasoning.
- aiSummary: A brief 2-sentence summary of the candidate's profile.
- aiReasoning: A 1-2 sentence explanation of why they received the score they did (e.g. "Missing React, which is a must-have").

Return the result as a raw JSON object (NO markdown code blocks, NO backticks, just the raw JSON string). It must exactly match this structure:
{
  "cgpa": number | null,
  "yearsOfExperience": number | null,
  "college": "string",
  "extractedSkills": ["string"],
  "mustHaveMatched": ["string"],
  "mustHaveMissing": ["string"],
  "niceToHaveMatched": ["string"],
  "niceToHaveMissing": ["string"],
  "aiScore": number,
  "aiSummary": "string",
  "aiReasoning": "string"
}

Resume Text:
"""
${resumeText.substring(0, 30000) /* limit text length to avoid token limits */}
"""
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    const data = JSON.parse(resultText);

    // Ensure hasMissingMustHave flag is set for UI compatibility
    data.hasMissingMustHave = Array.isArray(data.mustHaveMissing) && data.mustHaveMissing.length > 0;
    
    // For legacy UI compatibility, populate matchedSkills and missingSkills
    data.matchedSkills = [...(data.mustHaveMatched || []), ...(data.niceToHaveMatched || [])];
    data.missingSkills = [...(data.mustHaveMissing || []), ...(data.niceToHaveMissing || [])];

    return data;
  } catch (error) {
    console.error('AI Analysis failed:', error);
    throw new Error('AI parsing failed: ' + error.message);
  }
};

module.exports = { analyzeResumeWithAI };

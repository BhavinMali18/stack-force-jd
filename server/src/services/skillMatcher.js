/**
 * Phase 2 — Weighted skill scoring engine.
 *
 * Scoring rules:
 *  - Must-have skills carry 60% of the total weight.
 *  - Nice-to-have skills carry 40%.
 *  - If ANY must-have skill is missing → score is CAPPED at 40 max.
 *  - Phase 3: replace this entire file with an AI call. Same I/O shape.
 *
 * @param {string[]} extractedSkills  - skills found in the resume
 * @param {string[]} requiredSkills   - plain skills list (Phase 1 fallback)
 * @param {{ skill: string, type: string }[]} weightedSkills - Phase 2 weighted list
 */
const computeMatchScore = (extractedSkills, requiredSkills, weightedSkills = []) => {
  const normalized = extractedSkills.map((s) => s.toLowerCase().trim());

  const skillMatch = (req) => {
    const r = req.toLowerCase().trim();
    return normalized.some((e) => e === r || e.includes(r) || r.includes(e));
  };

  // --- Phase 2: Weighted scoring ---
  if (weightedSkills && weightedSkills.length > 0) {
    const mustHaves = weightedSkills.filter((ws) => ws.type === 'must-have');
    const niceToHaves = weightedSkills.filter((ws) => ws.type === 'nice-to-have');

    const mustHaveMatched = mustHaves.filter((ws) => skillMatch(ws.skill)).map((ws) => ws.skill);
    const mustHaveMissing = mustHaves.filter((ws) => !skillMatch(ws.skill)).map((ws) => ws.skill);
    const niceToHaveMatched = niceToHaves.filter((ws) => skillMatch(ws.skill)).map((ws) => ws.skill);
    const niceToHaveMissing = niceToHaves.filter((ws) => !skillMatch(ws.skill)).map((ws) => ws.skill);

    const mustFraction = mustHaves.length > 0 ? mustHaveMatched.length / mustHaves.length : 1;
    const niceFraction = niceToHaves.length > 0 ? niceToHaveMatched.length / niceToHaves.length : 1;

    let rawScore;
    if (mustHaves.length === 0) {
      rawScore = niceFraction * 100;
    } else if (niceToHaves.length === 0) {
      rawScore = mustFraction * 100;
    } else {
      rawScore = mustFraction * 60 + niceFraction * 40;
    }

    // Cap if any must-have is missing
    const hasMissingMustHave = mustHaveMissing.length > 0;
    const score = hasMissingMustHave ? Math.min(Math.round(rawScore), 40) : Math.round(rawScore);

    // Legacy matchedSkills / missingSkills for UI display
    const matchedSkills = [...mustHaveMatched, ...niceToHaveMatched];
    const missingSkills = [...mustHaveMissing, ...niceToHaveMissing];

    return {
      score,
      matchedSkills,
      missingSkills,
      hasMissingMustHave,
      mustHaveMatched,
      mustHaveMissing,
      niceToHaveMatched,
      niceToHaveMissing,
    };
  }

  // --- Phase 1 fallback: plain required skills ---
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      score: 0, matchedSkills: [], missingSkills: [],
      hasMissingMustHave: false,
      mustHaveMatched: [], mustHaveMissing: [],
      niceToHaveMatched: [], niceToHaveMissing: [],
    };
  }

  const matchedSkills = requiredSkills.filter((req) => skillMatch(req));
  const missingSkills = requiredSkills.filter((req) => !skillMatch(req));
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    score, matchedSkills, missingSkills,
    hasMissingMustHave: false,
    mustHaveMatched: matchedSkills, mustHaveMissing: missingSkills,
    niceToHaveMatched: [], niceToHaveMissing: [],
  };
};

module.exports = { computeMatchScore };

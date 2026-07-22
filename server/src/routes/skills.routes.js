const express = require('express');
const { autocompleteSkill } = require('../services/openSkillsApi');

const router = express.Router();

// GET /api/skills/autocomplete?query=java
router.get('/autocomplete', async (req, res) => {
  const { query } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter "query" is required' });
  }

  try {
    const results = await autocompleteSkill(query);
    res.json(results);
  } catch (error) {
    console.error('Error in /api/skills/autocomplete:', error);
    res.status(500).json({ error: 'Failed to fetch autocomplete suggestions' });
  }
});

module.exports = router;

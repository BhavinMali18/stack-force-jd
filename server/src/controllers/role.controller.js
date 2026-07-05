const Role = require('../models/Role');
const Candidate = require('../models/Candidate');

/**
 * POST /api/roles
 */
const createRole = async (req, res) => {
  const { title, description, weightedSkills, requiredSkills, experienceLevel, location, minExperience, maxExperience } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Role title is required.' });
  }

  // Accept either weightedSkills (Phase 2) or requiredSkills (Phase 1 fallback)
  let ws = [];
  if (Array.isArray(weightedSkills) && weightedSkills.length > 0) {
    ws = weightedSkills.map((item) =>
      typeof item === 'string'
        ? { skill: item.trim(), type: 'must-have' }
        : { skill: (item.skill || item).trim(), type: item.type || 'must-have' }
    );
  } else if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
    ws = requiredSkills.map((s) => ({ skill: s.trim(), type: 'must-have' }));
  }

  const role = new Role({
    company: req.company._id,
    title,
    description: description || '',
    weightedSkills: ws,
    experienceLevel: experienceLevel || 'Any',
    location: location || 'Remote',
    minExperience: minExperience || 0,
    maxExperience: maxExperience || 50,
  });

  await role.save(); // pre-save hook syncs requiredSkills
  res.status(201).json({ success: true, role });
};

/**
 * GET /api/roles
 */
const getRoles = async (req, res) => {
  const roles = await Role.find({ company: req.company._id }).sort({ createdAt: -1 });
  res.json({ success: true, roles });
};

/**
 * GET /api/roles/:id
 */
const getRoleById = async (req, res) => {
  const role = await Role.findOne({ _id: req.params.id, company: req.company._id });
  if (!role) {
    return res.status(404).json({ success: false, message: 'Role not found.' });
  }
  res.json({ success: true, role });
};

/**
 * PATCH /api/roles/:id
 */
const updateRole = async (req, res) => {
  const { title, description, weightedSkills, requiredSkills, experienceLevel, location, isActive, minExperience, maxExperience } = req.body;

  const role = await Role.findOne({ _id: req.params.id, company: req.company._id });
  if (!role) return res.status(404).json({ success: false, message: 'Role not found.' });

  if (title !== undefined) role.title = title;
  if (description !== undefined) role.description = description;
  if (experienceLevel !== undefined) role.experienceLevel = experienceLevel;
  if (location !== undefined) role.location = location;
  if (isActive !== undefined) role.isActive = isActive;
  if (minExperience !== undefined) role.minExperience = minExperience;
  if (maxExperience !== undefined) role.maxExperience = maxExperience;

  if (Array.isArray(weightedSkills)) {
    role.weightedSkills = weightedSkills.map((item) =>
      typeof item === 'string'
        ? { skill: item.trim(), type: 'must-have' }
        : { skill: (item.skill || item).trim(), type: item.type || 'must-have' }
    );
  } else if (Array.isArray(requiredSkills)) {
    role.weightedSkills = requiredSkills.map((s) => ({ skill: s.trim(), type: 'must-have' }));
  }

  await role.save();
  res.json({ success: true, role });
};

/**
 * DELETE /api/roles/:id
 */
const deleteRole = async (req, res) => {
  const role = await Role.findOneAndDelete({ _id: req.params.id, company: req.company._id });
  if (!role) return res.status(404).json({ success: false, message: 'Role not found.' });
  await Candidate.deleteMany({ role: role._id });
  res.json({ success: true, message: 'Role deleted.' });
};

module.exports = { createRole, getRoles, getRoleById, updateRole, deleteRole };

const express = require('express');
const {
  uploadCandidates,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
  exportCandidates,
  getRoleAnalytics,
  getAllCompanyCandidates,
} = require('../controllers/candidate.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.post('/roles/:roleId/candidates/upload', upload.array('resumes', 100), uploadCandidates);
router.get('/roles/:roleId/candidates', getCandidates);
router.get('/roles/:roleId/export', exportCandidates);
router.get('/roles/:roleId/analytics', getRoleAnalytics);

router.get('/candidates', getAllCompanyCandidates);
router.get('/candidates/:id', getCandidateById);
router.patch('/candidates/:id/status', updateCandidateStatus);
router.delete('/candidates/:id', deleteCandidate);

module.exports = router;


/**
 * storage.routes.js
 * ─────────────────────────────────────────────────────────────
 * Simulates the AWS S3 presigned URL pattern for local dev.
 *
 * Production flow:
 *   1. Client hits AWS to get a presigned PUT URL
 *   2. Client uploads file directly to S3 (bypasses your backend)
 *   3. S3 triggers an SQS event → worker picks it up
 *
 * Local equivalent:
 *   1. Client POSTs to /api/storage/presign → gets a token + upload URL
 *   2. Client PUTs file to /api/storage/upload/:token (this server)
 *   3. File saved to disk, job enqueued in BullMQ → worker picks it up
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth.middleware');
const { enqueueResume } = require('../queue/queueFactory');
const Candidate = require('../models/Candidate');
const Role = require('../models/Role');

const router = express.Router();

// ── Token store: in-memory map of token → { roleId, companyId, filename } ──
// In production this would be Redis with a TTL.
const pendingTokens = new Map();

// ── Upload storage: save to uploads/resumes/ ─────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const token = req.params.token;
    const meta = pendingTokens.get(token);
    const ext = path.extname(file.originalname);
    cb(null, `${token}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${ext}`));
  },
});

// ─────────────────────────────────────────────────────────────
// POST /api/storage/presign
// Body: { roleId, files: [{ name, size }] }
// Returns: [{ token, uploadUrl, filename }] — one per file
// ─────────────────────────────────────────────────────────────
router.post('/presign', protect, async (req, res) => {
  const { roleId, files } = req.body;

  if (!roleId || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'roleId and files[] are required' });
  }

  const role = await Role.findOne({ _id: roleId, company: req.user.companyId });
  if (!role) return res.status(404).json({ error: 'Role not found' });

  // Generate one token per file
  const tokens = files.map((file) => {
    const token = uuidv4();
    const meta = {
      roleId,
      companyId: req.user.companyId,
      originalName: file.name,
      requiredSkills: role.requiredSkills,
      weightedSkills: role.weightedSkills,
    };
    pendingTokens.set(token, meta);

    // Tokens expire after 15 minutes (production: S3 URL TTL)
    setTimeout(() => pendingTokens.delete(token), 15 * 60 * 1000);

    return {
      token,
      uploadUrl: `/api/storage/upload/${token}`,
      filename: file.name,
    };
  });

  res.json({ tokens });
});

// ─────────────────────────────────────────────────────────────
// PUT /api/storage/upload/:token
// Receives the actual file, saves to disk, creates a
// Candidate doc in "queued" state, then enqueues the job.
// ─────────────────────────────────────────────────────────────
router.put('/upload/:token', upload.single('file'), async (req, res) => {
  const { token } = req.params;
  const meta = pendingTokens.get(token);

  if (!meta) {
    // Clean up orphaned upload if token not found
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Invalid or expired upload token' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }

  // Create the candidate record in MongoDB with status "queued"
  const candidate = await Candidate.create({
    role: meta.roleId,
    company: meta.companyId,
    resumeUrl: `/uploads/resumes/${req.file.filename}`,
    resumeFilename: meta.originalName,
    processingStatus: 'queued',
    // name/email/skills will be filled by the worker
  });

  // Enqueue the resume processing job
  const jobId = await enqueueResume({
    candidateId: candidate._id.toString(),
    filePath: req.file.path,
    roleId: meta.roleId,
    requiredSkills: meta.requiredSkills,
    weightedSkills: meta.weightedSkills,
  });

  // Cleanup token
  pendingTokens.delete(token);

  res.status(202).json({
    candidateId: candidate._id,
    jobId,
    status: 'queued',
    message: 'Resume queued for processing',
  });
});

module.exports = router;

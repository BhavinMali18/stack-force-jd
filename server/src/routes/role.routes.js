const express = require('express');
const { createRole, getRoles, getRoleById, updateRole, deleteRole, parseJD } = require('../controllers/role.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect); // all role routes require auth

router.post('/roles/parse-jd', upload.single('jd'), parseJD);
router.route('/roles').get(getRoles).post(createRole);
router.route('/roles/:id').get(getRoleById).patch(updateRole).delete(deleteRole);

module.exports = router;

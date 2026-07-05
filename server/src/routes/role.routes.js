const express = require('express');
const { createRole, getRoles, getRoleById, updateRole, deleteRole } = require('../controllers/role.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // all role routes require auth

router.route('/roles').get(getRoles).post(createRole);
router.route('/roles/:id').get(getRoleById).patch(updateRole).delete(deleteRole);

module.exports = router;

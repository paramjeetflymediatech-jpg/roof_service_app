const express = require('express');
const router = express.Router();

const leadController = require('../controllers/lead.controller');

// /api/leads
router.post('/', leadController.createLead);
router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);

module.exports = router;

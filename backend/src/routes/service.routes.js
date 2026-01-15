const express = require('express');
const router = express.Router();

const serviceController = require('../controllers/service.controller');

// /api/services
router.post('/', serviceController.createService);
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;

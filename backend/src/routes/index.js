const express = require('express');

const serviceRoutes = require('./service.routes');
const leadRoutes = require('./lead.routes');

const router = express.Router();

router.use('/services', serviceRoutes);
router.use('/leads', leadRoutes);

module.exports = router;




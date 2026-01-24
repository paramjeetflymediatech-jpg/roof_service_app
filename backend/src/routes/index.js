const express = require('express');

const serviceRoutes = require('./service.routes');
const leadRoutes = require('./lead.routes');
const apiRoutes = require('./api.routes');

const router = express.Router();

router.use('/services', serviceRoutes);
router.use('/leads', leadRoutes);
router.use('/', apiRoutes);

module.exports = router;




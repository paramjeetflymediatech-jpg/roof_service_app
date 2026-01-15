const express = require('express');

const serviceRoutes = require('./service.routes');

const router = express.Router();

router.use('/services', serviceRoutes);

module.exports = router;

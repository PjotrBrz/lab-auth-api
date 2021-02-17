const { Router } = require('express');

const userRoutes = require('./routes/userRoutes');

const router = Router();

router.use('/users', userRoutes);

module.exports = router;

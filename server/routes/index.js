const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./user');
const attendanceRoutes = require('./attendance');
const otRoutes = require('./ot');
const leaveRoutes = require('./leave');
const advanceRoutes = require('./advance');
const reportRoutes = require('./report');
const siteFeedRoutes = require('./sitefeed');

router.use(userRoutes);
router.use(attendanceRoutes);
router.use(otRoutes);
router.use(leaveRoutes);
router.use(advanceRoutes);
router.use(reportRoutes);
router.use(siteFeedRoutes);

module.exports = router;

// Global error logging endpoint (production-safe)
router.post('/log-error', (req, res) => {
	try {
		console.error('[CLIENT ERROR]', req.body);
	} catch (e) {
		console.error('[CLIENT ERROR] (malformed body)', e);
	}
	res.status(204).end();
});

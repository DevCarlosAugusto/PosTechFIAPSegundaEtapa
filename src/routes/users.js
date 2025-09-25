import express from 'express';

let router = express.Router();

router.get('/', (req, res) => {
	res.json({
		message: 'User Routes',
		version: '0.1.1',
		status: 'online',
	});
});

export default router;

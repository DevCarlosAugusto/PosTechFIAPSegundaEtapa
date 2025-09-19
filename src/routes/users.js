import express from 'express';

let router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });

	res.json({
		message: 'User Routes',
		version: '0.1.1',
		status: 'online',
	});
});

export default router;

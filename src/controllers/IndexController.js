class HomeController {
	static getHomePage(req, res) {
		res.json({
			message: 'Bem-vindo à Home Page (com TypeScript e rotas modulares)!',
			version: '1.0.0',
			status: 'online',
		});
	}
}

export default HomeController;

class HomeController {
	static getHomePage(req, res) {
		res.json({
			message: 'Bem-vindo à Home Page (com TypeScript e rotas modulares) Yeah !',
			version: '0.1.1',
			status: 'online',
		});
	}
}

export default HomeController;

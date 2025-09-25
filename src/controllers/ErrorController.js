// Importa o http-errors para criar os erros, se necessário em alguma rota
// TODO: Criar Funções 'next' para utilizar o 'CreateError'
// import createError from 'http-errors';

const ErrorController = (err, req, res /*, next*/) => {
	const status = err.status || 500;
	const message = err.message || 'Erro interno do servidor';

	res.status(status).json({
		error: {
			status: status,
			message: message
		}
	});
};

export default ErrorController;

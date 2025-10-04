import app from '../app.js';
import debug from 'debug';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

let port = normalizePort(process.env.PORT || '3000');

app.set('port', port);

let server = http.createServer(app);

server.on('error', onError);
server.on('listening', onListening);

server.listen(port, '0.0.0.0');

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {

        return val;
    }

    if (port >= 0) {

        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);

    const green = '\x1b[38;2;129;201;149m';
    const reset = '\x1b[0m';
    const originalConsoleInfo = console.info;

    console.info = (message, ...args) => {
        originalConsoleInfo.call(console, `${green}${message}${reset}`, ...args);
    };

    console.info(`Listening on http://localhost:${bind}`);
}

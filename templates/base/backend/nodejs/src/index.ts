import { Server, IncomingMessage, ServerResponse } from 'http';

const exit = (error: Error) => {
    if (server) {
      server.close(() => {
          console.log('Server closed');
          process.exit(1);
      });
  } else process.exit(1);
};

import { app } from './app';

let server: Server<typeof IncomingMessage, typeof ServerResponse>;
const start = async () => {
    try {
        // Error handler for uncaught exceptions
        process.on('SIGINT', exit);
        process.on('SIGTERM', exit);
        process.on('uncaughtException', exit);
        process.on('unhandledRejection', exit);

        // Start server
        server = app.listen(8080, () => {
            console.log(`Listening to port ${8080}`);
        });
    } catch (err) {
        console.error('Error starting application\n', err);
    }
};

start();
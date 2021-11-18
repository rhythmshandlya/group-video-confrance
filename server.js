const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const opn = require('opn');
const server = require('./app');

server.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT||443}`);
  opn('http://localhost:3000/test');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled error occluded, shutting the server down');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught exception has occluded, shutting the server down');
  server.close(() => {
    process.exit(1);
  });
});

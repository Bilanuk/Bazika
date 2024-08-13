// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('http');

const url = process.argv[2];
const maxAttempts = parseInt(process.argv[3], 10);

let attempts = 0;

const checkHealth = () => {
  attempts++;
  http
    .get(url, (res) => {
      if (res.statusCode === 200) {
        console.log('Health check passed');
        process.exit(0);
      } else {
        console.log(`Health check failed with status code: ${res.statusCode}`);
        if (attempts < maxAttempts) {
          setTimeout(checkHealth, 1000);
        } else {
          process.exit(1);
        }
      }
    })
    .on('error', (err) => {
      console.log(
        `Health check failed with error: ${err.message.length > 0 ? err.message : 'waiting to start server'}`,
      );
      if (attempts < maxAttempts) {
        setTimeout(checkHealth, 1000);
      } else {
        process.exit(1);
      }
    });
};

checkHealth();

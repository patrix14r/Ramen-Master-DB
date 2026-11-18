// Punto de entrada: enciende el servidor (npm run dev).
const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`API Ramen Master escuchando en http://localhost:${env.port}/api`);
});

import express from "express";
import http from "http";
import { 
  createServer, 
  IncomingMessage, 
  ServerResponse } from 'http';


/**
 * Instancia de la aplicación Express
 * @type {express.Express}
 */
const app = express();

/**
 * Puerto en el que escucha el servidor
 * @type {number}
 */
const port = 3000;

/**
 * Manejador de la ruta '/weather'
 * @param {express.Request} req Objeto Request de Express
 * @param {express.Response} res Objeto Response de Express
 */
app.get('/weather', (req, res) => {
  const { location } = req.query;
  const api_key = '5c3557e8d64cd23142664b76ea4324f6';

  // Se realiza una petición HTTP GET a la API de Weatherstack
  http.get(`http://api.weatherstack.com/current?access_key=${api_key}&query=${location}`, (response) => {
    let data = '';

    // Se concatenan los datos de la respuesta a medida que se reciben
    response.on('data', (chunk) => {
      data += chunk;
    });

    // Cuando finaliza la respuesta, se procesan los datos y se envía la respuesta al cliente
    response.on('end', () => {
      const result = JSON.parse(data);

      if (result.success === false) {
        // Si la respuesta indica un error, se envía un código de estado 500 y un mensaje de error
        res.status(500).json({ error: result.error.info });
      } else {
        // Si la respuesta es satisfactoria, se envía la respuesta al cliente
        res.json(result);
      }
    });
  }).on('error', (error) => {
    // Si se produce un error durante la petición, se envía un código de estado 500 y un mensaje de error
    res.status(500).json({ error: error.message });
  });
});

/**
 * Manejador de todas las demás rutas (404)
 * @param {express.Request} req Objeto Request de Express
 * @param {express.Response} res Objeto Response de Express
 */
app.get("*", (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Inicia el servidor y se escucha en el puerto especificado
 */
app.listen(port, () => {
  console.log(`Se está ejecutando el servidor en el puerto ${port}:`);
});
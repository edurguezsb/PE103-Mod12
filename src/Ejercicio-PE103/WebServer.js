"use strict";
exports.__esModule = true;
var express_1 = require("express");
var http_1 = require("http");
/**
 * Instancia de la aplicación Express
 * @type {express.Express}
 */
var app = (0, express_1["default"])();
/**
 * Puerto en el que escucha el servidor
 * @type {number}
 */
var port = 3000;
/**
 * Manejador de la ruta '/weather'
 * @param {express.Request} req Objeto Request de Express
 * @param {express.Response} res Objeto Response de Express
 */
app.get('/weather', function (req, res) {
    var location = req.query.location;
    var api_key = '5c3557e8d64cd23142664b76ea4324f6';
    // Se realiza una petición HTTP GET a la API de Weatherstack
    http_1["default"].get("http://api.weatherstack.com/current?access_key=".concat(api_key, "&query=").concat(location), function (response) {
        var data = '';
        // Se concatenan los datos de la respuesta a medida que se reciben
        response.on('data', function (chunk) {
            data += chunk;
        });
        // Cuando finaliza la respuesta, se procesan los datos y se envía la respuesta al cliente
        response.on('end', function () {
            var result = JSON.parse(data);
            if (result.success === false) {
                // Si la respuesta indica un error, se envía un código de estado 500 y un mensaje de error
                res.status(500).json({ error: result.error.info });
            }
            else {
                // Si la respuesta es satisfactoria, se envía la respuesta al cliente
                res.json(result);
            }
        });
    }).on('error', function (error) {
        // Si se produce un error durante la petición, se envía un código de estado 500 y un mensaje de error
        res.status(500).json({ error: error.message });
    });
});
/**
 * Manejador de todas las demás rutas (404)
 * @param {express.Request} req Objeto Request de Express
 * @param {express.Response} res Objeto Response de Express
 */
app.use(function (req, res) {
    res.status(404).json({ error: 'Not found' });
});
/**
 * Inicia el servidor y se escucha en el puerto especificado
 */
app.listen(port, function () {
    console.log("Se est\u00E1 ejecutando el servidor en el puerto ".concat(port, ":"));
});

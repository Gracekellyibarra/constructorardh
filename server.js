// server.js - Archivo principal del Backend
const express = require('express');
const cors = require('cors');
const path = require('path'); 

// 💡 CORRECCIÓN DE RUTA: Apunta a src/controller/
const solicitudController = require('./src/controller/solicitud.controller'); 
// 💡 CORRECCIÓN DE RUTA: Apunta a src/config/
const db = require('./src/config/database'); // Importa la conexión para inicializar Sequelize

const app = express();
const PORT = 3001; // Puerto del servidor Express

// --- CONFIGURACIÓN DE MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las peticiones

// CONFIGURAR ARCHIVOS ESTÁTICOS
// Esto sirve los archivos HTML, CSS e imágenes (asumiendo que están en la carpeta 'public')
app.use(express.static(path.join(__dirname, 'public')));


// --- RUTAS DE API (Backend) ---

// 1. Ruta de solicitudes del cotizador (Calculadora.html)
// Llama a la lógica de guardado en la BD
app.post('/api/solicitudes', solicitudController.registrarCotizacion);

// 2. Ruta de contacto (index.html)
// Llama a la lógica de guardado del contacto
app.post('/api/contacto', solicitudController.handleSimpleContact);

// 3. Ruta de prueba (Mantiene la compatibilidad con la raíz)
app.get('/', (req, res) => {
    // Intenta enviar el index.html si existe en la carpeta pública
    res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
        if (err) {
            // Si falla, solo muestra un mensaje simple
            res.send('Servidor activo ✅. Acceda a /index.html o /calculadora.html');
        }
    });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    // La conexión a BD y la sincronización se inician en database.js
});

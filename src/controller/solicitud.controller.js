// src/controller/solicitud.controller.js - Capa de Control (C en MVC)

// 💡 RUTA CORRECTA: Subimos un nivel (a src/) y bajamos a config/
const { Cliente, Solicitud, CotizacionPreliminar, sequelize } = require('../config/database');
// 💡 RUTA CORRECTA: Subimos un nivel (a src/) y bajamos a services/
const { sendSimpleContactEmail, sendCotizationEmail } = require('../services/email.service');

// Función 1: Maneja el formulario simple de index.html
async function handleSimpleContact(req, res) {
    const t = await sequelize.transaction(); // Inicia la transacción
    try {
        const { name, email, phone, message } = req.body;
        
        let cliente = await Cliente.findOne({ where: { correo: email } }, { transaction: t });
        
        if (!cliente) {
            cliente = await Cliente.create({ nombre: name, correo: email, telefono: phone }, { transaction: t });
        }

        await Solicitud.create({
            id_cliente: cliente.id_cliente, 
            descripcion: 'Mensaje de contacto simple: ' + message,
            canal_ingreso: 'Web Contacto',
            estado: 'pendiente'
        }, { transaction: t });

        await t.commit(); // Confirma la transacción
        
        // Enviar Correo de Notificación (RF07)
        await sendSimpleContactEmail({ name, email, phone, message });

        return res.status(200).json({ mensaje: 'Mensaje de contacto enviado y registrado.' });
    } catch (error) {
        await t.rollback(); // Deshace la transacción si hay error
        console.error('Error al manejar contacto simple:', error);
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud de contacto. Verifique logs.' });
    }
}


// Función 2: Maneja el formulario de calculadora.html (CRUD - Crear)
async function registrarCotizacion(req, res) {
    const t = await sequelize.transaction(); // Inicia la transacción
    
    try {
        const { nombre, correo, telefono, descripcion, costo_estimado, parametros_resumen } = req.body;

        let cliente = await Cliente.findOne({ where: { correo: correo } }, { transaction: t });

        if (!cliente) {
            cliente = await Cliente.create({ nombre, correo, telefono }, { transaction: t });
        }

        const solicitud = await Solicitud.create({
            id_cliente: cliente.id_cliente,
            descripcion: 'Cotización preliminar: ' + descripcion,
            canal_ingreso: 'Web Cotizador',
            estado: 'pendiente', 
        }, { transaction: t });

        await CotizacionPreliminar.create({
            id_solicitud: solicitud.id_solicitud,
            monto_estimado: parseFloat(costo_estimado), 
            parametros_resumen: parametros_resumen 
        }, { transaction: t });

        await t.commit(); // Confirma la transacción (RF05)
        
        // Enviar Correo de Notificación (RF07)
        await sendCotizationEmail({
            id: solicitud.id_solicitud,
            nombre: nombre,
            correo: correo,
            descripcion: descripcion
        }, costo_estimado, parametros_resumen); 

        return res.status(201).json({ 
            mensaje: `Cotización de ${nombre} registrada con éxito. ID: RDH-2025-${solicitud.id_solicitud}`, 
            id: solicitud.id_solicitud 
        });

    } catch (error) {
        await t.rollback(); // Si falla, deshace todos los cambios
        console.error('Error FATAL al registrar la cotización:', error);
        return res.status(500).json({ mensaje: 'Error al registrar la cotización. Verifique logs y configuración de la BD.' });
    }
}

module.exports = {
    handleSimpleContact,
    registrarCotizacion
};
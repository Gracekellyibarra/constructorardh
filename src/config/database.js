// src/config/database.js - Archivo de Conexión y Modelos DAO
const { Sequelize, DataTypes } = require('sequelize');

// ⚠️ AJUSTA ESTAS CREDENCIALES A TU CONFIGURACIÓN DE MYSQL ⚠️
const sequelize = new Sequelize('integrador', 'root', '', { // 💡 REVISA 'integrador' y 'root'
    host: '127.0.0.1',
    port: 3307, // 👈 ¡CLAVE PARA XAMPP!
    dialect: 'mysql', 
    logging: console.log, // Muestra consultas SQL
    define: {
        freezeTableName: true // Evita que Sequelize pluralice
    }
});

// DEFINICIÓN DE MODELOS DAO
const Cliente = sequelize.define('Cliente', {
    id_cliente: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    correo: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    telefono: { type: DataTypes.STRING(30) }
}, { tableName: 'Cliente', timestamps: false });

const Solicitud = sequelize.define('Solicitud', {
    id_solicitud: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    estado: { type: DataTypes.ENUM('pendiente', 'procede', 'no procede'), defaultValue: 'pendiente' },
    canal_ingreso: { type: DataTypes.STRING(30), defaultValue: 'Web Contacto' }
}, { tableName: 'Solicitud', timestamps: true, createdAt: 'fecha_creacion' }); 

const CotizacionPreliminar = sequelize.define('CotizacionPreliminar', {
    id_cotizacion: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    monto_estimado: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    parametros_resumen: { type: DataTypes.JSON } 
}, { tableName: 'CotizacionPreliminar', timestamps: false });

// RELACIONES
Cliente.hasMany(Solicitud, { foreignKey: 'id_cliente' });
Solicitud.belongsTo(Cliente, { foreignKey: 'id_cliente' });

Solicitud.hasOne(CotizacionPreliminar, { foreignKey: 'id_solicitud' });
CotizacionPreliminar.belongsTo(Solicitud, { foreignKey: 'id_solicitud' });

// BLOQUE DE CONEXIÓN Y SINCRONIZACIÓN
sequelize.authenticate()
    .then(() => {
        console.log("Conexión MySQL establecida. Sincronizando modelos...");
        // 🚨 CAMBIO CLAVE: Usamos force: true para solucionar el Error 150
        // Esto borrará y recreará las tablas Cliente, Solicitud y CotizacionPreliminar.
        return sequelize.sync({ force: true }); 
    })
    .then(() => {
        console.log("Modelos de BD sincronizados. ✅");
    })
    .catch(err => {
        console.error("Error FATAL al conectar/sincronizar la BD:", err.message);
        console.error("Asegúrese de que XAMPP esté iniciado en el puerto 3307 y que la BD 'integrador' exista.");
    });

module.exports = {
    sequelize,
    Cliente,
    Solicitud,
    CotizacionPreliminar
};
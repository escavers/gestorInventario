const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",      
    password: "root",      
    database: "inventario_pc"
});

connection.connect((err) => {
    if (err) {
        console.error("Error al conectar: " + err.stack);
        return;
    }
    console.log("Conectado a la base de datos");
});

module.exports = connection;

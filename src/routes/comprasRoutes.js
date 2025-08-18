const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", (req, res) => {
  db.query("SELECT * FROM compras", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


router.get("/detalles", (req, res) => {
  const sql = `
    SELECT c.id_compra, c.fecha, u.nombre AS usuario, pr.nombre AS proveedor,
           p.nombre AS producto, dc.cantidad, dc.precio_unitario, dc.subtotal, c.total
    FROM compras c
    JOIN usuarios u ON c.id_usuario = u.id_usuario
    JOIN proveedores pr ON c.id_proveedor = pr.id_proveedor
    JOIN detalle_compras dc ON c.id_compra = dc.id_compra
    JOIN productos p ON dc.id_producto = p.id_producto
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;

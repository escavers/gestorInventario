const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM ventas", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


router.get("/detalles", (req, res) => {
  const sql = `
    SELECT v.id_venta, v.fecha, u.nombre AS usuario,
           p.nombre AS producto, dv.cantidad, dv.precio_unitario, dv.subtotal, v.total
    FROM ventas v
    JOIN usuarios u ON v.id_usuario = u.id_usuario
    JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
    JOIN productos p ON dv.id_producto = p.id_producto
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;

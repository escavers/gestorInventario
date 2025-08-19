const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("select nombre, descripcion, stock from productos", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

router.get("/detalles", (req, res) => {
  const sql = `
    SELECT p.id_producto, p.nombre, p.descripcion, p.stock, p.precio_venta, p.estado,
           c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

router.get("/proveedores", (req, res) => {
  const sql = `
    SELECT p.nombre AS producto, pr.nombre AS proveedor, pp.precio_costo
    FROM producto_proveedor pp
    JOIN productos p ON pp.id_producto = p.id_producto
    JOIN proveedores pr ON pp.id_proveedor = pr.id_proveedor
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;

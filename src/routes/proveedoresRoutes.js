const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM proveedores", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


router.get("/productos", (req, res) => {
  const sql = `
    SELECT pr.id_proveedor, pr.nombre AS proveedor, 
           p.nombre AS producto, pp.precio_costo
    FROM proveedores pr
    JOIN producto_proveedor pp ON pr.id_proveedor = pp.id_proveedor
    JOIN productos p ON pp.id_producto = p.id_producto
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;

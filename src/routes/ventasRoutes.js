const express = require("express");
const router = express.Router();
const db = require("../db");

// ----------------- GET todas las ventas -----------------
router.get("/", (req, res) => {
  db.query("SELECT * FROM ventas", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ----------------- GET detalles de ventas -----------------
router.get("/detalles", (req, res) => {
  const sql = `
    SELECT 
      v.id_venta,
      v.fecha,
      u.nombre AS usuario,
      p.nombre AS producto,
      dv.cantidad,
      dv.precio_unitario,
      dv.subtotal,
      v.total
    FROM ventas v
    JOIN usuarios u ON v.id_usuario = u.id_usuario
    LEFT JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
    LEFT JOIN productos p ON dv.id_producto = p.id_producto
    ORDER BY v.id_venta, dv.id_detalle
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Agrupar detalles por venta
    const ventas = {};
    results.forEach(row => {
      if (!ventas[row.id_venta]) {
        ventas[row.id_venta] = {
          id_venta: row.id_venta,
          fecha: row.fecha,
          usuario: row.usuario,
          total: row.total,
          detalles: []
        };
      }
      if (row.producto) {
        ventas[row.id_venta].detalles.push({
          producto: row.producto,
          cantidad: row.cantidad,
          precio_unitario: row.precio_unitario,
          subtotal: row.subtotal
        });
      }
    });

    res.json(Object.values(ventas));
5  });
});

// ----------------- POST crear venta -----------------
router.post("/", (req, res) => {
  const { id_usuario, productos } = req.body;
  // productos = [{id_producto, cantidad, precio_unitario}, ...]

  if (!id_usuario || !productos || productos.length === 0) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  let totalVenta = 0;
  productos.forEach(p => {
    totalVenta += p.cantidad * p.precio_unitario;
  });

  // Insertar venta
  const sqlVenta = "INSERT INTO ventas (id_usuario, total) VALUES (?, ?)";
  db.query(sqlVenta, [id_usuario, totalVenta], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const id_venta = result.insertId;

    // Insertar detalles
    const sqlDetalle = "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ?";
    const values = productos.map(p => [
      id_venta,
      p.id_producto,
      p.cantidad,
      p.precio_unitario,
      p.cantidad * p.precio_unitario
    ]);

    db.query(sqlDetalle, [values], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Actualizar stock
      productos.forEach(p => {
        const sqlStock = "UPDATE productos SET stock = stock - ? WHERE id_producto = ?";
        db.query(sqlStock, [p.cantidad, p.id_producto], err => { if(err) console.error(err); });
      });

      res.json({ message: "Venta creada", id_venta });
    });
  });
});

// ----------------- PUT actualizar venta -----------------
router.put("/:id", (req, res) => {
  const id_venta = req.params.id;
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  let totalVenta = 0;
  productos.forEach(p => totalVenta += p.cantidad * p.precio_unitario);

  // Actualizar total en ventas
  const sqlUpdateTotal = "UPDATE ventas SET total = ? WHERE id_venta = ?";
  db.query(sqlUpdateTotal, [totalVenta, id_venta], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Eliminar detalles anteriores
    const sqlDeleteDetalle = "DELETE FROM detalle_ventas WHERE id_venta = ?";
    db.query(sqlDeleteDetalle, [id_venta], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Insertar nuevos detalles
      const sqlDetalle = "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ?";
      const values = productos.map(p => [
        id_venta,
        p.id_producto,
        p.cantidad,
        p.precio_unitario,
        p.cantidad * p.precio_unitario
      ]);
      db.query(sqlDetalle, [values], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Venta actualizada" });
      });
    });
  });
});

// ----------------- DELETE eliminar venta -----------------
router.delete("/:id", (req, res) => {
  const id_venta = req.params.id;

  // Obtener detalles de venta para restaurar stock
  const sqlDetalles = "SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = ?";
  db.query(sqlDetalles, [id_venta], (err, detalles) => {
    if (err) return res.status(500).json({ error: err.message });

    // Restaurar stock
    detalles.forEach(d => {
      const sqlStock = "UPDATE productos SET stock = stock + ? WHERE id_producto = ?";
      db.query(sqlStock, [d.cantidad, d.id_producto], err => { if(err) console.error(err); });
    });

    // Eliminar detalles
    const sqlDeleteDetalle = "DELETE FROM detalle_ventas WHERE id_venta = ?";
    db.query(sqlDeleteDetalle, [id_venta], err => {
      if (err) return res.status(500).json({ error: err.message });

      // Eliminar venta
      const sqlDeleteVenta = "DELETE FROM ventas WHERE id_venta = ?";
      db.query(sqlDeleteVenta, [id_venta], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Venta eliminada" });
      });
    });
  });
});

module.exports = router;

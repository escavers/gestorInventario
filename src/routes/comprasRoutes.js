const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todas las compras
router.get("/", (req, res) => {
  db.query("SELECT id_compra, id_usuario, id_proveedor, fecha, total FROM compras", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Obtener detalles de compra
router.get("/detalles", (req, res) => {
  const sql = `
    SELECT 
      dc.id_detalle, dc.id_compra, dc.id_producto, dc.cantidad, dc.precio_unitario, dc.subtotal,
      c.total
    FROM compras c
    JOIN detalle_compras dc ON c.id_compra = dc.id_compra`;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Crear una nueva compra con validación de claves foráneas y fecha
router.post("/", (req, res) => {
  let { id_usuario, id_proveedor, fecha, total } = req.body;

  // Formatear fecha a 'YYYY-MM-DD HH:mm:ss'
  try {
    const dateObj = new Date(fecha);
    const twoDigits = (n) => n.toString().padStart(2, '0');
    fecha = `${dateObj.getFullYear()}-${twoDigits(dateObj.getMonth() + 1)}-${twoDigits(dateObj.getDate())} ${twoDigits(dateObj.getHours())}:${twoDigits(dateObj.getMinutes())}:${twoDigits(dateObj.getSeconds())}`;
  } catch {
    return res.status(400).json({ error: "Formato de fecha inválido" });
  }

  // Validar existencia de usuario y proveedor
  const sqlCheck = `
    SELECT 
      (SELECT COUNT(*) FROM usuarios WHERE id_usuario = ?) AS usuarioExiste,
      (SELECT COUNT(*) FROM proveedores WHERE id_proveedor = ?) AS proveedorExiste
  `;
  db.query(sqlCheck, [id_usuario, id_proveedor], (err, results) => {
    if (err) throw err;

    const { usuarioExiste, proveedorExiste } = results[0];

    if (!usuarioExiste) {
      return res.status(400).json({ error: "El id_usuario no existe." });
    }
    if (!proveedorExiste) {
      return res.status(400).json({ error: "El id_proveedor no existe." });
    }

    // Insertar compra
    const sqlInsert = `
      INSERT INTO compras (id_usuario, id_proveedor, fecha, total)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sqlInsert, [id_usuario, id_proveedor, fecha, total], (err, result) => {
      if (err) throw err;
      res.json({ message: "Compra creada correctamente", id: result.insertId });
    });
  });
});

// Crear un nuevo detalle de compra
router.post("/detalles", (req, res) => {
  const { id_compra, id_producto, cantidad, precio_unitario, subtotal } = req.body;
  const sql = `
    INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario, subtotal)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [id_compra, id_producto, cantidad, precio_unitario, subtotal], (err, result) => {
    if (err) throw err;
    res.json({ message: "Detalle de compra creado", id: result.insertId });
  });
});

// Actualizar una compra
router.put("/:id", (req, res) => {
  const { id } = req.params;
  let { id_usuario, id_proveedor, fecha, total } = req.body;

  try {
    const dateObj = new Date(fecha);
    const twoDigits = (n) => n.toString().padStart(2, '0');
    fecha = `${dateObj.getFullYear()}-${twoDigits(dateObj.getMonth() + 1)}-${twoDigits(dateObj.getDate())} ${twoDigits(dateObj.getHours())}:${twoDigits(dateObj.getMinutes())}:${twoDigits(dateObj.getSeconds())}`;
  } catch {
    return res.status(400).json({ error: "Formato de fecha inválido" });
  }

  const sql = `
    UPDATE compras SET id_usuario = ?, id_proveedor = ?, fecha = ?, total = ?
    WHERE id_compra = ?
  `;
  db.query(sql, [id_usuario, id_proveedor, fecha, total, id], (err) => {
    if (err) throw err;
    res.json({ message: "Compra actualizada" });
  });
});

// Actualizar un detalle de compra
router.put("/detalles/:id", (req, res) => {
  const { id } = req.params;
  const { id_compra, id_producto, cantidad, precio_unitario, subtotal } = req.body;
  const sql = `
    UPDATE detalle_compras 
    SET id_compra = ?, id_producto = ?, cantidad = ?, precio_unitario = ?, subtotal = ?
    WHERE id_detalle = ?
  `;
  db.query(sql, [id_compra, id_producto, cantidad, precio_unitario, subtotal, id], (err) => {
    if (err) throw err;
    res.json({ message: "Detalle de compra actualizado" });
  });
});
//DELETE
// Eliminar una compra y sus detalles asociados
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // Primero eliminar los detalles de compra relacionados
  const sqlDeleteDetalles = "DELETE FROM detalle_compras WHERE id_compra = ?";
  db.query(sqlDeleteDetalles, [id], (err) => {
    if (err) return res.status(500).json({ error: "Error eliminando detalles de compra" });

    // Luego eliminar la compra
    const sqlDeleteCompra = "DELETE FROM compras WHERE id_compra = ?";
    db.query(sqlDeleteCompra, [id], (err) => {
      if (err) return res.status(500).json({ error: "Error eliminando compra" });

      res.json({ message: "Compra y detalles eliminados correctamente" });
    });
  });
});

//DELETE
// Eliminar un detalle de compra
router.delete("/detalles/:id", (req, res) => {
  const { id } = req.params;

  // Verificar si el detalle de compra existe
  const sqlCheck = "SELECT * FROM detalle_compras WHERE id_detalle = ?";
  db.query(sqlCheck, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al verificar el detalle de compra" });
    if (results.length === 0) return res.status(404).json({ error: "Detalle de compra no encontrado" });

    // Eliminar el detalle de compra
    const sqlDelete = "DELETE FROM detalle_compras WHERE id_detalle = ?";
    db.query(sqlDelete, [id], (err) => {
      if (err) return res.status(500).json({ error: "Error eliminando detalle de compra" });
      res.json({ message: "Detalle de compra eliminado" });
    });
  });
});

module.exports = router;

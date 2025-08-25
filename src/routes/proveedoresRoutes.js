const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM proveedores", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM proveedores WHERE id_proveedor = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json(result[0]);
  });
});

router.post("/", (req, res) => {
  const { nombre, telefono, correo, direccion } = req.body;
  if (!nombre || !telefono || !correo || !direccion) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const nuevoProveedor = { nombre, telefono, correo, direccion };
  db.query("INSERT INTO proveedores SET ?", nuevoProveedor, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, ...nuevoProveedor });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, correo, direccion } = req.body;

  db.query(
    "UPDATE proveedores SET nombre = ?, telefono = ?, correo = ?, direccion = ? WHERE id_proveedor = ?",
    [nombre, telefono, correo, direccion, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Proveedor no encontrado" });
      res.json({ id, nombre, telefono, correo, direccion });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM proveedores WHERE id_proveedor = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json({ message: "Proveedor eliminado correctamente" });
  });
});

module.exports = router;

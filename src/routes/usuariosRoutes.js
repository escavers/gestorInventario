const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE id_usuario = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { nombre, correo, contraseña, rol } = req.body;
  db.query(
    "INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)",
    [nombre, correo, contraseña, rol],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Usuario agregado", id: result.insertId });
    }
  );
});


router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contraseña, rol } = req.body;
  db.query(
    "UPDATE usuarios SET nombre=?, correo=?, contraseña=?, rol=? WHERE id_usuario=?",
    [nombre, correo, contraseña, rol, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ message: "Usuario actualizado" });
    }
  );
});


router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM usuarios WHERE id_usuario=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  });
});

module.exports = router;

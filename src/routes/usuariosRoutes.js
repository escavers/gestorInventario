
const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { nombre, apellido, correo, rol } = req.body;
  db.query(
    "INSERT INTO usuarios (nombre, apellido, correo, rol) VALUES (?, ?, ?, ?)",
    [nombre, apellido, correo, rol],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Usuario agregado", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo, rol } = req.body;
  db.query(
    "UPDATE usuarios SET nombre=?, apellido=?, correo=?, rol=? WHERE id_usuario=?",
    [nombre, apellido, correo, rol, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Usuario actualizado" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM usuarios WHERE id_usuario=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Usuario eliminado" });
  });
});

module.exports = router;

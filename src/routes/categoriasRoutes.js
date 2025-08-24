const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", (req, res) => {
  db.query("SELECT * FROM categorias", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { nombre } = req.body;

  const sql = `INSERT INTO categorias (nombre) VALUES (?)`
  db.query(sql, [nombre], (err, result) => {
    if (err){
      console.log(err);
      return res.status(500).json({error: "Error en el Servidor"})
    }
    
    res.status(201).json({message: "Categoria Creada Exitosamente!! :)", id: result.insertId})
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  const sql = `UPDATE categorias 
  SET nombre = ? WHERE id_categoria = ?`;

  db.query(sql, [nombre, id], (err, result) => {
    if (err){
      console.log(err);
      return res.status(500).json({ error: "Error al Actualizar la Categoria" });
    }
    res.status(201).json({ message: "La Categoria se actualizo Exitosamente!! :)" })
  });
});

module.exports = router;

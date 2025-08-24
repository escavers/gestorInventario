const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", (req, res) => {
  db.query("SELECT * FROM productos", (err, results) => {
    /*if (err) throw err;
    res.json(results);*/
    
    if (err){
      console.error(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
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
    if(err) {
      console.log(err);
      return res.status(500).json({error: "Error en el Servidor"});
    }
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
    if (err){
      console.log(err);
      return res.status(500).json({error: "Error en el Servidor"});
    }
    res.json(results);
  });
});

//POST
router.post("/", (req, res) => {
  const { nombre, descripcion, stock, precio_venta, id_categoria } = req.body;

  const sql = `INSERT INTO productos (nombre, descripcion, stock, precio_venta, id_categoria) VALUES (?, ?, ?, ?, ?)`;
  
  db.query(sql, [nombre, descripcion, stock, precio_venta, id_categoria], (err, result) => {
    if (err){
      console.error(err);
      return res.status(500).json({error: "Error al crear el producto"});
    }
    res.status(201).json({message: "Producto creado exitosamente", id: result.insertId});
  });
});

//PUT
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, stock, precio_venta, id_categoria } = req.body

  const sql = `UPDATE productos 
  SET nombre = ?, descripcion = ?, stock = ?, precio_venta = ?, id_categoria = ? 
  WHERE id_producto = ?`;
  db.query(sql, [nombre, descripcion, stock, precio_venta, id_categoria, id], (err, result) => {
    if (err){
      console.log(err);
      console.log(id)
      return res.status(500).json({err: "Error al Actualizar el Producto"},);
    }
    res.status(201).json({ message: "Producto Actualizado Exitosamente" })
  })

});

module.exports = router;

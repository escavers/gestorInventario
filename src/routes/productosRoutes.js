const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", (req, res) => {
  db.query("SELECT * FROM productos WHERE estado = 1", (err, results) => {
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


// POST - Crear producto (con o sin proveedor)
router.post("/", (req, res) => {
  const { nombre, descripcion, stock, precio_venta, id_categoria, id_proveedor, precio_costo } = req.body;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Error al iniciar transacción" });

    // 1. Insertar producto
    const sqlProducto = `INSERT INTO productos (nombre, descripcion, stock, precio_venta, id_categoria) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sqlProducto, [nombre, descripcion, stock, precio_venta, id_categoria], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: "Error al crear producto" });
        });
      }

      const id_producto = result.insertId;

      // 2. Si hay proveedor, insertar relación
      if (id_proveedor && precio_costo) {
        const sqlProveedor = `INSERT INTO producto_proveedor (id_producto, id_proveedor, precio_costo) VALUES (?, ?, ?)`;
        
        db.query(sqlProveedor, [id_producto, id_proveedor, precio_costo], (err, result) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Error al agregar proveedor" });
            });
          }
          //FORMATO DE ENVIO EN JSON (para que llene producto_proveedor)
          /*
          {
            "nombre": "Mouse Gamer",
            "descripcion": "Mouse RGB 6400DPI",
            "stock": 10,
            "precio_venta": 45.00,
            "id_categoria": 5,
            "id_proveedor": 2,
            "precio_costo": 30.00
          }
          */
          db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: "Error al confirmar" }));
            res.status(201).json({ message: "Producto y proveedor creados", id_producto });
          });
        });
      } else {
        // Solo producto, sin proveedor
        db.commit((err) => {
          if (err) return db.rollback(() => res.status(500).json({ error: "Error al confirmar" }));
          res.status(201).json({ message: "Producto creado", id_producto });
        });
      }
    });
  });
});

//PUT
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, stock, precio_venta, id_categoria, estado } = req.body

  const sql = `UPDATE productos 
  SET nombre = ?, descripcion = ?, stock = ?, precio_venta = ?, id_categoria = ?, estado = ? 
  WHERE id_producto = ?`;
  db.query(sql, [nombre, descripcion, stock, precio_venta, id_categoria, estado, id], (err, result) => {
    if (err){
      console.log(err);
      console.log(id)
      return res.status(500).json({err: "Error al Actualizar el Producto"},);
    }
    res.status(201).json({ message: "Producto Actualizado Exitosamente" })
  })

});

// DELETE LOGICO
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE productos SET estado = 0 WHERE id_producto = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al eliminar producto" });
    }
    res.json({ message: "Producto desactivado exitosamente" });
  });
});

module.exports = router;


//POST
/*router.post("/", (req, res) => {
  const { nombre, descripcion, stock, precio_venta, id_categoria } = req.body;

  const sql = `INSERT INTO productos (nombre, descripcion, stock, precio_venta, id_categoria) VALUES (?, ?, ?, ?, ?)`;
  
  db.query(sql, [nombre, descripcion, stock, precio_venta, id_categoria], (err, result) => {
    if (err){
      console.error(err);
      return res.status(500).json({error: "Error al crear el producto"});
    }
    res.status(201).json({message: "Producto creado exitosamente", id: result.insertId});
  });
});*/
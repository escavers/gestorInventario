    const express = require("express");
    const app = express();
    const path = require('path');
    const cors = require("cors"); //agregue la importacion de "cors"
    const puerto = 3000;
    
    app.use(cors()); //aqui usamos el cors (para que otros archivos (dominios) puedan ingresas a estos recursos)
    app.use(express.json());

    app.use(express.static(path.join(__dirname, 'Front_Proyecto_TW')));

    const usuariosRoutes = require("./routes/usuariosRoutes");
    const proveedoresRoutes = require("./routes/proveedoresRoutes");
    const categoriasRoutes = require("./routes/categoriasRoutes");
    const productosRoutes = require("./routes/productosRoutes");
    const comprasRoutes = require("./routes/comprasRoutes");
    const ventasRoutes = require("./routes/ventasRoutes");

    app.use("/usuarios", usuariosRoutes);
    app.use("/proveedores", proveedoresRoutes);
    app.use("/categorias", categoriasRoutes);
    app.use("/productos", productosRoutes);
    app.use("/compras", comprasRoutes);
    app.use("/ventas", ventasRoutes);

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'Front_Proyecto_TW', 'index.html'));
    });

    app.listen(puerto, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://localhost:${puerto}`);

    });

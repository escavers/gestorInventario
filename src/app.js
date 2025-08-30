const express = require("express");
const app = express();
const puerto = 3000;

app.use(express.json());

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

app.listen(puerto, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);

});

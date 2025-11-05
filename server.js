import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import Usuario from "./Modelos/Usuario.js";
import Pedido from "./Modelos/Pedido.js";
import Carrito from "./Modelos/Carrito.js";
import Categoria from "./Modelos/Categoria.js";
import Producto from "./Modelos/Producto.js";
import Resena from "./Modelos/Resena.js";
import productosRuta from "./Rutas/productosRuta.js";
import usuariosRuta from "./Rutas/usuariosRuta.js";
import categoriasRuta from "./Rutas/categoriasRuta.js";
import carritoRuta from "./Rutas/carritoRuta.js";
import pedidosRuta from "./Rutas/pedidosRuta.js";
import resenasRuta from "./Rutas/resenasRuta.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

// Rutas base (más adelante agregaremos las reales)
app.get("/", (req, res) => {
  res.json({ message: "API de e-commerce funcionando" });
});

app.get("/test", async (req, res) => {
  const count = await Usuario.countDocuments();
  res.json({ usuarios_en_bd: count });
});



app.listen(process.env.PORT, () =>
  console.log("Servidor corriendo en puerto ", process.env.PORT)
);
// Rutas API
app.use("/api/productos", productosRuta);
app.use("/api/usuarios", usuariosRuta);
app.use("/api/categorias", categoriasRuta);
app.use("/api/carrito", carritoRuta);
app.use("/api/pedidos", pedidosRuta);
app.use("/api/resenas", resenasRuta);

app.use((req, res) => {
  res.status(404).send('Error 404: Ruta no encontrada');
});
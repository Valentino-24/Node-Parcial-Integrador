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

app.use((req, res) => {
  res.status(404).send('Error 404: Ruta no encontrada');
});

app.listen(process.env.PORT, () =>
  console.log("Servidor corriendo en puerto ", process.env.PORT)
);

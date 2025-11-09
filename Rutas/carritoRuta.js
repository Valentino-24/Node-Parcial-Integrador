import express from "express";
import Carrito from "../Modelos/Carrito.js";
import Producto from "../Modelos/Producto.js";
import { agregarActualizarItem, eliminarCarrito, eliminarItem, total } from "../Controllers/carritoController.js";
import { verificarToken } from "../middleware/verificarToken.js";


const carritoRuta = express.Router();
carritoRuta.use(verificarToken);
// Create de Carrito
carritoRuta.post("/", async (req, res) => {
  try {
    const { usuario_id, items = [] } = req.body;
    if (!usuario_id) return res.status(400).json({ error: "usuario_id requerido" });
    const carrito = await Carrito.findOneAndUpdate(
      { usuario_id },
      { $set: { items } },
      { upsert: true, new: true }
    );
    res.status(201).json(carrito);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get de Carrito con todos los productos
carritoRuta.get("/:usuarioId", async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario_id: req.params.usuarioId }).populate("items.producto_id");
    if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(carrito);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Actualizar productos del carrito
carritoRuta.put("/:usuarioId/item", async (req, res) => {
  try {
    return res.status(200).json(await agregarActualizarItem());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar producto del carrito
carritoRuta.delete("/:usuarioId/item/:productoId", async (req, res) => {
  try {
    return res.status(200).json(await eliminarItem());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar carrito por completo
carritoRuta.delete("/:usuarioId", async (req, res) => {
  try {
    return res.status(200).json(await eliminarCarrito());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener total y subtotal del carrito
carritoRuta.get("/:usuarioId/total", async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario_id: req.params.usuarioId }).populate("items.producto_id");
    if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });
    return res.status(200).json(await total());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default carritoRuta;

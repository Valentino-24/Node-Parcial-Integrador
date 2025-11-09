import express from "express";
import Carrito from "../Modelos/Carrito.js";
import { agregarActualizarItem, eliminarCarrito, eliminarItem, total } from "../Controllers/carritoController.js";
import { verificarToken } from "../middleware/verificarToken.js";

const carritoRuta = express.Router();
carritoRuta.use(verificarToken);

// Crear o actualizar carrito completo
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

// Obtener carrito del usuario
carritoRuta.get("/:usuarioId", async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario_id: req.params.usuarioId }).populate("items.producto_id");
    if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(carrito);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Agregar o actualizar un ítem
carritoRuta.put("/:usuarioId/item", async (req, res) => {
  try {
    const resultado = await agregarActualizarItem(req.params.usuarioId, req.body);
    res.status(200).json(resultado);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Eliminar un ítem
carritoRuta.delete("/:usuarioId/item/:productoId", async (req, res) => {
  try {
    const data = await eliminarItem(req.params.usuarioId, req.params.productoId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Eliminar carrito completo
carritoRuta.delete("/:usuarioId", async (req, res) => {
  try {
    const data = await eliminarCarrito(req.params.usuarioId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener total y subtotales
carritoRuta.get("/:usuarioId/total", async (req, res) => {
  try {
    const data = await total(req.params.usuarioId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default carritoRuta;
// Rutas/ordenes.js
import express from "express";
import Pedido from "../Modelos/Pedido.js";
import { stats } from "../Controllers/pedidosController.js";
import { verificarToken } from "../middleware/verificarToken.js";
import { soloAdmin } from "../middleware/verificarRol.js";

const pedidosRutas = express.Router();
pedidosRutas.use(verificarToken);

// CREATE pedido
pedidosRutas.post("/", async (req, res) => {
  try {
    const data = req.body; // esperar: usuario_id, items:[{producto_id,cantidad,subtotal}], total, estado
    const pedido = await Pedido.create(data);
    res.status(201).json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/ordenes -> listar pedidos con datos de usuario (populate usuario_id)
pedidosRutas.get("/", async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate("usuario_id", "nombre email").sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/ordenes/stats -> total de pedidos por estado
pedidosRutas.get("/stats", async (req, res) => {
  try {
    return res.status(200).json(await stats());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/ordenes/user/:userId -> pedidos de un usuario
pedidosRutas.get("/user/:userId", async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario_id: req.params.userId }).populate("items.producto_id");
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/ordenes/:id/status -> actualizar estado
pedidosRutas.patch("/:id/status", async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: "Enviar campo estado" });
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { $set: { estado } }, { new: true });
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/ordenes/:id -> detalle de pedido
pedidosRutas.get("/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate("usuario_id", "nombre email").populate("items.producto_id");
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE pedido
pedidosRutas.delete("/:id", soloAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndDelete(req.params.id);
    res.json({ message: "Pedido eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default pedidosRutas;

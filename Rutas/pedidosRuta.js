import express from "express";
import Pedido from "../Modelos/Pedido.js";
import { stats } from "../Controllers/pedidosController.js";
import { verificarToken } from "../middleware/verificarToken.js";
import { soloAdmin } from "../middleware/verificarRol.js";

const pedidosRutas = express.Router();
pedidosRutas.use(verificarToken);

// Crear pedido
pedidosRutas.post("/", async (req, res) => {
  try {
    const data = req.body;
    const pedido = await Pedido.create(data);
    res.status(201).json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener pedidos con datos del usuario
pedidosRutas.get("/", async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate("usuario_id", "nombre email").sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener pedidos por estado
pedidosRutas.get("/stats", async (req, res) => {
  try {
    return res.status(200).json(await stats());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener pedidos por usuarioId
pedidosRutas.get("/user/:userId", async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario_id: req.params.userId }).populate("items.producto_id");
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Actualizar estado de un pedido
pedidosRutas.patch("/:id/status", async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: "Enviar campo estado" });
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { $set: { estado } }, { new: true });
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener detalles de un pedido
pedidosRutas.get("/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate("usuario_id", "nombre email").populate("items.producto_id");
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar pedido
pedidosRutas.delete("/:id", soloAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndDelete(req.params.id);
    res.json({ message: "Pedido eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default pedidosRutas;

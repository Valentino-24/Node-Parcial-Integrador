import express from "express";
import Pedido from "../Modelos/Pedido.js";
import Producto from "../Modelos/Producto.js"
import { stats } from "../Controllers/pedidosController.js";
import { verificarToken } from "../middleware/verificarToken.js";
import { soloAdmin } from "../middleware/verificarRol.js";

const pedidosRutas = express.Router();
pedidosRutas.use(verificarToken);

// Crear pedido
pedidosRutas.post("/", async (req, res) => {
  try {
    const { usuario_id, items = [], metodo_pago } = req.body;
    if (!usuario_id || !items.length) return res.status(400).json({ error: "Faltan datos del pedido" });

    // Calcular subtotales y total
    let total = 0;
    const itemsCalculados = [];

    for (const item of items) {
      const producto = await Producto.findById(item.producto_id);
      if (!producto) return res.status(404).json({ error: `Producto ${item.producto_id} no encontrado` });

      const subtotal = producto.precio * item.cantidad;
      total += subtotal;

      itemsCalculados.push({
        producto_id: producto._id,
        cantidad: item.cantidad,
        subtotal
      });
    }

    const pedido = await Pedido.create({
      usuario_id,
      items: itemsCalculados,
      total,
      metodo_pago
    });

    res.status(201).json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener todos los pedidos 
pedidosRutas.get("/",soloAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("usuario_id", "nombre email")
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Estadísticas de pedidos por estado
pedidosRutas.get("/stats",soloAdmin, async (req, res) => {
  try {
    const data = await stats();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Pedidos por usuario específico
pedidosRutas.get("/user/:userId",soloAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario_id: req.params.userId })
      .populate("items.producto_id");
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Actualizar estado
pedidosRutas.patch("/:id/status",soloAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: "Enviar campo estado" });
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { $set: { estado } },
      { new: true }
    );
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Eliminar pedido (solo admin)
pedidosRutas.delete("/:id", soloAdmin, async (req, res) => {
  try {
    await Pedido.findByIdAndDelete(req.params.id);
    res.json({ message: "Pedido eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default pedidosRutas;
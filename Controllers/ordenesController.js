// Controllers/ordenesController.js
import Pedido from "../Modelos/Pedido.js";

export const crear = async (req, res) => {
  try {
    const data = req.body; // usuario_id, items, total, estado
    const pedido = await Pedido.create(data);
    res.status(201).json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const listar = async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate("usuario_id", "nombre email").sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const stats = async (req, res) => {
  try {
    const agg = await Pedido.aggregate([
      { $group: { _id: "$estado", totalPedidos: { $sum: 1 } } },
      { $project: { estado: "$_id", totalPedidos: 1, _id: 0 } }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const listarPorUsuario = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario_id: req.params.userId }).populate("items.producto_id");
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: "Enviar campo estado" });
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { $set: { estado } }, { new: true });
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const detalle = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate("usuario_id", "nombre email").populate("items.producto_id");
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const eliminar = async (req, res) => {
  try {
    await Pedido.findByIdAndDelete(req.params.id);
    res.json({ message: "Pedido eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

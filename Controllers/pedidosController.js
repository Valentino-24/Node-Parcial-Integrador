import Pedido from "../Modelos/Pedido.js";

export const stats = async (req, res) => {
  try {
    const agg = await Pedido.aggregate([
      { $group: { _id: "$estado", totalPedidos: { $sum: 1 } } },
      { $project: { estado: "$_id", totalPedidos: 1, _id: 0 } }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

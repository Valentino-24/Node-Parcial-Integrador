// Controllers/resenasController.js
import Resena from "../Modelos/Resena.js";
import Pedido from "../Modelos/Pedido.js";
import Producto from "../Modelos/Producto.js";

export const crear = async (req, res) => {
  try {
    const { usuario_id, producto_id, calificacion, comentario } = req.body;
    if (!usuario_id || !producto_id || !calificacion) return res.status(400).json({ error: "Faltan datos" });

    const encontro = await Pedido.findOne({
      usuario_id,
      "items.producto_id": producto_id
    });

    if (!encontro) return res.status(403).json({ error: "Solo puede reseñar productos que haya comprado" });

    const r = await Resena.create({ usuario_id, producto_id, calificacion, comentario });
    await Producto.findByIdAndUpdate(producto_id, { $push: { reseñas: r._id } });
    res.status(201).json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
};


export const top = async (req, res) => {
  try {
    const agg = await Resena.aggregate([
      { $group: { _id: "$producto_id", avgRating: { $avg: "$calificacion" }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "producto" } },
      { $unwind: "$producto" },
      { $project: { productoId: "$producto._id", nombre: "$producto.nombre", avgRating: 1, count: 1 } },
      { $limit: 20 }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

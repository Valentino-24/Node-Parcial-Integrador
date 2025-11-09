import Categoria from "../Modelos/Categoria.js";
import Producto from "../Modelos/Producto.js";

export const stats = async (req, res) => {
  try {
    const agg = await Categoria.aggregate([
      { $lookup: { from: "productos", localField: "_id", foreignField: "categoria_id", as: "productos" } },
      { $project: { nombre: 1, cantidadProductos: { $size: "$productos" } } },
      { $sort: { cantidadProductos: -1 } }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

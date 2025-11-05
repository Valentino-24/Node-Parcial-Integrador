// Controllers/categoriasController.js
import Categoria from "../Modelos/Categoria.js";
import Producto from "../Modelos/Producto.js";

export const crear = async (req, res) => {
  try {
    const c = await Categoria.create(req.body);
    res.status(201).json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const listar = async (req, res) => {
  try {
    const cats = await Categoria.find();
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const detalle = async (req, res) => {
  try {
    const c = await Categoria.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const actualizar = async (req, res) => {
  try {
    const c = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const eliminar = async (req, res) => {
  try {
    await Producto.updateMany({ categoria_id: req.params.id }, { $unset: { categoria_id: "" } });
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: "Categoría eliminada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

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
